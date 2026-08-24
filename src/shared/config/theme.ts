/**
 * SahyogSeva - Theme Configuration & Color Palettes
 */

export type ThemeId = 'forest' | 'ocean' | 'terracotta' | 'slate';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameHi: string;
  description: string;
  badge: string;
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    headerGradient: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  forest: {
    id: 'forest',
    name: 'Cooperative Forest Emerald (Default)',
    nameHi: 'सहकारी वन पन्ना (डिफ़ॉल्ट)',
    description: 'High-contrast accessible green inspired by Indian agrarian & artisan cooperatives.',
    badge: 'Accessible Default',
    colors: {
      primary: '#059669', // emerald-600
      primaryHover: '#047857', // emerald-700
      primaryLight: '#ecfdf5', // emerald-50
      primaryDark: '#064e3b', // emerald-900
      accent: '#10b981', // emerald-500
      headerGradient: 'from-slate-900 via-slate-800 to-emerald-950',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Jal Sahyog Ocean Blue',
    nameHi: 'जल सहयोग ओशन ब्लू',
    description: 'Clean municipal ocean blue tailored for urban service utilities.',
    badge: 'Cool Utility',
    colors: {
      primary: '#0284c7', // sky-600
      primaryHover: '#0369a1', // sky-700
      primaryLight: '#f0f9ff', // sky-50
      primaryDark: '#0c4a6e', // sky-900
      accent: '#38bdf8', // sky-400
      headerGradient: 'from-slate-900 via-slate-800 to-sky-950',
    },
  },
  terracotta: {
    id: 'terracotta',
    name: 'Shramik Terracotta Warmth',
    nameHi: 'श्रमिक टेराकोटा वॉर्मथ',
    description: 'Warm earth tones reflecting Indian clay craftsmanship and masonry.',
    badge: 'Artisan Warmth',
    colors: {
      primary: '#d97706', // amber-600
      primaryHover: '#b45309', // amber-700
      primaryLight: '#fffbeb', // amber-50
      primaryDark: '#78350f', // amber-900
      accent: '#f59e0b', // amber-500
      headerGradient: 'from-slate-900 via-slate-800 to-amber-950',
    },
  },
  slate: {
    id: 'slate',
    name: 'Modern Industrial Slate',
    nameHi: 'मॉडर्न इंडस्ट्रियल स्लेट',
    description: 'Ultra-modern dark slate theme for technical workflows.',
    badge: 'Sleek Contrast',
    colors: {
      primary: '#4f46e5', // indigo-600
      primaryHover: '#4338ca', // indigo-700
      primaryLight: '#eef2ff', // indigo-50
      primaryDark: '#312e81', // indigo-900
      accent: '#6366f1', // indigo-500
      headerGradient: 'from-slate-950 via-slate-900 to-indigo-950',
    },
  },
};

export const DEFAULT_THEME: ThemeId = 'forest';

export function getTheme(themeId: ThemeId): ThemeConfig {
  return THEMES[themeId] || THEMES[DEFAULT_THEME];
}
