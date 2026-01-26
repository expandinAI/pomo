'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface EndConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * End Session Confirmation Modal
 * Shows when user presses 'E' to end session early
 */
export function EndConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
}: EndConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useFocusTrap(modalRef, isOpen, { initialFocusRef: cancelButtonRef });

  // Handle keyboard shortcuts within modal - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onConfirm();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onCancel, onConfirm]);

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
            onClick={onCancel}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="w-[90vw] max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="end-confirm-title"
                aria-describedby="end-confirm-description"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
              >
                {/* Content */}
                <div className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-accent light:text-accent-dark" />
                  </div>

                  <h2
                    id="end-confirm-title"
                    className="text-lg font-semibold text-primary light:text-primary-dark mb-2"
                  >
                    End session early?
                  </h2>

                  <p
                    id="end-confirm-description"
                    className="text-sm text-tertiary light:text-tertiary-dark mb-6"
                  >
                    Your progress will be saved, but this won&apos;t count as a completed session.
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      ref={cancelButtonRef}
                      onClick={onCancel}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Continue
                      <kbd className="ml-2 text-xs text-tertiary light:text-tertiary-dark">Esc</kbd>
                    </button>
                    <button
                      onClick={onConfirm}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-accent light:bg-accent-dark text-background light:text-background-light hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      End
                      <kbd className="ml-2 text-xs opacity-70">↵</kbd>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
