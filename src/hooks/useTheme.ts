'use client';

import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * Hook for managing theme state
 *
 * Reads initial theme from localStorage or system preference.
 * Persists changes to localStorage and updates document class.
 */
export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (stored) {
      setThemeState(stored);
    } else if (prefersDark) {
      setThemeState('dark');
    }
  }, []);

  // Update document class and localStorage when theme changes
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, toggleTheme, setTheme };
}
