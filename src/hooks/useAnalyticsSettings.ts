'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'particle:analytics-enabled';

/**
 * Hook for managing analytics opt-in/opt-out setting.
 * Persists to localStorage.
 * Default: true (opt-in for anonymous analytics)
 */
export function useAnalyticsSettings() {
  const [analyticsEnabled, setAnalyticsEnabledState] = useState(true); // Default: opt-in
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setAnalyticsEnabledState(stored === 'true');
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, String(analyticsEnabled));
    }
  }, [analyticsEnabled, isLoaded]);

  const toggleAnalytics = useCallback(() => {
    setAnalyticsEnabledState((prev) => !prev);
  }, []);

  const setAnalyticsEnabled = useCallback((enabled: boolean) => {
    setAnalyticsEnabledState(enabled);
  }, []);

  return { analyticsEnabled, toggleAnalytics, setAnalyticsEnabled, isLoaded };
}
