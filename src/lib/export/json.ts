/**
 * JSON Export Generator
 *
 * Exports session data as structured JSON for developers and integrations.
 */

import type { ExportData } from './types';

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
      date: s.date.toISOString().split('T')[0],
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
