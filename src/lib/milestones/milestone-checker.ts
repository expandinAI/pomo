/**
 * Milestone Checker
 *
 * Detects when milestones are reached based on current stats.
 * Returns the first unearned milestone that has been achieved.
 */

import { loadSessions, type CompletedSession } from '@/lib/session-storage';
import {
  type MilestoneDefinition,
  getCountMilestones,
  getTimeMilestones,
  getMilestoneById,
} from './milestones';

export interface MilestoneStats {
  totalParticles: number;
  totalHours: number;
  currentStreak: number;
  lastSessionDurationMinutes: number;
  hasProjects: boolean;
  isFirstProject: boolean;
}

/**
 * Build current milestone stats from session storage
 *
 * @param options - Configuration options
 * @param sessionsInput - Optional sessions array (loads from storage if not provided)
 */
export function buildMilestoneStats(
  options: {
    hasProjects?: boolean;
    isFirstProject?: boolean;
    lastSessionDurationSeconds?: number;
  } = {},
  sessionsInput?: CompletedSession[]
): MilestoneStats {
  const sessions = sessionsInput ?? loadSessions();
  const workSessions = sessions.filter((s) => s.type === 'work');

  // Total particles (work sessions)
  const totalParticles = workSessions.length;

  // Total hours (sum of all work session durations)
  const totalSeconds = workSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = totalSeconds / 3600;

  // Calculate current streak (consecutive days with at least one work session)
  const currentStreak = calculateStreak(workSessions);

  // Last session duration in minutes
  const lastSessionDurationMinutes = options.lastSessionDurationSeconds
    ? options.lastSessionDurationSeconds / 60
    : 0;

  return {
    totalParticles,
    totalHours,
    currentStreak,
    lastSessionDurationMinutes,
    hasProjects: options.hasProjects ?? false,
    isFirstProject: options.isFirstProject ?? false,
  };
}

/**
 * Calculate current streak (consecutive days with work sessions)
 */
function calculateStreak(sessions: CompletedSession[]): number {
  if (sessions.length === 0) return 0;

  // Group sessions by date (YYYY-MM-DD)
  const dateSet = new Set<string>();
  for (const session of sessions) {
    const date = new Date(session.completedAt).toLocaleDateString('en-CA');
    dateSet.add(date);
  }

  // Sort dates in descending order
  const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));

  // Check if today or yesterday has a session (streak must be current)
  const today = new Date().toLocaleDateString('en-CA');
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');

  if (!dateSet.has(today) && !dateSet.has(yesterday)) {
    return 0; // Streak broken
  }

  // Count consecutive days starting from the most recent
  let streak = 0;
  let expectedDate = dateSet.has(today) ? today : yesterday;

  for (const date of dates) {
    if (date === expectedDate) {
      streak++;
      // Move to previous day
      const prevDate = new Date(expectedDate);
      prevDate.setDate(prevDate.getDate() - 1);
      expectedDate = prevDate.toLocaleDateString('en-CA');
    } else if (date < expectedDate) {
      // Gap in dates - streak ends
      break;
    }
  }

  return streak;
}

/**
 * Check for a newly earned milestone
 *
 * Returns the first unearned milestone that has been achieved,
 * or undefined if no new milestone was reached.
 */
export function checkForNewMilestone(
  stats: MilestoneStats,
  earnedIds: Set<string>
): MilestoneDefinition | undefined {
  // Check count milestones (in order of threshold)
  const countMilestones = getCountMilestones();
  for (const milestone of countMilestones) {
    if (!earnedIds.has(milestone.id) && stats.totalParticles >= (milestone.threshold ?? 0)) {
      return milestone;
    }
  }

  // Check time milestones (in order of threshold)
  const timeMilestones = getTimeMilestones();
  for (const milestone of timeMilestones) {
    if (!earnedIds.has(milestone.id) && stats.totalHours >= (milestone.threshold ?? 0)) {
      return milestone;
    }
  }

  // Check streak milestones (commented out for now - streaks aren't the Particle way)
  // const streakMilestones = getStreakMilestones();
  // for (const milestone of streakMilestones) {
  //   if (!earnedIds.has(milestone.id) && stats.currentStreak >= (milestone.threshold ?? 0)) {
  //     return milestone;
  //   }
  // }

  // Check special milestones
  // Deep Work: completed a 90-minute session
  if (!earnedIds.has('deep-work') && stats.lastSessionDurationMinutes >= 90) {
    return getMilestoneById('deep-work');
  }

  // First Project: created the first project
  if (!earnedIds.has('first-project') && stats.isFirstProject) {
    return getMilestoneById('first-project');
  }

  return undefined;
}

/**
 * Get all milestones that should have been earned based on stats
 * (Useful for syncing after data migration or debugging)
 */
export function getAllEarnedMilestones(
  stats: MilestoneStats,
  earnedIds: Set<string>
): MilestoneDefinition[] {
  const newlyEarned: MilestoneDefinition[] = [];

  // Count milestones
  const countMilestones = getCountMilestones();
  for (const milestone of countMilestones) {
    if (!earnedIds.has(milestone.id) && stats.totalParticles >= (milestone.threshold ?? 0)) {
      newlyEarned.push(milestone);
    }
  }

  // Time milestones
  const timeMilestones = getTimeMilestones();
  for (const milestone of timeMilestones) {
    if (!earnedIds.has(milestone.id) && stats.totalHours >= (milestone.threshold ?? 0)) {
      newlyEarned.push(milestone);
    }
  }

  return newlyEarned;
}

/**
 * Calculate the historically accurate date when a milestone was actually earned
 * by analyzing session history.
 *
 * @param milestoneId - The milestone ID
 * @param threshold - The milestone threshold value
 * @param category - The milestone category
 * @param sessionsInput - Optional sessions array (loads from storage if not provided)
 */
export function calculateMilestoneEarnedDate(
  milestoneId: string,
  threshold: number | undefined,
  category: 'count' | 'time' | 'streak' | 'special',
  sessionsInput?: CompletedSession[]
): string {
  const sessions = sessionsInput ?? loadSessions();
  const workSessions = sessions
    .filter((s) => s.type === 'work')
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

  if (workSessions.length === 0) {
    return new Date().toISOString();
  }

  if (category === 'count' && threshold !== undefined) {
    // For count milestones: find the Nth session
    const sessionIndex = Math.min(threshold - 1, workSessions.length - 1);
    return workSessions[sessionIndex].completedAt;
  }

  if (category === 'time' && threshold !== undefined) {
    // For time milestones: accumulate hours until threshold reached
    const thresholdSeconds = threshold * 3600;
    let accumulatedSeconds = 0;

    for (const session of workSessions) {
      accumulatedSeconds += session.duration;
      if (accumulatedSeconds >= thresholdSeconds) {
        return session.completedAt;
      }
    }

    // If not reached yet, use last session date
    return workSessions[workSessions.length - 1].completedAt;
  }

  // For special milestones or unknown, use current date
  return new Date().toISOString();
}
