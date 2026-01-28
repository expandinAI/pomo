'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ============================================================================
// ONBOARDING OVERLAY - Reusable Pattern
// ============================================================================
//
// This component provides a consistent onboarding experience across Particle.
// Use it for:
// - First-run feature introductions
// - Setting initial preferences
// - Explaining new features
//
// Key principles:
// 1. Full-screen takeover with Particle at 30% from top
// 2. Three phases: question → confirmation → exiting
// 3. Magical animations with reduced-motion support
// 4. Keyboard isolation (blocks timer shortcuts)
//
// See CLAUDE.md "Onboarding Pattern" section for documentation.
// ============================================================================

// Timing constants (in ms) - exported for consistency across implementations
export const ONBOARDING_TIMING = {
  /** How long to show the confirmation message before fade-out */
  CONFIRMATION_DISPLAY_DURATION: 3500,
  /** Duration of final overlay fade-out (magical slow fade) */
  FADE_OUT_DURATION: 1200,
  /** Delay before confirmation text appears after question fades */
  CONFIRMATION_DELAY: 0.2,
  /** Stagger delay between option cards */
  CARD_STAGGER_DELAY: 0.1,
} as const;

// Animation presets - exported for custom implementations
export const ONBOARDING_ANIMATIONS = {
  /** Spring animation for option cards */
  cardSpring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
  },
  /** Smooth ease for overlay fade */
  overlayEase: [0.4, 0, 0.2, 1] as const,
} as const;

/** Single option in the onboarding selection */
export interface OnboardingOption {
  /** Unique identifier returned on selection */
  id: string;
  /** Primary label (e.g., "Classic", "Deep Work") */
  label: string;
  /** Secondary label (e.g., "25 min", "52 min") */
  sublabel?: string;
  /** Description text explaining this option */
  description: string;
  /** Confirmation message shown after selection */
  confirmation: string;
}

/** Fallback option shown below main options (e.g., "I'm not sure") */
export interface OnboardingFallback {
  /** Text for the fallback button */
  label: string;
  /** ID to return (can reference an existing option's ID) */
  resultId: string;
  /** Confirmation message for this choice */
  confirmation: string;
}

export interface OnboardingOverlayProps {
  /** The question/title shown to the user */
  title: string;
  /** Optional subtitle/helper text below the title */
  subtitle?: string;
  /** Array of options to choose from (renders as cards) */
  options: OnboardingOption[];
  /** Optional fallback option (renders as text link below cards) */
  fallback?: OnboardingFallback;
  /** Called when user completes the onboarding with selected option ID */
  onComplete: (selectedId: string) => void;
  /** Keys to block from reaching other handlers (default: timer shortcuts) */
  blockedKeys?: string[];
  /** Optional custom content to render instead of default cards */
  renderOptions?: (props: {
    options: OnboardingOption[];
    onSelect: (id: string, confirmation: string) => void;
    prefersReducedMotion: boolean | null;
  }) => ReactNode;
}

/**
 * OnboardingOverlay - Reusable full-screen onboarding component
 *
 * Provides a consistent, animated onboarding experience with:
 * - Breathing Particle animation
 * - Question phase with option cards
 * - Confirmation phase with selected message
 * - Magical fade-out transition
 *
 * @example
 * ```tsx
 * <OnboardingOverlay
 *   title="Choose your rhythm"
 *   subtitle="You can change this anytime"
 *   options={[
 *     { id: 'classic', label: 'Classic', sublabel: '25 min', description: '...', confirmation: '...' },
 *     { id: 'deep', label: 'Deep Work', sublabel: '52 min', description: '...', confirmation: '...' },
 *   ]}
 *   fallback={{ label: "I'm not sure", resultId: 'classic', confirmation: '...' }}
 *   onComplete={(id) => applyPreset(id)}
 * />
 * ```
 */
export function OnboardingOverlay({
  title,
  subtitle,
  options,
  fallback,
  onComplete,
  blockedKeys = [' ', 'ArrowUp', 'ArrowDown', '1', '2', '3', '4', 's', 'r', 'S', 'R'],
  renderOptions,
}: OnboardingOverlayProps) {
  const [phase, setPhase] = useState<'question' | 'confirmation' | 'exiting'>('question');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const prefersReducedMotion = useReducedMotion();

  // Handle option selection
  const handleSelect = useCallback((id: string, confirmation: string) => {
    setSelectedId(id);
    setConfirmationMessage(confirmation);
    setPhase('confirmation');
  }, []);

  // Start exit sequence after confirmation is displayed
  useEffect(() => {
    if (phase === 'confirmation' && selectedId) {
      const timeout = setTimeout(() => {
        setPhase('exiting');
      }, ONBOARDING_TIMING.CONFIRMATION_DISPLAY_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [phase, selectedId]);

  // Complete onboarding after exit animation
  useEffect(() => {
    if (phase === 'exiting' && selectedId) {
      const timeout = setTimeout(() => {
        onComplete(selectedId);
      }, ONBOARDING_TIMING.FADE_OUT_DURATION);
      return () => clearTimeout(timeout);
    }
  }, [phase, selectedId, onComplete]);

  // Block keyboard events from reaching other handlers
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }

    // Use capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [blockedKeys]);

  const isExiting = phase === 'exiting';

  // Particle animation - gentle breathing in question phase, calm in confirmation
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
        duration: isExiting ? ONBOARDING_TIMING.FADE_OUT_DURATION / 1000 : 0.5,
        ease: ONBOARDING_ANIMATIONS.overlayEase,
      }}
    >
      {/*
        Layout: Particle and content are absolutely positioned independently.
        This prevents any layout shift when content changes height.

        Visual structure:
        - Particle: centered at 30% from top (above center for visual balance)
        - Content: centered at 38% from top (question phase)
        - Confirmation: true center (50%)
      */}

      {/* Particle - absolutely positioned, never affected by content changes */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary light:bg-primary-dark"
        style={{ top: '30%' }}
        animate={particleAnimation}
        transition={particleTransition}
      />

      {/* Content area - absolutely positioned */}
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
              {/* Title */}
              <motion.h1
                className="text-xl font-medium text-primary light:text-primary-dark mb-3 text-center"
                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
              >
                {title}
              </motion.h1>

              {/* Subtitle */}
              {subtitle && (
                <motion.p
                  className="text-sm text-tertiary light:text-tertiary-dark mb-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
                >
                  {subtitle}
                </motion.p>
              )}

              {/* Options - either custom render or default cards */}
              {renderOptions ? (
                renderOptions({ options, onSelect: handleSelect, prefersReducedMotion })
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 w-full max-w-2xl">
                  {options.map((option, index) => (
                    <motion.button
                      key={option.id}
                      onClick={() => handleSelect(option.id, option.confirmation)}
                      className="flex-1 py-5 px-5 rounded-xl border border-tertiary/10 light:border-tertiary-dark/10 bg-tertiary/5 light:bg-tertiary-dark/5 hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 hover:border-tertiary/20 light:hover:border-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent light:focus-visible:ring-accent-dark text-left"
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        ...ONBOARDING_ANIMATIONS.cardSpring,
                        delay: 0.5 + index * ONBOARDING_TIMING.CARD_STAGGER_DELAY,
                      }}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                    >
                      {/* Header: Label + Sublabel */}
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-base font-medium text-primary light:text-primary-dark">
                          {option.label}
                        </span>
                        {option.sublabel && (
                          <span className="text-sm font-medium text-secondary light:text-secondary-dark">
                            {option.sublabel}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-tertiary light:text-tertiary-dark leading-relaxed">
                        {option.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Fallback Option */}
              {fallback && (
                <motion.button
                  onClick={() => handleSelect(fallback.resultId, fallback.confirmation)}
                  className="text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:underline transition-colors focus:outline-none focus-visible:underline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5, ease: 'easeOut' }}
                >
                  {fallback.label}
                </motion.button>
              )}
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
                delay: ONBOARDING_TIMING.CONFIRMATION_DELAY,
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
