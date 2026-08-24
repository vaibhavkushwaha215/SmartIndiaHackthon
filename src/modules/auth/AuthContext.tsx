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
  login: (params: { phone: string; password: string }) => Promise<User>;
  register: (params: { name: string; role: UserRole; phone: string; password: string }) => Promise<User>;
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
    // Restore preferred language or default to English
    const savedLang = (localStorage.getItem('sahyog_lang') as LanguagePreference) || 'en';
    changeLanguage(savedLang);

    // Restore session or default to demo customer
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
      } catch {
        setCurrentUser(SEED_USERS[0]);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(SEED_USERS[0]));
      }
    } else {
      // Default to Customer Ramesh Kumar for seamless first impression
      setCurrentUser(SEED_USERS[0]);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(SEED_USERS[0]));
    }
    setIsLoading(false);
  }, []);

  const login = async ({ phone, password }: { phone: string; password: string }): Promise<User> => {
    const cleanPhone = phone.trim().replace(/\D/g, '');

    // 1. Phone validation (Error 102)
    if (cleanPhone.length !== 10) {
      const err = createAppError(ERROR_CODES.INVALID_PHONE_NUMBER, 'Please enter a valid 10-digit Indian mobile number');
      await logger.logAuth('LOGIN_FAILED', null, phone, ERROR_CODES.INVALID_PHONE_NUMBER, err.message);
      throw err;
    }

    // 2. Password validation (Error 400)
    if (!password) {
      const err = createAppError(ERROR_CODES.BAD_REQUEST, 'Please enter your password');
      await logger.logAuth('LOGIN_FAILED', null, cleanPhone, ERROR_CODES.BAD_REQUEST, err.message);
      throw err;
    }

    try {
      const user = await db.authenticateUser(cleanPhone, password);

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

  const register = async ({ name, role, phone, password }: { name: string; role: UserRole; phone: string; password: string }): Promise<User> => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanName = name.trim();

    if (cleanPhone.length !== 10) {
      throw createAppError(ERROR_CODES.INVALID_PHONE_NUMBER, 'Please enter a valid 10-digit Indian mobile number');
    }
    if (!cleanName) {
      throw createAppError(ERROR_CODES.BAD_REQUEST, 'Please enter your full name');
    }
    if (!password || password.length < 6) {
      throw createAppError(ERROR_CODES.BAD_REQUEST, 'Password must be at least 6 characters');
    }

    // Check if phone already exists (Error 103)
    const existing = await db.getUserByPhone(cleanPhone);
    if (existing) {
      throw createAppError(ERROR_CODES.PHONE_ALREADY_REGISTERED, 'An account with this phone number already exists. Please sign in instead.');
    }

    const activeLang = (localStorage.getItem('sahyog_lang') as LanguagePreference) || 'en';
    const user: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      role,
      phone: cleanPhone,
      language_pref: activeLang,
      password_hash: password, // In production: bcrypt.hashSync(password, 10)
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanPhone}`,
    };
    await db.upsertUser(user);

    setCurrentUser(user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    await logger.logAuth('LOGIN_SUCCESS', user.id, user.phone, 200, `New user ${user.name} registered as ${user.role}`);
    return user;
  };

  const quickSwitchUser = async (userId: string): Promise<User> => {
    try {
      const user = await db.getUserById(userId);
      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      await logger.logAuth('LOGIN_SUCCESS', user.id, user.phone, 200, `Quick-switched to ${user.name} (${user.role})`);
      return user;
    } catch (err: any) {
      const fallbackUser = SEED_USERS.find((u) => u.id === userId) || SEED_USERS[0];
      setCurrentUser(fallbackUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const switchRole = (role: UserRole) => {
    let targetUser: User;
    if (role === 'Worker') {
      targetUser = SEED_USERS.find((u) => u.role === 'Worker') || SEED_USERS[2];
    } else if (role === 'Admin') {
      targetUser = SEED_USERS.find((u) => u.role === 'Admin') || SEED_USERS[6];
    } else {
      targetUser = SEED_USERS.find((u) => u.role === 'Customer') || SEED_USERS[0];
    }

    setCurrentUser(targetUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(targetUser));

    logger.log({
      action: 'ROLE_SWITCHED',
      userId: targetUser.id,
      phone: targetUser.phone,
      resultCode: 200,
      details: `Switched account profile to ${targetUser.name} (${role})`,
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
        register,
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
