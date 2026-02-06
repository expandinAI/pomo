'use client';

import { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '@/contexts/SessionContext';
import { useProjectStore } from '@/contexts/ProjectContext';
import { useParticleOfWeek } from '@/hooks/useParticleOfWeek';
import { getWeekBoundaries } from '@/lib/session-analytics';
import type { CompletedSession } from '@/lib/session-storage';
import {
  buildWeekData,
  generateLocalNarrative,
  computeNarrativeStats,
  getWeekLabel,
  getCachedNarrative,
  saveCachedNarrative,
  MIN_PARTICLES_FOR_NARRATIVE,
  QUIET_WEEK_FALLBACK,
  type NarrativeStats,
} from '@/lib/coach/weekly-narrative';

interface UseWeeklyNarrativeReturn {
  narrative: string | null;
  stats: NarrativeStats | null;
  isLoading: boolean;
  weekLabel: string;
}

/**
 * Hook for weekly narrative — cache check → API attempt → local fallback
 *
 * Generates a 3-sentence story about the user's last completed week.
 * Flow tier gets AI-generated narratives; free tier gets local templates.
 * Results are cached in localStorage (1 generation per week).
 */
export function useWeeklyNarrative(): UseWeeklyNarrativeReturn {
  const { sessions } = useSessionStore();
  const { projects } = useProjectStore();
  const { potw } = useParticleOfWeek();

  const [narrative, setNarrative] = useState<string | null>(null);
  const [stats, setStats] = useState<NarrativeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (sessions.length === 0) {
      setIsLoading(false);
      return;
    }

    // Prevent concurrent generations
    if (generatingRef.current) return;

    async function generate() {
      generatingRef.current = true;

      try {
        const { start } = getWeekBoundaries(-1);
        const weekStart = start.toLocaleDateString('en-CA');

        // 1. Check localStorage cache
        const cached = getCachedNarrative(weekStart);
        if (cached) {
          setNarrative(cached.narrative);
          setStats(cached.stats);
          setIsLoading(false);
          generatingRef.current = false;
          return;
        }

        // 2. Build week data
        const typedSessions = sessions as CompletedSession[];
        const weekData = buildWeekData(typedSessions, projects, -1, potw);

        // 3. Check minimum threshold
        if (weekData.totalParticles < MIN_PARTICLES_FOR_NARRATIVE) {
          const narrativeStats = computeNarrativeStats(weekData);
          setNarrative(QUIET_WEEK_FALLBACK);
          setStats(narrativeStats);
          saveCachedNarrative(weekStart, {
            narrative: QUIET_WEEK_FALLBACK,
            stats: narrativeStats,
            generatedAt: new Date().toISOString(),
          });
          setIsLoading(false);
          generatingRef.current = false;
          return;
        }

        const narrativeStats = computeNarrativeStats(weekData);

        // 4. Try AI generation (Flow tier)
        try {
          const res = await fetch('/api/coach/narrative', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weekData }),
          });

          if (res.ok) {
            const { narrative: aiNarrative } = await res.json();
            if (aiNarrative && typeof aiNarrative === 'string') {
              setNarrative(aiNarrative);
              setStats(narrativeStats);
              saveCachedNarrative(weekStart, {
                narrative: aiNarrative,
                stats: narrativeStats,
                generatedAt: new Date().toISOString(),
              });
              setIsLoading(false);
              generatingRef.current = false;
              return;
            }
          }
          // 403, 429, or other error → fall through to local
        } catch {
          // Network error → fall through to local
        }

        // 5. Local fallback
        const localNarrative = generateLocalNarrative(weekData);
        setNarrative(localNarrative);
        setStats(narrativeStats);
        saveCachedNarrative(weekStart, {
          narrative: localNarrative,
          stats: narrativeStats,
          generatedAt: new Date().toISOString(),
        });
        setIsLoading(false);
      } finally {
        generatingRef.current = false;
      }
    }

    generate();
  }, [sessions, projects, potw]);

  return {
    narrative,
    stats,
    isLoading,
    weekLabel: getWeekLabel(),
  };
}
