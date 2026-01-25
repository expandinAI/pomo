/**
 * Year View Aggregation Utilities
 *
 * Helper functions for processing session data into year view format.
 */

import type { CompletedSession } from '@/lib/session-storage';
import type { DayAggregation, YearViewDay, YearViewSummary } from './types';

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get the number of days in a year (365 or 366)
 */
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Format a date as YYYY-MM-DD using locale-safe method
 */
export function formatDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD
}

/**
 * Filter sessions to only work sessions within a specific year
 * Optionally filter by project ID
 */
export function filterWorkSessionsForYear(
  sessions: CompletedSession[],
  year: number,
  projectId?: string | null
): CompletedSession[] {
  return sessions.filter((session) => {
    if (session.type !== 'work') return false;
    const sessionDate = new Date(session.completedAt);
    if (sessionDate.getFullYear() !== year) return false;
    // Filter by project if specified
    if (projectId && session.projectId !== projectId) return false;
    return true;
  });
}

/**
 * Group sessions by day, aggregating counts and durations
 */
export function groupSessionsByDay(
  sessions: CompletedSession[]
): Map<string, DayAggregation> {
  const dayMap = new Map<string, DayAggregation>();

  for (const session of sessions) {
    const dateKey = formatDateKey(new Date(session.completedAt));
    const existing = dayMap.get(dateKey);

    if (existing) {
      existing.particleCount += 1;
      existing.totalDuration += session.duration;

      // Track task durations
      const taskName = session.task?.trim();
      if (taskName) {
        const currentDuration = existing.taskDurations.get(taskName) || 0;
        existing.taskDurations.set(taskName, currentDuration + session.duration);
      }
    } else {
      const taskDurations = new Map<string, number>();
      const taskName = session.task?.trim();
      if (taskName) {
        taskDurations.set(taskName, session.duration);
      }

      dayMap.set(dateKey, {
        particleCount: 1,
        totalDuration: session.duration,
        taskDurations,
      });
    }
  }

  return dayMap;
}

/**
 * Find the task with the most accumulated time
 */
export function findTopTask(taskDurations: Map<string, number>): string | undefined {
  let topTask: string | undefined;
  let maxDuration = 0;

  taskDurations.forEach((duration, task) => {
    if (duration > maxDuration) {
      maxDuration = duration;
      topTask = task;
    }
  });

  return topTask;
}

/**
 * Generate all days of a year with aggregated data
 * Returns array of YearViewDay without isPeakDay set (handled separately)
 */
export function generateAllDaysOfYear(
  year: number,
  dayMap: Map<string, DayAggregation>
): YearViewDay[] {
  const days: YearViewDay[] = [];
  const daysInYear = getDaysInYear(year);

  // Start from January 1st of the year
  const startDate = new Date(year, 0, 1);

  for (let i = 0; i < daysInYear; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dateKey = formatDateKey(currentDate);
    const aggregation = dayMap.get(dateKey);

    days.push({
      date: new Date(currentDate), // Clone to avoid mutation
      particleCount: aggregation?.particleCount ?? 0,
      totalDuration: aggregation?.totalDuration ?? 0,
      topTask: aggregation ? findTopTask(aggregation.taskDurations) : undefined,
      topProject: undefined, // No project data in CompletedSession
      isPeakDay: false, // Will be set by findPeakDay
    });
  }

  return days;
}

/**
 * Find the peak day (highest particle count) and return its index and date
 * If multiple days have the same max, returns the first chronologically
 */
export function findPeakDay(days: YearViewDay[]): { index: number; date: Date; max: number } {
  let peakIndex = 0;
  let maxParticles = 0;

  for (let i = 0; i < days.length; i++) {
    if (days[i].particleCount > maxParticles) {
      maxParticles = days[i].particleCount;
      peakIndex = i;
    }
  }

  return {
    index: peakIndex,
    date: days[peakIndex].date,
    max: maxParticles,
  };
}

/**
 * Calculate the longest streak of consecutive days with sessions within the year
 */
export function calculateYearStreak(days: YearViewDay[]): number {
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

  return longestStreak;
}

/**
 * Calculate summary statistics from the days array
 */
export function calculateSummary(days: YearViewDay[]): YearViewSummary {
  let totalParticles = 0;
  let totalDuration = 0;
  let activeDays = 0;

  for (const day of days) {
    totalParticles += day.particleCount;
    totalDuration += day.totalDuration;
    if (day.particleCount > 0) {
      activeDays++;
    }
  }

  const longestStreak = calculateYearStreak(days);
  const averagePerActiveDay = activeDays > 0 ? totalParticles / activeDays : 0;

  return {
    totalParticles,
    totalDuration,
    longestStreak,
    activeDays,
    averagePerActiveDay,
  };
}
