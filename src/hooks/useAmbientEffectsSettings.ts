'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'particle_ambient_effects_enabled';
const OLD_STORAGE_KEY = 'pomo_ambient_effects_enabled';
const DEFAULT_ENABLED = true;

function loadSettings(): boolean {
  if (typeof window === 'undefined') {
    return DEFAULT_ENABLED;
  }

  try {
    // Migrate from old key if exists
    const oldValue = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldValue !== null && localStorage.getItem(STORAGE_KEY) === null) {
      localStorage.setItem(STORAGE_KEY, oldValue);
      localStorage.removeItem(OLD_STORAGE_KEY);
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    return DEFAULT_ENABLED;
  } catch {
    return DEFAULT_ENABLED;
  }
}

function saveSettings(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function useAmbientEffectsSettings() {
  const [effectsEnabled, setEffectsEnabledState] = useState(DEFAULT_ENABLED);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();
    setEffectsEnabledState(settings);
    setIsLoaded(true);
  }, []);

  // Set effects enabled
  const setEffectsEnabled = useCallback((enabled: boolean) => {
    setEffectsEnabledState(enabled);
    saveSettings(enabled);
  }, []);

  // Toggle effects
  const toggleEffects = useCallback(() => {
    setEffectsEnabledState((prev) => {
      const next = !prev;
      saveSettings(next);
      return next;
    });
  }, []);

  return {
    effectsEnabled,
    setEffectsEnabled,
    toggleEffects,
    isLoaded,
  };
}
