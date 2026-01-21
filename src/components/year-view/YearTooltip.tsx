'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GridCell } from '@/lib/year-view/grid';
import type { YearViewDay } from '@/lib/year-view';
import { formatDuration } from '@/lib/utils';
import { ParticleDots } from './ParticleDots';

interface YearTooltipProps {
  /** The hovered grid cell */
  cell: GridCell | null;
  /** Full day data from YearViewData.days */
  dayData: YearViewDay | null;
  /** Anchor element rect for positioning */
  anchorRect: DOMRect | null;
  /** Container element for boundary calculations */
  containerRef?: React.RefObject<HTMLElement>;
}

interface TooltipPosition {
  x: number;
  y: number;
  anchor: 'top' | 'bottom';
}

const TOOLTIP_WIDTH = 220;
const TOOLTIP_OFFSET = 8;

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Format date for tooltip display
 * "Montag, 15. Januar 2025" in German
 */
function formatDateLong(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Calculate tooltip position to avoid clipping
 */
function calculatePosition(
  anchorRect: DOMRect,
  containerRect?: DOMRect
): TooltipPosition {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

  // Horizontal: center above the cell
  let x = anchorRect.left + anchorRect.width / 2 - TOOLTIP_WIDTH / 2;

  // Keep within viewport bounds
  const minX = containerRect ? containerRect.left + TOOLTIP_OFFSET : TOOLTIP_OFFSET;
  const maxX = (containerRect ? containerRect.right : viewportWidth) - TOOLTIP_WIDTH - TOOLTIP_OFFSET;

  x = Math.max(minX, Math.min(maxX, x));

  // Vertical: prefer above the cell
  const spaceAbove = anchorRect.top - (containerRect?.top ?? 0);
  const estimatedHeight = 160; // Approximate tooltip height

  let y: number;
  let anchor: 'top' | 'bottom';

  if (spaceAbove >= estimatedHeight + TOOLTIP_OFFSET) {
    // Position above
    y = anchorRect.top - TOOLTIP_OFFSET;
    anchor = 'bottom';
  } else {
    // Position below
    y = anchorRect.bottom + TOOLTIP_OFFSET;
    anchor = 'top';
  }

  // Keep within vertical viewport
  y = Math.max(TOOLTIP_OFFSET, Math.min(viewportHeight - estimatedHeight - TOOLTIP_OFFSET, y));

  return { x, y, anchor };
}

/**
 * Year View Tooltip
 *
 * Shows detailed information about a hovered day:
 * - Date (or "Heute" for today)
 * - Particle count with visual dots
 * - Focus duration
 * - Top task (if any)
 * - Top project (if any)
 * - Peak day badge
 * - "Ein Tag der Ruhe." for zero-particle days
 */
export function YearTooltip({
  cell,
  dayData,
  anchorRect,
  containerRef,
}: YearTooltipProps) {
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce visibility to prevent flicker on fast mouse movement
  useEffect(() => {
    if (cell && anchorRect) {
      // Show after 100ms delay
      debounceRef.current = setTimeout(() => {
        const containerRect = containerRef?.current?.getBoundingClientRect();
        setPosition(calculatePosition(anchorRect, containerRect));
        setIsVisible(true);
      }, 100);
    } else {
      // Hide immediately
      setIsVisible(false);
      setPosition(null);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [cell, anchorRect, containerRef]);

  // Don't render if not visible or missing data
  if (!isVisible || !cell || !dayData || !position) {
    return null;
  }

  const isRestDay = dayData.particleCount === 0;
  const isTodayDate = isToday(cell.date);
  const isPeakDay = dayData.isPeakDay && dayData.particleCount > 0;

  return (
    <AnimatePresence>
      <motion.div
        key="year-tooltip"
        className="fixed z-50 pointer-events-none"
        style={{
          left: position.x,
          top: position.anchor === 'bottom' ? 'auto' : position.y,
          bottom: position.anchor === 'bottom' ? `calc(100vh - ${position.y}px)` : 'auto',
          width: TOOLTIP_WIDTH,
        }}
        initial={{ opacity: 0, scale: 0.95, y: position.anchor === 'bottom' ? 4 : -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <div className="bg-surface light:bg-surface-light border border-border light:border-border-light rounded-lg shadow-xl p-4">
          {/* Date */}
          <div className="text-sm font-semibold text-primary light:text-primary-light mb-3">
            {isTodayDate ? 'Heute' : formatDateLong(cell.date)}
          </div>

          {isRestDay ? (
            /* Rest day - no particles */
            <div className="text-[13px] text-secondary light:text-secondary-light italic">
              Ein Tag der Ruhe.
            </div>
          ) : (
            /* Active day */
            <>
              {/* Particles visualization */}
              <div className="flex items-center gap-2 mb-2">
                <ParticleDots count={dayData.particleCount} max={12} />
                <span className="text-[13px] font-medium text-primary light:text-primary-light">
                  {dayData.particleCount} {dayData.particleCount === 1 ? 'Partikel' : 'Partikel'}
                </span>
              </div>

              {/* Focus duration */}
              <div className="text-xs text-secondary light:text-secondary-light mb-3">
                {formatDuration(dayData.totalDuration)} Fokuszeit
              </div>

              {/* Top task */}
              {dayData.topTask && (
                <div className="text-xs text-secondary light:text-secondary-light mb-2">
                  <span className="text-tertiary light:text-tertiary-light">Top Task: </span>
                  <span className="text-primary light:text-primary-light italic">
                    &quot;{dayData.topTask}&quot;
                  </span>
                </div>
              )}

              {/* Top project */}
              {dayData.topProject && (
                <div className="text-[11px] text-tertiary light:text-tertiary-light mb-3">
                  Projekt: {dayData.topProject.name}
                </div>
              )}

              {/* Peak day badge */}
              {isPeakDay && (
                <div className="pt-2 mt-2 border-t border-border light:border-border-light">
                  <span className="text-xs font-medium text-accent">
                    🏆 Dein produktivster Tag
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
