'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';
import {
  generateWeeklyReport,
  formatHoursMinutes,
  formatHoursDecimal,
  type WeeklyReport,
} from '@/lib/session-analytics';

interface WeeklyReportSummaryProps {
  /** Trigger refresh when this changes */
  refreshTrigger?: number;
}

/**
 * Weekly Report Summary
 * Shows top tasks, comparison vs last week, and best day
 */
export function WeeklyReportSummary({ refreshTrigger }: WeeklyReportSummaryProps) {
  const reducedMotion = prefersReducedMotion();

  const report = useMemo(() => {
    return generateWeeklyReport(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Format week range (e.g., "Jan 13-19")
  const weekRangeLabel = useMemo(() => {
    const startMonth = report.weekStart.toLocaleDateString('en-US', { month: 'short' });
    const startDay = report.weekStart.getDate();
    const endDay = report.weekEnd.getDate();
    const endMonth = report.weekEnd.toLocaleDateString('en-US', { month: 'short' });

    // Same month
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`;
    }
    // Different months
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }, [report]);

  // Format comparison
  const comparisonText = useMemo(() => {
    const { comparison } = report;
    if (comparison.totalChange === 0) return null;

    const deltaHours = formatHoursDecimal(Math.abs(comparison.totalChange));
    return comparison.trend === 'up'
      ? `+${deltaHours}h vs last week`
      : `-${deltaHours}h vs last week`;
  }, [report]);

  // No data state
  if (report.totalSessions === 0) {
    return (
      <div className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-2 text-center">
          Weekly Summary
        </h3>
        <p className="text-xs text-tertiary light:text-tertiary-dark text-center">
          No Particles collected this week yet
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
      className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4"
    >
      {/* Header with week range */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-secondary light:text-secondary-dark">
          Week of {weekRangeLabel}
        </h3>
        {comparisonText && (
          <span className="text-xs flex items-center gap-1 text-secondary light:text-secondary-dark">
            {report.comparison.trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : report.comparison.trend === 'down' ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {comparisonText}
          </span>
        )}
      </div>

      {/* Top Tasks */}
      {report.topTasks.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-tertiary light:text-tertiary-dark mb-2">Top Tasks</p>
          <div className="space-y-1.5">
            {report.topTasks.map((task, index) => (
              <div
                key={task.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-primary light:text-primary-dark truncate flex-1">
                  <span className="text-xs text-tertiary light:text-tertiary-dark w-4">
                    {index + 1}.
                  </span>
                  <span className="truncate">{task.name}</span>
                </span>
                <span className="text-xs text-secondary light:text-secondary-dark tabular-nums ml-2">
                  {formatHoursMinutes(task.totalSeconds)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Day */}
      {report.bestDay && report.bestDay.totalSeconds > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-tertiary/10 light:border-tertiary-dark/10">
          <Trophy className="w-3.5 h-3.5 text-primary light:text-primary-dark" />
          <span className="text-xs text-secondary light:text-secondary-dark">
            Best day:{' '}
            <span className="text-primary light:text-primary-dark font-medium">
              {report.bestDay.dayName}
            </span>
            {' '}({formatHoursMinutes(report.bestDay.totalSeconds)})
          </span>
        </div>
      )}
    </motion.div>
  );
}
