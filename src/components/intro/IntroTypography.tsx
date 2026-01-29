'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { IntroPhase } from '@/hooks/useIntro';
import { usePrefersReducedMotion } from '@/hooks/useIntro';

// ============================================================================
// Types
// ============================================================================

interface IntroTypographyProps {
  /** Current phase of the intro */
  phase: IntroPhase;
}

// ============================================================================
// Component
// ============================================================================

export function IntroTypography({ phase }: IntroTypographyProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Visibility logic based on phase
  // Text 1 shows during truth1 and truth2
  const showText1 = ['truth1', 'truth2'].includes(phase);
  // Text 2 shows during truth2 (while particles divide)
  const showText2 = phase === 'truth2';
  // "Ready?" shows during invitation (while particles converge)
  const showInvitation = phase === 'invitation';

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
      {/* Text 1 - Above particle */}
      <AnimatePresence>
        {showText1 && (
          <motion.p
            key="text1"
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
            Great works are not born
            <br />
            from great moments.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Text 2 - Below particle */}
      <AnimatePresence>
        {showText2 && (
          <motion.p
            key="text2"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="absolute text-white text-center font-normal tracking-tight leading-relaxed
                       text-lg md:text-xl lg:text-2xl
                       px-6"
            style={{ top: 'calc(50% + 40px)' }}
          >
            They are born from many small ones.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Invitation - Below particle cloud */}
      <AnimatePresence>
        {showInvitation && (
          <motion.p
            key="invitation"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="absolute text-white text-center font-normal tracking-tight leading-relaxed
                       text-lg md:text-xl lg:text-2xl"
            style={{ top: 'calc(50% + 60px)' }}
          >
            Ready?
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
