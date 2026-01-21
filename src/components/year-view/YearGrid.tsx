'use client';

import { useMemo } from 'react';
import type { YearViewData } from '@/lib/year-view';
import { generateYearGrid, type GridCell, type YearGridData } from '@/lib/year-view/grid';
import { YearGridCell } from './YearGridCell';
import { prefersReducedMotion } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface YearGridProps {
  /** Year view data with all days and statistics */
  data: YearViewData;
  /** Whether weeks start on Monday (default: true) */
  weekStartsOnMonday?: boolean;
  /** Callback when hovering over a cell */
  onCellHover?: (cell: GridCell | null) => void;
  /** Callback when clicking a cell */
  onCellClick?: (cell: GridCell) => void;
}

// Weekday labels (Monday-first)
const WEEKDAY_LABELS_MONDAY = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
// Weekday labels (Sunday-first)
const WEEKDAY_LABELS_SUNDAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Year Grid Component
 *
 * Displays a 7×53 grid showing 365 days as particles.
 * Brightness indicates activity level, with peak days glowing.
 *
 * Layout:
 * ```
 *          Jan    Feb    Mar    ...    Dec
 *     Mo   [cells for all Mondays...]
 *     Tu   [cells for all Tuesdays...]
 *     We   ...
 *     Th   ...
 *     Fr   ...
 *     Sa   ...
 *     Su   ...
 * ```
 */
export function YearGrid({
  data,
  weekStartsOnMonday = true,
  onCellHover,
  onCellClick,
}: YearGridProps) {
  const reducedMotion = prefersReducedMotion();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Generate grid data (expensive, memoize)
  const gridData: YearGridData = useMemo(
    () => generateYearGrid(data, weekStartsOnMonday),
    [data, weekStartsOnMonday]
  );

  const weekdayLabels = weekStartsOnMonday
    ? WEEKDAY_LABELS_MONDAY
    : WEEKDAY_LABELS_SUNDAY;

  // Build aria description
  const ariaLabel = useMemo(() => {
    const { totalParticles, activeDays } = data.summary;
    return `Year ${data.year} focus activity: ${totalParticles} particles across ${activeDays} active days`;
  }, [data]);

  return (
    <div className="overflow-x-auto flex justify-center">
      <div
        role="grid"
        aria-label={ariaLabel}
        className="inline-block"
      >
        {/* Month labels row */}
        <div className="flex mb-2" aria-hidden="true">
          {/* Empty cell for weekday labels column */}
          <div className="w-6 flex-shrink-0" />
          {/* Month labels positioned absolutely within relative container */}
          <div
            className="relative h-3"
            style={{ width: `${gridData.totalWeeks * 15}px` }}
          >
            {gridData.monthLabels.map((label, index) => {
              // Calculate position: each cell is 12px + 3px gap = 15px
              const leftPosition = label.weekIndex * 15;
              return (
                <span
                  key={`month-${index}`}
                  className="text-[8px] text-tertiary light:text-tertiary-dark absolute whitespace-nowrap"
                  style={{ left: `${leftPosition}px` }}
                >
                  {label.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Grid rows (7 days) */}
        {gridData.grid.map((row, dayIndex) => (
          <div key={`day-${dayIndex}`} className="flex mb-[3px]" role="row">
            {/* Weekday label */}
            <div
              className="w-6 flex-shrink-0 flex items-center"
              aria-hidden="true"
            >
              <span className="text-[10px] text-tertiary light:text-tertiary-dark font-medium">
                {weekdayLabels[dayIndex]}
              </span>
            </div>

            {/* Cells for this weekday */}
            <div className="flex gap-[3px]">
              {row.map((cell, weekIndex) => {
                if (cell === null) {
                  // Empty cell (before Jan 1 or after Dec 31)
                  return (
                    <div
                      key={`empty-${dayIndex}-${weekIndex}`}
                      className="w-3 h-3"
                      aria-hidden="true"
                    />
                  );
                }

                return (
                  <YearGridCell
                    key={`cell-${dayIndex}-${weekIndex}`}
                    cell={cell}
                    reducedMotion={reducedMotion}
                    animationDelay={reducedMotion ? 0 : weekIndex * 0.01}
                    isDarkMode={isDarkMode}
                    onHover={onCellHover}
                    onClick={onCellClick}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
