/**
 * Mock Data Generator for Year View
 *
 * Generates realistic mock data for development and demo purposes.
 * Used by both the YearViewModal (demo toggle) and year-test page.
 */

import type { YearViewData, YearViewDay } from './types';

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
 *
 * Creates a full year of data with:
 * - Higher activity on weekdays vs weekends
 * - Realistic particle count distribution (most days 1-4, occasional peak days)
 * - Random task assignments
 * - Calculated streaks and summary stats
 */
export function generateMockYearData(year: number): YearViewData {
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
