'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import type { GridCell } from '@/lib/year-view/grid';
import { cn } from '@/lib/utils';

interface YearGridCellProps {
  cell: GridCell;
  reducedMotion: boolean;
  animationDelay: number;
  isDarkMode: boolean;
  onHover?: (cell: GridCell | null, rect: DOMRect | null) => void;
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

  // Wave animation: scale + opacity for dramatic reveal
  const initialAnimation = reducedMotion
    ? { opacity: 1, scale: 1 }
    : { opacity: 0, scale: 0.6 };

  const targetAnimation = {
    opacity: isFuture ? 0.3 : 1,
    scale: 1,
  };

  const transitionConfig = reducedMotion
    ? { duration: 0 }
    : {
        duration: 0.15,
        delay: animationDelay,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
      };

  // Peak day gets larger hover scale
  const hoverScale = isPeakDay ? 1.4 : 1.3;

  return (
    <motion.div
      role="gridcell"
      aria-label={ariaLabel}
      aria-current={isPeakDay ? 'true' : undefined}
      title={tooltipText}
      className={cn(
        'w-3 h-3 rounded-sm cursor-pointer',
        isPeakDay && !reducedMotion && 'year-grid-peak-day',
        isPeakDay && reducedMotion && 'year-grid-peak-day-static',
        isDarkMode ? 'year-grid-cell-dark' : 'year-grid-cell-light'
      )}
      style={{
        backgroundColor,
        willChange: 'opacity, transform',
      }}
      initial={initialAnimation}
      animate={targetAnimation}
      transition={transitionConfig}
      whileHover={
        reducedMotion
          ? {}
          : { scale: hoverScale, transition: { type: 'spring', ...SPRING.snappy } }
      }
      onMouseEnter={(e) => onHover?.(cell, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => onHover?.(null, null)}
      onClick={() => onClick?.(cell)}
    />
  );
}
