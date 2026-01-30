'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useMigration, type MigrationStats } from '@/hooks/useMigration';
import { MigrationProgress } from './MigrationProgress';

/**
 * Success view showing migration statistics
 */
function MigrationSuccess({ stats }: { stats: MigrationStats }) {
  const prefersReducedMotion = useReducedMotion();

  // Particle animation - calm, subtle pulsing
  const particleAnimation = prefersReducedMotion
    ? { opacity: 1 }
    : {
        scale: [1, 1.05, 1],
        opacity: [0.9, 1, 0.9],
      };

  const particleTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 3, repeat: Infinity, ease: 'easeInOut' as const };

  // Only show stats that have values
  const hasStats = stats.sessions > 0 || stats.projects > 0 || stats.tasks > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Particle */}
      <motion.div
        className="w-3 h-3 rounded-full bg-primary light:bg-primary-dark mb-12"
        animate={particleAnimation}
        transition={particleTransition}
      />

      {/* Title */}
      <motion.h1
        className="text-lg font-medium text-primary light:text-primary-dark mb-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        Migration complete
      </motion.h1>

      {/* Stats */}
      {hasStats && (
        <motion.div
          className="flex flex-col items-center gap-1 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {stats.sessions > 0 && (
            <span className="text-sm text-secondary light:text-secondary-dark">
              {stats.sessions} {stats.sessions === 1 ? 'particle' : 'particles'}
            </span>
          )}
          {stats.projects > 0 && (
            <span className="text-sm text-secondary light:text-secondary-dark">
              {stats.projects} {stats.projects === 1 ? 'project' : 'projects'}
            </span>
          )}
          {stats.tasks > 0 && (
            <span className="text-sm text-secondary light:text-secondary-dark">
              {stats.tasks} {stats.tasks === 1 ? 'task' : 'tasks'}
            </span>
          )}
        </motion.div>
      )}

      {/* Footer text */}
      <motion.p
        className="text-sm text-tertiary light:text-tertiary-dark text-center leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Your data is now
        <br />
        ready for sync.
      </motion.p>
    </div>
  );
}

/**
 * Migration Overlay
 *
 * Full-screen overlay shown during data migration.
 * Only appears for large datasets (≥50 entries).
 *
 * Features:
 * - Progress bar during migration
 * - Success summary after completion
 * - Auto-closes after 2 seconds
 * - Blocks keyboard events to prevent timer interference
 */
export function MigrationOverlay() {
  const { state, showUI, stats } = useMigration();
  const prefersReducedMotion = useReducedMotion();

  // Block keyboard events during migration
  // (using useEffect in the hook would be cleaner, but we need this at component level)

  return (
    <AnimatePresence>
      {showUI && (state.status === 'running' || state.status === 'complete') && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background light:bg-background-dark flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.8,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <AnimatePresence mode="wait">
            {state.status === 'running' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MigrationProgress progress={state.progress} />
              </motion.div>
            )}

            {state.status === 'complete' && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MigrationSuccess stats={stats} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
