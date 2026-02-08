'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils';
import { buildDeepWorkInsights } from '@/lib/deep-work-insights';
import type { CompletedSession } from '@/lib/session-storage';

interface DeepWorkInsightsCardProps {
  sessions: CompletedSession[];
}

/**
 * Dashboard card showing a "Focus Profile" — stacked bar of
 * Deep Work / Normal / Quick Focus ratio, plus flow session stats.
 * Hidden when no work sessions exist (returns null).
 */
export function DeepWorkInsightsCard({ sessions }: DeepWorkInsightsCardProps) {
  const reducedMotion = prefersReducedMotion();
  const insights = useMemo(() => buildDeepWorkInsights(sessions), [sessions]);

  if (!insights) return null;

  const { breakdown, totalWorkSessions, deepWorkRatio, avgSessionDuration, flowSessions, totalOverflowSeconds } = insights;

  const deepPct = Math.round((breakdown.deepWork / totalWorkSessions) * 100);
  const normalPct = Math.round((breakdown.normal / totalWorkSessions) * 100);
  const quickPct = 100 - deepPct - normalPct;

  const avgMinutes = Math.round(avgSessionDuration / 60);
  const overflowMinutes = Math.round(totalOverflowSeconds / 60);

  return (
    <motion.section
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { delay: 0.3 }}
      className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4"
    >
      <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-3">
        Focus Profile
      </h3>

      {/* Stacked Bar */}
      <div className="h-2 rounded-full overflow-hidden flex gap-px bg-tertiary/5 light:bg-tertiary-dark/5">
        {deepPct > 0 && (
          <div
            className="bg-primary/80 light:bg-primary-dark/80 first:rounded-l-full last:rounded-r-full"
            style={{ width: `${deepPct}%` }}
          />
        )}
        {normalPct > 0 && (
          <div
            className="bg-tertiary/30 light:bg-tertiary-dark/30 first:rounded-l-full last:rounded-r-full"
            style={{ width: `${normalPct}%` }}
          />
        )}
        {quickPct > 0 && (
          <div
            className="bg-tertiary/10 light:bg-tertiary-dark/10 first:rounded-l-full last:rounded-r-full"
            style={{ width: `${quickPct}%` }}
          />
        )}
      </div>

      {/* Metrics line */}
      <div className="mt-3 flex items-center gap-2 text-xs text-tertiary light:text-tertiary-dark">
        <span>
          <span className="text-primary light:text-primary-dark font-medium">
            {Math.round(deepWorkRatio * 100)}%
          </span>
          {' '}deep work
        </span>
        <span aria-hidden="true">&middot;</span>
        <span>&Oslash; {avgMinutes}m</span>
      </div>

      {/* Flow line (conditional) */}
      {flowSessions > 0 && (
        <div className="mt-1 flex items-center gap-2 text-xs text-tertiary light:text-tertiary-dark">
          <span>{flowSessions} flow session{flowSessions !== 1 ? 's' : ''}</span>
          <span aria-hidden="true">&middot;</span>
          <span>+{overflowMinutes}m overflow</span>
        </div>
      )}
    </motion.section>
  );
}
