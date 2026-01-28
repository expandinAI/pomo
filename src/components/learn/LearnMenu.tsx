'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Brain, FlaskConical, Sparkles } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

export type LearnView = 'menu' | 'rhythms' | 'breaks' | 'science' | 'philosophy';

interface LearnMenuProps {
  onNavigate: (view: LearnView) => void;
}

interface MenuItem {
  id: LearnView;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'rhythms',
    icon: Book,
    title: 'The Three Rhythms',
    description: 'Everyone works differently.',
  },
  {
    id: 'breaks',
    icon: Brain,
    title: 'Why Breaks Matter',
    description: 'Your brain needs space.',
  },
  {
    id: 'science',
    icon: FlaskConical,
    title: 'The Science',
    description: 'Focus isn\'t magic.',
  },
  {
    id: 'philosophy',
    icon: Sparkles,
    title: 'The Particle Philosophy',
    description: 'Why we built this differently.',
  },
];

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', ...SPRING.gentle },
  },
};

export function LearnMenu({ onNavigate }: LearnMenuProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          e.stopImmediatePropagation();
          setFocusedIndex(i => Math.min(i + 1, MENU_ITEMS.length - 1));
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          e.stopImmediatePropagation();
          setFocusedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          e.stopImmediatePropagation();
          onNavigate(MENU_ITEMS[focusedIndex].id);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [focusedIndex, onNavigate]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {MENU_ITEMS.map((item, index) => (
        <motion.button
          key={item.id}
          variants={itemVariants}
          className={cn(
            'w-full text-left p-4 rounded-xl',
            'bg-tertiary/5 light:bg-tertiary-dark/5',
            'border transition-colors',
            focusedIndex === index
              ? 'border-accent/50 light:border-accent-dark/50 ring-1 ring-accent/30 light:ring-accent-dark/30'
              : 'border-tertiary/10 light:border-tertiary-dark/10',
            'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
            'hover:border-tertiary/20 light:hover:border-tertiary-dark/20',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            'group'
          )}
          onClick={() => onNavigate(item.id)}
          onMouseEnter={() => setFocusedIndex(index)}
        >
          <div className="flex items-start gap-3">
            <item.icon className={cn(
              'w-5 h-5 flex-shrink-0 mt-0.5 transition-colors',
              focusedIndex === index
                ? 'text-secondary light:text-secondary-dark'
                : 'text-tertiary light:text-tertiary-dark group-hover:text-secondary light:group-hover:text-secondary-dark'
            )} />
            <div>
              <div className="font-medium text-primary light:text-primary-dark">
                {item.title}
              </div>
              <div className="text-sm text-tertiary light:text-tertiary-dark mt-0.5">
                {item.description}
              </div>
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
