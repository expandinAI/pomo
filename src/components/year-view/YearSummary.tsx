'use client';

import type { YearViewSummary } from '@/lib/year-view';

interface YearSummaryProps {
  /** Year summary statistics */
  summary: YearViewSummary;
}

/**
 * Format duration from seconds to human-readable string
 * Examples: 45m, 1h, 2h 5m, 521h 35m
 */
function formatYearDuration(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Format number with locale (comma as thousand separator)
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

interface SummaryCardProps {
  value: string;
  label: string;
}

function SummaryCard({ value, label }: SummaryCardProps) {
  return (
    <div className="text-center min-w-[100px] sm:min-w-[120px]">
      <div className="text-2xl sm:text-[32px] font-bold font-mono text-primary light:text-primary-light tracking-tight leading-tight">
        {value}
      </div>
      <div className="text-[11px] sm:text-[13px] text-secondary light:text-secondary-light mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

/**
 * Year Summary Statistics
 *
 * Displays four key metrics for the year:
 * - Total Particles
 * - Total Focus Time
 * - Longest Streak
 * - Active Days
 *
 * Large, proud numbers with monospace font for a clean, professional look.
 * Responsive: 4 columns on desktop, 2×2 grid on mobile.
 */
export function YearSummary({ summary }: YearSummaryProps) {
  const {
    totalParticles,
    totalDuration,
    longestStreak,
    activeDays,
    averagePerActiveDay,
  } = summary;

  const avgFormatted = activeDays > 0
    ? averagePerActiveDay.toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-6 sm:gap-8 py-6 sm:py-8 px-4 mt-6 sm:mt-8 border-t border-border light:border-border-light">
      <SummaryCard
        value={formatNumber(totalParticles)}
        label="Particles"
      />
      <SummaryCard
        value={avgFormatted}
        label="Per Day"
      />
      <SummaryCard
        value={formatYearDuration(totalDuration)}
        label="Focus Time"
      />
      <SummaryCard
        value={`${longestStreak}`}
        label="Longest Streak"
      />
      <SummaryCard
        value={formatNumber(activeDays)}
        label="Active Days"
      />
    </div>
  );
}
