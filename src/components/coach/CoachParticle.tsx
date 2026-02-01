'use client';

import { motion } from 'framer-motion';
import { useFeature } from '@/lib/tiers';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

interface CoachParticleProps {
  onOpenCoach: () => void;
  hasInsight?: boolean; // For future: pulse when insight waiting
}

/**
 * AI Coach Sparkle Button
 *
 * Appears next to the Library button for Flow users.
 * Breathing animation like MacBook sleep indicator when idle.
 * Pulse animation when an insight is waiting.
 */
export function CoachParticle({ onOpenCoach, hasInsight = false }: CoachParticleProps) {
  const hasAICoach = useFeature('aiCoach');

  // Not visible for non-Flow users
  if (!hasAICoach) return null;

  return (
    <motion.button
      onClick={onOpenCoach}
      className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center',
        'text-tertiary light:text-tertiary-dark',
        'hover:text-secondary light:hover:text-secondary-dark',
        'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
        'transition-colors duration-fast',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
      )}
      animate={
        hasInsight
          ? {
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.15, 1],
            }
          : undefined
      }
      transition={
        hasInsight
          ? {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : { type: 'spring', ...SPRING.default }
      }
      whileHover={{ scale: 1.05, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Open AI Coach"
      title="AI Coach · G C"
    >
      <SparkleIcon className="w-4 h-4" />
    </motion.button>
  );
}

/**
 * Custom Sparkle Icon
 * 8-point star pattern for AI/magic aesthetic
 */
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {/* Main cross */}
      <path
        d="M8 0v6M8 10v6M0 8h6M10 8h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Diagonal accents */}
      <path
        d="M2.5 2.5l3.5 3.5M10 10l3.5 3.5M13.5 2.5l-3.5 3.5M6 10l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
