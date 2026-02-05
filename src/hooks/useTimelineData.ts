'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSessionStore } from '@/contexts/SessionContext';
import { type CompletedSession } from '@/lib/session-storage';
import { useProjects } from './useProjects';
import type { SessionType } from '@/styles/design-tokens';
import type { IntentionAlignment } from '@/lib/db/types';

/**
 * Extended session data for timeline display
 * Includes computed startTime and enriched project info
 */
export interface TimelineSession {
  id: string;
  type: SessionType;
  startTime: Date;
  endTime: Date;
  duration: number;
  task?: string;
  projectId?: string;
  projectName?: string;
  brightness: number;
  intentionAlignment?: IntentionAlignment;
}

/**
 * Timeline data hook return type
 */
export interface UseTimelineDataReturn {
  /** Current selected date */
  date: Date;

  /** Sessions for the current date, chronologically sorted */
  sessions: TimelineSession[];

  /** Number of work sessions (particles) */
  particleCount: number;

  /** Total focus time in seconds (work sessions only) */
  totalFocusSeconds: number;

  /** First session start time of the day */
  firstStart: Date | null;

  /** Last session end time of the day */
  lastEnd: Date | null;

  /** Navigate to previous day */
  goToPreviousDay: () => void;

  /** Navigate to next day */
  goToNextDay: () => void;

  /** Navigate to today */
  goToToday: () => void;

  /** Whether we can navigate forward (not if already at today) */
  canGoForward: boolean;

  /** Check if current date is today */
  isToday: boolean;

  /** Force refresh timeline data */
  refresh: () => void;

  /** Lifetime average particles per active day (null if < 7 active days) */
  averageParticlesPerDay: number | null;
}

/**
 * Get date key in YYYY-MM-DD format
 */
function getDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
}

/**
 * Check if two dates are the same day
 */
function isSameDay(d1: Date, d2: Date): boolean {
  return getDateKey(d1) === getDateKey(d2);
}

/**
 * Hook for loading and transforming timeline data
 *
 * Provides session data enriched with start times (computed from completedAt - duration)
 * and project information. Supports day-by-day navigation.
 *
 * @example
 * ```tsx
 * const {
 *   date,
 *   sessions,
 *   particleCount,
 *   goToPreviousDay,
 *   goToNextDay,
 *   isToday
 * } = useTimelineData();
 * ```
 */
export function useTimelineData(): UseTimelineDataReturn {
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Use SessionContext for sessions
  const { sessions: contextSessions, refresh: refreshContextSessions } = useSessionStore();

  const { getById } = useProjects();

  // Get today at midnight for comparison
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // Load and transform sessions for the selected date
  const sessions = useMemo((): TimelineSession[] => {
    // Cast to CompletedSession[] for compatibility
    const allSessions = contextSessions as CompletedSession[];
    const dateKey = getDateKey(date);

    // Filter sessions for this date
    const daySessions = allSessions.filter(session => {
      const sessionDate = new Date(session.completedAt);
      return getDateKey(sessionDate) === dateKey;
    });

    // Transform to TimelineSession with computed startTime
    const transformed = daySessions.map((session): TimelineSession => {
      const endTime = new Date(session.completedAt);
      const startTime = new Date(endTime.getTime() - session.duration * 1000);

      // Get project info if available
      let projectName: string | undefined;
      let brightness = 0.7; // Default brightness

      if (session.projectId) {
        const project = getById(session.projectId);
        if (project) {
          projectName = project.name;
          brightness = project.brightness;
        }
      }

      // Extract intentionAlignment (only exists on DBSession, not CompletedSession)
      const intentionAlignment = ('intentionAlignment' in session)
        ? (session.intentionAlignment as IntentionAlignment | undefined)
        : undefined;

      return {
        id: session.id,
        type: session.type,
        startTime,
        endTime,
        duration: session.duration,
        task: session.task,
        projectId: session.projectId,
        projectName,
        brightness,
        intentionAlignment,
      };
    });

    // Sort chronologically (earliest first)
    return transformed.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [date, getById, contextSessions]);

  // Compute statistics
  const stats = useMemo(() => {
    const workSessions = sessions.filter(s => s.type === 'work');

    return {
      particleCount: workSessions.length,
      totalFocusSeconds: workSessions.reduce((sum, s) => sum + s.duration, 0),
      firstStart: sessions.length > 0 ? sessions[0].startTime : null,
      lastEnd: sessions.length > 0 ? sessions[sessions.length - 1].endTime : null,
    };
  }, [sessions]);

  // Navigation
  const goToPreviousDay = useCallback(() => {
    setDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      // Don't go beyond today
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      if (newDate > todayDate) {
        return todayDate;
      }
      return newDate;
    });
  }, []);

  const goToToday = useCallback(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    setDate(todayDate);
  }, []);

  // Force refresh of timeline data
  const refresh = useCallback(() => {
    refreshContextSessions();
  }, [refreshContextSessions]);

  // Compute lifetime average particles per active day
  const averageParticlesPerDay = useMemo(() => {
    const allSessions = contextSessions as CompletedSession[];
    const workSessions = allSessions.filter(s => s.type === 'work');

    // Count unique active days
    const activeDaySet = new Set<string>();
    for (const s of workSessions) {
      activeDaySet.add(s.completedAt.split('T')[0]);
    }
    const activeDays = activeDaySet.size;

    // Only show when enough data (>= 7 active days)
    if (activeDays < 7) return null;

    return workSessions.length / activeDays;
  }, [contextSessions]);

  const isToday = isSameDay(date, today);
  const canGoForward = !isToday;

  return {
    date,
    sessions,
    particleCount: stats.particleCount,
    totalFocusSeconds: stats.totalFocusSeconds,
    firstStart: stats.firstStart,
    lastEnd: stats.lastEnd,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    canGoForward,
    isToday,
    refresh,
    averageParticlesPerDay,
  };
}
