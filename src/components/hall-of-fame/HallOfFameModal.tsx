'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { getPOTWHistory, type ParticleOfWeek } from '@/lib/coach/particle-of-week';
import { ShareModal } from '@/components/share';

interface HallOfFameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HallOfFameModal({ isOpen, onClose }: HallOfFameModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const history = getPOTWHistory();
  const [sharingPOTW, setSharingPOTW] = useState<ParticleOfWeek | null>(null);

  // Focus trap
  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' as const }}
            exit={{ opacity: 0, pointerEvents: 'none' as const }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="w-full max-w-lg max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="hall-of-fame-title"
                className="flex flex-col overflow-hidden bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 focus:outline-none"
              >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[#FFD700]">✧</span>
                    <h2
                      id="hall-of-fame-title"
                      className="text-base font-semibold text-primary light:text-primary-dark"
                    >
                      Hall of Fame
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {history.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-tertiary light:text-tertiary-dark">
                          Your greatest moments
                        </p>
                        {history.map((potw, index) => (
                          <POTWCard
                            key={`${potw.year}-${potw.weekNumber}`}
                            potw={potw}
                            index={index}
                            onShare={setSharingPOTW}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Share Modal */}
          <ShareModal
            isOpen={sharingPOTW !== null}
            onClose={() => setSharingPOTW(null)}
            potw={sharingPOTW}
          />
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-4 opacity-30">✧</span>
      <p className="text-sm text-secondary light:text-secondary-dark mb-2">
        No highlights yet
      </p>
      <p className="text-xs text-tertiary light:text-tertiary-dark">
        Complete your first focused session this week
      </p>
    </div>
  );
}

function POTWCard({
  potw,
  index,
  onShare,
}: {
  potw: ParticleOfWeek;
  index: number;
  onShare: (potw: ParticleOfWeek) => void;
}) {
  const duration = Math.round(potw.session.duration / 60);
  const date = new Date(potw.session.completedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-xl bg-gradient-to-br from-[#FFD700]/5 to-transparent border border-[#FFD700]/10 hover:border-[#FFD700]/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Week label */}
          <div className="text-xs text-tertiary light:text-tertiary-dark mb-1">
            Week {potw.weekNumber}, {potw.year}
          </div>

          {/* Opening narrative */}
          <p className="text-sm text-secondary light:text-secondary-dark line-clamp-2">
            &ldquo;{potw.narrative.opening}&rdquo;
          </p>

          {/* Session info */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[#FFD700] text-xs">✧</span>
            <span className="text-xs text-primary light:text-primary-dark">
              {duration} min
              {potw.session.task && ` · ${potw.session.task}`}
            </span>
          </div>

          {/* Date */}
          <div className="text-xs text-tertiary light:text-tertiary-dark mt-1">
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(potw);
          }}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
