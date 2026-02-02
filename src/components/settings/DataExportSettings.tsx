'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, AlertCircle, Loader2 } from 'lucide-react';
import { exportAllData } from '@/lib/data-export';
import { SPRING } from '@/styles/design-tokens';

type ExportState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Data Export Settings Component
 *
 * Allows users to export all their data as JSON (GDPR compliance).
 * Shows loading/success/error states with appropriate feedback.
 */
export function DataExportSettings() {
  const [state, setState] = useState<ExportState>('idle');

  const handleExport = useCallback(async () => {
    if (state === 'loading') return;

    setState('loading');

    try {
      await exportAllData();
      setState('success');

      // Reset to idle after success feedback
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setState('error');

      // Reset to idle after error feedback
      setTimeout(() => setState('idle'), 3000);
    }
  }, [state]);

  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <Check className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getButtonText = () => {
    switch (state) {
      case 'loading':
        return 'Exporting...';
      case 'success':
        return 'Downloaded';
      case 'error':
        return 'Failed';
      default:
        return 'Export Data';
    }
  };

  const getButtonClasses = () => {
    const base =
      'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

    switch (state) {
      case 'success':
        return `${base} bg-green-500/20 text-green-400 cursor-default`;
      case 'error':
        return `${base} bg-red-500/20 text-red-400 cursor-default`;
      case 'loading':
        return `${base} bg-tertiary/10 light:bg-tertiary-dark/10 text-tertiary light:text-tertiary-dark cursor-wait`;
      default:
        return `${base} bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20`;
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
        Privacy
      </label>

      <motion.button
        onClick={handleExport}
        disabled={state === 'loading'}
        className={getButtonClasses()}
        whileHover={state === 'idle' ? { scale: 1.02 } : {}}
        whileTap={state === 'idle' ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', ...SPRING.snappy }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            {getIcon()}
            {getButtonText()}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <p className="text-xs text-tertiary light:text-tertiary-dark">
        Download all your data as JSON (sessions, projects, settings)
      </p>
    </div>
  );
}
