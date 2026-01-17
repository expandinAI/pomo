export type ColorTheme = 'sunrise' | 'ocean' | 'forest' | 'midnight';

export interface ThemeColors {
  accent: string;
  accentHover: string;
  accentLight: string;
  accentDark: string;
  accentDarkHover: string;
  accentDarkLight: string;
}

export interface ThemePreset {
  id: ColorTheme;
  name: string;
  emoji: string;
  colors: ThemeColors;
}

export const COLOR_THEMES: ThemePreset[] = [
  {
    id: 'sunrise',
    name: 'Sunrise',
    emoji: '🌅',
    colors: {
      accent: '#0D9488', // Teal 600
      accentHover: '#0F766E', // Teal 700
      accentLight: '#14B8A6', // Teal 500
      accentDark: '#2DD4BF', // Teal 400
      accentDarkHover: '#5EEAD4', // Teal 300
      accentDarkLight: '#14B8A6', // Teal 500
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    colors: {
      accent: '#3B82F6', // Blue 500
      accentHover: '#2563EB', // Blue 600
      accentLight: '#60A5FA', // Blue 400
      accentDark: '#60A5FA', // Blue 400
      accentDarkHover: '#93C5FD', // Blue 300
      accentDarkLight: '#3B82F6', // Blue 500
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    colors: {
      accent: '#10B981', // Emerald 500
      accentHover: '#059669', // Emerald 600
      accentLight: '#34D399', // Emerald 400
      accentDark: '#34D399', // Emerald 400
      accentDarkHover: '#6EE7B7', // Emerald 300
      accentDarkLight: '#10B981', // Emerald 500
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🌙',
    colors: {
      accent: '#8B5CF6', // Violet 500
      accentHover: '#7C3AED', // Violet 600
      accentLight: '#A78BFA', // Violet 400
      accentDark: '#A78BFA', // Violet 400
      accentDarkHover: '#C4B5FD', // Violet 300
      accentDarkLight: '#8B5CF6', // Violet 500
    },
  },
];

export const DEFAULT_THEME: ColorTheme = 'sunrise';

export function getThemeById(id: ColorTheme): ThemePreset | undefined {
  return COLOR_THEMES.find((t) => t.id === id);
}
