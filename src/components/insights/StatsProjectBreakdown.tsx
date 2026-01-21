'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';
import type { ProjectBreakdown } from '@/lib/projects';

interface StatsProjectBreakdownProps {
  /** Project breakdown data */
  breakdown: ProjectBreakdown[];
  /** Called when a project is clicked */
  onProjectClick?: (projectId: string | null) => void;
  /** Maximum projects to show (default: 10) */
  maxItems?: number;
}

/**
 * Format duration in seconds to a readable string
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Project breakdown for Statistics Dashboard
 *
 * Shows distribution of particles across projects with
 * horizontal bars representing percentages.
 */
export function StatsProjectBreakdown({
  breakdown,
  onProjectClick,
  maxItems = 10,
}: StatsProjectBreakdownProps) {
  const reducedMotion = prefersReducedMotion();

  // Limit items and check if there are more
  const visibleItems = breakdown.slice(0, maxItems);
  const hasMore = breakdown.length > maxItems;
  const hiddenCount = breakdown.length - maxItems;

  // Empty state
  if (breakdown.length === 0) {
    return (
      <motion.div
        initial={reducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.2 }}
        className="py-6"
      >
        <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-3">
          By Project
        </h3>
        <p className="text-sm text-tertiary light:text-tertiary-dark text-center py-4">
          No focus sessions in this period
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { delay: 0.2 }}
      className="py-4"
    >
      <h3 className="text-sm font-medium text-secondary light:text-secondary-dark mb-4">
        By Project
      </h3>

      <div className="space-y-4">
        {visibleItems.map((item, index) => {
          const isNoProject = item.projectId === null;

          return (
            <motion.div
              key={item.projectId ?? 'no-project'}
              initial={reducedMotion ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { delay: 0.25 + index * 0.05, ...SPRING.gentle }
              }
            >
              {/* Separator before "No Project" */}
              {isNoProject && index > 0 && (
                <div className="border-t border-tertiary/10 light:border-tertiary-dark/10 mb-4" />
              )}

              <button
                onClick={() => onProjectClick?.(item.projectId)}
                disabled={!onProjectClick}
                className={`w-full text-left group ${
                  onProjectClick
                    ? 'cursor-pointer hover:bg-tertiary/5 light:hover:bg-tertiary-dark/5 -mx-2 px-2 py-1.5 rounded-lg transition-colors'
                    : ''
                }`}
              >
                {/* Project name and stats */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {/* Brightness indicator dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isNoProject
                          ? 'transparent'
                          : `rgba(255, 255, 255, ${item.brightness})`,
                        border: isNoProject
                          ? '1px solid rgba(255, 255, 255, 0.3)'
                          : 'none',
                      }}
                    />
                    <span
                      className={`text-sm ${
                        isNoProject
                          ? 'text-tertiary light:text-tertiary-dark italic'
                          : 'text-primary light:text-primary-dark'
                      }`}
                    >
                      {item.projectName}
                    </span>
                  </div>

                  <span className="text-xs text-secondary light:text-secondary-dark tabular-nums">
                    {item.particleCount} Particle{item.particleCount !== 1 ? 's' : ''}{' '}
                    <span className="text-tertiary light:text-tertiary-dark">
                      ({Math.round(item.percentage)}%)
                    </span>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-tertiary/10 light:bg-tertiary-dark/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: isNoProject
                        ? 'rgba(255, 255, 255, 0.2)'
                        : `rgba(255, 255, 255, ${Math.max(item.brightness * 0.6, 0.3)})`,
                    }}
                    initial={reducedMotion ? { width: `${item.percentage}%` } : { width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { delay: 0.3 + index * 0.05, duration: 0.5, ease: 'easeOut' }
                    }
                  />
                </div>

                {/* Duration (subtle) */}
                <div className="mt-1 text-xs text-tertiary light:text-tertiary-dark">
                  {formatDuration(item.totalDuration)}
                </div>
              </button>
            </motion.div>
          );
        })}

        {/* Show more indicator */}
        {hasMore && (
          <div className="text-center pt-2">
            <span className="text-xs text-tertiary light:text-tertiary-dark">
              +{hiddenCount} more project{hiddenCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
