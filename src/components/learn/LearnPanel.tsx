'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { cn } from '@/lib/utils';
import { LearnMenu, type LearnView } from './LearnMenu';
import { RhythmContent } from './RhythmContent';

interface LearnPanelProps {
  onClose: () => void;
  currentPresetId: string;
  onPresetChange: (presetId: string) => void;
  initialView?: LearnView;
}

const VIEW_TITLES: Record<LearnView, string> = {
  menu: 'Learn',
  rhythms: 'The Three Rhythms',
  breaks: 'Why Breaks Matter',
  science: 'The Science',
};

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

export function LearnPanel({
  onClose,
  currentPresetId,
  onPresetChange,
  initialView = 'menu',
}: LearnPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<LearnView>(initialView);

  // Focus trap with initial focus on panel container
  useFocusTrap(panelRef, true, { initialFocusRef: panelRef });

  // Keyboard event isolation - block timer shortcuts from reaching the timer
  // Uses capture phase + stopImmediatePropagation to prevent ALL other handlers
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape closes the panel
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
        return;
      }

      // Block timer-related keys from propagating
      // Space = start/pause, ArrowUp/Down = adjust duration, 1-4 = presets, s = skip, r = reset
      // Note: ArrowLeft/Right and Backspace are used for panel navigation (handled by sub-views)
      const blockedKeys = [
        ' ', // Space - start/pause timer
        'ArrowUp', // Increase timer duration
        'ArrowDown', // Decrease timer duration
        '1', // Preset 1
        '2', // Preset 2
        '3', // Preset 3
        '4', // Preset 4
        's', // Skip
        'S', // Skip (uppercase)
        'r', // Reset
        'R', // Reset (uppercase)
      ];

      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  // Handle preset change - change preset and close panel
  const handlePresetChange = (presetId: string) => {
    onPresetChange(presetId);
    onClose();
  };

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
        <div className="flex items-center gap-2">
          {view !== 'menu' && (
            <button
              onClick={() => setView('menu')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Back to menu"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2
            id="learn-title"
            className="text-base font-semibold text-primary light:text-primary-dark"
          >
            {VIEW_TITLES[view]}
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
      <div className="flex-1 overflow-y-auto p-5">
        {view === 'menu' && <LearnMenu onNavigate={setView} />}
        {view === 'rhythms' && (
          <RhythmContent
            currentPresetId={currentPresetId}
            onPresetChange={handlePresetChange}
            onBack={() => setView('menu')}
          />
        )}
        {view === 'breaks' && (
          <div className="text-secondary light:text-secondary-dark text-sm">
            Coming soon...
          </div>
        )}
        {view === 'science' && (
          <div className="text-secondary light:text-secondary-dark text-sm">
            Coming soon...
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-5 py-3 border-t border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
        <span className="text-xs text-tertiary light:text-tertiary-dark">
          {view === 'menu' ? 'Keyboard: L' : 'Press ← or Backspace to go back'}
        </span>
      </div>
    </motion.div>
  );
}
