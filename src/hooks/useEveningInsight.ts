'use client';

import { useState, useEffect, useRef } from 'react';
import {
  generateLocalEveningInsight,
  type EveningInsightContext,
} from '@/lib/coach/intention-insights';

interface UseEveningInsightReturn {
  insight: string | null;
  isLoading: boolean;
}

/**
 * Evening Insight hook — tries AI generation, falls back to local.
 *
 * Flow tier: POST /api/coach/evening → AI insight
 * Free tier / error: generateLocalEveningInsight() → template
 */
export function useEveningInsight(
  context: EveningInsightContext | null
): UseEveningInsightReturn {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (!context) {
      setInsight(null);
      setIsLoading(false);
      return;
    }

    // Prevent concurrent calls
    if (generatingRef.current) return;

    async function generate() {
      generatingRef.current = true;
      setIsLoading(true);

      try {
        // Try AI generation
        const res = await fetch('/api/coach/evening', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.insight && typeof data.insight === 'string') {
            setInsight(data.insight);
            setIsLoading(false);
            generatingRef.current = false;
            return;
          }
        }
        // 403, 429, or other error → fall through to local
      } catch {
        // Network error → fall through to local
      }

      // Local fallback
      setInsight(generateLocalEveningInsight(context!));
      setIsLoading(false);
      generatingRef.current = false;
    }

    generate();
  }, [context]);

  return { insight, isLoading };
}
