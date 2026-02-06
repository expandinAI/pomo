'use client';

import { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '@/contexts/SessionContext';
import { useProjectStore } from '@/contexts/ProjectContext';
import {
  findMatchingContext,
  buildMorningInsight,
} from '@/lib/coach/intention-insights';
import type { CompletedSession } from '@/lib/session-storage';

const DEBOUNCE_MS = 500;

interface UseIntentionInsightReturn {
  insight: string | null;
  isLoading: boolean;
}

/**
 * Morning Context hook — debounced search for historical insight while typing intention.
 *
 * Uses local data only (projects, sessions). No API calls.
 */
export function useIntentionInsight(intentionText: string): UseIntentionInsightReturn {
  const { sessions } = useSessionStore();
  const { projects } = useProjectStore();
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear on empty text
    if (!intentionText.trim() || intentionText.trim().length < 3) {
      setInsight(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const projectList = projects.map((p) => ({ id: p.id, name: p.name }));
      const match = findMatchingContext(
        intentionText,
        projectList,
        sessions as CompletedSession[]
      );

      if (match) {
        setInsight(buildMorningInsight(match));
      } else {
        setInsight(null);
      }
      setIsLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [intentionText, sessions, projects]);

  return { insight, isLoading };
}
