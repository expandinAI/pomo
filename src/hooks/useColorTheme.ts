'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  COLOR_THEMES,
  DEFAULT_THEME,
  getThemeById,
  type ColorTheme,
} from '@/styles/themes';

const STORAGE_KEY = 'pomo_color_theme';

function loadTheme(): ColorTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && COLOR_THEMES.some((t) => t.id === stored)) {
      return stored as ColorTheme;
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_THEME;
}

function saveTheme(theme: ColorTheme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
}

function applyThemeToDOM(theme: ColorTheme): void {
  if (typeof window === 'undefined') return;

  const themeData = getThemeById(theme);
  if (!themeData) return;

  const root = document.documentElement;

  // Set CSS custom properties
  root.style.setProperty('--color-accent', themeData.colors.accent);
  root.style.setProperty('--color-accent-hover', themeData.colors.accentHover);
  root.style.setProperty('--color-accent-light', themeData.colors.accentLight);
  root.style.setProperty('--color-accent-dark', themeData.colors.accentDark);
  root.style.setProperty('--color-accent-dark-hover', themeData.colors.accentDarkHover);
  root.style.setProperty('--color-accent-dark-light', themeData.colors.accentDarkLight);

  // Set data attribute for potential CSS targeting
  root.dataset.colorTheme = theme;
}

export function useColorTheme() {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme on mount
  useEffect(() => {
    const theme = loadTheme();
    setCurrentTheme(theme);
    applyThemeToDOM(theme);
    setIsLoaded(true);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (isLoaded) {
      applyThemeToDOM(currentTheme);
    }
  }, [currentTheme, isLoaded]);

  // Change theme
  const setTheme = useCallback((theme: ColorTheme) => {
    setCurrentTheme(theme);
    saveTheme(theme);
  }, []);

  return {
    currentTheme,
    setTheme,
    isLoaded,
    themes: COLOR_THEMES,
  };
}
