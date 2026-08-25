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
  isDark?: boolean;
  colors: {
    primary: string;
    primaryHover: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    headerGradient: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
  };
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  forest: {
    id: 'forest',
    name: 'Cooperative Forest Emerald (Default)',
    nameHi: 'सहकारी वन पन्ना (डिफ़ॉल्ट)',
    description: 'High-contrast accessible green inspired by Indian agrarian & artisan cooperatives.',
    badge: 'Accessible Default',
    isDark: false,
    colors: {
      primary: '#059669', // emerald-600
      primaryHover: '#047857', // emerald-700
      primaryLight: '#ecfdf5', // emerald-50
      primaryDark: '#064e3b', // emerald-900
      accent: '#10b981', // emerald-500
      headerGradient: 'from-slate-900 via-slate-800 to-emerald-950',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      border: '#e2e8f0',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Jal Sahyog Ocean Blue',
    nameHi: 'जल सहयोग ओशन ब्लू',
    description: 'Clean municipal ocean blue tailored for urban service utilities.',
    badge: 'Cool Utility',
    isDark: false,
    colors: {
      primary: '#0284c7', // sky-600
      primaryHover: '#0369a1', // sky-700
      primaryLight: '#f0f9ff', // sky-50
      primaryDark: '#0c4a6e', // sky-900
      accent: '#06b6d4', // cyan-500
      headerGradient: 'from-slate-900 via-sky-950 to-blue-950',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      textMuted: '#64748b',
      border: '#bae6fd',
    },
  },
  terracotta: {
    id: 'terracotta',
    name: 'Shramik Terracotta Warmth',
    nameHi: 'श्रमिक टेराकोटा वॉर्मथ',
    description: 'Warm earth tones reflecting Indian clay craftsmanship and masonry.',
    badge: 'Artisan Warmth',
    isDark: false,
    colors: {
      primary: '#ea580c', // orange-600 (Terracotta Rust)
      primaryHover: '#c2410c', // orange-700
      primaryLight: '#fff7ed', // orange-50
      primaryDark: '#7c2d12', // orange-900 (Deep Clay)
      accent: '#f59e0b', // amber-500
      headerGradient: 'from-slate-900 via-stone-900 to-amber-950',
      background: '#fafaf9',
      surface: '#ffffff',
      text: '#1c1917',
      textSecondary: '#44403c',
      textMuted: '#78716c',
      border: '#fed7aa',
    },
  },
  slate: {
    id: 'slate',
    name: 'Modern Industrial Slate (Dark Mode)',
    nameHi: 'मॉडर्न इंडस्ट्रियल स्लेट (डार्क मोड)',
    description: 'Ultra-modern dark slate theme for technical workflows and night usage.',
    badge: 'AMOLED Dark',
    isDark: true,
    colors: {
      primary: '#6366f1', // indigo-500 (Electric Violet)
      primaryHover: '#4f46e5', // indigo-600
      primaryLight: '#1e1b4b', // indigo-950 (Dark Elevated Surface)
      primaryDark: '#090d16', // ultra dark slate
      accent: '#818cf8', // indigo-400
      headerGradient: 'from-slate-950 via-slate-900 to-indigo-950',
      background: '#090d16',
      surface: '#0f172a',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      border: '#1e293b',
    },
  },
};

export const DEFAULT_THEME: ThemeId = 'forest';

export function getTheme(themeId: ThemeId): ThemeConfig {
  return THEMES[themeId] || THEMES[DEFAULT_THEME];
}
