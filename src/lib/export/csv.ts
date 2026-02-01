/**
 * CSV Export Generator
 *
 * Generates CSV files from session data for invoicing and time tracking.
 */

import type { ExportData, ExportSession } from './types';

/**
 * Format date as YYYY-MM-DD (using local timezone, not UTC)
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format duration as hours:minutes
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate CSV content from export data
 */
export function generateCSV(data: ExportData): string {
  const lines: string[] = [];

  // Header
  lines.push('Date,Project,Task,Start,End,Duration (min),Duration (h:mm)');

  // Sort sessions by date
  const sortedSessions = [...data.sessions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Data rows
  for (const session of sortedSessions) {
    const row = [
      formatDate(session.date),
      escapeCSV(data.projectName),
      escapeCSV(session.task || ''),
      session.startTime,
      session.endTime,
      session.durationMinutes.toString(),
      formatDuration(session.durationMinutes),
    ];
    lines.push(row.join(','));
  }

  // Empty line before totals
  lines.push('');

  // Totals row
  lines.push(`Total,${data.projectName},,,,${data.totalMinutes},${formatDuration(data.totalMinutes)}`);
  lines.push(`Sessions,${data.sessionCount}`);

  return lines.join('\n');
}

/**
 * Group sessions by date for display
 */
export function groupSessionsByDate(sessions: ExportSession[]): Map<string, ExportSession[]> {
  const groups = new Map<string, ExportSession[]>();

  for (const session of sessions) {
    const dateKey = formatDate(session.date);
    const existing = groups.get(dateKey) || [];
    existing.push(session);
    groups.set(dateKey, existing);
  }

  return groups;
}

/**
 * Create a downloadable CSV file
 */
export function downloadCSV(data: ExportData, filename?: string): void {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${data.projectName.replace(/\s+/g, '-')}_export.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
