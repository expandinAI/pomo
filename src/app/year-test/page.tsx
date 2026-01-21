'use client';

import { useMemo, useState, useCallback } from 'react';
import { YearGrid, YearTooltip, YearSummary } from '@/components/year-view';
import type { YearViewData, YearViewDay } from '@/lib/year-view';
import type { GridCell } from '@/lib/year-view/grid';
import { useTheme } from '@/hooks/useTheme';

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

/**
 * Test page for YearGrid component
 * Access at: http://localhost:3000/year-test
 */
export default function YearTestPage() {
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const { theme, toggleTheme } = useTheme();

  // Generate mock data (memoized so it doesn't regenerate on every render)
  const data: YearViewData = useMemo(() => generateMockYearData(2025), []);

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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-primary">Year Grid Test</h1>
          <p className="text-secondary">
            {data.year} - {data.summary.totalParticles} particles across {data.summary.activeDays} active days
          </p>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="mt-4 px-4 py-2 rounded-lg bg-surface border border-border text-primary hover:bg-border transition-colors"
          >
            Toggle Theme ({theme === 'dark' ? '🌙 Dark' : '☀️ Light'})
          </button>
        </div>

        {/* Hovered cell info */}
        <div className="h-8 text-center">
          {hoveredCell && (
            <p className="text-secondary text-sm">
              {hoveredCell.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              : {hoveredCell.particleCount} particle{hoveredCell.particleCount !== 1 ? 's' : ''}
              {hoveredCell.isPeakDay && ' (Peak Day)'}
            </p>
          )}
        </div>

        {/* Year Grid */}
        <div className="bg-surface rounded-xl p-6">
          <YearGrid
            data={data}
            weekStartsOnMonday={true}
            onCellHover={handleCellHover}
            onCellClick={(cell) => console.log('Clicked:', cell)}
          />
        </div>

        {/* Tooltip */}
        <YearTooltip
          cell={hoveredCell}
          dayData={hoveredDayData}
          anchorRect={hoveredRect}
        />

        {/* Year Summary Stats */}
        <YearSummary summary={data.summary} />
      </div>
    </div>
  );
}
