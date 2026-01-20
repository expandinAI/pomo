'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Check, AlertCircle } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { exportSessionsAsCSV } from '@/lib/export-utils';
import { prefersReducedMotion } from '@/lib/utils';

type ExportState = 'idle' | 'success' | 'empty';

interface ExportButtonProps {
  /** Variant style */
  variant?: 'default' | 'compact';
  /** Additional class names */
  className?: string;
}

/**
 * Export Button - Downloads session data as CSV
 * Shows feedback on success or if no data available
 */
export function ExportButton({ variant = 'default', className = '' }: ExportButtonProps) {
  const [state, setState] = useState<ExportState>('idle');
  const reducedMotion = prefersReducedMotion();

  const handleExport = useCallback(() => {
    const success = exportSessionsAsCSV();

    if (success) {
      setState('success');
      // Reset after 2 seconds
      setTimeout(() => setState('idle'), 2000);
    } else {
      setState('empty');
      // Reset after 3 seconds
      setTimeout(() => setState('idle'), 3000);
    }
  }, []);

  const isCompact = variant === 'compact';

  // Icon based on state
  const Icon = state === 'success' ? Check : state === 'empty' ? AlertCircle : Download;

  // Text based on state
  const text = state === 'success'
    ? 'Downloaded!'
    : state === 'empty'
      ? 'No data to export'
      : 'Export CSV';

  // Color based on state
  const stateClasses = state === 'success'
    ? 'text-green-500 light:text-green-600'
    : state === 'empty'
      ? 'text-amber-500 light:text-amber-600'
      : 'text-secondary light:text-secondary-dark hover:text-primary light:hover:text-primary-dark';

  return (
    <motion.button
      onClick={handleExport}
      disabled={state !== 'idle'}
      className={`
        flex items-center justify-center gap-2
        ${isCompact ? 'px-3 py-1.5' : 'px-4 py-2'}
        rounded-lg
        bg-surface/50 light:bg-surface-dark/50
        hover:bg-surface light:hover:bg-surface-dark
        border border-tertiary/10 light:border-tertiary-dark/10
        transition-colors duration-fast
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
        disabled:cursor-not-allowed
        ${stateClasses}
        ${className}
      `}
      whileHover={reducedMotion || state !== 'idle' ? {} : { scale: 1.02 }}
      whileTap={reducedMotion || state !== 'idle' ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', ...SPRING.snappy }}
      aria-label={text}
      title="Export all sessions as CSV file"
    >
      <motion.div
        key={state}
        initial={reducedMotion ? {} : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.snappy }}
      >
        <Icon className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </motion.div>
      {!isCompact && (
        <span className={`text-sm font-medium ${isCompact ? '' : ''}`}>
          {text}
        </span>
      )}
    </motion.button>
  );
}
