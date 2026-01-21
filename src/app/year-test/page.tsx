'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YearGrid, YearTooltip, YearSummary, YearSelector } from '@/components/year-view';
import type { YearViewData, YearViewDay } from '@/lib/year-view';
import type { GridCell } from '@/lib/year-view/grid';
import { useTheme } from '@/hooks/useTheme';
import { useWeekStart } from '@/hooks/useWeekStart';

// Sample tasks for mock data
const SAMPLE_TASKS = [
  'API Integration',
  'Feature Development',
  'Bug Fixes',
  'Code Review',
  'Documentation',
  'UI Polish',
  'Testing',
  'Refactoring',
  'Design System',
  'Performance Optimization',
];

/**
 * Generate mock year data with realistic activity patterns
 */
function generateMockYearData(year: number): YearViewData {
  const days: YearViewDay[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const today = new Date();

  let totalParticles = 0;
  let activeDays = 0;
  let personalMax = 0;
  let peakDate = startDate;

  // Generate days
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFuture = currentDate > today;

    // Generate particle count with realistic patterns:
    // - Weekdays have more activity than weekends
    // - Some random variation
    // - Future days have no activity
    let particleCount = 0;
    let topTask: string | undefined;

    if (!isFuture) {
      const baseChance = isWeekend ? 0.3 : 0.7;
      const hasActivity = Math.random() < baseChance;

      if (hasActivity) {
        // Weighted random: most days 1-4 particles, occasional high days
        const rand = Math.random();
        if (rand < 0.5) {
          particleCount = Math.floor(Math.random() * 3) + 1; // 1-3
        } else if (rand < 0.85) {
          particleCount = Math.floor(Math.random() * 4) + 4; // 4-7
        } else {
          particleCount = Math.floor(Math.random() * 6) + 8; // 8-13 (peak days)
        }

        // Assign a random task (70% chance)
        if (Math.random() < 0.7) {
          topTask = SAMPLE_TASKS[Math.floor(Math.random() * SAMPLE_TASKS.length)];
        }

        activeDays++;
        totalParticles += particleCount;

        if (particleCount > personalMax) {
          personalMax = particleCount;
          peakDate = new Date(currentDate);
        }
      }
    }

    days.push({
      date: new Date(currentDate),
      particleCount,
      totalDuration: particleCount * 25 * 60, // 25 min per particle in seconds
      topTask,
      isPeakDay: false, // Will be set after finding max
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Mark peak day
  const peakDay = days.find(d =>
    d.date.getFullYear() === peakDate.getFullYear() &&
    d.date.getMonth() === peakDate.getMonth() &&
    d.date.getDate() === peakDate.getDate()
  );
  if (peakDay) {
    peakDay.isPeakDay = true;
  }

  // Calculate streak (simplified)
  let longestStreak = 0;
  let currentStreak = 0;
  for (const day of days) {
    if (day.particleCount > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    year,
    days,
    summary: {
      totalParticles,
      totalDuration: totalParticles * 25 * 60,
      longestStreak,
      activeDays,
      averagePerActiveDay: activeDays > 0 ? totalParticles / activeDays : 0,
    },
    personalMax,
    peakDate,
  };
}

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
