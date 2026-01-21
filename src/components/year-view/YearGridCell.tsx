'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import type { GridCell } from '@/lib/year-view/grid';

interface YearGridCellProps {
  cell: GridCell;
  reducedMotion: boolean;
  animationDelay: number;
  isDarkMode: boolean;
  onHover?: (cell: GridCell | null) => void;
  onClick?: (cell: GridCell) => void;
}

const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Format a date for display (e.g., "Jan 15, 2026")
 */
function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * A single cell in the year grid
 *
 * Renders a day as a small square with brightness indicating activity level.
 * Follows HeatmapGrid.tsx patterns for consistent styling.
 */
export function YearGridCell({
  cell,
  reducedMotion,
  animationDelay,
  isDarkMode,
  onHover,
  onClick,
}: YearGridCellProps) {
  const { date, particleCount, brightness, isPeakDay, isFuture, dayIndex } = cell;

  const dayName = WEEKDAY_NAMES[dayIndex];
  const dateStr = formatDateForDisplay(date);

  // Tooltip text
  const tooltipText = particleCount > 0
    ? `${dateStr}: ${particleCount} Particle${particleCount !== 1 ? 's' : ''}`
    : `${dateStr}: No sessions`;

  // Aria label for accessibility
  const ariaLabel = particleCount > 0
    ? `${dayName}, ${dateStr}: ${particleCount} Particle${particleCount !== 1 ? 's' : ''}${isPeakDay ? ', peak day' : ''}`
    : `${dayName}, ${dateStr}: no sessions`;

  // Calculate background color based on theme
  const backgroundColor = isDarkMode
    ? `rgba(255, 255, 255, ${brightness})`
    : `rgba(0, 0, 0, ${brightness})`;

  // Peak day glow effect
  const peakGlowStyle = isPeakDay
    ? isDarkMode
      ? { boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)' }
      : { boxShadow: '0 0 8px rgba(0, 0, 0, 0.4)' }
    : {};

  return (
    <motion.div
      role="gridcell"
      aria-label={ariaLabel}
      aria-current={isPeakDay ? 'true' : undefined}
      title={tooltipText}
      className="w-3 h-3 rounded-sm cursor-pointer"
      style={{
        backgroundColor,
        opacity: isFuture ? 0.3 : 1,
        ...peakGlowStyle,
      }}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: isFuture ? 0.3 : 1 }}
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
      onMouseEnter={() => onHover?.(cell)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(cell)}
    />
  );
}
