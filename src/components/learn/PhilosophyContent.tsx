'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  PHILOSOPHY_INTRO,
  PHILOSOPHY_SECTIONS,
  PHILOSOPHY_CLOSING,
} from '@/lib/content/philosophy-content';

interface PhilosophyContentProps {
  onBack: () => void;
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
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

export function PhilosophyContent({ onBack }: PhilosophyContentProps) {
  // Keyboard: Back navigation (← / Backspace)
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
      className="space-y-8"
    >
      {/* Intro – centered, poetic */}
      <motion.div variants={itemVariants} className="text-center space-y-1 mb-10">
        {PHILOSOPHY_INTRO.map((line, i) => (
          <p
            key={i}
            className="text-lg italic text-secondary light:text-secondary-dark"
          >
            {line}
          </p>
        ))}
      </motion.div>

      {/* Sections */}
      {PHILOSOPHY_SECTIONS.map((section) => (
        <motion.div key={section.id} variants={itemVariants} className="space-y-3">
          <h3 className="text-base font-semibold text-primary light:text-primary-dark">
            {section.title}
          </h3>
          {section.emphasis && (
            <p className="text-base font-medium text-primary light:text-primary-dark">
              {section.emphasis}
            </p>
          )}
          {section.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-sm text-secondary light:text-secondary-dark leading-relaxed"
            >
              {p}
            </p>
          ))}
        </motion.div>
      ))}

      {/* Closing – centered, poetic */}
      <motion.div
        variants={itemVariants}
        className="pt-4 border-t border-tertiary/10 light:border-tertiary-dark/10 text-center space-y-1"
      >
        {PHILOSOPHY_CLOSING.map((line, i) => (
          <p
            key={i}
            className={cn(
              'italic',
              i === 0
                ? 'text-base font-medium text-secondary light:text-secondary-dark'
                : 'text-sm text-tertiary light:text-tertiary-dark'
            )}
          >
            {line}
          </p>
        ))}
      </motion.div>

      {/* Pulsing Particle */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center pt-4"
      >
        <motion.div
          className="w-3 h-3 rounded-full bg-primary light:bg-primary-dark"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
