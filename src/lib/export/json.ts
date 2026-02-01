/**
 * JSON Export Generator
 *
 * Exports session data as structured JSON for developers and integrations.
 */

import type { ExportData } from './types';

/**
 * Format date as YYYY-MM-DD (using local timezone, not UTC)
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * JSON export format - clean, structured data
 */
export interface JSONExport {
  meta: {
    exportedAt: string;
    projectName: string;
    periodStart: string;
    periodEnd: string;
    generatedBy: string;
  };
  summary: {
    totalSessions: number;
    totalMinutes: number;
    totalHours: number;
  };
  sessions: Array<{
    id: string;
    date: string;
    task: string | null;
    startTime: string;
    endTime: string;
    durationMinutes: number;
  }>;
}

/**
 * Generate JSON export object
 */
export function generateJSON(data: ExportData): JSONExport {
  return {
    meta: {
      exportedAt: new Date().toISOString(),
      projectName: data.projectName,
      periodStart: data.periodStart.toISOString(),
      periodEnd: data.periodEnd.toISOString(),
      generatedBy: 'Particle',
    },
    summary: {
      totalSessions: data.sessionCount,
      totalMinutes: data.totalMinutes,
      totalHours: Math.round((data.totalMinutes / 60) * 100) / 100,
    },
    sessions: data.sessions.map((s) => ({
      id: s.id,
      date: formatLocalDate(s.date),
      task: s.task || null,
      startTime: s.startTime,
      endTime: s.endTime,
      durationMinutes: s.durationMinutes,
    })),
  };
}

/**
 * Generate JSON string (formatted)
 */
export function generateJSONString(data: ExportData): string {
  return JSON.stringify(generateJSON(data), null, 2);
}

/**
 * Download JSON file (client-side)
 */
export function downloadJSON(data: ExportData, filename?: string): void {
  const json = generateJSONString(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${data.projectName.replace(/\s+/g, '-')}_export.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
