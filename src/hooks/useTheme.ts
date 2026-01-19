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
 * Dark mode is the default. Light mode adds the .light class.
 * Reads initial theme from localStorage or system preference.
 * Persists changes to localStorage and updates document class.
 */
export function useTheme(): UseThemeReturn {
  // Dark is now the default
  const [theme, setThemeState] = useState<Theme>('dark');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (stored) {
      setThemeState(stored);
      // Apply class immediately based on stored value
      if (stored === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    } else if (prefersLight) {
      setThemeState('light');
      document.documentElement.classList.add('light');
    }
  }, []);

  // Update document class and localStorage when theme changes
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // Light mode adds .light class, dark mode removes it (dark is default)
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, toggleTheme, setTheme };
}
