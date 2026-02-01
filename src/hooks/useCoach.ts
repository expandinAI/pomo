'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { CoachInsight, CoachMessage } from '@/components/coach/types';
import { buildCoachContext, type CoachContext } from '@/lib/coach';
import type { GeneratedInsight } from '@/lib/coach';
import { useCoachSettings } from '@/hooks/useCoachSettings';

interface UseCoachResult {
  /** Current insight from the coach */
  insight: CoachInsight | null;
  /** Whether insight is currently being generated */
  isLoadingInsight: boolean;
  /** Error message for insight generation */
  insightError: string | null;
  /** Chat message history */
  messages: CoachMessage[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** User's context for AI interactions */
  context: CoachContext | null;
  /** Refresh the context from IndexedDB */
  refreshContext: () => Promise<void>;
  /** Generate a daily insight */
  generateDailyInsight: () => Promise<void>;
}

/**
 * useCoach - Hook for AI Coach state management
 *
 * Provides context building from IndexedDB session data and
 * insight generation via the API.
 */
export function useCoach(): UseCoachResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<CoachContext | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);

  // Insight state
  const [insight, setInsight] = useState<CoachInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Coach settings for frequency control
  const { canGenerateInsight, recordInsightGenerated, isLoaded: settingsLoaded } = useCoachSettings();

  // Session-level flag to prevent retries on errors (doesn't count against daily limit)
  const hasAttemptedThisSession = useRef(false);

  /**
   * Load coach context from IndexedDB
   */
  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newContext = await buildCoachContext();
      console.log('[useCoach] Context loaded:', {
        totalParticles: newContext.sessionSummary.totalParticles,
        weekParticles: newContext.sessionSummary.weekParticles,
        todayParticles: newContext.sessionSummary.todayParticles,
        patterns: newContext.patterns.length,
      });
      setContext(newContext);
    } catch (err) {
      console.error('[useCoach] Failed to build coach context:', err);
      setError('Failed to load your data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate a daily insight from the AI
   */
  const generateDailyInsight = useCallback(async () => {
    // Skip if already attempted this session (prevents infinite retry loops on errors)
    if (hasAttemptedThisSession.current) {
      console.log('[useCoach] Already attempted this session');
      return;
    }
    // Skip if settings-based limits don't allow generation
    if (!canGenerateInsight()) {
      console.log('[useCoach] Insight generation blocked by frequency settings');
      return;
    }
    if (!context) {
      console.log('[useCoach] No context available yet');
      return;
    }

    // Mark as attempted for this session
    hasAttemptedThisSession.current = true;

    console.log('[useCoach] Generating daily insight...', {
      todayParticles: context.sessionSummary.todayParticles,
      totalParticles: context.sessionSummary.totalParticles,
    });

    setIsLoadingInsight(true);
    setInsightError(null);

    try {
      const response = await fetch('/api/coach/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'daily',
          context,
        }),
      });

      console.log('[useCoach] API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        const generated: GeneratedInsight = data.insight;
        console.log('[useCoach] Insight generated:', generated.title);

        setInsight({
          id: `insight-${Date.now()}`,
          type: generated.type,
          title: generated.title,
          content: generated.content,
          highlights: generated.highlights,
          createdAt: new Date(),
        });
        recordInsightGenerated();

        // Dispatch event for CoachParticle glow + StatusMessage preview
        window.dispatchEvent(new CustomEvent('particle:insight-ready', {
          detail: {
            title: generated.title,
            preview: generated.title // Title is already concise, use as preview
          }
        }));
      } else if (response.status === 429) {
        // Quota limit reached - graceful degradation
        console.log('[useCoach] Quota limit reached (429), skipping insight');
        // Don't record - already at limit, will be handled by canGenerateInsight
      } else if (response.status === 403) {
        // Not a Flow user - graceful degradation
        console.log('[useCoach] Flow subscription required (403)');
        // Don't record - user doesn't have access
      } else if (response.status === 401) {
        console.log('[useCoach] Not authenticated (401)');
        // Don't record - user not authenticated
      } else if (response.status === 404) {
        console.log('[useCoach] User not found (404)');
        // Don't record - user not found
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('[useCoach] API error:', response.status, errorData);
        setInsightError(errorData.error || 'Could not generate insight');
        // Don't record - generic error
      }
    } catch (err) {
      console.error('[useCoach] Failed to generate insight:', err);
      setInsightError('Could not generate insight');
      // Don't record - network/fetch error
    } finally {
      setIsLoadingInsight(false);
    }
  }, [context, canGenerateInsight, recordInsightGenerated]);

  // Load context on mount
  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  // Generate insight when context and settings are ready
  useEffect(() => {
    if (context && settingsLoaded && !hasAttemptedThisSession.current && !insight) {
      generateDailyInsight();
    }
  }, [context, settingsLoaded, insight, generateDailyInsight]);

  return {
    insight,
    isLoadingInsight,
    insightError,
    messages,
    isLoading,
    error,
    context,
    refreshContext,
    generateDailyInsight,
  };
}
