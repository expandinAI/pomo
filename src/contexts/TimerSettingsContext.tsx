'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import {
  PRESETS,
  type TimerPreset,
  type TimerDurations,
} from '@/styles/design-tokens';

// Re-export for convenience
export type { TimerDurations, TimerPreset };

const STORAGE_KEY = 'particle_timer_settings';
const CUSTOM_PRESET_KEY = 'particle_custom_preset';
const OVERFLOW_KEY = 'particle_overflow_enabled';
const DAILY_GOAL_KEY = 'particle_daily_goal';
const DEFAULT_PRESET_ID = 'classic';
const DEFAULT_OVERFLOW_ENABLED = true; // Overflow is ON by default

// Old keys for migration
const OLD_STORAGE_KEY = 'pomo_timer_settings';
const OLD_CUSTOM_PRESET_KEY = 'pomo_custom_preset';

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
    // Migrate from old key if exists
    const oldStored = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldStored && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, oldStored);
      localStorage.removeItem(OLD_STORAGE_KEY);
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed.presetId === 'string') {
        // Migrate 'pomodoro' preset ID to 'classic'
        if (parsed.presetId === 'pomodoro') {
          parsed.presetId = 'classic';
        }
        if (parsed.presetId in PRESETS) {
          return parsed;
        }
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
    // Migrate from old key if exists
    const oldStored = localStorage.getItem(OLD_CUSTOM_PRESET_KEY);
    if (oldStored && !localStorage.getItem(CUSTOM_PRESET_KEY)) {
      localStorage.setItem(CUSTOM_PRESET_KEY, oldStored);
      localStorage.removeItem(OLD_CUSTOM_PRESET_KEY);
    }

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

function loadOverflowEnabled(): boolean {
  if (typeof window === 'undefined') return DEFAULT_OVERFLOW_ENABLED;
  try {
    const stored = localStorage.getItem(OVERFLOW_KEY);
    if (stored !== null) {
      return JSON.parse(stored) === true;
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_OVERFLOW_ENABLED;
}

function saveOverflowEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OVERFLOW_KEY, JSON.stringify(enabled));
}

function loadDailyGoal(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(DAILY_GOAL_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 9) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

function saveDailyGoal(goal: number | null): void {
  if (typeof window === 'undefined') return;
  if (goal === null) {
    localStorage.removeItem(DAILY_GOAL_KEY);
  } else {
    localStorage.setItem(DAILY_GOAL_KEY, goal.toString());
  }
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
  // Overflow mode (continue past 0:00)
  overflowEnabled: boolean;
  setOverflowEnabled: (enabled: boolean) => void;
  // Daily goal (1-9 particles, null = no goal)
  dailyGoal: number | null;
  setDailyGoal: (goal: number | null) => void;
}

const TimerSettingsContext = createContext<TimerSettingsContextValue | null>(null);

interface TimerSettingsProviderProps {
  children: ReactNode;
}

export function TimerSettingsProvider({ children }: TimerSettingsProviderProps) {
  const [activePresetId, setActivePresetId] = useState<string>(DEFAULT_PRESET_ID);
  const [customDurations, setCustomDurations] = useState<TimerDurations>({ ...PRESETS.custom.durations });
  const [customSessionsUntilLong, setCustomSessionsUntilLong] = useState<number>(PRESETS.custom.sessionsUntilLong);
  const [overflowEnabled, setOverflowEnabledState] = useState<boolean>(DEFAULT_OVERFLOW_ENABLED);
  const [dailyGoal, setDailyGoalState] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();
    setActivePresetId(settings.presetId);

    const customSettings = loadCustomPreset();
    setCustomDurations(customSettings.durations);
    setCustomSessionsUntilLong(customSettings.sessionsUntilLong);

    const overflow = loadOverflowEnabled();
    setOverflowEnabledState(overflow);

    const goal = loadDailyGoal();
    setDailyGoalState(goal);

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
    const defaultDurations = { ...PRESETS.classic.durations };
    const defaultSessionsUntilLong = PRESETS.classic.sessionsUntilLong;
    setCustomDurations(defaultDurations);
    setCustomSessionsUntilLong(defaultSessionsUntilLong);
    saveCustomPreset(defaultDurations, defaultSessionsUntilLong);
  }, []);

  // Toggle overflow mode
  const setOverflowEnabled = useCallback((enabled: boolean) => {
    setOverflowEnabledState(enabled);
    saveOverflowEnabled(enabled);
  }, []);

  // Set daily goal
  const setDailyGoal = useCallback((goal: number | null) => {
    setDailyGoalState(goal);
    saveDailyGoal(goal);
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
      overflowEnabled,
      setOverflowEnabled,
      dailyGoal,
      setDailyGoal,
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
      overflowEnabled,
      setOverflowEnabled,
      dailyGoal,
      setDailyGoal,
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
