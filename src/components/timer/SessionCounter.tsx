'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';

interface SessionCounterProps {
  count: number;
  sessionsUntilLong: number;
  onNextSlotPosition?: (position: { x: number; y: number } | null) => void;
  showGlow?: boolean;
  refreshPositionTrigger?: number;  // Increment to force position recalculation
}

export function SessionCounter({ count, sessionsUntilLong, onNextSlotPosition, showGlow = false, refreshPositionTrigger = 0 }: SessionCounterProps) {
  // Show up to sessionsUntilLong indicators, then reset
  const displayCount = count % sessionsUntilLong;

  // Refs for slot elements to calculate position
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Get center position of the next empty slot
  const getNextSlotPosition = useCallback((): { x: number; y: number } | null => {
    const nextSlotIndex = displayCount; // The next slot to be filled
    if (nextSlotIndex >= sessionsUntilLong) return null;

    const slotElement = slotRefs.current[nextSlotIndex];
    if (!slotElement) return null;

    const rect = slotElement.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, [displayCount, sessionsUntilLong]);

  // Report position when count changes, on mount, or when refresh is triggered
  useEffect(() => {
    if (onNextSlotPosition) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        const position = getNextSlotPosition();
        onNextSlotPosition(position);
      });
    }
  }, [count, refreshPositionTrigger, onNextSlotPosition, getNextSlotPosition]);

  // Update position on resize
  useEffect(() => {
    if (!onNextSlotPosition) return;

    const handleResize = () => {
      requestAnimationFrame(() => {
        const position = getNextSlotPosition();
        onNextSlotPosition(position);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onNextSlotPosition, getNextSlotPosition]);

  return (
    <div className="flex items-center gap-3">
      {/* Particle indicators */}
      {Array.from({ length: sessionsUntilLong }).map((_, index) => {
        const isCompleted = index < displayCount;
        const isNextSlot = index === displayCount;
        const shouldGlow = showGlow && isNextSlot;

        return (
          <motion.div
            key={index}
            ref={(el) => { slotRefs.current[index] = el; }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', ...SPRING.gentle, delay: index * 0.05 }}
            className={shouldGlow ? 'animate-slot-glow rounded-full' : ''}
          >
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="completed"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', ...SPRING.bouncy }}
                  className="relative w-5 h-5 rounded-full bg-primary light:bg-primary-dark flex items-center justify-center"
                >
                  {/* Checkmark as negative (background color) */}
                  <Check className="w-3 h-3 text-background light:text-background-dark" strokeWidth={3} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="w-5 h-5 rounded-full border border-tertiary/50 light:border-tertiary-dark/50"
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
