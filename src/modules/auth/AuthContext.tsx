import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, LanguagePreference } from '../../shared/types';
import { db } from '../../shared/services/database';
import { logger } from '../../shared/services/logger';
import { ERROR_CODES, createAppError } from '../../shared/constants/error-codes';
import { SEED_USERS } from '../../shared/data/seed-data';
import i18n, { changeLanguage } from '../../shared/i18n/i18n';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: { name: string; role: UserRole; phone: string }) => Promise<User>;
  quickSwitchUser: (userId: string) => Promise<User>;
  switchRole: (role: UserRole) => void;
  logout: () => Promise<void>;
  updateLanguage: (lang: LanguagePreference) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'sahyog_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session or default to demo customer
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        if (parsed.language_pref) {
          changeLanguage(parsed.language_pref);
        }
      } catch {
        setCurrentUser(SEED_USERS[0]);
      }
    } else {
      // Default to Customer Ramesh Kumar for seamless first impression
      setCurrentUser(SEED_USERS[0]);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(SEED_USERS[0]));
    }
    setIsLoading(false);
  }, []);

  const login = async ({ name, role, phone }: { name: string; role: UserRole; phone: string }): Promise<User> => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanName = name.trim();

    // 1. Phone validation (Error 102)
    if (cleanPhone.length !== 10) {
      const err = createAppError(ERROR_CODES.INVALID_PHONE_NUMBER, 'Please enter a valid 10-digit Indian mobile number');
      await logger.logAuth('LOGIN_FAILED', null, phone, ERROR_CODES.INVALID_PHONE_NUMBER, err.message);
      throw err;
    }

    // 2. Name validation (Error 400)
    if (!cleanName) {
      const err = createAppError(ERROR_CODES.BAD_REQUEST, 'Please enter your full name');
      await logger.logAuth('LOGIN_FAILED', null, cleanPhone, ERROR_CODES.BAD_REQUEST, err.message);
      throw err;
    }

    try {
      // Check if user exists or create a new profile
      let user = await db.getUserByPhone(cleanPhone);
      if (!user) {
        user = {
          id: `user-${Date.now()}`,
          name: cleanName,
          role,
          phone: cleanPhone,
          language_pref: (i18n.language as LanguagePreference) || 'en',
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanPhone}`,
        };
        await db.upsertUser(user);
      } else {
        // Update role and name if changed
        user = { ...user, name: cleanName, role };
        await db.upsertUser(user);
      }

      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      await logger.logAuth('LOGIN_SUCCESS', user.id, user.phone, 200, `User ${user.name} logged in as ${user.role}`);
      return user;
    } catch (err: any) {
      const code = err.code || ERROR_CODES.SERVER_ERROR;
      await logger.logAuth('LOGIN_FAILED', null, cleanPhone, code, err.message);
      throw err;
    }
  };

  const quickSwitchUser = async (userId: string): Promise<User> => {
    try {
      const user = await db.getUserById(userId);
      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      if (user.language_pref) {
        changeLanguage(user.language_pref);
      }

      await logger.logAuth('LOGIN_SUCCESS', user.id, user.phone, 200, `Quick-switched to ${user.name} (${user.role})`);
      return user;
    } catch (err: any) {
      const code = err.code || ERROR_CODES.NOT_FOUND;
      await logger.logError('QUICK_SWITCH_USER', err, userId);
      throw err;
    }
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    logger.log({
      action: 'ROLE_SWITCHED',
      userId: updated.id,
      phone: updated.phone,
      resultCode: 200,
      details: `Role switched to ${role}`,
    });
  };

  const logout = async () => {
    if (currentUser) {
      await logger.logAuth('LOGOUT', currentUser.id, currentUser.phone, 200, 'User signed out');
    }
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const updateLanguage = (lang: LanguagePreference) => {
    changeLanguage(lang);
    if (currentUser) {
      const updated = { ...currentUser, language_pref: lang };
      setCurrentUser(updated);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      db.upsertUser(updated).catch(console.warn);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'Customer',
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        quickSwitchUser,
        switchRole,
        logout,
        updateLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
