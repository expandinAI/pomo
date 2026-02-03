'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Download, Loader2, X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportFirst: () => void;
}

type DeleteState = 'idle' | 'deleting' | 'error';

const CONFIRMATION_TEXT = 'DELETE';

/**
 * Delete Account Confirmation Modal
 *
 * Shows a warning about what will be deleted and requires typing "DELETE" to confirm.
 * Based on EndConfirmationModal pattern.
 *
 * POMO-328
 */
export function DeleteAccountModal({
  isOpen,
  onClose,
  onExportFirst,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [deleteState, setDeleteState] = useState<DeleteState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus trap
  useFocusTrap(modalRef, isOpen, { initialFocusRef: inputRef });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmText('');
      setDeleteState('idle');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const isConfirmValid = confirmText === CONFIRMATION_TEXT;
  const isDeleting = deleteState === 'deleting';
  const canDelete = isConfirmValid && deleteState === 'idle';

  // Handle deletion
  const handleDelete = useCallback(async () => {
    if (!canDelete) return;

    setDeleteState('deleting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete account');
      }

      // Success - hard redirect to home
      // Use window.location instead of router.push because Clerk session is now invalid
      window.location.href = '/';
    } catch (error) {
      console.error('[DeleteAccountModal] Error:', error);
      setDeleteState('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    }
  }, [canDelete]);

  // Handle keyboard shortcuts - capture phase + stopImmediatePropagation prevents Timer interference
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      } else if (e.key === 'Enter' && canDelete) {
        e.preventDefault();
        e.stopImmediatePropagation();
        handleDelete();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose, canDelete, handleDelete]);

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
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="w-[90vw] max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                tabIndex={-1}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-account-title"
                aria-describedby="delete-account-description"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden focus:outline-none"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-tertiary/10 light:border-tertiary-dark/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <h2
                      id="delete-account-title"
                      className="text-lg font-semibold text-primary light:text-primary-dark"
                    >
                      Delete Account
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

                {/* Content */}
                <div className="p-5 space-y-4">
                  <p
                    id="delete-account-description"
                    className="text-sm text-secondary light:text-secondary-dark"
                  >
                    This action cannot be undone.
                  </p>

                  {/* What will be deleted */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary light:text-primary-dark">
                      The following will be permanently deleted:
                    </p>
                    <ul className="text-sm text-tertiary light:text-tertiary-dark space-y-1 ml-4">
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-tertiary light:bg-tertiary-dark" />
                        Your Particles (focus sessions)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-tertiary light:bg-tertiary-dark" />
                        Your Projects
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-tertiary light:bg-tertiary-dark" />
                        Your Settings
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-tertiary light:bg-tertiary-dark" />
                        Coach conversation history
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-tertiary light:bg-tertiary-dark" />
                        Your Flow subscription (if any)
                      </li>
                    </ul>
                  </div>

                  {/* Export button */}
                  <button
                    onClick={onExportFirst}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <Download className="w-4 h-4" />
                    Export my data first
                  </button>

                  {/* Confirmation input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-delete"
                      className="text-sm font-medium text-primary light:text-primary-dark"
                    >
                      To confirm, type &quot;{CONFIRMATION_TEXT}&quot;:
                    </label>
                    <input
                      ref={inputRef}
                      id="confirm-delete"
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={CONFIRMATION_TEXT}
                      className="w-full px-4 py-2.5 rounded-lg text-sm bg-tertiary/10 light:bg-tertiary-dark/10 text-primary light:text-primary-dark placeholder:text-tertiary light:placeholder:text-tertiary-dark border border-transparent focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                  </div>

                  {/* Error message */}
                  {errorMessage && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-400">{errorMessage}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-5 pt-0">
                  <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
                  >
                    Cancel
                    <kbd className="ml-2 text-xs text-tertiary light:text-tertiary-dark">
                      Esc
                    </kbd>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={!canDelete}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                      canDelete && !isDeleting
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-red-500/30 text-red-300 cursor-not-allowed'
                    }`}
                  >
                    {isDeleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      <>
                        Delete Account
                        {canDelete && (
                          <kbd className="ml-2 text-xs opacity-70">↵</kbd>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
