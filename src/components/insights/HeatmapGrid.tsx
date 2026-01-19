'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import {
  type HeatmapCell,
  type HeatmapData,
  getIntensityLevel,
  formatHour,
  formatMinutesAsHours,
} from '@/lib/session-analytics';
import { prefersReducedMotion } from '@/lib/utils';

interface HeatmapGridProps {
  data: HeatmapData;
}

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// Intensity classes for each level (0-4)
const INTENSITY_CLASSES = [
  'bg-tertiary/5 light:bg-tertiary-dark/5',      // 0 - empty
  'bg-accent/20 light:bg-accent-dark/20',         // 1 - low
  'bg-accent/40 light:bg-accent-dark/40',         // 2 - medium
  'bg-accent/70 light:bg-accent-dark/70',         // 3 - high
  'bg-accent light:bg-accent-dark',               // 4 - peak
] as const;

/**
 * GitHub-style heatmap grid for focus patterns
 * 7 rows (Mon-Sun) × 17 columns (6am-10pm)
 */
export function HeatmapGrid({ data }: HeatmapGridProps) {
  const reducedMotion = prefersReducedMotion();

  // Generate hour labels (6, 8, 10, 12, 14, 16, 18, 20, 22)
  const hourLabels = useMemo(() => {
    const labels: number[] = [];
    for (let h = 6; h <= 22; h += 2) {
      labels.push(h);
    }
    return labels;
  }, []);

  // Build aria label for screen readers
  const ariaLabel = useMemo(() => {
    const descriptions: string[] = [];
    for (const row of data.grid) {
      for (const cell of row) {
        if (cell.totalMinutes > 0) {
          const dayName = DAY_LABELS[cell.day];
          const hourStr = formatHour(cell.hour);
          descriptions.push(`${dayName} ${hourStr}: ${formatMinutesAsHours(cell.totalMinutes)}`);
        }
      }
    }
    return descriptions.length > 0
      ? `Focus heatmap showing ${descriptions.length} active time slots`
      : 'Focus heatmap with no data';
  }, [data.grid]);

  return (
    <div className="overflow-x-auto flex justify-center">
      <div
        role="grid"
        aria-label={ariaLabel}
        className="inline-block"
      >
        {/* Hour labels row */}
        <div className="flex mb-1" role="row" aria-hidden="true">
          {/* Empty cell for day labels column */}
          <div className="w-6 flex-shrink-0" />

          {/* Hour labels - show every 2 hours */}
          <div className="flex gap-0.5">
            {data.grid[0].map((cell, hourIndex) => {
              const showLabel = hourLabels.includes(cell.hour);
              return (
                <div
                  key={`hour-${cell.hour}`}
                  className="w-3.5 h-3.5 flex items-center justify-center"
                >
                  {showLabel && (
                    <span className="text-[8px] text-tertiary light:text-tertiary-dark tabular-nums">
                      {cell.hour}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid rows */}
        {data.grid.map((row, dayIndex) => (
          <div key={`day-${dayIndex}`} className="flex mb-0.5" role="row">
            {/* Day label */}
            <div
              className="w-6 flex-shrink-0 flex items-center"
              aria-hidden="true"
            >
              <span className="text-[10px] text-tertiary light:text-tertiary-dark font-medium">
                {DAY_LABELS[dayIndex]}
              </span>
            </div>

            {/* Cells for this day */}
            <div className="flex gap-0.5">
              {row.map((cell, hourIndex) => (
                <HeatmapCellComponent
                  key={`cell-${dayIndex}-${hourIndex}`}
                  cell={cell}
                  isPeak={
                    data.peakSlot?.day === cell.day &&
                    data.peakSlot?.hour === cell.hour
                  }
                  reducedMotion={reducedMotion}
                  animationDelay={reducedMotion ? 0 : (dayIndex * 17 + hourIndex) * 0.008}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HeatmapCellComponentProps {
  cell: HeatmapCell;
  isPeak: boolean;
  reducedMotion: boolean;
  animationDelay: number;
}

function HeatmapCellComponent({
  cell,
  isPeak,
  reducedMotion,
  animationDelay,
}: HeatmapCellComponentProps) {
  const level = getIntensityLevel(cell.intensity);
  const dayName = DAY_LABELS[cell.day];
  const hourStr = formatHour(cell.hour);

  const tooltipText = cell.totalMinutes > 0
    ? `${dayName} ${hourStr}: ${formatMinutesAsHours(cell.totalMinutes)} (${cell.sessionsCount} session${cell.sessionsCount !== 1 ? 's' : ''})`
    : `${dayName} ${hourStr}: No sessions`;

  const ariaLabel = cell.totalMinutes > 0
    ? `${dayName} at ${hourStr}: ${formatMinutesAsHours(cell.totalMinutes)}, ${cell.sessionsCount} sessions${isPeak ? ', peak focus time' : ''}`
    : `${dayName} at ${hourStr}: no sessions`;

  return (
    <motion.div
      role="gridcell"
      aria-label={ariaLabel}
      aria-current={isPeak ? 'true' : undefined}
      title={tooltipText}
      className={`
        w-3.5 h-3.5 rounded-sm cursor-default transition-colors
        ${INTENSITY_CLASSES[level]}
        ${isPeak ? 'ring-1 ring-accent light:ring-accent-dark ring-offset-1 ring-offset-surface light:ring-offset-surface-dark' : ''}
      `}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.2, delay: animationDelay }
      }
      whileHover={
        reducedMotion
          ? {}
          : { scale: 1.3, transition: { type: 'spring', ...SPRING.snappy } }
      }
    />
  );
}
