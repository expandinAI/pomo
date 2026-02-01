'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type CoachInsightFrequency = 'more' | 'normal' | 'less' | 'off';
export type CoachDisplayDuration = 3000 | 5000 | 8000;

export interface InsightFrequencyConfig {
  maxPerDay: number;
  cooldownMs: number;
  label: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

const HOUR_MS = 60 * 60 * 1000;

export const INSIGHT_FREQUENCY_CONFIG: Record<CoachInsightFrequency, InsightFrequencyConfig> = {
  more: { maxPerDay: 5, cooldownMs: 1 * HOUR_MS, label: 'More' },
  normal: { maxPerDay: 3, cooldownMs: 2 * HOUR_MS, label: 'Normal' },
  less: { maxPerDay: 1, cooldownMs: 4 * HOUR_MS, label: 'Less' },
  off: { maxPerDay: 0, cooldownMs: Infinity, label: 'Off' },
};

export const DISPLAY_DURATION_OPTIONS: { value: CoachDisplayDuration; label: string }[] = [
  { value: 3000, label: '3s' },
  { value: 5000, label: '5s' },
  { value: 8000, label: '8s' },
];

// Storage keys
const STORAGE_KEYS = {
  insightFrequency: 'particle:coach-insight-frequency',
  weeklySummary: 'particle:coach-weekly-summary',
  displayDuration: 'particle:coach-display-duration',
  lastInsightTime: 'particle:coach-last-insight-time',
  insightsToday: 'particle:coach-insights-today',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Helper functions
// ═══════════════════════════════════════════════════════════════════════════

interface InsightsTodayData {
  date: string; // YYYY-MM-DD
  count: number;
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getInsightsTodayFromStorage(): InsightsTodayData {
  if (typeof window === 'undefined') {
    return { date: getTodayDateString(), count: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.insightsToday);
    if (stored) {
      const data = JSON.parse(stored) as InsightsTodayData;
      // Reset if it's a new day
      if (data.date === getTodayDateString()) {
        return data;
      }
    }
  } catch {
    // Ignore parse errors
  }

  return { date: getTodayDateString(), count: 0 };
}

function saveInsightsTodayToStorage(data: InsightsTodayData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.insightsToday, JSON.stringify(data));
}

function getLastInsightTimeFromStorage(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.lastInsightTime);
  return stored ? parseInt(stored, 10) : null;
}

function saveLastInsightTimeToStorage(time: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.lastInsightTime, String(time));
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════

export interface UseCoachSettingsResult {
  /** Current insight frequency setting */
  insightFrequency: CoachInsightFrequency;
  /** Update insight frequency */
  setInsightFrequency: (freq: CoachInsightFrequency) => void;
  /** Whether weekly summary is enabled */
  weeklySummaryEnabled: boolean;
  /** Toggle weekly summary */
  setWeeklySummaryEnabled: (enabled: boolean) => void;
  /** How long insights are displayed in StatusMessage (ms) */
  insightDisplayDuration: CoachDisplayDuration;
  /** Update display duration */
  setInsightDisplayDuration: (duration: CoachDisplayDuration) => void;
  /** Check if we can generate a new insight (respects cooldown + daily limit) */
  canGenerateInsight: () => boolean;
  /** Record that an insight was generated (updates timestamps) */
  recordInsightGenerated: () => void;
  /** Get current config for the active frequency setting */
  currentConfig: InsightFrequencyConfig;
  /** Number of insights generated today */
  insightsToday: number;
  /** Whether settings have been loaded from storage */
  isLoaded: boolean;
}

/**
 * Hook for managing AI Coach settings with localStorage persistence.
 *
 * Controls proactive insight generation frequency, weekly summary toggle,
 * and how long insights are displayed in the StatusMessage.
 */
export function useCoachSettings(): UseCoachSettingsResult {
  // State with defaults (will be overwritten by localStorage on mount)
  const [insightFrequency, setInsightFrequencyState] = useState<CoachInsightFrequency>('normal');
  const [weeklySummaryEnabled, setWeeklySummaryEnabledState] = useState(true);
  const [insightDisplayDuration, setInsightDisplayDurationState] = useState<CoachDisplayDuration>(5000);
  const [insightsToday, setInsightsToday] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load insight frequency
    const storedFreq = localStorage.getItem(STORAGE_KEYS.insightFrequency);
    if (storedFreq && (storedFreq === 'more' || storedFreq === 'normal' || storedFreq === 'less' || storedFreq === 'off')) {
      setInsightFrequencyState(storedFreq);
    }

    // Load weekly summary
    const storedWeekly = localStorage.getItem(STORAGE_KEYS.weeklySummary);
    if (storedWeekly !== null) {
      setWeeklySummaryEnabledState(storedWeekly === 'true');
    }

    // Load display duration
    const storedDuration = localStorage.getItem(STORAGE_KEYS.displayDuration);
    if (storedDuration) {
      const parsed = parseInt(storedDuration, 10);
      if (parsed === 3000 || parsed === 5000 || parsed === 8000) {
        setInsightDisplayDurationState(parsed);
      }
    }

    // Load insights today count
    const todayData = getInsightsTodayFromStorage();
    setInsightsToday(todayData.count);

    setIsLoaded(true);
  }, []);

  // Setters with localStorage persistence
  const setInsightFrequency = useCallback((freq: CoachInsightFrequency) => {
    setInsightFrequencyState(freq);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.insightFrequency, freq);
    }
  }, []);

  const setWeeklySummaryEnabled = useCallback((enabled: boolean) => {
    setWeeklySummaryEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.weeklySummary, String(enabled));
    }
  }, []);

  const setInsightDisplayDuration = useCallback((duration: CoachDisplayDuration) => {
    setInsightDisplayDurationState(duration);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.displayDuration, String(duration));
    }
  }, []);

  // Current config based on frequency setting
  const currentConfig = useMemo(() => {
    return INSIGHT_FREQUENCY_CONFIG[insightFrequency];
  }, [insightFrequency]);

  // Check if we can generate a new insight
  const canGenerateInsight = useCallback(() => {
    // If insights are off, never generate
    if (insightFrequency === 'off') {
      return false;
    }

    const config = INSIGHT_FREQUENCY_CONFIG[insightFrequency];

    // Check daily limit
    const todayData = getInsightsTodayFromStorage();
    if (todayData.count >= config.maxPerDay) {
      return false;
    }

    // Check cooldown
    const lastTime = getLastInsightTimeFromStorage();
    if (lastTime !== null) {
      const elapsed = Date.now() - lastTime;
      if (elapsed < config.cooldownMs) {
        return false;
      }
    }

    return true;
  }, [insightFrequency]);

  // Record that an insight was generated
  const recordInsightGenerated = useCallback(() => {
    const now = Date.now();
    const today = getTodayDateString();

    // Update last insight time
    saveLastInsightTimeToStorage(now);

    // Update today's count
    const currentData = getInsightsTodayFromStorage();
    const newData: InsightsTodayData = {
      date: today,
      count: currentData.date === today ? currentData.count + 1 : 1,
    };
    saveInsightsTodayToStorage(newData);
    setInsightsToday(newData.count);
  }, []);

  return {
    insightFrequency,
    setInsightFrequency,
    weeklySummaryEnabled,
    setWeeklySummaryEnabled,
    insightDisplayDuration,
    setInsightDisplayDuration,
    canGenerateInsight,
    recordInsightGenerated,
    currentConfig,
    insightsToday,
    isLoaded,
  };
}
