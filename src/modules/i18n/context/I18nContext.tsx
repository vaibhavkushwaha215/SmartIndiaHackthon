/**
 * SahyogSeva - I18n Context & Provider
 * 
 * Provides reactive language state, translations, persistence, and feature-flag awareness.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { LanguageCode, I18nContextType, TranslationParams } from '../types';
import { translationService, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../services/translation.service';
import { useFeature } from '../../../shared/config/features.config';
import i18next from 'i18next';

// Import Static Localized Dictionaries
import enDict from '../locales/en.json';
import hiDict from '../locales/hi.json';
import teDict from '../locales/te.json';
import knDict from '../locales/kn.json';
import taDict from '../locales/ta.json';

// Initialize and register all 5 language dictionaries into translationService & i18next
translationService.registerDictionary('en', enDict);
translationService.registerDictionary('hi', hiDict);
translationService.registerDictionary('te', teDict);
translationService.registerDictionary('kn', knDict);
translationService.registerDictionary('ta', taDict);

// Add resources dynamically to i18next for backward compatibility
if (i18next && i18next.isInitialized) {
  i18next.addResourceBundle('en', 'translation', enDict, true, true);
  i18next.addResourceBundle('hi', 'translation', hiDict, true, true);
  i18next.addResourceBundle('te', 'translation', teDict, true, true);
  i18next.addResourceBundle('kn', 'translation', knDict, true, true);
  i18next.addResourceBundle('ta', 'translation', taDict, true, true);
}

const STORAGE_KEY = 'sahyog_lang';

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved as LanguageCode;
    }
  } catch {
    // Ignore storage read errors
  }
  return DEFAULT_LANGUAGE;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<LanguageCode>(getInitialLanguage);
  const isMultilingualEnabled = useFeature('multilingual');

  // Active language is pinned to default English if feature flag is OFF
  const activeLanguage: LanguageCode = isMultilingualEnabled ? currentLang : DEFAULT_LANGUAGE;

  const setLanguage = useCallback((newLang: LanguageCode) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) {
      newLang = DEFAULT_LANGUAGE;
    }

    setCurrentLang(newLang);

    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore storage write errors
    }

    // Sync with i18next instance if present
    try {
      if (i18next && typeof i18next.changeLanguage === 'function') {
        i18next.changeLanguage(newLang);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Ensure document direction and html lang attribute are set
  useEffect(() => {
    document.documentElement.lang = activeLanguage;
    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === activeLanguage);
    document.documentElement.dir = langInfo?.direction || 'ltr';
  }, [activeLanguage]);

  const t = useCallback(
    (key: string, paramsOrDefault?: TranslationParams | string, defaultFallback?: string): string => {
      return translationService.translate(key, activeLanguage, paramsOrDefault, defaultFallback);
    },
    [activeLanguage]
  );

  const isRtl = useMemo(() => {
    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === activeLanguage);
    return langInfo?.direction === 'rtl';
  }, [activeLanguage]);

  const contextValue: I18nContextType = useMemo(
    () => ({
      language: activeLanguage,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isRtl,
      isMultilingualEnabled,
    }),
    [activeLanguage, setLanguage, t, isRtl, isMultilingualEnabled]
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    // Return safe default fallback if used outside provider
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      t: (key: string, paramsOrDefault?: TranslationParams | string, defaultFallback?: string) =>
        translationService.translate(key, DEFAULT_LANGUAGE, paramsOrDefault, defaultFallback),
      supportedLanguages: SUPPORTED_LANGUAGES,
      isRtl: false,
      isMultilingualEnabled: false,
    };
  }
  return context;
};
