'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, FileSpreadsheet, FileJson, Loader2, ChevronDown } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';
import { prepareExportData } from '@/lib/export';

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

interface PeriodOption {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Get all months that have sessions
 */
function getAvailableMonths(sessions: Array<{ completedAt: string }>): PeriodOption[] {
  const monthsMap = new Map<string, { start: Date; end: Date; count: number }>();

  for (const session of sessions) {
    const date = new Date(session.completedAt);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;

    if (!monthsMap.has(key)) {
      const start = new Date(year, month, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(year, month + 1, 0);
      end.setHours(23, 59, 59, 999);

      monthsMap.set(key, { start, end, count: 0 });
    }

    monthsMap.get(key)!.count++;
  }

  // Convert to sorted array (newest first)
  const months = Array.from(monthsMap.entries())
    .map(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month, 1);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      return {
        id: key,
        label,
        startDate: value.start,
        endDate: value.end,
        timestamp: date.getTime(),
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  return months.map(({ id, label, startDate, endDate }) => ({
    id,
    label,
    startDate,
    endDate,
  }));
}

/**
 * ExportDialog - Modal for exporting project time data
 *
 * Allows users to:
 * - Select time period (specific month or all time)
 * - Choose format (PDF, CSV, JSON)
 * - Download the export
 */
export function ExportDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
  sessions,
}: ExportDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all-time');
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get available months from sessions
  const availableMonths = useMemo(() => getAvailableMonths(sessions), [sessions]);

  // Build period options: All Time + available months
  const periodOptions = useMemo((): PeriodOption[] => {
    // Find earliest and latest session dates for "All Time"
    if (sessions.length === 0) {
      return [];
    }

    const dates = sessions.map((s) => new Date(s.completedAt).getTime());
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));

    earliest.setHours(0, 0, 0, 0);
    latest.setHours(23, 59, 59, 999);

    const allTime: PeriodOption = {
      id: 'all-time',
      label: 'All Time',
      startDate: earliest,
      endDate: latest,
    };

    return [allTime, ...availableMonths];
  }, [sessions, availableMonths]);

  // Get current period option
  const currentPeriod = useMemo(() => {
    return periodOptions.find((p) => p.id === selectedPeriod) || periodOptions[0];
  }, [periodOptions, selectedPeriod]);

  // Calculate preview stats for selected period
  const stats = useMemo(() => {
    if (!currentPeriod) {
      return { sessions: 0, totalMinutes: 0 };
    }

    const data = prepareExportData(sessions, {
      projectId: projectId ?? undefined,
      projectName,
      startDate: currentPeriod.startDate,
      endDate: currentPeriod.endDate,
      format: 'csv',
    });

    return {
      sessions: data.sessionCount,
      totalMinutes: data.totalMinutes,
    };
  }, [sessions, projectId, projectName, currentPeriod]);

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
    if (!currentPeriod) return;

    setIsExporting(true);
    setError(null);

    try {
      const exportData = prepareExportData(sessions, {
        projectId: projectId ?? undefined,
        projectName,
        startDate: currentPeriod.startDate,
        endDate: currentPeriod.endDate,
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
  }, [currentPeriod, format, sessions, projectId, projectName, onClose]);

  // Handle period selection
  const handleSelectPeriod = useCallback((periodId: string) => {
    setSelectedPeriod(periodId);
    setIsDropdownOpen(false);
  }, []);

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

                {/* Period selector - Dropdown */}
                <div>
                  <div className="text-xs text-tertiary light:text-tertiary-dark uppercase tracking-wider mb-2">
                    Period
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        'bg-tertiary/5 light:bg-tertiary-dark/5 text-primary light:text-primary-dark',
                        'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
                        'border border-tertiary/10 light:border-tertiary-dark/10'
                      )}
                    >
                      <span>{currentPeriod?.label || 'Select period'}</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-tertiary transition-transform',
                          isDropdownOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Dropdown menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-surface light:bg-surface-dark rounded-xl border border-tertiary/10 light:border-tertiary-dark/10 shadow-lg z-10"
                        >
                          {periodOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleSelectPeriod(option.id)}
                              className={cn(
                                'w-full px-4 py-2.5 text-left text-sm transition-colors',
                                'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
                                selectedPeriod === option.id
                                  ? 'text-primary light:text-primary-dark font-medium bg-tertiary/5 light:bg-tertiary-dark/5'
                                  : 'text-secondary light:text-secondary-dark'
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
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
