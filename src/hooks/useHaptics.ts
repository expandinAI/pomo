'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Haptic feedback patterns
 * - light: Quick confirmation (session start, resume)
 * - double: Pause action (double tap feel)
 * - medium: Success (session complete)
 * - heavy: Significant action (skip/reset)
 */
type HapticPattern = 'light' | 'double' | 'medium' | 'heavy';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 30,
  double: [50, 30, 50],
  medium: 100,
  heavy: 150,
};

const STORAGE_KEY = 'pomo_haptics_enabled';

/**
 * Hook for haptic feedback via the Web Vibration API.
 * Provides tactile feedback for significant actions on supported devices.
 *
 * Note: Only works on Android Chrome. iOS Safari does not support the Vibration API.
 */
export function useHaptics() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  // Check for Vibration API support on mount
  useEffect(() => {
    const supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
    setIsSupported(supported);

    // Load preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsEnabled(saved === 'true');
      }
    }
  }, []);

  /**
   * Trigger haptic feedback
   * @param pattern - The haptic pattern to use
   */
  const vibrate = useCallback((pattern: HapticPattern) => {
    if (!isSupported || !isEnabled) return;

    try {
      navigator.vibrate(HAPTIC_PATTERNS[pattern]);
    } catch {
      // Silently fail if vibration fails
    }
  }, [isSupported, isEnabled]);

  /**
   * Toggle haptic feedback on/off
   */
  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  /**
   * Set haptic feedback enabled state directly
   */
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    }
  }, []);

  return {
    /** Trigger haptic feedback with the specified pattern */
    vibrate,
    /** Whether the device supports haptic feedback */
    isSupported,
    /** Whether haptic feedback is enabled by the user */
    isEnabled,
    /** Toggle haptic feedback on/off */
    toggle,
    /** Set haptic feedback enabled state */
    setEnabled,
  };
}
