'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'particle:daily-intention-enabled';

/**
 * Hook for managing Daily Intention feature setting
 *
 * When enabled, shows an inspirational statement at app start
 * instead of going directly to the timer.
 *
 * Default: disabled
 */
export function useDailyIntentionSettings(): {
  dailyIntentionEnabled: boolean;
  toggleDailyIntention: () => void;
  setDailyIntentionEnabled: (enabled: boolean) => void;
  isLoaded: boolean;
} {
  const [dailyIntentionEnabled, setDailyIntentionEnabledState] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setDailyIntentionEnabledState(stored === 'true');
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, String(dailyIntentionEnabled));
    }
  }, [dailyIntentionEnabled, isLoaded]);

  const toggleDailyIntention = useCallback(() => {
    setDailyIntentionEnabledState((prev) => !prev);
  }, []);

  const setDailyIntentionEnabled = useCallback((enabled: boolean) => {
    setDailyIntentionEnabledState(enabled);
  }, []);

  return {
    dailyIntentionEnabled,
    toggleDailyIntention,
    setDailyIntentionEnabled,
    isLoaded,
  };
}
