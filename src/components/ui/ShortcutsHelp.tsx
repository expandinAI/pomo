'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';

interface ShortcutGroup {
  title: string;
  shortcuts: { key: string; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Timer',
    shortcuts: [
      { key: 'Space', description: 'Start / Pause' },
      { key: 'R', description: 'Reset' },
      { key: 'S', description: 'Skip session' },
      { key: '↑ / ↓', description: '+/- 1 min (paused)' },
    ],
  },
  {
    title: 'Sessions',
    shortcuts: [
      { key: '1', description: 'Focus mode' },
      { key: '2', description: 'Short break' },
      { key: '3', description: 'Long break' },
    ],
  },
  {
    title: 'Sound',
    shortcuts: [
      { key: 'M', description: 'Mute / Unmute' },
      { key: 'A', description: 'Cycle ambient' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { key: 'D', description: 'Dark / Light mode' },
      { key: '⌘ ,', description: 'Open settings' },
      { key: 'Esc', description: 'Close modal' },
      { key: '?', description: 'This help' },
    ],
  },
];

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
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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
              className="absolute bottom-full left-0 mb-2 z-50 min-w-[220px]"
            >
              <div className="bg-surface light:bg-surface-dark rounded-xl shadow-lg border border-tertiary/10 light:border-tertiary-dark/10 p-4">
                <h3 className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider mb-3">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-3">
                  {SHORTCUT_GROUPS.map((group) => (
                    <div key={group.title}>
                      <h4 className="text-xs font-medium text-tertiary/70 light:text-tertiary-dark/70 mb-1.5">
                        {group.title}
                      </h4>
                      <ul className="space-y-1">
                        {group.shortcuts.map(({ key, description }) => (
                          <li key={key} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-secondary light:text-secondary-dark">
                              {description}
                            </span>
                            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-background light:bg-background-dark rounded border border-tertiary/20 light:border-tertiary-dark/20 text-tertiary light:text-tertiary-dark whitespace-nowrap">
                              {key}
                            </kbd>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
