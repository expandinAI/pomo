'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeature } from '@/lib/tiers';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

interface CoachParticleProps {
  onOpenCoach: () => void;
  hasInsight?: boolean;
}

/** Duration of the aurora entrance effect in ms */
const AURORA_DURATION = 5000;

/**
 * AI Coach Sparkle Button
 *
 * Appears next to the Library button for Flow users.
 * When a new insight arrives: soft aurora glow effect.
 * After that: gentle breathing pulse on the sparkle.
 */
export function CoachParticle({ onOpenCoach, hasInsight = false }: CoachParticleProps) {
  const hasAICoach = useFeature('aiCoach');

  // Track if insight just arrived (for aurora effect)
  const [showAurora, setShowAurora] = useState(false);

  // When hasInsight becomes true, trigger aurora
  useEffect(() => {
    if (hasInsight) {
      setShowAurora(true);
      const timer = setTimeout(() => {
        setShowAurora(false);
      }, AURORA_DURATION);
      return () => clearTimeout(timer);
    } else {
      setShowAurora(false);
    }
  }, [hasInsight]);

  if (!hasAICoach) return null;

  const isPulsing = hasInsight && !showAurora;

  return (
    <motion.button
      onClick={onOpenCoach}
      className={cn(
        'relative w-9 h-9 rounded-full flex items-center justify-center',
        'text-tertiary light:text-tertiary-dark',
        'hover:text-secondary light:hover:text-secondary-dark',
        'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
        'transition-colors duration-fast',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', ...SPRING.default }}
      aria-label={hasInsight ? 'New insight available - Open AI Coach' : 'Open AI Coach'}
      title="AI Coach · G C"
    >
      {/* Aurora effect - soft magical glow when insight arrives */}
      <AnimatePresence mode="wait">
        {showAurora && (
          <>
            {/* Wide aurora sweep - slow, ethereal */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/15 light:bg-primary-dark/15"
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 2.8, 2.2],
                opacity: [0, 0.5, 0],
              }}
              exit={{ opacity: 0, scale: 2.5, transition: { duration: 1.5, ease: 'easeOut' } }}
              transition={{
                duration: 5,
                ease: [0.4, 0, 0.2, 1], // Custom bezier for smooth flow
              }}
              style={{ filter: 'blur(16px)' }}
            />

            {/* Inner glow - gentle pulse */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 light:bg-primary-dark/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.8, 1.4],
                opacity: [0, 0.6, 0],
              }}
              exit={{ opacity: 0, scale: 1.6, transition: { duration: 1.2, ease: 'easeOut' } }}
              transition={{
                duration: 4.5,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.5,
              }}
              style={{ filter: 'blur(10px)' }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Gentle breathing glow - after aurora */}
      {isPulsing && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 light:bg-primary-dark/20 blur-xl"
          initial={{ opacity: 0 }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* The sparkle icon with breathing animation */}
      <motion.div
        animate={
          isPulsing
            ? {
                scale: [1, 1.08, 1],
              }
            : showAurora
            ? {
                scale: [1, 1.12, 1],
              }
            : undefined
        }
        transition={{
          duration: isPulsing ? 4 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <SparkleIcon isPulsing={isPulsing} isAurora={showAurora} />
      </motion.div>
    </motion.button>
  );
}

/**
 * Custom Sparkle Icon with alternating pulse animation
 */
function SparkleIcon({ isPulsing, isAurora }: { isPulsing: boolean; isAurora: boolean }) {
  return (
    <svg
      className="w-4 h-4"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {/* Main cross - primary rays */}
      <motion.path
        d="M8 0v6M8 10v6M0 8h6M10 8h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={isPulsing || isAurora ? { color: 'var(--color-primary)' } : undefined}
        animate={
          isPulsing
            ? { opacity: [0.7, 1, 0.7] }
            : isAurora
            ? { opacity: [0.7, 1, 0.7] }
            : undefined
        }
        transition={
          isPulsing
            ? {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : isAurora
            ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
      />

      {/* Diagonal accents - secondary rays (offset timing) */}
      <motion.path
        d="M2.5 2.5l3.5 3.5M10 10l3.5 3.5M13.5 2.5l-3.5 3.5M6 10l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        style={isPulsing || isAurora ? { color: 'var(--color-primary)' } : undefined}
        animate={
          isPulsing
            ? { opacity: [0.5, 1, 0.5] }
            : isAurora
            ? { opacity: [0.5, 0.9, 0.5] }
            : { opacity: 0.5 }
        }
        transition={
          isPulsing
            ? {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }
            : isAurora
            ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
      />
    </svg>
  );
}
