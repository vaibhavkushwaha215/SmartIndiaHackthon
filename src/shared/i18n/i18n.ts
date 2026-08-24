import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './en.json';
import hiTranslation from './hi.json';

const savedLang = localStorage.getItem('sahyog_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lang: 'en' | 'hi') => {
  localStorage.setItem('sahyog_lang', lang);
  i18n.changeLanguage(lang);
};

export default i18n;
