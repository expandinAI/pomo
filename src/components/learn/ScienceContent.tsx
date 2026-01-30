'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  SCIENCE_INTRO,
  SCIENCE_SUBINTRO,
  SCIENCE_SECTIONS,
  SCIENCE_CLOSING,
} from '@/lib/content/science-content';

interface ScienceContentProps {
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

export function ScienceContent({ onBack }: ScienceContentProps) {
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
      <motion.div variants={itemVariants} className="space-y-1">
        <p className="text-lg italic text-secondary light:text-secondary-dark">
          {SCIENCE_INTRO}
        </p>
        <p className="text-sm text-tertiary light:text-tertiary-dark">
          {SCIENCE_SUBINTRO}
        </p>
      </motion.div>

      {/* Sections */}
      {SCIENCE_SECTIONS.map((section) => (
        <motion.div key={section.id} variants={itemVariants} className="space-y-3">
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-semibold text-primary light:text-primary-dark">
              {section.title}
            </h3>
            {section.subtitle && (
              <span className="text-xs text-tertiary light:text-tertiary-dark">
                {section.subtitle}
              </span>
            )}
          </div>
          {section.paragraphs.map((p, i) => (
            <p
              key={i}
              className={cn(
                'text-sm text-secondary light:text-secondary-dark leading-relaxed',
                i === 0 && 'font-medium'
              )}
            >
              {p}
            </p>
          ))}
          {section.particleNote && (
            <p className="text-sm text-accent/80 italic border-l-2 border-accent/30 pl-3 mt-2">
              {section.particleNote}
            </p>
          )}
        </motion.div>
      ))}

      {/* Closing */}
      <motion.div
        variants={itemVariants}
        className="pt-4 border-t border-tertiary/10 light:border-tertiary-dark/10 text-center space-y-1"
      >
        {SCIENCE_CLOSING.map((line, i) => (
          <p
            key={i}
            className="text-sm italic text-tertiary light:text-tertiary-dark"
          >
            {line}
          </p>
        ))}
      </motion.div>
    </motion.div>
  );
}
