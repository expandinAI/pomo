// src/hooks/useParticleMemory.ts
//
// Hook that generates a Particle Memory after a work session completes.
// Fire-and-forget: generates memory, writes to DB, silent on failure.

import { useCallback } from 'react';
import { useSessionStore, type UnifiedSession } from '@/contexts/SessionContext';
import { useProjects } from './useProjects';
import { generateMemory, type MemoryContext } from '@/lib/coach/memory-generator';

/**
 * Get YYYY-MM-DD date key from ISO timestamp
 */
function getDateKey(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-CA');
}

/**
 * Get the start of the current week (Monday)
 */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(now);
  monday.setDate(monday.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function useParticleMemory(): {
  generateMemoryForSession: (session: UnifiedSession) => void;
} {
  const { sessions, updateSession } = useSessionStore();
  const { getById } = useProjects();

  const generateMemoryForSession = useCallback(
    (session: UnifiedSession) => {
      try {
        // Guard: only work sessions
        if (session.type !== 'work') return;

        const workSessions = sessions.filter(s => s.type === 'work');
        const todayKey = getDateKey(session.completedAt);

        // todayWorkCount: work sessions today BEFORE this one
        const todayWorkCount = workSessions.filter(
          s => getDateKey(s.completedAt) === todayKey && s.id !== session.id
        ).length;

        // allTimeDailyMax: group all work sessions by date, find max count
        const dayCounts = new Map<string, number>();
        for (const s of workSessions) {
          if (s.id === session.id) continue; // exclude current session
          const key = getDateKey(s.completedAt);
          dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
        }
        const allTimeDailyMax = Math.max(0, ...Array.from(dayCounts.values()));

        // daysSinceLastSession: find most recent work session before this one
        let daysSinceLastSession = 0;
        const thisTime = new Date(session.completedAt).getTime();
        const previousWorkSessions = workSessions
          .filter(s => s.id !== session.id && new Date(s.completedAt).getTime() < thisTime)
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

        if (previousWorkSessions.length > 0) {
          const lastDate = new Date(previousWorkSessions[0].completedAt);
          const sessionDate = new Date(session.completedAt);
          // Compute difference in calendar days
          const lastDay = new Date(lastDate);
          lastDay.setHours(0, 0, 0, 0);
          const thisDay = new Date(sessionDate);
          thisDay.setHours(0, 0, 0, 0);
          daysSinceLastSession = Math.round(
            (thisDay.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        // longestThisWeekDuration: max work duration this week (excluding this session)
        const weekStart = getWeekStart();
        const longestThisWeekDuration = workSessions
          .filter(
            s =>
              s.id !== session.id &&
              new Date(s.completedAt) >= weekStart
          )
          .reduce((max, s) => Math.max(max, s.duration), 0);

        // consecutiveSameProject: count backwards including this session
        let consecutiveSameProject = 1;
        if (session.projectId) {
          // Sessions are newest-first in the store
          const sortedByTime = [...workSessions]
            .filter(s => s.id !== session.id)
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

          for (const s of sortedByTime) {
            if (s.projectId === session.projectId) {
              consecutiveSameProject++;
            } else {
              break;
            }
          }
        }

        // lifetimeWorkCount: total work sessions including this one
        const lifetimeWorkCount = workSessions.length;

        // sessionStartHour
        const endTime = new Date(session.completedAt);
        const startTime = new Date(endTime.getTime() - session.duration * 1000);
        const sessionStartHour = startTime.getHours();

        // Project name
        const project = session.projectId ? getById(session.projectId) : undefined;

        // Build context
        const ctx: MemoryContext = {
          sessionDuration: session.duration,
          sessionTask: session.task || null,
          sessionProjectId: session.projectId || null,
          sessionProjectName: project?.name || null,
          sessionCompletedAt: session.completedAt,
          sessionOverflowDuration: ('overflowDuration' in session ? (session.overflowDuration as number) : 0) || 0,
          sessionEstimatedDuration: ('estimatedDuration' in session ? (session.estimatedDuration as number) : 0) || session.duration,
          todayWorkCount,
          allTimeDailyMax,
          daysSinceLastSession,
          longestThisWeekDuration,
          consecutiveSameProject,
          lifetimeWorkCount,
          sessionStartHour,
        };

        const memory = generateMemory(ctx);
        if (memory) {
          void updateSession(session.id, { memory });
        }
      } catch {
        // Silent fail — memory generation is non-critical
      }
    },
    [sessions, updateSession, getById]
  );

  return { generateMemoryForSession };
}
