'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';

const SHORTCUTS = [
  { key: 'Space', description: 'Start / Pause' },
  { key: 'R', description: 'Reset' },
  { key: 'S', description: 'Skip' },
  { key: 'D', description: 'Dark mode' },
  { key: '?', description: 'Shortcuts' },
] as const;

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Listen for ? key to toggle
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        toggleOpen();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <motion.button
        onClick={toggleOpen}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-tertiary dark:text-tertiary-dark hover:text-secondary dark:hover:text-secondary-dark hover:bg-tertiary/10 dark:hover:bg-tertiary-dark/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label="Show keyboard shortcuts"
        aria-expanded={isOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <Keyboard className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Popover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 min-w-[160px]"
            >
              <div className="bg-surface dark:bg-surface-dark rounded-xl shadow-lg border border-tertiary/10 dark:border-tertiary-dark/10 p-3">
                <h3 className="text-xs font-medium text-tertiary dark:text-tertiary-dark uppercase tracking-wider mb-2">
                  Shortcuts
                </h3>
                <ul className="space-y-1.5">
                  {SHORTCUTS.map(({ key, description }) => (
                    <li key={key} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-secondary dark:text-secondary-dark">
                        {description}
                      </span>
                      <kbd className="px-1.5 py-0.5 text-xs font-mono bg-background dark:bg-background-dark rounded border border-tertiary/20 dark:border-tertiary-dark/20 text-tertiary dark:text-tertiary-dark">
                        {key}
                      </kbd>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
