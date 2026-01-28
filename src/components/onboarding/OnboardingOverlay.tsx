'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Timing constants (in ms)
const CONFIRMATION_DISPLAY_DURATION = 3500; // How long to show the confirmation message
const FADE_OUT_DURATION = 1200; // Duration of final overlay fade-out (magical slow fade)

// Content constants - All three rhythm presets with explanations
const RHYTHM_PRESETS = [
  {
    id: 'classic',
    presetId: 'classic',
    name: 'Classic',
    duration: '25 min',
    shortcut: '1',
    description: 'The original Pomodoro technique. Short, focused sprints with frequent breaks.',
    confirmation: 'Classic rhythm selected. Short sprints, frequent breaks.',
  },
  {
    id: 'deepWork',
    presetId: 'deepWork',
    name: 'Deep Work',
    duration: '52 min',
    shortcut: '2',
    description: 'Based on productivity research. Longer focus for complex, creative work.',
    confirmation: 'Deep Work rhythm selected. Longer focus, deeper immersion.',
  },
  {
    id: 'ultradian',
    presetId: 'ultradian',
    name: '90-Min',
    duration: '90 min',
    shortcut: '3',
    description: 'Full ultradian cycle. Matches your natural energy rhythm.',
    confirmation: '90-Min rhythm selected. Complete energy cycles.',
  },
];

const UNSURE_OPTION = {
  presetId: 'classic',
  confirmation: 'Starting with Classic. You can switch anytime with keys 1, 2, or 3.',
};

interface OnboardingOverlayProps {
  onComplete: (presetId: string) => void;
}

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [phase, setPhase] = useState<'question' | 'confirmation' | 'exiting'>('question');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const prefersReducedMotion = useReducedMotion();

  // Handle option selection
  const handleSelect = useCallback((presetId: string, confirmation: string) => {
    setSelectedPreset(presetId);
    setConfirmationMessage(confirmation);
    setPhase('confirmation');
  }, []);

  // Start exit sequence after confirmation is displayed
  useEffect(() => {
    if (phase === 'confirmation' && selectedPreset) {
      const timeout = setTimeout(() => {
        setPhase('exiting');
      }, CONFIRMATION_DISPLAY_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [phase, selectedPreset]);

  // Complete onboarding after exit animation
  useEffect(() => {
    if (phase === 'exiting' && selectedPreset) {
      const timeout = setTimeout(() => {
        onComplete(selectedPreset);
      }, FADE_OUT_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [phase, selectedPreset, onComplete]);

  // Block keyboard events from reaching the timer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Block timer shortcuts
      const blockedKeys = [' ', 'ArrowUp', 'ArrowDown', '1', '2', '3', '4', 's', 'r', 'S', 'R'];
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }

    // Use capture phase to intercept before timer handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Determine if we're showing content (not in exiting phase)
  const isExiting = phase === 'exiting';

  // Particle animation - gentle breathing
  const particleAnimation = prefersReducedMotion
    ? { opacity: 1 }
    : {
        scale: phase === 'question' ? [1, 1.15, 1] : 1,
        opacity: phase === 'question' ? [0.7, 1, 0.7] : 1,
      };

  const particleTransition = prefersReducedMotion
    ? { duration: 0 }
    : phase === 'question'
      ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }
      : { duration: 0.6, ease: 'easeOut' as const };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background light:bg-background-dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{
        duration: isExiting ? FADE_OUT_DURATION / 1000 : 0.5,
        ease: [0.4, 0, 0.2, 1], // Smooth ease for magical feel
      }}
    >
      {/*
        Layout: Particle and content are absolutely positioned independently.
        This prevents any layout shift when content changes height.

        Visual structure:
        - Particle: centered at 30% from top (above center for visual balance)
        - Content: centered at 50% from top (true center, extends downward)
      */}

      {/* Particle - absolutely positioned, never affected by content changes */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary light:bg-primary-dark"
        style={{ top: '30%' }}
        animate={particleAnimation}
        transition={particleTransition}
      />

      {/* Content area - absolutely positioned at vertical center */}
      <div
        className="absolute inset-x-0 flex justify-center px-4"
        style={{ top: '38%' }}
      >
        <AnimatePresence mode="wait">
          {phase === 'question' && (
            <motion.div
              key="question"
              className="flex flex-col items-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {/* Question */}
              <motion.h1
                className="text-xl font-medium text-primary light:text-primary-dark mb-3 text-center"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
              >
                Choose your rhythm
              </motion.h1>

              {/* Subtext */}
              <motion.p
                className="text-sm text-tertiary light:text-tertiary-dark mb-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
              >
                You can switch anytime with keys 1, 2, or 3
              </motion.p>

              {/* Three Rhythm Preset Cards */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 w-full max-w-2xl">
                {RHYTHM_PRESETS.map((preset, index) => (
                  <motion.button
                    key={preset.id}
                    onClick={() => handleSelect(preset.presetId, preset.confirmation)}
                    className="flex-1 py-5 px-5 rounded-xl border border-tertiary/10 light:border-tertiary-dark/10 bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 hover:border-tertiary/20 light:hover:border-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent light:focus-visible:ring-accent-dark text-left"
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                      delay: 0.5 + index * 0.1,
                    }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  >
                    {/* Header: Name + Duration */}
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-base font-medium text-primary light:text-primary-dark">
                        {preset.name}
                      </span>
                      <span className="text-sm font-medium text-secondary light:text-secondary-dark">
                        {preset.duration}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-tertiary light:text-tertiary-dark leading-relaxed">
                      {preset.description}
                    </p>
                  </motion.button>
                ))}
              </div>

              {/* Unsure Option */}
              <motion.button
                onClick={() => handleSelect(UNSURE_OPTION.presetId, UNSURE_OPTION.confirmation)}
                className="text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:underline transition-colors focus:outline-none focus-visible:underline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
              >
                I&apos;m not sure – start with Classic
              </motion.button>
            </motion.div>
          )}

          {phase === 'confirmation' && (
            <motion.div
              key="confirmation"
              className="fixed inset-0 flex items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
                delay: 0.2, // Small delay after question fades
              }}
            >
              <motion.p
                className="text-lg text-primary light:text-primary-dark leading-relaxed text-center max-w-md"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              >
                {confirmationMessage}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
