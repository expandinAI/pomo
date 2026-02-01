/**
 * Prepare session data for export
 *
 * Converts raw session data into the export format.
 */

import type { ExportData, ExportSession, ExportOptions } from './types';

interface RawSession {
  id: string;
  type: string;
  duration: number; // seconds
  completedAt: string; // ISO string
  task?: string;
  projectId?: string;
}

/**
 * Format time as HH:MM
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Calculate start time from end time and duration
 */
function calculateStartTime(endTime: Date, durationSeconds: number): Date {
  return new Date(endTime.getTime() - durationSeconds * 1000);
}

/**
 * Prepare sessions for export
 *
 * @param sessions - Raw sessions from the database
 * @param options - Export options (project, date range)
 * @returns Formatted export data
 */
export function prepareExportData(
  sessions: RawSession[],
  options: ExportOptions
): ExportData {
  // Filter sessions by project and date range
  const filtered = sessions.filter((session) => {
    // Only work sessions
    if (session.type !== 'work') return false;

    // Filter by project
    if (options.projectId) {
      if (session.projectId !== options.projectId) return false;
    } else if (options.projectId === null) {
      // Explicitly "No Project"
      if (session.projectId) return false;
    }

    // Filter by date range
    const sessionDate = new Date(session.completedAt);
    if (sessionDate < options.startDate || sessionDate > options.endDate) {
      return false;
    }

    return true;
  });

  // Convert to export format
  const exportSessions: ExportSession[] = filtered.map((session) => {
    const endTime = new Date(session.completedAt);
    const startTime = calculateStartTime(endTime, session.duration);
    const durationMinutes = Math.round(session.duration / 60);

    return {
      id: session.id,
      date: new Date(endTime.toDateString()), // Date only, no time
      task: session.task,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      durationMinutes,
    };
  });

  // Sort by date (oldest first)
  exportSessions.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate totals
  const totalMinutes = exportSessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return {
    projectName: options.projectName,
    periodStart: options.startDate,
    periodEnd: options.endDate,
    sessions: exportSessions,
    totalMinutes,
    sessionCount: exportSessions.length,
  };
}

/**
 * Get date range for common periods
 */
export function getDateRange(period: 'this-week' | 'this-month' | 'last-month'): {
  start: Date;
  end: Date;
} {
  const now = new Date();

  switch (period) {
    case 'this-week': {
      // Monday of current week
      const start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    }

    case 'this-month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(now);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    }

    case 'last-month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);

      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);

      return { start, end };
    }
  }
}

/**
 * Format period for display
 */
export function formatPeriodLabel(period: 'this-week' | 'this-month' | 'last-month' | 'custom'): string {
  switch (period) {
    case 'this-week':
      return 'This Week';
    case 'this-month':
      return 'This Month';
    case 'last-month':
      return 'Last Month';
    case 'custom':
      return 'Custom Range';
  }
}
