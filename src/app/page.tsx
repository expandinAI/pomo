'use client';

import { useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from '@/components/timer/Timer';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useGPrefixNavigation } from '@/hooks/useGPrefixNavigation';

// Lazy load non-critical modal components
const ShortcutsHelp = dynamic(
  () => import('@/components/ui/ShortcutsHelp').then(mod => ({ default: mod.ShortcutsHelp })),
  { ssr: false }
);
const TimerSettings = dynamic(
  () => import('@/components/settings/TimerSettings').then(mod => ({ default: mod.TimerSettings })),
  { ssr: false }
);
const SessionHistory = dynamic(
  () => import('@/components/insights/SessionHistory').then(mod => ({ default: mod.SessionHistory })),
  { ssr: false }
);
const StatisticsDashboard = dynamic(
  () => import('@/components/insights/StatisticsDashboard').then(mod => ({ default: mod.StatisticsDashboard })),
  { ssr: false }
);
const FocusHeatmap = dynamic(
  () => import('@/components/insights/FocusHeatmap').then(mod => ({ default: mod.FocusHeatmap })),
  { ssr: false }
);

export default function Home() {
  // G-prefix navigation callbacks
  const gPrefixCallbacks = useMemo(
    () => ({
      onTimer: () => {
        // Close all modals by dispatching close events
        // The modals handle their own Escape key, but this is for "go to timer"
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      },
      onStats: () => {
        window.dispatchEvent(new CustomEvent('particle:open-dashboard'));
      },
      onHistory: () => {
        window.dispatchEvent(new CustomEvent('particle:open-history'));
      },
      onSettings: () => {
        window.dispatchEvent(new CustomEvent('particle:open-settings'));
      },
    }),
    []
  );

  const { isGPressed } = useGPrefixNavigation(gPrefixCallbacks);

  // Global keyboard shortcut for Cmd+, to open settings
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd+, (Mac) or Ctrl+, (Windows/Linux) to open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('particle:open-settings'));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main
      id="main-timer"
      tabIndex={-1}
      className="relative min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset-top safe-area-inset-bottom focus:outline-none"
    >
      {/* Analytics, Settings and Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <FocusHeatmap />
        <SessionHistory />
        <TimerSettings />
        <ThemeToggle />
      </div>

      {/* Statistics Dashboard (opened via G+S keyboard shortcut) */}
      <StatisticsDashboard />

      <Timer />

      {/* Shortcuts help in bottom-left corner */}
      <div className="absolute bottom-4 left-4">
        <ShortcutsHelp />
      </div>

      {/* G-prefix indicator */}
      <AnimatePresence>
        {isGPressed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-4 right-4 px-3 py-1.5 bg-surface/90 light:bg-surface-dark/90 backdrop-blur-sm rounded-lg border border-tertiary/20 light:border-tertiary-dark/20 shadow-lg z-50"
          >
            <span className="text-sm font-medium text-secondary light:text-secondary-dark">
              G...
            </span>
            <span className="ml-2 text-xs text-tertiary light:text-tertiary-dark">
              t/s/h/,
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
