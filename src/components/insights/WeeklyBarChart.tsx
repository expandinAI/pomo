'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { type DailyStats, formatHoursDecimal } from '@/lib/session-analytics';
import { prefersReducedMotion } from '@/lib/utils';

interface WeeklyBarChartProps {
  dailyStats: DailyStats[];
  bestDay: DailyStats | null;
}

/**
 * Minimal bar chart for weekly focus data
 * Linia-inspired: clean lines, generous spacing, data as art
 */
export function WeeklyBarChart({ dailyStats, bestDay }: WeeklyBarChartProps) {
  const reducedMotion = prefersReducedMotion();

  // Find max for scaling (minimum 1 to prevent division by zero)
  const maxSeconds = Math.max(...dailyStats.map(d => d.totalSeconds), 1);

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
      {/* Bars container */}
      <div
        className="flex items-end justify-center gap-3 h-[120px]"
        aria-hidden="true"
      >
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
                      ? 'bg-accent dark:bg-accent-dark'
                      : day.totalSeconds > 0
                        ? 'bg-accent/40 dark:bg-accent-dark/40'
                        : 'bg-tertiary/20 dark:bg-tertiary-dark/20'
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
                  ? 'text-accent dark:text-accent-dark font-medium'
                  : 'text-tertiary dark:text-tertiary-dark'
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
            className="w-6 text-center text-[10px] text-tertiary dark:text-tertiary-dark tabular-nums"
          >
            {day.totalSeconds > 0 ? formatHoursDecimal(day.totalSeconds) : ''}
          </div>
        ))}
      </div>
    </div>
  );
}
