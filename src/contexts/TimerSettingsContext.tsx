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
const AUTO_START_KEY = 'particle_auto_start_enabled';
const AUTO_START_DELAY_KEY = 'particle_auto_start_delay';
const AUTO_START_MODE_KEY = 'particle_auto_start_mode';
const DEFAULT_PRESET_ID = 'classic';
const DEFAULT_OVERFLOW_ENABLED = true; // Overflow is ON by default
const DEFAULT_AUTO_START_ENABLED = false;
const DEFAULT_AUTO_START_DELAY: AutoStartDelay = 5;
const DEFAULT_AUTO_START_MODE: AutoStartMode = 'all';

type AutoStartDelay = 3 | 5 | 10;
type AutoStartMode = 'all' | 'breaks-only';

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

function loadAutoStartEnabled(): boolean {
  if (typeof window === 'undefined') return DEFAULT_AUTO_START_ENABLED;
  try {
    const stored = localStorage.getItem(AUTO_START_KEY);
    if (stored !== null) {
      return JSON.parse(stored) === true;
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_AUTO_START_ENABLED;
}

function saveAutoStartEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTO_START_KEY, JSON.stringify(enabled));
}

function loadAutoStartDelay(): AutoStartDelay {
  if (typeof window === 'undefined') return DEFAULT_AUTO_START_DELAY;
  try {
    const stored = localStorage.getItem(AUTO_START_DELAY_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (parsed === 3 || parsed === 5 || parsed === 10) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_AUTO_START_DELAY;
}

function saveAutoStartDelay(delay: AutoStartDelay): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTO_START_DELAY_KEY, delay.toString());
}

function loadAutoStartMode(): AutoStartMode {
  if (typeof window === 'undefined') return DEFAULT_AUTO_START_MODE;
  try {
    const stored = localStorage.getItem(AUTO_START_MODE_KEY);
    if (stored === 'all' || stored === 'breaks-only') {
      return stored;
    }
  } catch {
    // Ignore errors
  }
  return DEFAULT_AUTO_START_MODE;
}

function saveAutoStartMode(mode: AutoStartMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTO_START_MODE_KEY, mode);
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
  // Auto-start next session
  autoStartEnabled: boolean;
  setAutoStartEnabled: (enabled: boolean) => void;
  autoStartDelay: AutoStartDelay;
  setAutoStartDelay: (delay: AutoStartDelay) => void;
  // Auto-start mode: 'all' or 'breaks-only'
  autoStartMode: AutoStartMode;
  setAutoStartMode: (mode: AutoStartMode) => void;
}

export type { AutoStartDelay, AutoStartMode };

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
  const [autoStartEnabled, setAutoStartEnabledState] = useState<boolean>(DEFAULT_AUTO_START_ENABLED);
  const [autoStartDelay, setAutoStartDelayState] = useState<AutoStartDelay>(DEFAULT_AUTO_START_DELAY);
  const [autoStartMode, setAutoStartModeState] = useState<AutoStartMode>(DEFAULT_AUTO_START_MODE);
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

    const autoStart = loadAutoStartEnabled();
    setAutoStartEnabledState(autoStart);

    const autoStartDelayVal = loadAutoStartDelay();
    setAutoStartDelayState(autoStartDelayVal);

    const autoStartModeVal = loadAutoStartMode();
    setAutoStartModeState(autoStartModeVal);

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

  // Set auto-start enabled
  const setAutoStartEnabled = useCallback((enabled: boolean) => {
    setAutoStartEnabledState(enabled);
    saveAutoStartEnabled(enabled);
  }, []);

  // Set auto-start delay
  const setAutoStartDelay = useCallback((delay: AutoStartDelay) => {
    setAutoStartDelayState(delay);
    saveAutoStartDelay(delay);
  }, []);

  // Set auto-start mode
  const setAutoStartMode = useCallback((mode: AutoStartMode) => {
    setAutoStartModeState(mode);
    saveAutoStartMode(mode);
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
      autoStartEnabled,
      setAutoStartEnabled,
      autoStartDelay,
      setAutoStartDelay,
      autoStartMode,
      setAutoStartMode,
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
      autoStartEnabled,
      setAutoStartEnabled,
      autoStartDelay,
      setAutoStartDelay,
      autoStartMode,
      setAutoStartMode,
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
