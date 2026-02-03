'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Twitter, Linkedin, Download, Copy, Check } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import type { ParticleOfWeek } from '@/lib/coach/particle-of-week';
import { ShareCard } from './ShareCard';
import { downloadShareCard } from '@/lib/share/generate-image';
import {
  getTwitterShareUrl,
  getLinkedInShareUrl,
  copyNarrativeToClipboard,
} from '@/lib/share/share-utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  potw: ParticleOfWeek | null;
}

export function ShareModal({ isOpen, onClose, potw }: ShareModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useFocusTrap(modalRef, isOpen, { initialFocusRef: modalRef });

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

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

  if (!potw) return null;

  const handleTwitter = () => {
    window.open(getTwitterShareUrl(potw), '_blank', 'noopener,noreferrer');
  };

  const handleLinkedIn = () => {
    window.open(getLinkedInShareUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async () => {
    const success = await copyNarrativeToClipboard(potw);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);

    const filename = `particle-week-${potw.weekNumber}-${potw.year}.png`;
    await downloadShareCard(cardRef.current, filename);

    setDownloading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', ...SPRING.gentle }}
            className="w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={modalRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
              className="flex flex-col overflow-hidden bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 focus:outline-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10">
                <div className="flex items-center gap-2">
                  <span className="text-[#FFD700]">✧</span>
                  <h2
                    id="share-modal-title"
                    className="text-base font-semibold text-primary light:text-primary-dark"
                  >
                    Share This Moment
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

              {/* Preview */}
              <div className="p-5 flex justify-center overflow-hidden">
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <ShareCard ref={cardRef} potw={potw} />
                </div>
              </div>

              {/* Share Options */}
              <div className="px-5 pb-5 flex gap-3 justify-center">
                <ShareButton
                  icon={<Twitter className="w-4 h-4" />}
                  label="Twitter"
                  onClick={handleTwitter}
                />
                <ShareButton
                  icon={<Linkedin className="w-4 h-4" />}
                  label="LinkedIn"
                  onClick={handleLinkedIn}
                />
                <ShareButton
                  icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  label={copied ? 'Copied!' : 'Copy'}
                  onClick={handleCopy}
                  active={copied}
                />
                <ShareButton
                  icon={<Download className="w-4 h-4" />}
                  label="Download"
                  onClick={handleDownload}
                  loading={downloading}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShareButton({
  icon,
  label,
  onClick,
  active = false,
  loading = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl
        transition-colors
        ${active
          ? 'bg-[#FFD700]/10 text-[#FFD700]'
          : 'bg-tertiary/5 light:bg-tertiary-dark/5 text-secondary light:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
        }
        ${loading ? 'opacity-50 cursor-wait' : ''}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
      `}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
