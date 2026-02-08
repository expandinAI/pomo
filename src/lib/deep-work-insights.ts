/**
 * Deep Work Insights — Focus profile breakdown and flow stats
 *
 * Pure functions, no React/UI imports.
 * Reuses getSessionQuality() for consistent thresholds.
 */

import type { CompletedSession } from '@/lib/session-storage';
import { getSessionQuality } from '@/lib/session-quality';

export interface DeepWorkBreakdown {
  deepWork: number;
  normal: number;
  quickFocus: number;
}

export interface DeepWorkInsights {
  totalWorkSessions: number;
  breakdown: DeepWorkBreakdown;
  deepWorkRatio: number;
  avgSessionDuration: number;
  flowSessions: number;
  totalOverflowSeconds: number;
}

/**
 * Build deep work insights from a list of sessions.
 *
 * - Filters to work sessions only
 * - Categorizes each via getSessionQuality()
 * - Overflow Champion counts as deepWork (it IS deep work that went further)
 * - Flow sessions is an orthogonal metric (overflowDuration > 0)
 *
 * @returns insights or null if no work sessions
 */
export function buildDeepWorkInsights(sessions: CompletedSession[]): DeepWorkInsights | null {
  const workSessions = sessions.filter((s) => s.type === 'work');

  if (workSessions.length === 0) return null;

  const breakdown: DeepWorkBreakdown = { deepWork: 0, normal: 0, quickFocus: 0 };
  let totalDuration = 0;
  let flowSessions = 0;
  let totalOverflowSeconds = 0;

  for (const s of workSessions) {
    totalDuration += s.duration;

    if (s.overflowDuration && s.overflowDuration > 0) {
      flowSessions++;
      totalOverflowSeconds += s.overflowDuration;
    }

    const quality = getSessionQuality(s.duration, s.estimatedDuration, s.overflowDuration);

    if (quality === null) {
      breakdown.normal++;
    } else if (quality.type === 'deep_work' || quality.type === 'overflow_champion') {
      breakdown.deepWork++;
    } else if (quality.type === 'quick_focus') {
      breakdown.quickFocus++;
    }
  }

  return {
    totalWorkSessions: workSessions.length,
    breakdown,
    deepWorkRatio: breakdown.deepWork / workSessions.length,
    avgSessionDuration: totalDuration / workSessions.length,
    flowSessions,
    totalOverflowSeconds,
  };
}
