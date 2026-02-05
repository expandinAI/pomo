'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSessionStore } from '@/contexts/SessionContext';
import { useProjects } from '@/hooks/useProjects';
import { useIntention } from '@/hooks/useIntention';
import { detectAllPatterns } from '@/lib/coach/patterns';
import { generateNudge, type NudgeType } from '@/lib/coach/nudge-generator';
import type { DBSession } from '@/lib/db/types';

interface UseStartNudgeOptions {
  isTimerIdle: boolean;
  selectedProjectId: string | null;
  currentTask: string;
  isWorkMode: boolean;
}

interface UseStartNudgeReturn {
  nudge: string | null;
  nudgeType: NudgeType | null;
}

/**
 * Hook that generates a contextual nudge shown below the start button.
 * Combines multiple data sources with debouncing for smooth updates.
 */
export function useStartNudge({
  isTimerIdle,
  selectedProjectId,
  currentTask,
  isWorkMode,
}: UseStartNudgeOptions): UseStartNudgeReturn {
  const { getSessionsFromDays, getTodaySessions, getTotalSessionCount } =
    useSessionStore();
  const { activeProjects, getById } = useProjects();
  const { todayIntention } = useIntention();

  // Debounce selectedProjectId and currentTask (500ms)
  const [debouncedProjectId, setDebouncedProjectId] = useState(selectedProjectId);
  const [debouncedTask, setDebouncedTask] = useState(currentTask);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedProjectId(selectedProjectId), 500);
    return () => clearTimeout(timer);
  }, [selectedProjectId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTask(currentTask), 500);
    return () => clearTimeout(timer);
  }, [currentTask]);

  // Get work sessions from last 30 days (cast compatible at runtime)
  const allWorkSessions = useMemo(() => {
    const sessions = getSessionsFromDays(30);
    return sessions.filter((s) => s.type === 'work') as DBSession[];
  }, [getSessionsFromDays]);

  // Detect patterns (recalculated only when sessions change)
  const patterns = useMemo(() => {
    if (allWorkSessions.length < 10) return [];
    // activeProjects have id & name, compatible with DBProject for pattern detection
    return detectAllPatterns(
      allWorkSessions,
      activeProjects as Parameters<typeof detectAllPatterns>[1]
    );
  }, [allWorkSessions, activeProjects]);

  // Calculate average per active day (only with >= 7 active days)
  const averagePerActiveDay = useMemo(() => {
    if (allWorkSessions.length === 0) return null;

    const daySet = new Set<string>();
    for (const s of allWorkSessions) {
      daySet.add(new Date(s.completedAt).toISOString().split('T')[0]);
    }

    if (daySet.size < 7) return null;
    return allWorkSessions.length / daySet.size;
  }, [allWorkSessions]);

  // Today's work count
  const todayWorkCount = useMemo(() => {
    return getTodaySessions().length;
  }, [getTodaySessions]);

  // Total work session count
  const totalWorkSessionCount = useMemo(() => {
    return getTotalSessionCount();
  }, [getTotalSessionCount]);

  // Resolve project name
  const selectedProjectName = useMemo(() => {
    if (!debouncedProjectId) return null;
    return getById(debouncedProjectId)?.name ?? null;
  }, [debouncedProjectId, getById]);

  // Use ref to avoid recalculating on every render for time values
  const nowRef = useRef({ hour: new Date().getHours(), day: new Date().getDay() });
  useEffect(() => {
    // Update time reference every minute
    const interval = setInterval(() => {
      nowRef.current = { hour: new Date().getHours(), day: new Date().getDay() };
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Generate nudge
  const result = useMemo(() => {
    if (!isTimerIdle || !isWorkMode) return { nudge: null, nudgeType: null };

    const nudgeResult = generateNudge({
      selectedProjectId: debouncedProjectId,
      selectedProjectName,
      currentTask: debouncedTask,
      todayWorkCount,
      averagePerActiveDay,
      currentHour: nowRef.current.hour,
      currentDayOfWeek: nowRef.current.day,
      patterns,
      intentionText: todayIntention?.status === 'active' ? todayIntention.text : null,
      allWorkSessions,
      activeProjects: activeProjects.map((p) => ({ id: p.id, name: p.name })),
      totalWorkSessionCount,
    });

    return {
      nudge: nudgeResult?.text ?? null,
      nudgeType: nudgeResult?.type ?? null,
    };
  }, [
    isTimerIdle,
    isWorkMode,
    debouncedProjectId,
    selectedProjectName,
    debouncedTask,
    todayWorkCount,
    averagePerActiveDay,
    patterns,
    todayIntention,
    allWorkSessions,
    activeProjects,
    totalWorkSessionCount,
  ]);

  return result;
}
