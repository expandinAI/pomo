'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';
import {
  getLifetimeStats,
  formatHoursMinutes,
  formatFirstSessionDate,
  type LifetimeStats,
} from '@/lib/session-analytics';

interface TotalHoursCounterProps {
  refreshTrigger?: number;
}

/**
 * Total Hours Counter - Shows lifetime focus statistics
 * Minimal view by default, expandable for details
 */
export function TotalHoursCounter({ refreshTrigger }: TotalHoursCounterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<LifetimeStats | null>(null);

  const reducedMotion = prefersReducedMotion();

  // Load stats on mount and when refresh triggers
  useEffect(() => {
    setStats(getLifetimeStats());
  }, [refreshTrigger]);

  // Format values for display
  const formattedTotal = useMemo(() => {
    if (!stats) return '0h 0m';
    return formatHoursMinutes(stats.totalSeconds);
  }, [stats]);

  const formattedAverage = useMemo(() => {
    if (!stats || stats.averageSessionLength === 0) return '0m';
    return formatHoursMinutes(stats.averageSessionLength);
  }, [stats]);

  const formattedFirstDate = useMemo(() => {
    if (!stats?.firstSessionDate) return null;
    return formatFirstSessionDate(stats.firstSessionDate);
  }, [stats]);

  // Encouraging message based on total time
  const encouragingMessage = useMemo(() => {
    if (!stats || stats.totalSeconds === 0) {
      return 'Start your first Particle!';
    }
    const hours = stats.totalSeconds / 3600;
    if (hours < 1) return 'Great start!';
    if (hours < 10) return 'Building momentum!';
    if (hours < 50) return 'Solid progress!';
    if (hours < 100) return 'Impressive dedication!';
    return 'Amazing commitment!';
  }, [stats]);

  if (!stats) return null;

  return (
    <motion.div
      className="bg-surface/50 light:bg-surface-dark/50 rounded-xl overflow-hidden"
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { delay: 0.05 }}
    >
      {/* Main display - clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-surface/80 light:hover:bg-surface-dark/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
        aria-expanded={isExpanded}
        aria-label={`Total focus time: ${formattedTotal}. ${isExpanded ? 'Collapse' : 'Expand'} for details`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-accent light:text-accent-dark" />
          </div>
          <div className="text-left">
            <div className="text-lg font-semibold text-primary light:text-primary-dark tabular-nums">
              {formattedTotal}
            </div>
            <div className="text-xs text-tertiary light:text-tertiary-dark">
              total focus time
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.snappy }}
        >
          <ChevronDown className="w-4 h-4 text-tertiary light:text-tertiary-dark" />
        </motion.div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={reducedMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-tertiary/10 light:border-tertiary-dark/10">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Particles collected */}
                <div className="flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5 text-tertiary light:text-tertiary-dark" />
                  <span className="text-sm text-secondary light:text-secondary-dark">
                    <span className="font-medium text-primary light:text-primary-dark">
                      {stats.totalSessions}
                    </span>
                    {' '}Particle{stats.totalSessions !== 1 ? 's' : ''} collected
                  </span>
                </div>

                {/* Average session */}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-tertiary light:text-tertiary-dark" />
                  <span className="text-sm text-secondary light:text-secondary-dark">
                    ~{formattedAverage} avg
                  </span>
                </div>
              </div>

              {/* First session date */}
              {formattedFirstDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-tertiary light:text-tertiary-dark" />
                  <span className="text-sm text-secondary light:text-secondary-dark">
                    Since {formattedFirstDate}
                  </span>
                </div>
              )}

              {/* Encouraging message */}
              <p className="text-xs text-center text-tertiary light:text-tertiary-dark pt-2 border-t border-tertiary/5 light:border-tertiary-dark/5">
                {encouragingMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
