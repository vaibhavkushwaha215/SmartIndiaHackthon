/**
 * SahyogSeva - Multilingual Localization Types
 */

export type LanguageCode = 'en' | 'hi' | 'te' | 'kn' | 'ta';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export interface TranslationParams {
  [key: string]: string | number;
}

export interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, paramsOrDefault?: TranslationParams | string, defaultFallback?: string) => string;
  supportedLanguages: LanguageInfo[];
  isRtl: boolean;
  isMultilingualEnabled: boolean;
}

/**
 * Provider interface for future dynamic machine translation integration (e.g. AI4Bharat IndicTrans2)
 */
export interface TranslationProvider {
  name: string;
  translate(
    text: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): Promise<string>;
}
