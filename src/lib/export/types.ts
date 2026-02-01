/**
 * Types for export functionality
 */

export interface ExportSession {
  id: string;
  date: Date;
  task?: string;
  startTime: string;    // HH:MM format
  endTime: string;      // HH:MM format
  durationMinutes: number;
}

export interface ExportData {
  projectName: string;
  periodStart: Date;
  periodEnd: Date;
  sessions: ExportSession[];
  totalMinutes: number;
  sessionCount: number;
}

export interface ExportOptions {
  projectId?: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
  format: 'csv' | 'pdf' | 'json';
  groupBy?: 'day' | 'task' | 'both';
}

export type ExportPeriod = 'this-week' | 'this-month' | 'last-month' | 'custom';
