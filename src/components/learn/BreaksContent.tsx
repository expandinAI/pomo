'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BREAKS_INTRO, BREAKS_SECTIONS, BREAKS_CLOSING } from '@/lib/content/breaks-content';

interface BreaksContentProps {
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

export function BreaksContent({ onBack }: BreaksContentProps) {
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
      {/* Intro */}
      <motion.p
        variants={itemVariants}
        className="text-lg italic text-secondary light:text-secondary-dark mb-8"
      >
        {BREAKS_INTRO}
      </motion.p>

      {/* Sections */}
      {BREAKS_SECTIONS.map((section) => (
        <motion.div key={section.id} variants={itemVariants} className="space-y-3">
          <h3 className="text-base font-semibold text-primary light:text-primary-dark">
            {section.title}
          </h3>
          {section.paragraphs.map((p, i) => (
            <p
              key={i}
              className={cn(
                'text-sm text-secondary light:text-secondary-dark leading-relaxed',
                // First paragraph often is emphasis
                i === 0 && 'font-medium'
              )}
            >
              {p}
            </p>
          ))}
        </motion.div>
      ))}

      {/* Closing */}
      <motion.div
        variants={itemVariants}
        className="pt-4 border-t border-tertiary/10 light:border-tertiary-dark/10 text-center"
      >
        {BREAKS_CLOSING.map((line, i) => (
          <p
            key={i}
            className={cn(
              'text-sm italic text-tertiary light:text-tertiary-dark',
              i === 0 && 'mb-1'
            )}
          >
            {line}
          </p>
        ))}
      </motion.div>
    </motion.div>
  );
}
