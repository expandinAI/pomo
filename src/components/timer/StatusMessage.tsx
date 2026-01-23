'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';

interface StatusMessageProps {
  message: string | null;
  subtle?: boolean;
}

/**
 * Fixed-position status message slot at the bottom of the screen.
 * Displays transient messages like "Well done!" or "Skipped to Focus".
 *
 * Design principles:
 * - No layout shifts (fixed positioning)
 * - Smooth fade in/out animations
 * - Centered between content and screen edge
 * - Future-ready for quotes, motivation, etc.
 */
export function StatusMessage({ message, subtle = false }: StatusMessageProps) {
  return (
    <div
      className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none z-40"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: subtle ? 0.5 : 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{
              type: 'spring',
              ...SPRING.gentle,
              opacity: { duration: 0.25 }
            }}
            className={
              subtle
                ? "text-sm text-tertiary light:text-tertiary-dark"
                : "text-sm text-secondary light:text-secondary-dark"
            }
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
