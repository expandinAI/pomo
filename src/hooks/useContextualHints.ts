'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'particle:contextual-hints';
const COOLDOWN_DAYS = 7;
const TRIGGER_THRESHOLD = 3;

interface HintState {
  lastHintShownAt: number | null;
  overflowCount: number;
  earlyStopCount: number;
  firstStartDate: number | null;
}

const DEFAULT_STATE: HintState = {
  lastHintShownAt: null,
  overflowCount: 0,
  earlyStopCount: 0,
  firstStartDate: null,
};

// Hint messages
const HINTS = {
  overflow: 'You were in flow. Press L to explore rhythms.',
  earlyStop: 'Shorter sessions work too. Press L to learn why.',
  firstWeek: 'One week of particles. Press L to discover your rhythm.',
} as const;

export function useContextualHints() {
  const [state, setState] = useState<HintState>(DEFAULT_STATE);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch {
        // Invalid JSON, use default
      }
    }
  }, []);

  // Save to localStorage
  const saveState = useCallback((newState: HintState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Check if cooldown has passed (7 days)
  const isCooldownActive = useCallback(() => {
    if (!state.lastHintShownAt) return false;
    const daysSince = (Date.now() - state.lastHintShownAt) / (1000 * 60 * 60 * 24);
    return daysSince < COOLDOWN_DAYS;
  }, [state.lastHintShownAt]);

  // Track overflow completion
  const trackOverflow = useCallback(() => {
    saveState({
      ...state,
      overflowCount: state.overflowCount + 1,
      firstStartDate: state.firstStartDate ?? Date.now(),
    });
  }, [state, saveState]);

  // Track early stop (skip/cancel before timer ends)
  const trackEarlyStop = useCallback(() => {
    saveState({
      ...state,
      earlyStopCount: state.earlyStopCount + 1,
      firstStartDate: state.firstStartDate ?? Date.now(),
    });
  }, [state, saveState]);

  // Track session start (for first-week calculation)
  const trackSessionStart = useCallback(() => {
    if (!state.firstStartDate) {
      saveState({ ...state, firstStartDate: Date.now() });
    }
  }, [state, saveState]);

  // Check for hint after session ends
  const checkForHint = useCallback((): string | null => {
    // Cooldown check
    if (isCooldownActive()) return null;

    // Priority 1: Overflow flow (3x overflow)
    if (state.overflowCount >= TRIGGER_THRESHOLD) {
      return HINTS.overflow;
    }

    // Priority 2: Early stop pattern (3x early stop)
    if (state.earlyStopCount >= TRIGGER_THRESHOLD) {
      return HINTS.earlyStop;
    }

    // Priority 3: First week milestone
    if (state.firstStartDate) {
      const daysSinceStart = (Date.now() - state.firstStartDate) / (1000 * 60 * 60 * 24);
      if (daysSinceStart >= 7) {
        return HINTS.firstWeek;
      }
    }

    return null;
  }, [state, isCooldownActive]);

  // Mark hint as shown (resets counters + sets cooldown)
  const markHintShown = useCallback(() => {
    saveState({
      ...state,
      lastHintShownAt: Date.now(),
      overflowCount: 0,      // Reset counters after showing
      earlyStopCount: 0,
    });
  }, [state, saveState]);

  return {
    trackOverflow,
    trackEarlyStop,
    trackSessionStart,
    checkForHint,
    markHintShown,
  };
}
