import { loadSessions, formatDuration, type CompletedSession } from './session-storage';
import type { UnifiedSession } from '@/contexts/SessionContext';

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSVValue(value: string): string {
  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate CSV content from sessions
 * UTF-8 BOM included for Excel compatibility
 */
export function generateCSV(sessions: CompletedSession[]): string {
  const header = 'id,type,duration_seconds,duration_formatted,task,estimated_particles,preset,completed_at,date,time';

  const rows = sessions.map(session => {
    const date = new Date(session.completedAt);
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return [
      session.id,
      session.type,
      session.duration.toString(),
      formatDuration(session.duration),
      escapeCSVValue(session.task || ''),
      session.estimatedPomodoros?.toString() || '',
      session.presetId || '',
      session.completedAt,
      dateStr,
      timeStr,
    ].join(',');
  });

  // UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  return BOM + [header, ...rows].join('\n');
}

/**
 * Generate filename with current date
 */
export function generateExportFilename(): string {
  const date = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  return `particle-sessions-${date}.csv`;
}

/**
 * Download a string as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all sessions as CSV and trigger download
 * Returns true if export was successful, false if no data
 *
 * @param sessionsInput - Optional sessions array from SessionContext.
 *                        If not provided, falls back to localStorage (legacy).
 */
export function exportSessionsAsCSV(sessionsInput?: UnifiedSession[]): boolean {
  // Use provided sessions or fall back to localStorage
  const sessions = sessionsInput ?? loadSessions();

  if (sessions.length === 0) {
    return false;
  }

  // Cast to CompletedSession[] - UnifiedSession is compatible
  const csv = generateCSV(sessions as CompletedSession[]);
  const filename = generateExportFilename();
  downloadFile(csv, filename);

  return true;
}

/**
 * Get start and end of current ISO week (Monday 00:00 - Sunday 23:59)
 */
function getCurrentWeekRange(): { start: Date; end: Date; weekNumber: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Convert to Monday-based (0 = Monday, 6 = Sunday)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  // Calculate ISO week number
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const daysSinceJan4 = Math.floor((start.getTime() - jan4.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((daysSinceJan4 + jan4.getDay() + 1) / 7);

  return { start, end, weekNumber };
}

/**
 * Export current week's work sessions as CSV
 * Returns success status, week number, and total hours
 */
export function exportCurrentWeekAsCSV(
  sessionsInput?: UnifiedSession[]
): { success: boolean; weekNumber: number; totalHours: number } {
  const sessions = sessionsInput ?? loadSessions();
  const { start, end, weekNumber } = getCurrentWeekRange();

  // Filter sessions: only work sessions in the current week
  const weekSessions = sessions.filter(session => {
    if (session.type !== 'work') return false;
    const completedAt = new Date(session.completedAt);
    return completedAt >= start && completedAt <= end;
  });

  if (weekSessions.length === 0) {
    return { success: false, weekNumber, totalHours: 0 };
  }

  // Calculate total hours
  const totalSeconds = weekSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10; // Round to 1 decimal

  // Generate CSV and download
  const csv = generateCSV(weekSessions as CompletedSession[]);
  const year = new Date().getFullYear();
  const weekStr = weekNumber.toString().padStart(2, '0');
  const filename = `particle-export-${year}-W${weekStr}.csv`;
  downloadFile(csv, filename);

  return { success: true, weekNumber, totalHours };
}
