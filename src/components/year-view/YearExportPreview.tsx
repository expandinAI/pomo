'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { prefersReducedMotion } from '@/lib/utils';
import { downloadBlob } from '@/lib/share/share-utils';

interface YearExportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageBlob: Blob | null;
  year: number;
  isGenerating: boolean;
}

export function YearExportPreview({
  isOpen,
  onClose,
  imageBlob,
  year,
  isGenerating,
}: YearExportPreviewProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const reducedMotion = prefersReducedMotion();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

  // Create/revoke object URL for preview
  useEffect(() => {
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      setImageUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setImageUrl(null);
      };
    } else {
      setImageUrl(null);
    }
  }, [imageBlob]);

  // Escape key handler - capture phase + stopImmediatePropagation
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

  const handleDownload = useCallback(() => {
    if (imageBlob) {
      downloadBlob(imageBlob, `particle-${year}.png`);
    }
  }, [imageBlob, year]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { scale: 0.95, y: 20 }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div
              ref={modalRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="export-preview-title"
              className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden flex flex-col max-h-full focus:outline-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
                <h2
                  id="export-preview-title"
                  className="text-base font-semibold text-primary light:text-primary-dark"
                >
                  Export
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col min-h-0 p-5">
                {/* Preview area */}
                <div className="w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  {isGenerating && !imageUrl ? (
                    <Loader2 className="w-8 h-8 text-tertiary animate-spin" />
                  ) : imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- blob URL, can't use next/image
                    <img
                      src={imageUrl}
                      alt={`Particle year view ${year}`}
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>

                {/* Download button */}
                {imageUrl && (
                  <button
                    onClick={handleDownload}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary light:bg-primary-dark text-surface light:text-surface-dark text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
