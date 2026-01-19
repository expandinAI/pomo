import { loadSessions, getSessionsFromDays, type CompletedSession } from './session-storage';

// =============================================================================
// DATE FILTERING UTILITIES
// =============================================================================

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the current week (Monday-Sunday)
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const { start, end } = getWeekBoundaries(0);
  return date >= start && date <= end;
}

/**
 * Check if a date is in the current month
 */
export function isThisMonth(date: Date): boolean {
  const today = new Date();
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export type TimeRange = 'day' | 'week' | 'month' | 'all';

/**
 * Filter sessions by time range
 */
export function filterSessionsByTimeRange(
  sessions: CompletedSession[],
  range: TimeRange
): CompletedSession[] {
  switch (range) {
    case 'day':
      return sessions.filter(s => isToday(new Date(s.completedAt)));
    case 'week':
      return sessions.filter(s => isThisWeek(new Date(s.completedAt)));
    case 'month':
      return sessions.filter(s => isThisMonth(new Date(s.completedAt)));
    case 'all':
      return sessions;
  }
}

/**
 * Calculate deep work minutes from sessions
 */
export function calculateDeepWorkMinutes(sessions: CompletedSession[]): number {
  return sessions
    .filter(s => s.type === 'work')
    .reduce((sum, s) => sum + s.duration, 0) / 60;
}

/**
 * Statistics for a single day
 */
export interface DailyStats {
  date: string;           // YYYY-MM-DD format
  dayName: string;        // Localized: "Mon", "Tue", etc.
  dayIndex: number;       // 0 = Monday, 6 = Sunday (ISO week)
  totalSeconds: number;
  sessionsCount: number;
}

/**
 * Aggregated statistics for a week
 */
export interface WeeklyStats {
  totalSeconds: number;
  sessionsCount: number;
  dailyStats: DailyStats[];    // Always 7 entries, Mon-Sun
  bestDay: DailyStats | null;  // Day with most focus time, null if all zero
  previousWeekTotal: number;
  trend: 'up' | 'down' | 'same';
  trendDelta: number;          // Difference in seconds (positive or negative)
}

/**
 * Get the Monday and Sunday boundaries for a given week
 * @param weekOffset 0 = current week, -1 = last week, etc.
 */
export function getWeekBoundaries(weekOffset: number = 0): { start: Date; end: Date } {
  const now = new Date();

  // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDay = now.getDay();

  // Convert to ISO format (0 = Monday, 6 = Sunday)
  const isoDay = currentDay === 0 ? 6 : currentDay - 1;

  // Calculate Monday of current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - isoDay + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);

  // Calculate Sunday of that week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

/**
 * Filter sessions to only include those within a specific week
 */
export function getSessionsForWeek(
  sessions: CompletedSession[],
  weekOffset: number = 0
): CompletedSession[] {
  const { start, end } = getWeekBoundaries(weekOffset);

  return sessions.filter(session => {
    const sessionDate = new Date(session.completedAt);
    return sessionDate >= start && sessionDate <= end;
  });
}

/**
 * Get the ISO day index (0 = Monday, 6 = Sunday) from a date
 */
function getIsoDayIndex(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

/**
 * Build daily statistics for a week
 * Always returns 7 entries (Mon-Sun), even for days with no sessions
 */
export function buildDailyStats(
  sessions: CompletedSession[],
  weekStart: Date
): DailyStats[] {
  // Group sessions by day index
  const groupedByDay = new Map<number, CompletedSession[]>();

  for (const session of sessions) {
    // Only count work sessions for focus time
    if (session.type !== 'work') continue;

    const sessionDate = new Date(session.completedAt);
    const dayIndex = getIsoDayIndex(sessionDate);

    const existing = groupedByDay.get(dayIndex) || [];
    existing.push(session);
    groupedByDay.set(dayIndex, existing);
  }

  // Build stats for each day (Mon=0 through Sun=6)
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const stats: DailyStats[] = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);

    const daySessions = groupedByDay.get(i) || [];
    const totalSeconds = daySessions.reduce((sum, s) => sum + s.duration, 0);

    stats.push({
      date: dayDate.toLocaleDateString('en-CA'), // YYYY-MM-DD
      dayName: dayNames[i],
      dayIndex: i,
      totalSeconds,
      sessionsCount: daySessions.length,
    });
  }

  return stats;
}

/**
 * Find the best day (most focus time) from daily stats
 * Returns null if all days have zero focus time
 */
function findBestDay(dailyStats: DailyStats[]): DailyStats | null {
  let best: DailyStats | null = null;
  let maxSeconds = 0;

  for (const day of dailyStats) {
    if (day.totalSeconds > maxSeconds) {
      maxSeconds = day.totalSeconds;
      best = day;
    }
  }

  return best;
}

/**
 * Calculate complete weekly statistics
 * @param weekOffset 0 = current week, -1 = last week
 */
export function calculateWeeklyStats(weekOffset: number = 0): WeeklyStats {
  const sessions = loadSessions();

  // Current week stats
  const currentWeekSessions = getSessionsForWeek(sessions, weekOffset);
  const { start: weekStart } = getWeekBoundaries(weekOffset);
  const dailyStats = buildDailyStats(currentWeekSessions, weekStart);

  const totalSeconds = dailyStats.reduce((sum, d) => sum + d.totalSeconds, 0);
  const sessionsCount = dailyStats.reduce((sum, d) => sum + d.sessionsCount, 0);
  const bestDay = findBestDay(dailyStats);

  // Previous week stats for comparison
  const previousWeekSessions = getSessionsForWeek(sessions, weekOffset - 1);
  const { start: prevWeekStart } = getWeekBoundaries(weekOffset - 1);
  const prevDailyStats = buildDailyStats(previousWeekSessions, prevWeekStart);
  const previousWeekTotal = prevDailyStats.reduce((sum, d) => sum + d.totalSeconds, 0);

  // Calculate trend
  const trendDelta = totalSeconds - previousWeekTotal;
  let trend: 'up' | 'down' | 'same';

  if (trendDelta > 0) {
    trend = 'up';
  } else if (trendDelta < 0) {
    trend = 'down';
  } else {
    trend = 'same';
  }

  return {
    totalSeconds,
    sessionsCount,
    dailyStats,
    bestDay,
    previousWeekTotal,
    trend,
    trendDelta,
  };
}

/**
 * Format seconds as decimal hours (e.g., "12.5")
 */
export function formatHoursDecimal(seconds: number): string {
  const hours = seconds / 3600;

  if (hours === 0) return '0';
  if (hours < 0.1) return hours.toFixed(1);
  if (hours < 10) return hours.toFixed(1);

  // For larger numbers, show one decimal if not a whole number
  const rounded = Math.round(hours * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

/**
 * Format the trend delta as a human-readable message
 * Returns null if comparison isn't meaningful (both weeks zero)
 */
export function formatTrendMessage(stats: WeeklyStats): string | null {
  // Don't show trend if both weeks are empty
  if (stats.totalSeconds === 0 && stats.previousWeekTotal === 0) {
    return null;
  }

  // Don't show trend if previous week was empty (no baseline)
  if (stats.previousWeekTotal === 0 && stats.totalSeconds > 0) {
    return null;
  }

  const deltaHours = Math.abs(stats.trendDelta) / 3600;
  const formattedDelta = formatHoursDecimal(Math.abs(stats.trendDelta));

  if (stats.trend === 'up') {
    return `+${formattedDelta}h from last week`;
  } else if (stats.trend === 'down') {
    return `${formattedDelta}h less than last week`;
  }

  return 'Same as last week';
}

// =============================================================================
// HEATMAP ANALYTICS
// =============================================================================

/**
 * A single cell in the heatmap grid
 */
export interface HeatmapCell {
  day: number;           // 0-6 (Mon-Sun, ISO week)
  hour: number;          // 6-22
  totalMinutes: number;
  intensity: number;     // 0-1
  sessionsCount: number;
}

/**
 * Complete heatmap data structure
 */
export interface HeatmapData {
  grid: HeatmapCell[][];    // [day][hour] - 7 rows × 17 columns
  peakSlot: { day: number; hour: number } | null;
  peakLabel: string;
  isEmpty: boolean;
}

// Heatmap covers hours 6-22 (6am to 10pm)
const HEATMAP_START_HOUR = 6;
const HEATMAP_END_HOUR = 22;
const HEATMAP_HOURS = HEATMAP_END_HOUR - HEATMAP_START_HOUR + 1; // 17 hours

const DAY_NAMES_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Build a heatmap from session data
 * @param daysBack Number of days to analyze (default 30)
 */
export function buildHeatmap(daysBack: number = 30): HeatmapData {
  const sessions = getSessionsFromDays(daysBack);

  // Initialize 7×17 grid with zeros
  const grid: HeatmapCell[][] = [];
  for (let day = 0; day < 7; day++) {
    const row: HeatmapCell[] = [];
    for (let hourOffset = 0; hourOffset < HEATMAP_HOURS; hourOffset++) {
      row.push({
        day,
        hour: HEATMAP_START_HOUR + hourOffset,
        totalMinutes: 0,
        intensity: 0,
        sessionsCount: 0,
      });
    }
    grid.push(row);
  }

  // Aggregate work sessions into grid
  for (const session of sessions) {
    if (session.type !== 'work') continue;

    const sessionDate = new Date(session.completedAt);
    const dayIndex = getIsoDayIndex(sessionDate);
    const hour = sessionDate.getHours();

    // Skip hours outside our range
    if (hour < HEATMAP_START_HOUR || hour > HEATMAP_END_HOUR) continue;

    const hourIndex = hour - HEATMAP_START_HOUR;
    const cell = grid[dayIndex][hourIndex];

    cell.totalMinutes += session.duration / 60;
    cell.sessionsCount += 1;
  }

  // Find max for intensity calculation
  let maxMinutes = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.totalMinutes > maxMinutes) {
        maxMinutes = cell.totalMinutes;
      }
    }
  }

  // Calculate intensities and find peak
  let peakSlot: { day: number; hour: number } | null = null;
  let peakMinutes = 0;

  for (const row of grid) {
    for (const cell of row) {
      cell.intensity = maxMinutes > 0 ? cell.totalMinutes / maxMinutes : 0;

      if (cell.totalMinutes > peakMinutes) {
        peakMinutes = cell.totalMinutes;
        peakSlot = { day: cell.day, hour: cell.hour };
      }
    }
  }

  const isEmpty = maxMinutes === 0;
  const peakLabel = peakSlot ? generatePeakLabel(peakSlot) : '';

  return {
    grid,
    peakSlot,
    peakLabel,
    isEmpty,
  };
}

/**
 * Generate a human-readable label for the peak focus time
 */
function generatePeakLabel(peak: { day: number; hour: number }): string {
  const dayName = DAY_NAMES_FULL[peak.day];
  const hourStr = formatHour(peak.hour);

  // Pluralize for weekdays
  const dayLabel = peak.day < 5 ? `${dayName}s` : dayName;

  return `${dayLabel} at ${hourStr}`;
}

/**
 * Format hour as "9am" or "2pm"
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

/**
 * Get intensity level (0-4) for styling
 * Maps 0-1 intensity to discrete levels
 */
export function getIntensityLevel(intensity: number): 0 | 1 | 2 | 3 | 4 {
  if (intensity === 0) return 0;
  if (intensity < 0.25) return 1;
  if (intensity < 0.5) return 2;
  if (intensity < 0.75) return 3;
  return 4;
}

/**
 * Format minutes as hours for display
 */
export function formatMinutesAsHours(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}
