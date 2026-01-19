'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';

export interface TimerDurations {
  work: number; // in seconds
  shortBreak: number;
  longBreak: number;
}

export interface TimerPreset {
  name: string;
  label: string;
  durations: TimerDurations;
}

export const TIMER_PRESETS: TimerPreset[] = [
  {
    name: 'classic',
    label: 'Classic',
    durations: { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 },
  },
  {
    name: 'deepWork',
    label: 'Deep Work',
    durations: { work: 50 * 60, shortBreak: 10 * 60, longBreak: 30 * 60 },
  },
  {
    name: 'sprint',
    label: 'Sprint',
    durations: { work: 15 * 60, shortBreak: 3 * 60, longBreak: 10 * 60 },
  },
];

const STORAGE_KEY = 'pomo_timer_settings';
const DEFAULT_DURATIONS: TimerDurations = TIMER_PRESETS[0].durations;

function loadSettings(): TimerDurations {
  if (typeof window === 'undefined') return DEFAULT_DURATIONS;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        typeof parsed.work === 'number' &&
        typeof parsed.shortBreak === 'number' &&
        typeof parsed.longBreak === 'number'
      ) {
        return parsed;
      }
    }
  } catch {
    // Ignore errors, use default
  }
  return DEFAULT_DURATIONS;
}

function saveSettings(durations: TimerDurations): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(durations));
}

interface TimerSettingsContextValue {
  durations: TimerDurations;
  isLoaded: boolean;
  updateDuration: (key: keyof TimerDurations, minutes: number) => void;
  applyPreset: (presetName: string) => void;
  currentPreset: string | undefined;
  presets: TimerPreset[];
}

const TimerSettingsContext = createContext<TimerSettingsContextValue | null>(null);

interface TimerSettingsProviderProps {
  children: ReactNode;
}

export function TimerSettingsProvider({ children }: TimerSettingsProviderProps) {
  const [durations, setDurations] = useState<TimerDurations>(DEFAULT_DURATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setDurations(loadSettings());
    setIsLoaded(true);
  }, []);

  // Update a single duration
  const updateDuration = useCallback((key: keyof TimerDurations, minutes: number) => {
    const seconds = Math.max(1, Math.min(90, minutes)) * 60;
    setDurations((prev) => {
      const updated = { ...prev, [key]: seconds };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Apply a preset
  const applyPreset = useCallback((presetName: string) => {
    const preset = TIMER_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setDurations(preset.durations);
      saveSettings(preset.durations);
    }
  }, []);

  // Get current preset name (if any matches)
  const currentPreset = TIMER_PRESETS.find(
    (p) =>
      p.durations.work === durations.work &&
      p.durations.shortBreak === durations.shortBreak &&
      p.durations.longBreak === durations.longBreak
  )?.name;

  const value = useMemo(
    () => ({
      durations,
      isLoaded,
      updateDuration,
      applyPreset,
      currentPreset,
      presets: TIMER_PRESETS,
    }),
    [durations, isLoaded, updateDuration, applyPreset, currentPreset]
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
