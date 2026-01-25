/**
 * Year View Data API
 *
 * Main entry point for fetching year view data.
 */

import { loadSessions } from '@/lib/session-storage';
import type { YearViewData } from './types';
import {
  filterWorkSessionsForYear,
  groupSessionsByDay,
  generateAllDaysOfYear,
  findPeakDay,
  calculateSummary,
} from './aggregation';

/**
 * Get complete year view data for a specific year
 *
 * @param year - The year to fetch data for
 * @param projectId - Optional project filter (prepared for future use, currently ignored)
 * @returns Promise<YearViewData> - Complete year view data structure
 *
 * @example
 * ```typescript
 * const data = await getYearViewData(2026);
 * console.log(data.summary.totalParticles); // Total work sessions
 * console.log(data.days.length); // 365 or 366
 * ```
 */
export async function getYearViewData(
  year: number,
  projectId?: string | null
): Promise<YearViewData> {
  // 1. Load all sessions
  const sessions = loadSessions();

  // 2. Filter to work sessions in the specified year (and optionally by project)
  const workSessions = filterWorkSessionsForYear(sessions, year, projectId);

  // 3. Group sessions by day
  const dayMap = groupSessionsByDay(workSessions);

  // 4. Generate all days of the year
  const days = generateAllDaysOfYear(year, dayMap);

  // 5. Find peak day and mark it
  const peak = findPeakDay(days);
  if (peak.max > 0) {
    days[peak.index].isPeakDay = true;
  }

  // 6. Calculate summary statistics
  const summary = calculateSummary(days);

  // 7. Return complete data structure
  return {
    year,
    days,
    summary,
    personalMax: peak.max,
    peakDate: peak.date,
  };
}

/**
 * Check if there is any data for a specific year
 *
 * @param year - The year to check
 * @returns Promise<boolean> - True if there are work sessions in this year
 *
 * @example
 * ```typescript
 * if (await hasDataForYear(2025)) {
 *   // Show 2025 as a selectable option
 * }
 * ```
 */
export async function hasDataForYear(year: number): Promise<boolean> {
  const sessions = loadSessions();
  const workSessions = filterWorkSessionsForYear(sessions, year);
  return workSessions.length > 0;
}
