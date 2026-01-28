'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RHYTHM_CONTENT, RHYTHM_INTRO, RHYTHM_CLOSING } from '@/lib/content/learn-content';
import { RhythmCard } from './RhythmCard';

interface RhythmContentProps {
  currentPresetId: string;
  onPresetChange: (presetId: string) => void;
  onBack: () => void;
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function RhythmContent({
  currentPresetId,
  onPresetChange,
  onBack,
}: RhythmContentProps) {
  // Keyboard handler for back navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onBack();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onBack]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Intro text */}
      <motion.p
        variants={itemVariants}
        className="text-sm text-secondary light:text-secondary-dark leading-relaxed"
      >
        {RHYTHM_INTRO}
      </motion.p>

      {/* Rhythm cards */}
      <div className="space-y-3">
        {RHYTHM_CONTENT.map((rhythm, index) => (
          <motion.div key={rhythm.id} variants={itemVariants} custom={index}>
            <RhythmCard
              rhythm={rhythm}
              isActive={currentPresetId === rhythm.presetId}
              onTry={() => onPresetChange(rhythm.presetId)}
            />
          </motion.div>
        ))}
      </div>

      {/* Closing text */}
      <motion.p
        variants={itemVariants}
        className="text-sm text-tertiary light:text-tertiary-dark italic text-center pt-2"
      >
        {RHYTHM_CLOSING}
      </motion.p>
    </motion.div>
  );
}
