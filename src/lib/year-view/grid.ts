/**
 * Year Grid Layout Calculation
 *
 * Generates a 7×53 grid layout for visualizing a full year of focus activity.
 * Each cell represents a day, positioned by week (column) and day of week (row).
 */

import type { YearViewData, YearViewDay } from './types';
import { calculateBrightness } from './brightness';

/**
 * A single cell in the year grid
 */
export interface GridCell {
  /** The date this cell represents */
  date: Date;
  /** Column index (0-52), representing week of year */
  weekIndex: number;
  /** Row index (0-6), representing day of week */
  dayIndex: number;
  /** Number of particles (focus sessions) on this day */
  particleCount: number;
  /** Visual brightness (0.08-1.0) */
  brightness: number;
  /** Whether this is the peak day of the year */
  isPeakDay: boolean;
  /** Whether this day is in the future */
  isFuture: boolean;
}

/**
 * Month label with its position in the grid
 */
export interface MonthLabel {
  /** Short month name (Jan, Feb, etc.) */
  name: string;
  /** Week index where this month starts */
  weekIndex: number;
}

/**
 * Complete grid data structure for rendering
 */
export interface YearGridData {
  /** 7 rows × variable columns, with null for empty cells */
  grid: (GridCell | null)[][];
  /** Month labels with their positions */
  monthLabels: MonthLabel[];
  /** Total number of weeks (columns) in the grid */
  totalWeeks: number;
  /** The year this grid represents */
  year: number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Get the day of week index (0-6) for a date
 *
 * @param date - The date to get the day index for
 * @param weekStartsOnMonday - Whether weeks start on Monday (true) or Sunday (false)
 * @returns Index from 0-6 where 0 is the first day of the week
 */
export function getDayOfWeekIndex(date: Date, weekStartsOnMonday: boolean): number {
  const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

  if (weekStartsOnMonday) {
    // Convert: Monday=0, Tuesday=1, ..., Sunday=6
    return (jsDay + 6) % 7;
  }

  // Sunday=0, Monday=1, ..., Saturday=6 (default JS)
  return jsDay;
}

/**
 * Cumulative days before each month (non-leap year)
 */
const DAYS_BEFORE_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

/**
 * Get day of year (0-indexed, Jan 1 = 0)
 * Uses calendar math instead of timestamps to avoid DST issues
 */
function getDayOfYear(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const dayOfMonth = date.getDate();

  let dayOfYear = DAYS_BEFORE_MONTH[month] + dayOfMonth - 1;

  // Add 1 for leap years after February
  if (month > 1 && isLeapYear(year)) {
    dayOfYear++;
  }

  return dayOfYear;
}

/**
 * Get the week of year index for a date
 *
 * Week 0 is the partial week containing Jan 1.
 * Each subsequent week starts on the configured first day.
 *
 * @param date - The date to get the week index for
 * @param year - The year being displayed
 * @param weekStartsOnMonday - Whether weeks start on Monday
 * @returns Week index (0-52)
 */
export function getWeekOfYear(
  date: Date,
  year: number,
  weekStartsOnMonday: boolean
): number {
  const jan1 = new Date(year, 0, 1);
  const jan1DayIndex = getDayOfWeekIndex(jan1, weekStartsOnMonday);

  // Use calendar-based day calculation (immune to DST issues)
  const dayOfYear = getDayOfYear(date);

  // Add the day offset from Jan 1's position in its week
  return Math.floor((dayOfYear + jan1DayIndex) / 7);
}

/**
 * Generate the complete year grid data structure
 *
 * @param yearData - Aggregated year view data
 * @param weekStartsOnMonday - Whether weeks start on Monday (default: true)
 * @returns Complete grid data ready for rendering
 */
export function generateYearGrid(
  yearData: YearViewData,
  weekStartsOnMonday: boolean = true
): YearGridData {
  const { year, days, personalMax } = yearData;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create a map for quick lookup of day data by date string
  const dayMap = new Map<string, YearViewDay>();
  for (const day of days) {
    const key = formatDateKey(day.date);
    dayMap.set(key, day);
  }

  // Determine total weeks needed
  const dec31 = new Date(year, 11, 31);
  const totalWeeks = getWeekOfYear(dec31, year, weekStartsOnMonday) + 1;

  // Initialize grid: 7 rows × totalWeeks columns, all null
  const grid: (GridCell | null)[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: totalWeeks }, () => null)
  );

  // Fill in the grid with actual days
  const jan1 = new Date(year, 0, 1);
  const daysInYear = isLeapYear(year) ? 366 : 365;

  for (let dayOffset = 0; dayOffset < daysInYear; dayOffset++) {
    const date = new Date(jan1);
    date.setDate(jan1.getDate() + dayOffset);

    const weekIndex = getWeekOfYear(date, year, weekStartsOnMonday);
    const dayIndex = getDayOfWeekIndex(date, weekStartsOnMonday);

    const dateKey = formatDateKey(date);
    const dayData = dayMap.get(dateKey);

    const particleCount = dayData?.particleCount ?? 0;
    const isPeakDay = dayData?.isPeakDay ?? false;

    // Check if this day is in the future
    const isFuture = date > today;

    const brightness = calculateBrightness(particleCount, personalMax);

    grid[dayIndex][weekIndex] = {
      date: new Date(date),
      weekIndex,
      dayIndex,
      particleCount,
      brightness,
      isPeakDay,
      isFuture,
    };
  }

  // Generate month labels
  const monthLabels: MonthLabel[] = [];
  for (let month = 0; month < 12; month++) {
    const firstOfMonth = new Date(year, month, 1);
    const weekIndex = getWeekOfYear(firstOfMonth, year, weekStartsOnMonday);
    monthLabels.push({
      name: MONTH_NAMES[month],
      weekIndex,
    });
  }

  return {
    grid,
    monthLabels,
    totalWeeks,
    year,
  };
}

/**
 * Check if a year is a leap year
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Format a date as a string key for lookup (YYYY-MM-DD)
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
