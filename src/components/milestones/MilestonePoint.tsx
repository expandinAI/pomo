'use client';

import { motion } from 'framer-motion';
import { type MilestoneDefinition, type EarnedMilestone, formatEarnedDate } from '@/lib/milestones';

interface MilestonePointProps {
  /** The milestone definition */
  milestone: MilestoneDefinition;
  /** The earned milestone data (null if not yet earned) */
  earned: EarnedMilestone | null;
  /** Whether this milestone is currently focused/selected */
  isFocused: boolean;
  /** Whether this is the last milestone in the list */
  isLast: boolean;
  /** Callback when clicked to relive */
  onRelive: () => void;
  /** Index for animation stagger */
  index: number;
}

/**
 * MilestonePoint
 *
 * A single milestone in the journey timeline.
 * The sacred shrine where users reflect on their progress.
 *
 * Design principles:
 * - Full-bleed selection for visual satisfaction
 * - Timeline dot anchored to the left
 * - Generous spacing for readability
 * - Subtle but clear earned/unearned distinction
 */
export function MilestonePoint({
  milestone,
  earned,
  isFocused,
  isLast,
  onRelive,
  index,
}: MilestonePointProps) {
  const isEarned = earned !== null;

  return (
    <motion.button
      onClick={isEarned ? onRelive : undefined}
      disabled={!isEarned}
      className={`
        group relative flex w-full text-left
        transition-colors duration-150 focus:outline-none
        ${isEarned
          ? 'cursor-pointer'
          : 'cursor-default'
        }
      `}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      aria-label={
        isEarned
          ? `${milestone.name} - earned ${formatEarnedDate(earned.earnedAt)}. Press Enter to relive.`
          : `${milestone.name} - not yet earned`
      }
    >
      {/* Selection background - subtle, no ring */}
      <div
        className={`
          absolute inset-x-2 inset-y-0 rounded-xl transition-all duration-150 pointer-events-none
          ${isFocused && isEarned
            ? 'bg-tertiary/10 light:bg-tertiary-dark/10'
            : isEarned
              ? 'group-hover:bg-tertiary/5 light:group-hover:bg-tertiary-dark/5'
              : ''
          }
        `}
      />

      {/* Timeline structure */}
      <div className="relative flex items-stretch py-4 px-5 w-full">
        {/* Timeline column - dot and line */}
        <div className="relative flex flex-col items-center mr-5 w-3">
          {/* Dot - vertically centered with first line of text */}
          <div className="relative mt-1.5">
            <div
              className={`
                w-3 h-3 rounded-full transition-all duration-150
                ${isEarned
                  ? 'bg-primary light:bg-primary-dark'
                  : 'bg-transparent border-2 border-tertiary/30 light:border-tertiary-dark/30'
                }
                ${isFocused && isEarned
                  ? 'ring-4 ring-primary/20 light:ring-primary-dark/20'
                  : ''
                }
              `}
            />
            {/* Subtle glow for earned milestones */}
            {isEarned && (
              <div className="absolute inset-0 rounded-full bg-primary/20 light:bg-primary-dark/20 blur-sm -z-10" />
            )}
          </div>

          {/* Connecting line */}
          {!isLast && (
            <div
              className={`
                w-px flex-1 mt-3
                ${isEarned
                  ? 'bg-gradient-to-b from-tertiary/40 to-tertiary/10 light:from-tertiary-dark/40 light:to-tertiary-dark/10'
                  : 'bg-tertiary/15 light:bg-tertiary-dark/15'
                }
              `}
            />
          )}
        </div>

        {/* Content column */}
        <div className={`flex-1 min-w-0 ${!isLast ? 'pb-2' : ''}`}>
          {/* Header: Name and date */}
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <h3
              className={`
                font-semibold text-[15px] leading-tight
                ${isEarned
                  ? 'text-primary light:text-primary-dark'
                  : 'text-tertiary/50 light:text-tertiary-dark/50'
                }
              `}
            >
              {milestone.name}
            </h3>
            {isEarned && (
              <span className="text-xs text-tertiary/70 light:text-tertiary-dark/70 whitespace-nowrap tabular-nums">
                {formatEarnedDate(earned.earnedAt)}
              </span>
            )}
          </div>

          {/* Reflection text - only shown for earned milestones */}
          {isEarned && (
            <p className="text-sm leading-relaxed text-secondary/90 light:text-secondary-dark/90">
              {milestone.reflection}
            </p>
          )}
        </div>
      </div>

    </motion.button>
  );
}
