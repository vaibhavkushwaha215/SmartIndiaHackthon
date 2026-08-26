import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../../modules/i18n/locales/en.json';
import hiTranslation from '../../modules/i18n/locales/hi.json';
import teTranslation from '../../modules/i18n/locales/te.json';
import knTranslation from '../../modules/i18n/locales/kn.json';
import taTranslation from '../../modules/i18n/locales/ta.json';
import { LanguageCode } from '../../modules/i18n/types';

const savedLang = (localStorage.getItem('sahyog_lang') as LanguageCode) || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation },
      te: { translation: teTranslation },
      kn: { translation: knTranslation },
      ta: { translation: taTranslation },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lang: LanguageCode) => {
  try {
    localStorage.setItem('sahyog_lang', lang);
  } catch {
    // Ignore
  }
  i18n.changeLanguage(lang);
};

export default i18n;
