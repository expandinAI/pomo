'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { formatDuration } from '@/lib/session-storage';
import type { ParticleOfWeek } from '@/lib/coach/particle-of-week';
import type { CoachInsight } from './types';

interface CurrentWeekStats {
  totalParticles: number;
  totalMinutes: number;
  projectCount: number;
}

interface CoachBriefingProps {
  currentWeekStats: CurrentWeekStats | null;
  potw: ParticleOfWeek | null;
  potwLoading: boolean;
  insight: CoachInsight | null;
  insightLoading: boolean;
}

type ExpandedSection = 'potw' | 'insight' | null;

/** Extract the first sentence from a string */
function getFirstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : text;
}

/** Format POTW compact display */
function formatPotwCompact(potw: ParticleOfWeek): { line1: string; line2: string } {
  const minutes = Math.round(potw.session.duration / 60);
  const task = potw.session.task
    ? potw.session.task.length > 24
      ? potw.session.task.slice(0, 24) + '\u2026'
      : potw.session.task
    : '';
  const weekday = new Date(potw.session.completedAt).toLocaleDateString('en-US', {
    weekday: 'short',
  });

  const parts = [`${minutes} min`];
  if (task) parts.push(task);
  parts.push(weekday);

  return {
    line1: parts.join(' \u00b7 '),
    line2: `\u201c${potw.narrative.meaning}\u201d`,
  };
}

const STAGGER_DELAY = 0.05;

export function CoachBriefing({
  currentWeekStats,
  potw,
  potwLoading,
  insight,
  insightLoading,
}: CoachBriefingProps) {
  const [expanded, setExpanded] = useState<ExpandedSection>(null);
  const prefersReducedMotion = useReducedMotion();

  const toggleSection = useCallback((section: ExpandedSection) => {
    setExpanded((prev) => (prev === section ? null : section));
  }, []);

  const allLoading = !currentWeekStats && potwLoading && insightLoading;

  const animateProps = prefersReducedMotion
    ? { initial: false, transition: { duration: 0 } }
    : {};

  const expandTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, ...SPRING.gentle };

  // Loading skeleton
  if (allLoading) {
    return (
      <div className="space-y-2">
        {/* Stats ticker skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse" />
          <div className="h-3 w-36 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse" />
        </div>
        {/* POTW skeleton */}
        <div className="border-l-2 border-[#FFD700]/40 rounded-r-lg pl-3 pr-3 py-2.5">
          <div className="h-4 w-3/4 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse mb-1.5" />
          <div className="h-3 w-5/6 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse" />
        </div>
        {/* Insight skeleton */}
        <div className="border-l-2 border-tertiary/20 light:border-tertiary-dark/20 rounded-r-lg pl-3 pr-3 py-2.5">
          <div className="h-4 w-2/3 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse mb-1.5" />
          <div className="h-3 w-5/6 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const showTicker = !!currentWeekStats;
  const showPotw = potw || potwLoading;
  const showInsight = insight || insightLoading || (!insight && !insightLoading);

  return (
    <div className="space-y-2">
      {/* Zone 1 — Current Week Stats */}
      {showTicker && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: 0 }}
          className="pb-1"
        >
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-tertiary light:text-tertiary-dark uppercase tracking-wider">
              This Week
            </span>
          </div>
          {currentWeekStats.totalParticles > 0 ? (
            <p className="text-sm text-secondary light:text-secondary-dark">
              {currentWeekStats.totalParticles} {currentWeekStats.totalParticles === 1 ? 'particle' : 'particles'}
              {' \u00b7 '}
              {formatDuration(currentWeekStats.totalMinutes * 60)} focused
              {currentWeekStats.projectCount > 0 && (
                <> {'\u00b7 '}{currentWeekStats.projectCount} {currentWeekStats.projectCount === 1 ? 'project' : 'projects'}</>
              )}
            </p>
          ) : (
            <p className="text-sm text-tertiary light:text-tertiary-dark">
              No particles yet — start your first session
            </p>
          )}
        </motion.div>
      )}

      {/* Zone 2 — Particle of the Week */}
      {showPotw && potw && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: STAGGER_DELAY }}
          className="border-l-2 border-[#FFD700]/40 rounded-r-lg"
        >
          <button
            type="button"
            onClick={() => toggleSection('potw')}
            aria-expanded={expanded === 'potw'}
            aria-controls="potw-content"
            id="potw-trigger"
            className="w-full text-left pl-3 pr-3 py-2.5 rounded-r-lg hover:bg-tertiary/5 light:hover:bg-tertiary-dark/5 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm text-primary light:text-primary-dark">
                  <span className="text-[#FFD700] flex-shrink-0">{'\u2727'}</span>
                  <span className="truncate">{formatPotwCompact(potw).line1}</span>
                </div>
                <p className="text-xs text-secondary light:text-secondary-dark italic mt-0.5 truncate pl-5">
                  {formatPotwCompact(potw).line2}
                </p>
              </div>
              <motion.div
                animate={{ rotate: expanded === 'potw' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
                {...animateProps}
              >
                <ChevronDown className="w-3.5 h-3.5 text-tertiary light:text-tertiary-dark" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expanded === 'potw' && (
              <motion.div
                id="potw-content"
                role="region"
                aria-labelledby="potw-trigger"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={expandTransition}
                className="overflow-hidden"
              >
                <div className="pl-3 pr-3 pb-3 space-y-2">
                  <p className="text-sm text-secondary light:text-secondary-dark">
                    {potw.narrative.opening}
                  </p>
                  <p className="text-sm text-secondary light:text-secondary-dark">
                    {potw.narrative.body}
                  </p>
                  <p className="text-sm text-secondary light:text-secondary-dark italic">
                    {potw.narrative.meaning}
                  </p>
                  <p className="text-xs text-tertiary light:text-tertiary-dark mt-1">
                    {new Date(potw.session.completedAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Zone 3 — Insight */}
      {showInsight && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { delay: STAGGER_DELAY * 2 }}
          className="border-l-2 border-tertiary/20 light:border-tertiary-dark/20 rounded-r-lg"
        >
          {insightLoading ? (
            <div className="pl-3 pr-3 py-2.5">
              <div className="h-4 w-2/3 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse mb-1.5" />
              <div className="h-3 w-5/6 bg-tertiary/10 light:bg-tertiary-dark/10 rounded animate-pulse" />
            </div>
          ) : insight ? (
            <>
              <button
                type="button"
                onClick={() => toggleSection('insight')}
                aria-expanded={expanded === 'insight'}
                aria-controls="insight-content"
                id="insight-trigger"
                className="w-full text-left pl-3 pr-3 py-2.5 rounded-r-lg hover:bg-tertiary/5 light:hover:bg-tertiary-dark/5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sm text-primary light:text-primary-dark">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{insight.title}</span>
                    </div>
                    <p className="text-xs text-secondary light:text-secondary-dark mt-0.5 truncate pl-5">
                      {getFirstSentence(insight.content)}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded === 'insight' ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                    {...animateProps}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-tertiary light:text-tertiary-dark" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {expanded === 'insight' && (
                  <motion.div
                    id="insight-content"
                    role="region"
                    aria-labelledby="insight-trigger"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={expandTransition}
                    className="overflow-hidden"
                  >
                    <div className="pl-3 pr-3 pb-3 space-y-2">
                      <p className="text-sm text-secondary light:text-secondary-dark leading-relaxed">
                        {insight.content}
                      </p>
                      {insight.highlights && insight.highlights.length > 0 && (
                        <ul className="space-y-1">
                          {insight.highlights.map((highlight, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-xs text-tertiary light:text-tertiary-dark"
                            >
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-tertiary light:bg-tertiary-dark flex-shrink-0" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <p className="pl-3 pr-3 py-2.5 text-xs text-tertiary light:text-tertiary-dark">
              Complete a few sessions for your first insight
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
