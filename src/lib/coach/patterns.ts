/**
 * Pattern detection algorithms for the AI Coach
 *
 * These are heuristic-based pattern detectors that analyze session data
 * to find meaningful patterns in user behavior.
 */

import type { DBSession, DBProject } from '@/lib/db/types';
import type { DetectedPattern } from './types';

/**
 * Minimum sessions required for pattern detection
 */
const MIN_SESSIONS_FOR_PATTERNS = 10;

/**
 * Threshold for considering a peak significant (1.5x average)
 */
const PEAK_THRESHOLD = 1.5;

/**
 * Minimum confidence for a pattern to be considered valid
 */
const MIN_CONFIDENCE = 0.6;

/**
 * Detect when the user is most productive during the day
 *
 * Groups sessions by hour (0-23) and finds peak hours
 * that are significantly above average.
 *
 * @example "You're most productive between 9-11am"
 */
export function detectTimeOfDayPattern(
  sessions: DBSession[]
): DetectedPattern | null {
  const workSessions = sessions.filter((s) => s.type === 'work');

  if (workSessions.length < MIN_SESSIONS_FOR_PATTERNS) {
    return null;
  }

  // Group sessions by hour
  const hourBuckets: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    hourBuckets[i] = 0;
  }

  for (const session of workSessions) {
    const hour = new Date(session.completedAt).getHours();
    hourBuckets[hour] += session.duration / 60; // Convert to minutes
  }

  // Calculate average
  const totalMinutes = Object.values(hourBuckets).reduce((a, b) => a + b, 0);
  const avgMinutesPerHour = totalMinutes / 24;

  if (avgMinutesPerHour === 0) {
    return null;
  }

  // Find peak hours (above threshold)
  const peakHours: number[] = [];
  for (const [hourStr, minutes] of Object.entries(hourBuckets)) {
    if (minutes > avgMinutesPerHour * PEAK_THRESHOLD) {
      peakHours.push(parseInt(hourStr, 10));
    }
  }

  if (peakHours.length === 0) {
    return null;
  }

  // Sort peak hours to find contiguous ranges
  peakHours.sort((a, b) => a - b);

  // Find the best contiguous range
  const ranges = findContiguousRanges(peakHours);
  const bestRange = ranges.reduce((best, range) => {
    const rangeMinutes = range.reduce((sum, h) => sum + hourBuckets[h], 0);
    const bestMinutes = best.reduce((sum, h) => sum + hourBuckets[h], 0);
    return rangeMinutes > bestMinutes ? range : best;
  }, ranges[0]);

  if (!bestRange || bestRange.length === 0) {
    return null;
  }

  // Calculate confidence based on how much of the focus time is in peak hours
  const peakMinutes = bestRange.reduce((sum, h) => sum + hourBuckets[h], 0);
  const confidence = Math.min(peakMinutes / totalMinutes + 0.4, 1);

  if (confidence < MIN_CONFIDENCE) {
    return null;
  }

  // Format the time range
  const startHour = bestRange[0];
  const endHour = bestRange[bestRange.length - 1] + 1;
  const timeRange = `${formatHour(startHour)}-${formatHour(endHour)}`;

  return {
    type: 'time_of_day',
    description: `You're most productive between ${timeRange}`,
    confidence,
  };
}

/**
 * Detect which days of the week the user is most productive
 *
 * Aggregates focus time by weekday and identifies strong days.
 *
 * @example "Tuesdays and Thursdays are your strongest days"
 */
export function detectDayOfWeekPattern(
  sessions: DBSession[]
): DetectedPattern | null {
  const workSessions = sessions.filter((s) => s.type === 'work');

  if (workSessions.length < MIN_SESSIONS_FOR_PATTERNS) {
    return null;
  }

  // Group by day of week (0 = Sunday, 6 = Saturday)
  const dayBuckets: Record<number, number> = {};
  for (let i = 0; i < 7; i++) {
    dayBuckets[i] = 0;
  }

  for (const session of workSessions) {
    const day = new Date(session.completedAt).getDay();
    dayBuckets[day] += session.duration / 60;
  }

  // Calculate average
  const totalMinutes = Object.values(dayBuckets).reduce((a, b) => a + b, 0);
  const avgMinutesPerDay = totalMinutes / 7;

  if (avgMinutesPerDay === 0) {
    return null;
  }

  // Find strong days
  const strongDays: number[] = [];
  for (const [dayStr, minutes] of Object.entries(dayBuckets)) {
    if (minutes > avgMinutesPerDay * PEAK_THRESHOLD) {
      strongDays.push(parseInt(dayStr, 10));
    }
  }

  if (strongDays.length === 0 || strongDays.length > 4) {
    // No pattern or too many "strong" days
    return null;
  }

  // Calculate confidence
  const strongMinutes = strongDays.reduce((sum, d) => sum + dayBuckets[d], 0);
  const confidence = Math.min(strongMinutes / totalMinutes + 0.3, 1);

  if (confidence < MIN_CONFIDENCE) {
    return null;
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const formattedDays = strongDays.map((d) => dayNames[d]);
  const dayList = formatList(formattedDays);

  return {
    type: 'day_of_week',
    description: `${dayList} ${strongDays.length === 1 ? 'is your' : 'are your'} strongest ${strongDays.length === 1 ? 'day' : 'days'}`,
    confidence,
  };
}

/**
 * Detect if the user has been deeply focused on one project
 *
 * Identifies when >50% of recent focus time is on a single project.
 *
 * @example "You've been deep in Design System this week"
 */
export function detectProjectFocusPattern(
  sessions: DBSession[],
  projects: DBProject[]
): DetectedPattern | null {
  const workSessions = sessions.filter((s) => s.type === 'work' && s.projectId);

  if (workSessions.length < 5) {
    return null;
  }

  // Calculate time per project
  const projectMinutes: Record<string, number> = {};
  let totalMinutes = 0;

  for (const session of workSessions) {
    if (session.projectId) {
      projectMinutes[session.projectId] =
        (projectMinutes[session.projectId] || 0) + session.duration / 60;
      totalMinutes += session.duration / 60;
    }
  }

  if (totalMinutes === 0) {
    return null;
  }

  // Find dominant project
  let maxProjectId: string | null = null;
  let maxMinutes = 0;

  for (const [projectId, minutes] of Object.entries(projectMinutes)) {
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
      maxProjectId = projectId;
    }
  }

  if (!maxProjectId) {
    return null;
  }

  const percentage = maxMinutes / totalMinutes;

  // Need at least 40% focus on one project
  if (percentage < 0.4) {
    return null;
  }

  const project = projects.find((p) => p.id === maxProjectId);
  const projectName = project?.name || 'a project';

  const confidence = Math.min(percentage + 0.2, 1);

  return {
    type: 'project_focus',
    description: `You've been deep in ${projectName} recently`,
    confidence,
  };
}

/**
 * Detect patterns in session length
 *
 * Compares average session duration to preset duration (if available).
 *
 * @example "Your sessions tend to run 15% longer than planned"
 */
export function detectSessionLengthPattern(
  sessions: DBSession[]
): DetectedPattern | null {
  // Only consider work sessions with estimated duration
  const sessionsWithEstimate = sessions.filter(
    (s) => s.type === 'work' && s.estimatedDuration
  );

  if (sessionsWithEstimate.length < MIN_SESSIONS_FOR_PATTERNS) {
    return null;
  }

  // Calculate average actual vs estimated
  let totalActual = 0;
  let totalEstimated = 0;

  for (const session of sessionsWithEstimate) {
    totalActual += session.duration;
    totalEstimated += session.estimatedDuration!;
  }

  const avgActual = totalActual / sessionsWithEstimate.length;
  const avgEstimated = totalEstimated / sessionsWithEstimate.length;

  if (avgEstimated === 0) {
    return null;
  }

  const ratio = avgActual / avgEstimated;
  const percentDiff = Math.round((ratio - 1) * 100);

  // Need at least 10% difference to be notable
  if (Math.abs(percentDiff) < 10) {
    return null;
  }

  const confidence = Math.min(0.5 + Math.abs(percentDiff) / 100, 1);

  if (percentDiff > 0) {
    return {
      type: 'session_length',
      description: `Your sessions tend to run ${percentDiff}% longer than planned`,
      confidence,
    };
  } else {
    return {
      type: 'session_length',
      description: `You tend to finish ${Math.abs(percentDiff)}% earlier than planned`,
      confidence,
    };
  }
}

/**
 * Run all pattern detection algorithms and return found patterns
 */
export function detectAllPatterns(
  sessions: DBSession[],
  projects: DBProject[]
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const timeOfDay = detectTimeOfDayPattern(sessions);
  if (timeOfDay) patterns.push(timeOfDay);

  const dayOfWeek = detectDayOfWeekPattern(sessions);
  if (dayOfWeek) patterns.push(dayOfWeek);

  const projectFocus = detectProjectFocusPattern(sessions, projects);
  if (projectFocus) patterns.push(projectFocus);

  const sessionLength = detectSessionLengthPattern(sessions);
  if (sessionLength) patterns.push(sessionLength);

  // Sort by confidence (highest first)
  return patterns.sort((a, b) => b.confidence - a.confidence);
}

// ============================================
// Helper Functions
// ============================================

/**
 * Find contiguous ranges in a sorted array of numbers
 */
function findContiguousRanges(sorted: number[]): number[][] {
  if (sorted.length === 0) return [];

  const ranges: number[][] = [];
  let currentRange: number[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      currentRange.push(sorted[i]);
    } else {
      ranges.push(currentRange);
      currentRange = [sorted[i]];
    }
  }

  ranges.push(currentRange);
  return ranges;
}

/**
 * Format an hour (0-23) as a time string
 */
function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

/**
 * Format a list of strings with proper grammar
 * @example ["Monday", "Tuesday"] -> "Monday and Tuesday"
 * @example ["Monday", "Tuesday", "Wednesday"] -> "Monday, Tuesday, and Wednesday"
 */
function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
