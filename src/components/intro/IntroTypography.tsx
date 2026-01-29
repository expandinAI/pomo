'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { IntroPhase } from '@/hooks/useIntro';
import { usePrefersReducedMotion } from '@/hooks/useIntro';
import type { DailyIntention } from '@/lib/content/daily-intentions';

// ============================================================================
// Types
// ============================================================================

interface IntroTypographyProps {
  /** Current phase of the intro */
  phase: IntroPhase;
  /** The intention/text to display */
  intention: DailyIntention;
}

// ============================================================================
// Component
// ============================================================================

export function IntroTypography({ phase, intention }: IntroTypographyProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Visibility logic based on phase
  // Main text shows during truth1
  const showMainText = phase === 'truth1';
  // truth2 = visual pause (particle breathes)
  // Subtext shows during invitation
  const showSubtext = phase === 'invitation';

  // Animation variants
  const textVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 10,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -5,
    },
  };

  const transition = {
    duration: 1.2,
    ease: [0.33, 1, 0.68, 1], // easeOutCubic
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* Main text - Above particle */}
      <AnimatePresence>
        {showMainText && (
          <motion.p
            key="main-text"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="absolute text-white text-center font-normal tracking-tight leading-relaxed
                       text-lg md:text-xl lg:text-2xl
                       px-6"
            style={{ bottom: 'calc(50% + 40px)' }}
          >
            {intention.text}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Subtext - Below particle (only if intention has subtext) */}
      <AnimatePresence>
        {showSubtext && (
          <motion.p
            key="subtext"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="absolute text-white text-center font-normal tracking-tight leading-relaxed
                       text-lg md:text-xl lg:text-2xl"
            style={{ top: 'calc(50% + 50px)' }}
          >
            {intention.subtext}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
