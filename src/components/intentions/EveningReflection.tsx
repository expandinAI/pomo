'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSessionStore } from '@/contexts/SessionContext';
import { useIntention } from '@/hooks/useIntention';
import { useEveningInsight } from '@/hooks/useEveningInsight';
import type { IntentionStatus, IntentionAlignment } from '@/lib/db/types';
import type { EveningInsightContext } from '@/lib/coach/intention-insights';
import { getParticleHexColor } from '@/lib/intentions';
import { formatDuration } from '@/lib/session-storage';

// ============================================================================
// EVENING REFLECTION - End of Day Awareness
// ============================================================================
//
// A calm moment to reflect on intention vs reality.
// Two phases:
// 1. "Your Day" - Shows particles with alignment colors and summary
// 2. "How does this feel?" - Three options: Done, Partial, Tomorrow
//
// Philosophy: "How does this feel?" not "Did you succeed?"
// ============================================================================

/** Timing constants (in ms) */
const TIMING = {
  /** Initial delay before phase 1 content appears */
  INITIAL_DELAY: 300,
  /** Auto-advance to phase 2 after this duration (or Space to skip) */
  PHASE_ONE_DURATION: 3000,
  /** Stagger delay between particles */
  PARTICLE_STAGGER: 80,
  /** Delay before options appear in phase 2 */
  OPTIONS_DELAY: 200,
  /** Duration of exit animation */
  EXIT_DURATION: 800,
} as const;

interface EveningReflectionProps {
  /** Called when reflection is completed with the selected status */
  onComplete: (status: IntentionStatus) => void;
  /** Called when dismissed without selection (Escape) */
  onDismiss: () => void;
}

interface SessionSummary {
  totalParticles: number;
  alignedCount: number;
  reactiveCount: number;
  totalFocusSeconds: number;
  particles: Array<{ id: string; alignment?: IntentionAlignment }>;
}

/**
 * EveningReflection - End of day reflection overlay
 *
 * Shows a calm reflection on the day's work with alignment visualization
 * and allows marking the intention as completed, partial, or deferred.
 */
export function EveningReflection({
  onComplete,
  onDismiss,
}: EveningReflectionProps) {
  const [phase, setPhase] = useState<'one' | 'two' | 'exiting'>('one');
  const [selectedStatus, setSelectedStatus] = useState<IntentionStatus | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { todayIntention } = useIntention();
  const { getTodaySessions } = useSessionStore();

  // Calculate session summary
  const summary: SessionSummary = (() => {
    const sessions = getTodaySessions();
    const workSessions = sessions.filter(s => s.type === 'work');

    const particles = workSessions.map(s => ({
      id: s.id,
      alignment: ('intentionAlignment' in s)
        ? (s.intentionAlignment as IntentionAlignment | undefined)
        : undefined,
    }));

    const alignedCount = particles.filter(p => p.alignment === 'aligned').length;
    const reactiveCount = particles.filter(p => p.alignment === 'reactive').length;
    const totalFocusSeconds = workSessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      totalParticles: workSessions.length,
      alignedCount,
      reactiveCount,
      totalFocusSeconds,
      particles,
    };
  })();

  // Build evening insight context
  const eveningContext: EveningInsightContext | null = useMemo(() => {
    if (!todayIntention) return null;

    const sessions = getTodaySessions();
    const workSessions = sessions.filter(s => s.type === 'work');

    // Calculate aligned/reactive minutes
    let alignedSeconds = 0;
    let reactiveSeconds = 0;
    const reactiveTasks: string[] = [];
    const seenTasks = new Set<string>();

    for (const s of workSessions) {
      const alignment = ('intentionAlignment' in s)
        ? (s.intentionAlignment as IntentionAlignment | undefined)
        : undefined;

      if (alignment === 'aligned') {
        alignedSeconds += s.duration;
      } else if (alignment === 'reactive') {
        reactiveSeconds += s.duration;
        if (s.task && !seenTasks.has(s.task)) {
          seenTasks.add(s.task);
          reactiveTasks.push(s.task);
        }
      }
    }

    return {
      intentionText: todayIntention.text,
      totalParticles: summary.totalParticles,
      alignedCount: summary.alignedCount,
      reactiveCount: summary.reactiveCount,
      alignedMinutes: Math.round(alignedSeconds / 60),
      reactiveMinutes: Math.round(reactiveSeconds / 60),
      reactiveTasks,
    };
  }, [todayIntention, getTodaySessions, summary]);

  const { insight: eveningInsight } = useEveningInsight(eveningContext);

  // Handle status selection
  const handleSelect = useCallback((status: IntentionStatus) => {
    setSelectedStatus(status);
    setPhase('exiting');
  }, []);

  // Complete after exit animation
  useEffect(() => {
    if (phase === 'exiting' && selectedStatus) {
      const timeout = setTimeout(() => {
        onComplete(selectedStatus);
      }, TIMING.EXIT_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [phase, selectedStatus, onComplete]);

  // Auto-advance to phase 2 after delay (or Space to skip)
  useEffect(() => {
    if (phase === 'one') {
      const timeout = setTimeout(() => {
        setPhase('two');
      }, TIMING.PHASE_ONE_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  // Keyboard handling
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (e.key === 'Escape') {
        onDismiss();
        return;
      }

      // Space advances from phase 1 to phase 2
      if (e.key === ' ' && phase === 'one') {
        setPhase('two');
        return;
      }

      // In phase 2: D/1 = Done, P/2 = Partial, T/3 = Tomorrow
      if (phase === 'two') {
        if (e.key === 'd' || e.key === 'D' || e.key === '1') {
          handleSelect('completed');
        } else if (e.key === 'p' || e.key === 'P' || e.key === '2') {
          handleSelect('partial');
        } else if (e.key === 't' || e.key === 'T' || e.key === '3') {
          handleSelect('deferred');
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [phase, handleSelect, onDismiss]);

  const isExiting = phase === 'exiting';

  // Format focus time
  const focusTimeFormatted = formatDuration(summary.totalFocusSeconds);

  // Build summary text
  const summaryText = (() => {
    const parts = [focusTimeFormatted, `${summary.totalParticles} particle${summary.totalParticles !== 1 ? 's' : ''}`];
    if (summary.alignedCount > 0) {
      parts.push(`${summary.alignedCount} aligned`);
    }
    return parts.join(' · ');
  })();

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background light:bg-background-dark flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{
        duration: isExiting ? TIMING.EXIT_DURATION / 1000 : 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <div className="flex flex-col items-center px-6 max-w-lg">
        <AnimatePresence mode="wait">
          {/* Phase 1: Your Day */}
          {phase === 'one' && (
            <motion.div
              key="phase-one"
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* Intention Text */}
              <motion.p
                className="text-xl font-medium text-primary light:text-primary-dark text-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: TIMING.INITIAL_DELAY / 1000, duration: 0.5 }}
              >
                &ldquo;{todayIntention?.text}&rdquo;
              </motion.p>

              {/* Particles Row */}
              <motion.div
                className="flex items-center justify-center gap-2 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (TIMING.INITIAL_DELAY + 200) / 1000, duration: 0.4 }}
              >
                {summary.particles.map((particle, index) => (
                  <motion.div
                    key={particle.id}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getParticleHexColor(particle.alignment) }}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: (TIMING.INITIAL_DELAY + 400 + index * TIMING.PARTICLE_STAGGER) / 1000,
                      duration: 0.3,
                      type: 'spring',
                      stiffness: 400,
                      damping: 20,
                    }}
                  />
                ))}
                {summary.totalParticles === 0 && (
                  <motion.p
                    className="text-sm text-tertiary light:text-tertiary-dark"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (TIMING.INITIAL_DELAY + 400) / 1000 }}
                  >
                    No particles today
                  </motion.p>
                )}
              </motion.div>

              {/* Summary */}
              <motion.p
                className="text-sm text-secondary light:text-secondary-dark text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: (TIMING.INITIAL_DELAY + 600 + summary.particles.length * TIMING.PARTICLE_STAGGER) / 1000,
                  duration: 0.4,
                }}
              >
                {summaryText}
              </motion.p>

              {/* Evening Insight */}
              {eveningInsight && (
                <motion.p
                  className="text-sm italic text-secondary light:text-secondary-dark text-center mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  {eveningInsight}
                </motion.p>
              )}

              {/* Skip hint */}
              <motion.p
                className="text-xs text-tertiary light:text-tertiary-dark mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 2, duration: 0.4 }}
              >
                Press Space to continue
              </motion.p>
            </motion.div>
          )}

          {/* Phase 2: How does this feel? */}
          {phase === 'two' && (
            <motion.div
              key="phase-two"
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Question */}
              <motion.h2
                className="text-xl font-medium text-primary light:text-primary-dark text-center mb-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                How does this feel?
              </motion.h2>

              {/* Options */}
              <div className="flex gap-4">
                {/* Done */}
                <motion.button
                  onClick={() => handleSelect('completed')}
                  className="flex flex-col items-center justify-center w-28 h-28 rounded-xl border border-tertiary/10 light:border-tertiary-dark/10 bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 hover:border-tertiary/20 light:hover:border-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: TIMING.OPTIONS_DELAY / 1000, duration: 0.3 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <span className="text-2xl mb-2">✓</span>
                  <span className="text-sm font-medium text-primary light:text-primary-dark">Done</span>
                  <span className="text-xs text-tertiary light:text-tertiary-dark mt-1">D</span>
                </motion.button>

                {/* Partial */}
                <motion.button
                  onClick={() => handleSelect('partial')}
                  className="flex flex-col items-center justify-center w-28 h-28 rounded-xl border border-tertiary/10 light:border-tertiary-dark/10 bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 hover:border-tertiary/20 light:hover:border-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (TIMING.OPTIONS_DELAY + 100) / 1000, duration: 0.3 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <span className="text-2xl mb-2">◐</span>
                  <span className="text-sm font-medium text-primary light:text-primary-dark">Partial</span>
                  <span className="text-xs text-tertiary light:text-tertiary-dark mt-1">P</span>
                </motion.button>

                {/* Tomorrow */}
                <motion.button
                  onClick={() => handleSelect('deferred')}
                  className="flex flex-col items-center justify-center w-28 h-28 rounded-xl border border-tertiary/10 light:border-tertiary-dark/10 bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 hover:border-tertiary/20 light:hover:border-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (TIMING.OPTIONS_DELAY + 200) / 1000, duration: 0.3 }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                >
                  <span className="text-2xl mb-2">→</span>
                  <span className="text-sm font-medium text-primary light:text-primary-dark">Tomorrow</span>
                  <span className="text-xs text-tertiary light:text-tertiary-dark mt-1">T</span>
                </motion.button>
              </div>

              {/* Escape hint */}
              <motion.p
                className="text-xs text-tertiary light:text-tertiary-dark mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                Esc to dismiss
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
