import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, ThemeConfig, THEMES, DEFAULT_THEME, getTheme } from '../config/theme';

interface ThemeContextType {
  themeId: ThemeId;
  currentTheme: ThemeConfig;
  allThemes: Record<ThemeId, ThemeConfig>;
  setTheme: (themeId: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'sahyog_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {
      // Fallback
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
      const theme = getTheme(themeId);
      const root = document.documentElement;
      root.setAttribute('data-theme', themeId);
      root.style.setProperty('--color-primary', theme.colors.primary);
      root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
      root.style.setProperty('--color-primary-light', theme.colors.primaryLight);
      root.style.setProperty('--color-primary-dark', theme.colors.primaryDark);
      root.style.setProperty('--color-accent', theme.colors.accent);
      root.style.setProperty('--color-bg', theme.colors.background);
      root.style.setProperty('--color-surface', theme.colors.surface);
      root.style.setProperty('--color-text', theme.colors.text);
      root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
      root.style.setProperty('--color-text-muted', theme.colors.textMuted);
      root.style.setProperty('--color-border', theme.colors.border);

      if (theme.isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch {
      // Ignore
    }
  }, [themeId]);

  const setTheme = (newThemeId: ThemeId) => {
    if (THEMES[newThemeId]) {
      setThemeIdState(newThemeId);
    }
  };

  const currentTheme = getTheme(themeId);

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        currentTheme,
        allThemes: THEMES,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
