'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YearGrid, YearTooltip, YearSummary, YearSelector } from '@/components/year-view';
import type { YearViewData } from '@/lib/year-view';
import { generateMockYearData } from '@/lib/year-view/mock-data';
import type { GridCell } from '@/lib/year-view/grid';
import { useTheme } from '@/hooks/useTheme';
import { useWeekStart } from '@/hooks/useWeekStart';

// Available years for navigation (mock: 2023-current)
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2023;

/**
 * Test page for YearGrid component
 * Access at: http://localhost:3000/year-test
 */
export default function YearTestPage() {
  const [currentYear, setCurrentYear] = useState(CURRENT_YEAR);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [gridAnimationComplete, setGridAnimationComplete] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { weekStartsOnMonday, weekStart, setWeekStart } = useWeekStart();

  // Generate mock data for the selected year
  const data: YearViewData = useMemo(() => generateMockYearData(currentYear), [currentYear]);

  // Find the day data for the hovered cell
  const hoveredDayData = useMemo(() => {
    if (!hoveredCell) return null;
    return data.days.find(d =>
      d.date.getFullYear() === hoveredCell.date.getFullYear() &&
      d.date.getMonth() === hoveredCell.date.getMonth() &&
      d.date.getDate() === hoveredCell.date.getDate()
    ) ?? null;
  }, [hoveredCell, data.days]);

  // Handle cell hover with rect for tooltip positioning
  const handleCellHover = useCallback((cell: GridCell | null, rect: DOMRect | null) => {
    setHoveredCell(cell);
    setHoveredRect(rect);
  }, []);

  // Handle year change with direction for animation
  const handleYearChange = useCallback((newYear: number) => {
    setDirection(newYear > currentYear ? 'left' : 'right');
    setHoveredCell(null); // Clear hover state when changing years
    setGridAnimationComplete(false); // Reset animation state for new year
    setCurrentYear(newYear);
  }, [currentYear]);

  // Handle grid animation completion
  const handleGridAnimationComplete = useCallback(() => {
    setGridAnimationComplete(true);
  }, []);

  // Animation variants for slide effect
  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'left' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'left' ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Year Selector */}
        <div className="text-center space-y-4">
          <YearSelector
            currentYear={currentYear}
            minYear={MIN_YEAR}
            maxYear={CURRENT_YEAR}
            onYearChange={handleYearChange}
          />
          <p className="text-secondary light:text-secondary-light text-sm">
            Use ← → or H / L to navigate years
          </p>
          {/* Settings toggles */}
          <div className="flex gap-3 justify-center">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg bg-surface light:bg-surface-light border border-border light:border-border-light text-primary light:text-primary-light hover:bg-border light:hover:bg-border-light transition-colors"
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>

            {/* Week start toggle */}
            <button
              onClick={() => setWeekStart(weekStart === 'monday' ? 'sunday' : 'monday')}
              className="px-4 py-2 rounded-lg bg-surface light:bg-surface-light border border-border light:border-border-light text-primary light:text-primary-light hover:bg-border light:hover:bg-border-light transition-colors"
            >
              {weekStartsOnMonday ? '📅 Mo' : '📅 So'}
            </button>
          </div>
        </div>

        {/* Animated Year Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentYear}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* Year Grid */}
            <div className="bg-surface light:bg-surface-light rounded-xl p-6">
              <YearGrid
                data={data}
                weekStartsOnMonday={weekStartsOnMonday}
                onCellHover={handleCellHover}
                onCellClick={(cell) => console.log('Clicked:', cell)}
                onAnimationComplete={handleGridAnimationComplete}
              />
            </div>

            {/* Year Summary Stats - fades in after grid animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={gridAnimationComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <YearSummary summary={data.summary} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Tooltip (outside AnimatePresence to avoid flickering) */}
        <YearTooltip
          cell={hoveredCell}
          dayData={hoveredDayData}
          anchorRect={hoveredRect}
        />
      </div>
    </div>
  );
}
