'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isIndexedDBAvailable,
  hasPendingMigrations,
  countPendingEntries,
  runMigrations,
  type MigrationProgress,
  type MigrationSummary,
} from '@/lib/db';

/**
 * Threshold for showing migration UI
 * Below this, migration is too fast to warrant a visual overlay
 */
const SHOW_UI_THRESHOLD = 50;

/**
 * Duration to show success screen before auto-closing (ms)
 */
const SUCCESS_DISPLAY_DURATION = 2000;

/**
 * Demo mode settings
 */
const DEMO_URL_PARAM = 'demo-migration';
const DEMO_PHASE_DURATION = 1200; // Duration per phase in demo mode

/**
 * Migration state machine
 */
export type MigrationState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'not-needed' }
  | { status: 'running'; progress: MigrationProgress }
  | { status: 'complete'; summary: MigrationSummary }
  | { status: 'error'; error: string };

export interface MigrationStats {
  sessions: number;
  projects: number;
  tasks: number;
}

/**
 * Demo migration phases
 */
const DEMO_PHASES: MigrationProgress[] = [
  { current: 'sessions_v1', currentLabel: 'Migrating particles...', total: 4, completed: 0 },
  { current: 'projects_v1', currentLabel: 'Migrating projects...', total: 4, completed: 1 },
  { current: 'settings_v1', currentLabel: 'Migrating settings...', total: 4, completed: 2 },
  { current: 'recent_tasks_v1', currentLabel: 'Migrating tasks...', total: 4, completed: 3 },
  { current: 'complete', currentLabel: 'Migration complete', total: 4, completed: 4 },
];

/**
 * Demo stats shown after "migration"
 */
const DEMO_STATS: MigrationStats = {
  sessions: 127,
  projects: 12,
  tasks: 34,
};

/**
 * Hook to manage data migration from localStorage to IndexedDB
 *
 * Features:
 * - Auto-starts on mount
 * - Shows UI only for large datasets (≥50 entries)
 * - Reports progress during migration
 * - Auto-closes after success
 * - Demo mode via ?demo-migration URL parameter
 *
 * @example
 * ```tsx
 * const { state, showUI, stats } = useMigration();
 *
 * if (showUI && state.status === 'running') {
 *   return <MigrationProgress progress={state.progress} />;
 * }
 * ```
 */
export function useMigration() {
  const [state, setState] = useState<MigrationState>({ status: 'idle' });
  const [showUI, setShowUI] = useState(false);
  const [stats, setStats] = useState<MigrationStats>({ sessions: 0, projects: 0, tasks: 0 });
  const hasStarted = useRef(false);

  // Extract stats from migration summary
  const extractStats = useCallback((summary: MigrationSummary): MigrationStats => {
    const stats: MigrationStats = { sessions: 0, projects: 0, tasks: 0 };

    for (const result of summary.results) {
      if (result.name === 'sessions_v1') {
        stats.sessions = result.migrated;
      } else if (result.name === 'projects_v1') {
        stats.projects = result.migrated;
      } else if (result.name === 'recent_tasks_v1') {
        stats.tasks = result.migrated;
      }
    }

    return stats;
  }, []);

  // Run demo migration (simulated)
  const runDemoMigration = useCallback(async () => {
    console.log('[Migration] Running in DEMO mode');
    setShowUI(true);

    // Simulate each phase with delays
    for (let i = 0; i < DEMO_PHASES.length - 1; i++) {
      setState({ status: 'running', progress: DEMO_PHASES[i] });
      await new Promise((resolve) => setTimeout(resolve, DEMO_PHASE_DURATION));
    }

    // Set demo stats
    setStats(DEMO_STATS);

    // Transition to complete
    setState({
      status: 'complete',
      summary: {
        totalMigrated: DEMO_STATS.sessions + DEMO_STATS.projects + DEMO_STATS.tasks,
        totalErrors: 0,
        results: [
          { name: 'sessions_v1', skipped: false, migrated: DEMO_STATS.sessions, errors: [], duration: 100 },
          { name: 'projects_v1', skipped: false, migrated: DEMO_STATS.projects, errors: [], duration: 50 },
          { name: 'settings_v1', skipped: false, migrated: 1, errors: [], duration: 10 },
          { name: 'recent_tasks_v1', skipped: false, migrated: DEMO_STATS.tasks, errors: [], duration: 30 },
        ],
        duration: DEMO_PHASE_DURATION * 4,
      },
    });

    // Auto-close after delay
    setTimeout(() => {
      setShowUI(false);
      // Remove demo param from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete(DEMO_URL_PARAM);
      window.history.replaceState({}, '', url.toString());
    }, SUCCESS_DISPLAY_DURATION);
  }, []);

  // Run real migration
  const runMigrationProcess = useCallback(async () => {
    // Check if IndexedDB is available
    if (!isIndexedDBAvailable()) {
      console.log('[Migration] IndexedDB not available, skipping');
      setState({ status: 'not-needed' });
      return;
    }

    // Check if there are pending migrations
    if (!hasPendingMigrations()) {
      console.log('[Migration] No pending migrations');
      setState({ status: 'not-needed' });
      return;
    }

    // Check entry count to decide if we show UI
    const pendingCount = countPendingEntries();
    console.log(`[Migration] ${pendingCount} entries pending`);

    if (pendingCount >= SHOW_UI_THRESHOLD) {
      setShowUI(true);
    }

    // Start migration
    setState({
      status: 'running',
      progress: {
        current: 'starting',
        currentLabel: 'Preparing...',
        total: 4,
        completed: 0,
      },
    });

    try {
      const summary = await runMigrations((progress) => {
        setState({ status: 'running', progress });
      });

      console.log('[Migration] Complete:', summary);

      // Extract stats for display
      const migrationStats = extractStats(summary);
      setStats(migrationStats);

      // Check for errors
      if (summary.totalErrors > 0) {
        console.warn('[Migration] Completed with errors:', summary.results.filter(r => r.errors.length > 0));
      }

      // Transition to complete state
      setState({ status: 'complete', summary });

      // Auto-close after delay
      if (showUI || pendingCount >= SHOW_UI_THRESHOLD) {
        setTimeout(() => {
          setShowUI(false);
        }, SUCCESS_DISPLAY_DURATION);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Migration] Error:', error);
      // Log error but don't show to user (would confuse them)
      setState({ status: 'error', error: message });
      // Close UI on error (silently)
      setShowUI(false);
    }
  }, [extractStats, showUI]);

  // Auto-start on mount (once)
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Check if we're in browser
    if (typeof window === 'undefined') return;

    // Check for demo mode
    const urlParams = new URLSearchParams(window.location.search);
    const isDemo = urlParams.has(DEMO_URL_PARAM);

    if (isDemo) {
      runDemoMigration();
    } else {
      setState({ status: 'checking' });
      runMigrationProcess();
    }
  }, [runMigrationProcess, runDemoMigration]);

  return {
    /** Current migration state */
    state,
    /** Whether to show the migration UI overlay */
    showUI,
    /** Migration statistics (populated after completion) */
    stats,
    /** Whether migration has completed (successfully or not) */
    isComplete: state.status === 'complete' || state.status === 'not-needed' || state.status === 'error',
  };
}
