/**
 * SahyogSeva - Translation Service
 * 
 * Provides local static dictionary lookup, key fallback resolution,
 * template interpolation, and pluggable remote provider integration for future IndicTrans2.
 */

import { LanguageCode, LanguageInfo, TranslationParams, TranslationProvider } from '../types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr' },
];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

type LocaleDictionary = Record<string, any>;

export class TranslationService {
  private static instance: TranslationService;
  private dictionaries: Map<LanguageCode, LocaleDictionary> = new Map();
  private dynamicProvider: TranslationProvider | null = null;

  private constructor() {}

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  public registerDictionary(lang: LanguageCode, dict: LocaleDictionary): void {
    this.dictionaries.set(lang, dict);
  }

  public setProvider(provider: TranslationProvider): void {
    this.dynamicProvider = provider;
  }

  public getProvider(): TranslationProvider | null {
    return this.dynamicProvider;
  }

  /**
   * Translates a structured key (e.g., 'nav.services' or 'booking.confirm_btn') with fallback.
   */
  public translate(
    key: string,
    lang: LanguageCode,
    paramsOrDefault?: TranslationParams | string,
    defaultFallback?: string
  ): string {
    if (!key) return '';

    let params: TranslationParams | undefined;
    let fallbackText: string | undefined = defaultFallback;

    if (typeof paramsOrDefault === 'string') {
      fallbackText = paramsOrDefault;
    } else if (paramsOrDefault && typeof paramsOrDefault === 'object') {
      params = paramsOrDefault;
    }

    // 1. Try target language dictionary
    let value = this.lookupKey(key, lang);

    // 2. Fallback to English dictionary if missing
    if (value === undefined && lang !== DEFAULT_LANGUAGE) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing translation for key '${key}' in language '${lang}'`);
      }
      value = this.lookupKey(key, DEFAULT_LANGUAGE);
    }

    // 3. Fallback to explicit default text or readable key if completely missing
    if (value === undefined || typeof value !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Missing translation for key '${key}' in all languages`);
      }
      if (fallbackText !== undefined) {
        return fallbackText;
      }
      return key.split('.').pop() || key;
    }

    // 4. Interpolate variables (e.g. {{name}}, {{count}})
    if (params) {
      return this.interpolate(value, params);
    }

    return value;
  }

  /**
   * Helper to look up dotted keys in nested or flat JSON dictionaries
   */
  private lookupKey(key: string, lang: LanguageCode): string | undefined {
    const dict = this.dictionaries.get(lang);
    if (!dict) return undefined;

    // Direct key match
    if (dict[key] !== undefined && typeof dict[key] === 'string') {
      return dict[key];
    }

    // Dotted nested path lookup (e.g. "common.save" -> dict.common.save)
    const segments = key.split('.');
    let current: any = dict;
    for (const segment of segments) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment];
      } else {
        return undefined;
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    return undefined;
  }

  /**
   * Interpolates template string with parameters (e.g. "Hello {{name}}" -> "Hello Ramesh")
   */
  private interpolate(template: string, params: TranslationParams): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, paramKey) => {
      if (params[paramKey] !== undefined && params[paramKey] !== null) {
        return String(params[paramKey]);
      }
      return match;
    });
  }

  /**
   * Dynamic translation for user-generated content using registered provider
   */
  public async translateDynamic(
    text: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): Promise<string> {
    if (!text || sourceLanguage === targetLanguage) return text;
    if (this.dynamicProvider) {
      try {
        return await this.dynamicProvider.translate(text, sourceLanguage, targetLanguage);
      } catch {
        return text;
      }
    }
    return text;
  }
}

export const translationService = TranslationService.getInstance();
