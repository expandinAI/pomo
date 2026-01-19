'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pomo:keyboard-hints-visible';

/**
 * Hook for managing keyboard hints visibility setting
 *
 * Persists the setting in localStorage
 * Defaults to true (hints visible)
 */
export function useKeyboardHintsSettings(): {
  showKeyboardHints: boolean;
  toggleKeyboardHints: () => void;
  setShowKeyboardHints: (show: boolean) => void;
} {
  const [showKeyboardHints, setShowKeyboardHintsState] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setShowKeyboardHintsState(stored === 'true');
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, String(showKeyboardHints));
    }
  }, [showKeyboardHints, isLoaded]);

  const toggleKeyboardHints = useCallback(() => {
    setShowKeyboardHintsState((prev) => !prev);
  }, []);

  const setShowKeyboardHints = useCallback((show: boolean) => {
    setShowKeyboardHintsState(show);
  }, []);

  return {
    showKeyboardHints,
    toggleKeyboardHints,
    setShowKeyboardHints,
  };
}
