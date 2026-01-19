'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import {
  PRESETS,
  type TimerPreset,
  type TimerDurations,
} from '@/styles/design-tokens';

// Re-export for convenience
export type { TimerDurations, TimerPreset };

const STORAGE_KEY = 'pomo_timer_settings';
const CUSTOM_PRESET_KEY = 'pomo_custom_preset';
const DEFAULT_PRESET_ID = 'pomodoro';

interface StoredSettings {
  presetId: string;
  customDurations?: TimerDurations;
  customSessionsUntilLong?: number;
}

function loadSettings(): StoredSettings {
  if (typeof window === 'undefined') {
    return { presetId: DEFAULT_PRESET_ID };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.presetId === 'string' && parsed.presetId in PRESETS) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors, use default
  }
  return { presetId: DEFAULT_PRESET_ID };
}

function saveSettings(settings: StoredSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadCustomPreset(): { durations: TimerDurations; sessionsUntilLong: number } {
  if (typeof window === 'undefined') {
    return {
      durations: { ...PRESETS.custom.durations },
      sessionsUntilLong: PRESETS.custom.sessionsUntilLong,
    };
  }

  try {
    const stored = localStorage.getItem(CUSTOM_PRESET_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        typeof parsed.durations?.work === 'number' &&
        typeof parsed.durations?.shortBreak === 'number' &&
        typeof parsed.durations?.longBreak === 'number' &&
        typeof parsed.sessionsUntilLong === 'number'
      ) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors
  }
  return {
    durations: { ...PRESETS.custom.durations },
    sessionsUntilLong: PRESETS.custom.sessionsUntilLong,
  };
}

function saveCustomPreset(durations: TimerDurations, sessionsUntilLong: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_PRESET_KEY, JSON.stringify({ durations, sessionsUntilLong }));
}

interface TimerSettingsContextValue {
  // Current durations (from active preset)
  durations: TimerDurations;
  // Sessions until long break (from active preset)
  sessionsUntilLong: number;
  // Loading state
  isLoaded: boolean;
  // Active preset ID
  activePresetId: string;
  // Get active preset object
  getActivePreset: () => TimerPreset;
  // Apply a preset by ID
  applyPreset: (presetId: string) => void;
  // Update custom preset durations
  updateCustomDuration: (key: keyof TimerDurations, minutes: number) => void;
  // Update custom preset sessions until long
  updateCustomSessionsUntilLong: (count: number) => void;
  // Reset custom preset to defaults
  resetCustomPreset: () => void;
  // All available presets
  presets: TimerPreset[];
  // Custom preset values (for editor)
  customDurations: TimerDurations;
  customSessionsUntilLong: number;
}

const TimerSettingsContext = createContext<TimerSettingsContextValue | null>(null);

interface TimerSettingsProviderProps {
  children: ReactNode;
}

export function TimerSettingsProvider({ children }: TimerSettingsProviderProps) {
  const [activePresetId, setActivePresetId] = useState<string>(DEFAULT_PRESET_ID);
  const [customDurations, setCustomDurations] = useState<TimerDurations>({ ...PRESETS.custom.durations });
  const [customSessionsUntilLong, setCustomSessionsUntilLong] = useState<number>(PRESETS.custom.sessionsUntilLong);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();
    setActivePresetId(settings.presetId);

    const customSettings = loadCustomPreset();
    setCustomDurations(customSettings.durations);
    setCustomSessionsUntilLong(customSettings.sessionsUntilLong);

    setIsLoaded(true);
  }, []);

  // Get active preset object
  const getActivePreset = useCallback((): TimerPreset => {
    if (activePresetId === 'custom') {
      return {
        ...PRESETS.custom,
        durations: customDurations,
        sessionsUntilLong: customSessionsUntilLong,
      };
    }
    return PRESETS[activePresetId] || PRESETS[DEFAULT_PRESET_ID];
  }, [activePresetId, customDurations, customSessionsUntilLong]);

  // Derive durations and sessionsUntilLong from active preset
  const activePreset = getActivePreset();
  const durations = activePreset.durations;
  const sessionsUntilLong = activePreset.sessionsUntilLong;

  // Apply a preset by ID
  const applyPreset = useCallback((presetId: string) => {
    if (!(presetId in PRESETS)) return;

    setActivePresetId(presetId);
    saveSettings({ presetId });
  }, []);

  // Update custom preset durations
  const updateCustomDuration = useCallback((key: keyof TimerDurations, minutes: number) => {
    const seconds = Math.max(1, Math.min(120, minutes)) * 60;
    setCustomDurations((prev) => {
      const updated = { ...prev, [key]: seconds };
      saveCustomPreset(updated, customSessionsUntilLong);
      return updated;
    });
  }, [customSessionsUntilLong]);

  // Update custom preset sessions until long
  const updateCustomSessionsUntilLong = useCallback((count: number) => {
    const validCount = Math.max(1, Math.min(8, count));
    setCustomSessionsUntilLong(validCount);
    saveCustomPreset(customDurations, validCount);
  }, [customDurations]);

  // Reset custom preset to defaults
  const resetCustomPreset = useCallback(() => {
    const defaultDurations = { ...PRESETS.pomodoro.durations };
    const defaultSessionsUntilLong = PRESETS.pomodoro.sessionsUntilLong;
    setCustomDurations(defaultDurations);
    setCustomSessionsUntilLong(defaultSessionsUntilLong);
    saveCustomPreset(defaultDurations, defaultSessionsUntilLong);
  }, []);

  // All available presets as array
  const presets = useMemo(() => Object.values(PRESETS), []);

  const value = useMemo(
    () => ({
      durations,
      sessionsUntilLong,
      isLoaded,
      activePresetId,
      getActivePreset,
      applyPreset,
      updateCustomDuration,
      updateCustomSessionsUntilLong,
      resetCustomPreset,
      presets,
      customDurations,
      customSessionsUntilLong,
    }),
    [
      durations,
      sessionsUntilLong,
      isLoaded,
      activePresetId,
      getActivePreset,
      applyPreset,
      updateCustomDuration,
      updateCustomSessionsUntilLong,
      resetCustomPreset,
      presets,
      customDurations,
      customSessionsUntilLong,
    ]
  );

  return (
    <TimerSettingsContext.Provider value={value}>
      {children}
    </TimerSettingsContext.Provider>
  );
}

export function useTimerSettingsContext(): TimerSettingsContextValue {
  const context = useContext(TimerSettingsContext);
  if (!context) {
    throw new Error('useTimerSettingsContext must be used within a TimerSettingsProvider');
  }
  return context;
}
