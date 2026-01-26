'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Search, X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  SHORTCUTS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  searchShortcuts,
  type ShortcutCategory,
} from '@/lib/shortcuts';
import { formatShortcut } from '@/lib/platform';

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Focus management
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useFocusTrap(popoverRef, isOpen, { initialFocusRef: searchInputRef });

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Clear search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter shortcuts based on search
  const filteredShortcuts = useMemo(() => {
    return searchShortcuts(searchQuery);
  }, [searchQuery]);

  // Group filtered shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const grouped = new Map<ShortcutCategory, typeof filteredShortcuts>();

    for (const category of CATEGORY_ORDER) {
      const categoryShortcuts = filteredShortcuts.filter((s) => s.category === category);
      if (categoryShortcuts.length > 0) {
        grouped.set(category, categoryShortcuts);
      }
    }

    return grouped;
  }, [filteredShortcuts]);

  // Listen for ? key to toggle (always active)
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

  // Close on Escape - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
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
              animate={{ opacity: 1, pointerEvents: 'auto' as const }}
              exit={{ opacity: 0, pointerEvents: 'none' as const }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-black/10 light:bg-black/20"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="absolute bottom-full left-0 mb-2 z-50 w-[300px]"
            >
              <div
                ref={popoverRef}
                role="dialog"
                aria-modal="true"
                aria-label="Keyboard shortcuts"
                className="bg-surface light:bg-surface-dark rounded-xl shadow-lg border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
              >
                {/* Header */}
                <div className="p-3 border-b border-tertiary/10 light:border-tertiary-dark/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-primary light:text-primary-dark">
                      Keyboard Shortcuts
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary light:text-tertiary-dark pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search shortcuts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-background light:bg-background-dark rounded-lg border border-tertiary/20 light:border-tertiary-dark/20 text-primary light:text-primary-dark placeholder:text-tertiary light:placeholder:text-tertiary-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  </div>
                </div>

                {/* Shortcuts list */}
                <div className="max-h-[50vh] overflow-y-auto p-3">
                  {groupedShortcuts.size === 0 ? (
                    <p className="text-sm text-tertiary light:text-tertiary-dark text-center py-4">
                      No shortcuts found
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {Array.from(groupedShortcuts.entries()).map(([category, shortcuts]) => (
                        <div key={category}>
                          <h4 className="text-xs font-medium text-tertiary light:text-tertiary-dark uppercase tracking-wider mb-2">
                            {CATEGORY_LABELS[category]}
                          </h4>
                          <ul className="space-y-1.5">
                            {shortcuts.map(({ key, description }) => (
                              <li
                                key={key}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <span className="text-secondary light:text-secondary-dark truncate">
                                  {description}
                                </span>
                                <kbd className="flex-shrink-0 px-1.5 py-0.5 text-xs font-mono bg-background light:bg-background-dark rounded border border-tertiary/20 light:border-tertiary-dark/20 text-tertiary light:text-tertiary-dark whitespace-nowrap">
                                  {formatShortcut(key)}
                                </kbd>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-3 pb-3 pt-1">
                  <p className="text-[10px] text-tertiary light:text-tertiary-dark text-center">
                    Press <kbd className="px-1 py-0.5 rounded bg-background light:bg-background-dark border border-tertiary/20 light:border-tertiary-dark/20">?</kbd> to toggle
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
