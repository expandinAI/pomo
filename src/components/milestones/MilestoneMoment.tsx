'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { type MilestoneDefinition } from '@/lib/milestones';
import { playMilestoneGong } from '@/lib/milestones/milestone-sound';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { MilestoneParticles } from './MilestoneParticles';

interface MilestoneMomentProps {
  /** The milestone to display */
  milestone: MilestoneDefinition | null;
  /** Whether the moment is visible */
  isOpen: boolean;
  /** Callback when the moment should be dismissed */
  onDismiss: () => void;
  /** Whether this is a "relive" moment (skips sound) */
  isRelive?: boolean;
}

/**
 * MilestoneMoment
 *
 * Full-screen overlay that celebrates reaching a milestone.
 * This is "The Moment" - a ceremonial acknowledgment of progress.
 *
 * Design principles:
 * - Full immersion (black background)
 * - Minimal text (name + reflection)
 * - Particle convergence animation
 * - Deep gong sound
 * - Dismissible with Enter or click
 */
export function MilestoneMoment({
  milestone,
  isOpen,
  onDismiss,
  isRelive = false,
}: MilestoneMomentProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { muted, volume } = useSoundSettings();

  // Focus trap for accessibility
  useFocusTrap(containerRef, isOpen);

  // Play gong sound when opening (unless muted or reliving)
  useEffect(() => {
    if (isOpen && milestone && !muted && !isRelive) {
      // Slight delay for dramatic effect
      const timer = setTimeout(() => {
        playMilestoneGong(volume);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, milestone, muted, volume, isRelive]);

  // Handle keyboard dismiss - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onDismiss();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onDismiss]);

  return (
    <AnimatePresence>
      {isOpen && milestone && (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="milestone-name"
          aria-describedby="milestone-reflection"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background light:bg-background-dark cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onDismiss}
          tabIndex={-1}
        >
          {/* Particle convergence animation */}
          <MilestoneParticles isActive={isOpen} />

          {/* Content - positioned below particle convergence point */}
          <motion.div
            className="relative z-10 text-center px-8 max-w-md mt-[15vh]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: 'spring',
              ...SPRING.gentle,
              delay: prefersReducedMotion ? 0 : 1.2, // After particles converge
            }}
          >
            {/* Milestone name */}
            <motion.h1
              id="milestone-name"
              className="text-3xl sm:text-4xl font-bold text-primary light:text-primary-dark mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : 1.4,
                duration: 0.5,
              }}
            >
              {milestone.name}
            </motion.h1>

            {/* Reflection text */}
            <motion.p
              id="milestone-reflection"
              className="text-lg text-secondary light:text-secondary-dark leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : 1.8,
                duration: 0.5,
              }}
            >
              {milestone.reflection}
            </motion.p>

            {/* Dismiss hint - poetic and minimal */}
            <motion.div
              className="mt-16 flex items-center justify-center gap-2 text-sm text-tertiary/80 light:text-tertiary-dark/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: prefersReducedMotion ? 0 : 3,
                duration: 0.8,
              }}
            >
              <span>Take a breath</span>
              <span className="text-tertiary/50 light:text-tertiary-dark/50">·</span>
              <span>then press Enter</span>
            </motion.div>
          </motion.div>

          {/* Subtle vignette overlay for depth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
