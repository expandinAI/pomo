'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { type DailyStats, formatHoursDecimal } from '@/lib/session-analytics';
import { prefersReducedMotion } from '@/lib/utils';

interface WeeklyBarChartProps {
  dailyStats: DailyStats[];
  bestDay: DailyStats | null;
  /** Goal line in hours (default: 4h based on Cal Newport's recommendation) */
  goalHours?: number;
  /** Whether to show the goal line */
  showGoal?: boolean;
}

/**
 * Minimal bar chart for weekly focus data
 * Linia-inspired: clean lines, generous spacing, data as art
 */
export function WeeklyBarChart({
  dailyStats,
  bestDay,
  goalHours = 4,
  showGoal = false,
}: WeeklyBarChartProps) {
  const reducedMotion = prefersReducedMotion();

  // Convert goal to seconds for comparison
  const goalSeconds = goalHours * 3600;

  // Find max for scaling - include goal if shown (minimum 1 to prevent division by zero)
  const dataMax = Math.max(...dailyStats.map(d => d.totalSeconds), 1);
  const maxSeconds = showGoal ? Math.max(dataMax, goalSeconds * 1.1) : dataMax;

  // Calculate goal line position as percentage
  const goalPercent = showGoal ? (goalSeconds / maxSeconds) * 100 : 0;

  // Build aria label for screen readers
  const ariaLabel = dailyStats
    .map(d => {
      const hours = formatHoursDecimal(d.totalSeconds);
      const isBest = bestDay && d.date === bestDay.date;
      return `${d.dayName} ${hours} hours${isBest ? ' best day' : ''}`;
    })
    .join(', ');

  return (
    <div
      role="img"
      aria-label={`Weekly focus chart: ${ariaLabel}`}
      className="flex flex-col items-center"
    >
      {/* Bars container with goal line */}
      <div
        className="flex items-end justify-center gap-3 h-[120px] relative"
        aria-hidden="true"
      >
        {/* Goal line */}
        {showGoal && goalPercent > 0 && (
          <motion.div
            className="absolute left-0 right-0 flex items-center pointer-events-none"
            style={{ bottom: `${goalPercent}%` }}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={reducedMotion ? { duration: 0 } : { delay: 0.3, duration: 0.3 }}
          >
            <div className="flex-1 h-px bg-accent/30 light:bg-accent-dark/30 border-dashed" />
            <span className="ml-2 text-[10px] text-accent/60 light:text-accent-dark/60 font-medium whitespace-nowrap">
              {goalHours}h
            </span>
          </motion.div>
        )}
        {dailyStats.map((day, index) => {
          const isBestDay = bestDay && day.date === bestDay.date;
          const heightPercent = day.totalSeconds > 0
            ? (day.totalSeconds / maxSeconds) * 100
            : 0;

          // Minimum visual height for zero days (subtle indicator)
          const visualHeight = heightPercent > 0 ? heightPercent : 3;

          return (
            <motion.div
              key={day.date}
              className="flex flex-col items-center"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { delay: index * 0.05 }}
            >
              {/* Bar */}
              <div
                className="w-6 relative"
                style={{ height: '100px' }}
              >
                <motion.div
                  className={`
                    absolute bottom-0 w-full rounded-t-md
                    ${isBestDay
                      ? 'bg-accent light:bg-accent-dark'
                      : day.totalSeconds > 0
                        ? 'bg-accent/40 light:bg-accent-dark/40'
                        : 'bg-tertiary/20 light:bg-tertiary-dark/20'
                    }
                  `}
                  style={{ height: `${visualHeight}%` }}
                  initial={reducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : {
                          type: 'spring',
                          ...SPRING.gentle,
                          delay: index * 0.05,
                        }
                  }
                  whileHover={reducedMotion ? {} : { scale: 1.05 }}
                  title={`${day.sessionsCount} session${day.sessionsCount !== 1 ? 's' : ''}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Day labels */}
      <div className="flex justify-center gap-3 mt-2" aria-hidden="true">
        {dailyStats.map(day => {
          const isBestDay = bestDay && day.date === bestDay.date;

          return (
            <div
              key={`label-${day.date}`}
              className={`
                w-6 text-center text-xs
                ${isBestDay
                  ? 'text-accent light:text-accent-dark font-medium'
                  : 'text-tertiary light:text-tertiary-dark'
                }
              `}
            >
              {day.dayName.slice(0, 2)}
            </div>
          );
        })}
      </div>

      {/* Hours labels */}
      <div className="flex justify-center gap-3 mt-1" aria-hidden="true">
        {dailyStats.map(day => (
          <div
            key={`hours-${day.date}`}
            className="w-6 text-center text-[10px] text-tertiary light:text-tertiary-dark tabular-nums"
          >
            {day.totalSeconds > 0 ? formatHoursDecimal(day.totalSeconds) : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
