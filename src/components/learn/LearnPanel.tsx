'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { cn } from '@/lib/utils';
import { LearnMenu } from './LearnMenu';

interface LearnPanelProps {
  onClose: () => void;
}

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', ...SPRING.snappy },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export function LearnPanel({ onClose }: LearnPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap with initial focus on panel container
  useFocusTrap(panelRef, true, { initialFocusRef: panelRef });

  // Escape key handler - capture phase + stopImmediatePropagation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-title"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'fixed right-0 top-0 bottom-0 z-50',
        'w-[400px] max-w-full',
        'bg-surface light:bg-surface-dark',
        'border-l border-tertiary/10 light:border-tertiary-dark/10',
        'shadow-xl',
        'flex flex-col',
        'focus:outline-none',
        // Mobile fullscreen
        'max-sm:w-full max-sm:border-l-0'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
        <h2
          id="learn-title"
          className="text-base font-semibold text-primary light:text-primary-dark"
        >
          Learn
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
      <div className="flex-1 overflow-y-auto p-5">
        <LearnMenu />
      </div>

      {/* Footer hint */}
      <div className="px-5 py-3 border-t border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
        <span className="text-xs text-tertiary light:text-tertiary-dark">
          Keyboard: L
        </span>
      </div>
    </motion.div>
  );
}
