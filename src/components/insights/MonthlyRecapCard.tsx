'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/utils';
import { formatHoursMinutes, formatHoursDecimal } from '@/lib/session-analytics';
import { buildMonthlyRecap } from '@/lib/monthly-recap';
import type { CompletedSession } from '@/lib/session-storage';

interface MonthlyRecapCardProps {
  sessions: CompletedSession[];
}

/**
 * Monthly Recap Card — current month stats with MoM comparison and standout particle.
 * Always shows current month regardless of timeRange filter.
 * Hidden when no sessions exist this month.
 */
export function MonthlyRecapCard({ sessions }: MonthlyRecapCardProps) {
  const reducedMotion = prefersReducedMotion();

  const recap = useMemo(() => buildMonthlyRecap(sessions), [sessions]);

  if (!recap) return null;

  const trendSign = recap.comparison?.trend === 'up' ? '+' : '';
  const trendColor = recap.comparison?.trend === 'up'
    ? 'text-accent light:text-accent-dark'
    : 'text-tertiary light:text-tertiary-dark';

  return (
    <motion.section
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { delay: 0.3 }}
      className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4"
    >
      {/* Month label */}
      <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-2">
        {recap.monthLabel}
      </h3>

      {/* Stats line */}
      <p className="text-xs text-primary light:text-primary-dark">
        <span className="font-medium">{formatHoursMinutes(recap.totalSeconds)}</span>
        {' '}focused
        <span className="mx-1.5 text-tertiary light:text-tertiary-dark">&middot;</span>
        <span className="font-medium">{recap.particleCount}</span>
        {' '}{recap.particleCount === 1 ? 'particle' : 'particles'}
      </p>

      <p className="text-xs text-tertiary light:text-tertiary-dark mt-0.5">
        {recap.activeDays} active {recap.activeDays === 1 ? 'day' : 'days'}
      </p>

      {/* Month-over-month comparison */}
      {recap.comparison && (
        <p className={`text-xs mt-2 ${trendColor}`}>
          {trendSign}{formatHoursDecimal(Math.abs(recap.comparison.trendDelta))}h from {recap.comparison.prevMonthLabel}
        </p>
      )}

      {/* Highlight */}
      {recap.highlight && (
        <>
          <div className="border-t border-tertiary/10 light:border-tertiary-dark/10 my-3" />
          <div className="flex items-start gap-2 text-xs text-secondary light:text-secondary-dark">
            <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-tertiary light:text-tertiary-dark" />
            <span>{recap.highlight.narrative}</span>
          </div>
        </>
      )}
    </motion.section>
  );
}
