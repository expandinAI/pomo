'use client';

import { useCallback, useEffect, useState } from 'react';

type WeekStart = 'monday' | 'sunday';

interface UseWeekStartReturn {
  /** Whether the week starts on Monday (true) or Sunday (false) */
  weekStartsOnMonday: boolean;
  /** The week start day as a string */
  weekStart: WeekStart;
  /** Set the week start day */
  setWeekStart: (start: WeekStart) => void;
  /** Toggle between Monday and Sunday */
  toggleWeekStart: () => void;
}

const STORAGE_KEY = 'particle-week-start';

/**
 * Hook for managing week start preference
 *
 * Monday is the default (European convention).
 * Persists changes to localStorage.
 */
export function useWeekStart(): UseWeekStartReturn {
  // Monday is the default (European convention)
  const [weekStart, setWeekStartState] = useState<WeekStart>('monday');

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as WeekStart | null;
    if (stored === 'monday' || stored === 'sunday') {
      setWeekStartState(stored);
    }
  }, []);

  // Update localStorage when setting changes
  const setWeekStart = useCallback((newStart: WeekStart) => {
    setWeekStartState(newStart);
    localStorage.setItem(STORAGE_KEY, newStart);
  }, []);

  const toggleWeekStart = useCallback(() => {
    setWeekStart(weekStart === 'monday' ? 'sunday' : 'monday');
  }, [weekStart, setWeekStart]);

  return {
    weekStartsOnMonday: weekStart === 'monday',
    weekStart,
    setWeekStart,
    toggleWeekStart,
  };
}
