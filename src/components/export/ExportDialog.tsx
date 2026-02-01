'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';
import type { ExportPeriod } from '@/lib/export/types';
import { getDateRange, formatPeriodLabel, prepareExportData } from '@/lib/export';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  projectName: string;
  sessions: Array<{
    id: string;
    type: string;
    duration: number;
    completedAt: string;
    task?: string;
    projectId?: string;
  }>;
}

type ExportFormat = 'csv' | 'pdf' | 'json';

const PERIOD_OPTIONS: { value: ExportPeriod; label: string }[] = [
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
];

/**
 * ExportDialog - Modal for exporting project time data
 *
 * Allows users to:
 * - Select time period (this week, this month, last month)
 * - Choose format (CSV or PDF)
 * - Download the export
 */
export function ExportDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
  sessions,
}: ExportDialogProps) {
  const [period, setPeriod] = useState<ExportPeriod>('this-month');
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate preview stats for selected period
  const previewStats = useCallback(() => {
    const { start, end } = getDateRange(period as 'this-week' | 'this-month' | 'last-month');

    const data = prepareExportData(sessions, {
      projectId: projectId ?? undefined,
      projectName,
      startDate: start,
      endDate: end,
      format: 'csv', // Doesn't matter for stats
    });

    return {
      sessions: data.sessionCount,
      totalMinutes: data.totalMinutes,
    };
  }, [sessions, projectId, projectName, period]);

  const stats = previewStats();

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  // Handle export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setError(null);

    try {
      const { start, end } = getDateRange(period as 'this-week' | 'this-month' | 'last-month');

      const exportData = prepareExportData(sessions, {
        projectId: projectId ?? undefined,
        projectName,
        startDate: start,
        endDate: end,
        format,
      });

      // Call API
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          projectName: exportData.projectName,
          sessions: exportData.sessions.map((s) => ({
            ...s,
            date: s.date.toISOString(),
          })),
          periodStart: exportData.periodStart.toISOString(),
          periodEnd: exportData.periodEnd.toISOString(),
          totalMinutes: exportData.totalMinutes,
          sessionCount: exportData.sessionCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `${projectName}_export.${format}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Close dialog after successful export
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to generate export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [period, format, sessions, projectId, projectName, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', ...SPRING.snappy }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-sm bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-tertiary light:text-tertiary-dark" />
                  <h2 className="text-base font-semibold text-primary light:text-primary-dark">
                    Export
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-4 space-y-5">
                {/* Project name */}
                <div>
                  <div className="text-xs text-tertiary light:text-tertiary-dark uppercase tracking-wider mb-1">
                    Project
                  </div>
                  <div className="text-sm font-medium text-primary light:text-primary-dark">
                    {projectName}
                  </div>
                </div>

                {/* Period selector */}
                <div>
                  <div className="text-xs text-tertiary light:text-tertiary-dark uppercase tracking-wider mb-2">
                    Period
                  </div>
                  <div className="flex gap-2">
                    {PERIOD_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setPeriod(option.value)}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          period === option.value
                            ? 'bg-primary/10 light:bg-primary-dark/10 text-primary light:text-primary-dark'
                            : 'bg-tertiary/5 light:bg-tertiary-dark/5 text-secondary light:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview stats */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-tertiary/5 light:bg-tertiary-dark/5">
                  <div>
                    <div className="text-2xl font-semibold text-primary light:text-primary-dark">
                      {formatDuration(stats.totalMinutes)}
                    </div>
                    <div className="text-xs text-tertiary light:text-tertiary-dark">
                      {stats.sessions} {stats.sessions === 1 ? 'session' : 'sessions'}
                    </div>
                  </div>
                  {stats.sessions === 0 && (
                    <div className="text-xs text-tertiary light:text-tertiary-dark">
                      No data
                    </div>
                  )}
                </div>

                {/* Format selector */}
                <div>
                  <div className="text-xs text-tertiary light:text-tertiary-dark uppercase tracking-wider mb-2">
                    Format
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormat('pdf')}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        format === 'pdf'
                          ? 'bg-primary/10 light:bg-primary-dark/10 text-primary light:text-primary-dark'
                          : 'bg-tertiary/5 light:bg-tertiary-dark/5 text-secondary light:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                      )}
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => setFormat('csv')}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        format === 'csv'
                          ? 'bg-primary/10 light:bg-primary-dark/10 text-primary light:text-primary-dark'
                          : 'bg-tertiary/5 light:bg-tertiary-dark/5 text-secondary light:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                      )}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV
                    </button>
                    <button
                      onClick={() => setFormat('json')}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        format === 'json'
                          ? 'bg-primary/10 light:bg-primary-dark/10 text-primary light:text-primary-dark'
                          : 'bg-tertiary/5 light:bg-tertiary-dark/5 text-secondary light:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
                      )}
                    >
                      <FileJson className="w-4 h-4" />
                      JSON
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="text-sm text-red-400 text-center">{error}</div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-tertiary/10 light:border-tertiary-dark/10">
                <button
                  onClick={handleExport}
                  disabled={isExporting || stats.sessions === 0}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    'bg-primary light:bg-primary-dark text-background light:text-background-dark',
                    'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download {format.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
