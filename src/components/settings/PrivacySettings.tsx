'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, AlertCircle, Loader2, BarChart3, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { exportAllData } from '@/lib/data-export';
import { SPRING } from '@/styles/design-tokens';
import { useAnalyticsSettings } from '@/hooks/useAnalyticsSettings';
import { useIsAuthenticated } from '@/lib/auth';

type ExportState = 'idle' | 'loading' | 'success' | 'error';

interface PrivacySettingsProps {
  onOpenDeleteModal?: () => void;
}

/**
 * Privacy Settings Component
 *
 * Includes:
 * - Data export (GDPR compliance)
 * - Analytics opt-out toggle
 * - Delete account button (for authenticated users)
 * - Privacy policy link
 */
export function PrivacySettings({ onOpenDeleteModal }: PrivacySettingsProps) {
  const [exportState, setExportState] = useState<ExportState>('idle');
  const { analyticsEnabled, toggleAnalytics, isLoaded } = useAnalyticsSettings();
  const isAuthenticated = useIsAuthenticated();

  // Export handler
  const handleExport = useCallback(async () => {
    if (exportState === 'loading') return;

    setExportState('loading');

    try {
      await exportAllData();
      setExportState('success');
      setTimeout(() => setExportState('idle'), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportState('error');
      setTimeout(() => setExportState('idle'), 3000);
    }
  }, [exportState]);

  // Delete account handler
  const handleDeleteAccount = useCallback(() => {
    if (onOpenDeleteModal) {
      onOpenDeleteModal();
    } else {
      // Placeholder until POMO-328 is implemented
      alert('Account deletion will be available soon. Contact support@particle.app for immediate requests.');
    }
  }, [onOpenDeleteModal]);

  // Export button helpers
  const getExportIcon = () => {
    switch (exportState) {
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

  const getExportText = () => {
    switch (exportState) {
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

  const getExportClasses = () => {
    const base =
      'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

    switch (exportState) {
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
    <div className="space-y-4">
      <label className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider">
        Privacy
      </label>

      {/* Export Data */}
      <div className="space-y-1">
        <motion.button
          onClick={handleExport}
          disabled={exportState === 'loading'}
          className={getExportClasses()}
          whileHover={exportState === 'idle' ? { scale: 1.02 } : {}}
          whileTap={exportState === 'idle' ? { scale: 0.98 } : {}}
          transition={{ type: 'spring', ...SPRING.snappy }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={exportState}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              {getExportIcon()}
              {getExportText()}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <p className="text-xs text-tertiary light:text-tertiary-dark">
          Download all your data as JSON
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-tertiary/10 light:border-tertiary-dark/10" />

      {/* Analytics Toggle */}
      <motion.button
        onClick={toggleAnalytics}
        disabled={!isLoaded}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
          analyticsEnabled
            ? 'bg-accent/10 light:bg-accent-dark/10 ring-1 ring-accent light:ring-accent-dark'
            : 'bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
        }`}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <div className="flex items-center gap-3">
          <BarChart3
            className={`w-4 h-4 ${
              analyticsEnabled
                ? 'text-accent light:text-accent-dark'
                : 'text-tertiary light:text-tertiary-dark'
            }`}
          />
          <div className="text-left">
            <p
              className={`text-sm font-medium ${
                analyticsEnabled
                  ? 'text-accent light:text-accent-dark'
                  : 'text-secondary light:text-secondary-dark'
              }`}
            >
              Help improve Particle
            </p>
            <p className="text-xs text-tertiary light:text-tertiary-dark">
              Anonymous usage data, no personal info
            </p>
          </div>
        </div>
        {/* Toggle Switch */}
        <div
          className={`relative w-10 h-6 rounded-full transition-colors ${
            analyticsEnabled
              ? 'bg-accent light:bg-accent-dark'
              : 'bg-tertiary/30 light:bg-tertiary-dark/30'
          }`}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: analyticsEnabled ? 20 : 4 }}
            transition={{ type: 'spring', ...SPRING.default }}
          />
        </div>
      </motion.button>

      {/* Delete Account (only for authenticated users) */}
      {isAuthenticated && (
        <>
          {/* Divider */}
          <div className="border-t border-tertiary/10 light:border-tertiary-dark/10" />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-tertiary light:text-tertiary-dark" />
              <p className="text-sm font-medium text-secondary light:text-secondary-dark">
                Delete Account
              </p>
            </div>
            <p className="text-xs text-tertiary light:text-tertiary-dark">
              Permanently delete your account and all data. 30-day cooling-off period.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account...
            </button>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="border-t border-tertiary/10 light:border-tertiary-dark/10" />

      {/* Privacy Policy Link */}
      <Link
        href="/privacy"
        className="flex items-center gap-2 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        View Privacy Policy
      </Link>
    </div>
  );
}
