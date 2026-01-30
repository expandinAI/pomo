'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3X3, X, Star, Sparkles } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { buildHeatmap, type HeatmapData } from '@/lib/session-analytics';
import { HeatmapGrid } from './HeatmapGrid';
import { prefersReducedMotion } from '@/lib/utils';
import { useFeature, UpgradePrompt } from '@/lib/tiers';

interface FocusHeatmapProps {
  refreshTrigger?: number;
}

/**
 * Focus Heatmap Modal - Shows productivity patterns over time
 * GitHub-style visualization of when user is most productive
 */
export function FocusHeatmap({ refreshTrigger }: FocusHeatmapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<HeatmapData | null>(null);

  const reducedMotion = prefersReducedMotion();
  const hasAdvancedStats = useFeature('advancedStats');

  // Focus management
  const modalRef = useRef<HTMLDivElement>(null);
  // Focus the modal container itself to avoid visible ring on close button
  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Load heatmap data when modal opens or refresh triggers
  useEffect(() => {
    if (isOpen) {
      setData(buildHeatmap(30));
    }
  }, [isOpen, refreshTrigger]);

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
      {/* Trigger Button */}
      <motion.button
        onClick={toggleOpen}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        aria-label="Focus pattern heatmap"
        aria-expanded={isOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <Grid3X3 className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Modal Backdrop + Container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: 'auto' as const }}
              exit={{ opacity: 0, pointerEvents: 'none' as const }}
              transition={{ duration: reducedMotion ? 0 : 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
              onClick={() => setIsOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="heatmap-title"
            >
              {/* Modal Content */}
              <motion.div
                initial={reducedMotion ? { opacity: 1 } : { scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { scale: 0.95, y: 20 }}
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
                className="w-[90vw] max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <div
                  ref={modalRef}
                  tabIndex={-1}
                  className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden focus:outline-none"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                    <h2
                      id="heatmap-title"
                      className="text-base font-semibold text-primary light:text-primary-dark"
                    >
                      Your Focus Pattern
                    </h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Close heatmap"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 pt-5">
                    {!hasAdvancedStats ? (
                      /* Upgrade Prompt */
                      <UpgradePrompt feature="advancedStats" />
                    ) : data?.isEmpty ? (
                      /* Empty State */
                      <motion.div
                        initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={reducedMotion ? { duration: 0 } : { delay: 0.1 }}
                        className="text-center py-8"
                      >
                        <Grid3X3 className="w-12 h-12 mx-auto text-tertiary/40 light:text-tertiary-dark/40 mb-4" />
                        <p className="text-secondary light:text-secondary-dark font-medium">
                          No focus patterns yet
                        </p>
                        <p className="text-sm text-tertiary light:text-tertiary-dark mt-2">
                          Complete sessions to discover your peak focus times
                        </p>
                      </motion.div>
                    ) : data ? (
                      /* Heatmap Display */
                      <>
                        {/* Grid */}
                        <motion.div
                          initial={reducedMotion ? {} : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={reducedMotion ? { duration: 0 } : { delay: 0.1 }}
                          className="mb-4"
                        >
                          <HeatmapGrid data={data} />
                        </motion.div>

                        {/* Peak Info */}
                        {data.peakLabel && (
                          <motion.div
                            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={reducedMotion ? { duration: 0 } : { delay: 0.3 }}
                            className="flex items-center justify-center gap-2 text-sm mb-4"
                          >
                            <Star className="w-4 h-4 text-accent light:text-accent-dark flex-shrink-0" />
                            <span className="text-secondary light:text-secondary-dark">
                              Peak focus:{' '}
                              <span className="text-primary light:text-primary-dark font-medium">
                                {data.peakLabel}
                              </span>
                            </span>
                          </motion.div>
                        )}

                        {/* Legend */}
                        <motion.div
                          initial={reducedMotion ? {} : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={reducedMotion ? { duration: 0 } : { delay: 0.4 }}
                          className="flex items-center justify-center gap-1.5 text-[10px] text-tertiary light:text-tertiary-dark"
                        >
                          <span>Less</span>
                          <div className="flex gap-0.5">
                            <div className="w-3 h-3 rounded-sm bg-tertiary/5 light:bg-tertiary-dark/5" />
                            <div className="w-3 h-3 rounded-sm bg-accent/20 light:bg-accent-dark/20" />
                            <div className="w-3 h-3 rounded-sm bg-accent/40 light:bg-accent-dark/40" />
                            <div className="w-3 h-3 rounded-sm bg-accent/70 light:bg-accent-dark/70" />
                            <div className="w-3 h-3 rounded-sm bg-accent light:bg-accent-dark" />
                          </div>
                          <span>More</span>
                        </motion.div>
                      </>
                    ) : null}
                  </div>

                  {/* Footer with context - only show when feature available */}
                  {hasAdvancedStats && (
                    <div className="px-4 pb-4 pt-2">
                      <p className="text-[10px] text-tertiary/70 light:text-tertiary-dark/70 text-center">
                        Based on your last 30 days of focus sessions
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
