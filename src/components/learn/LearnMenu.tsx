'use client';

import { motion } from 'framer-motion';
import { Book, Brain, FlaskConical } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
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

export function LearnMenu() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {MENU_ITEMS.map((item) => (
        <motion.button
          key={item.id}
          variants={itemVariants}
          className={cn(
            'w-full text-left p-4 rounded-xl',
            'bg-tertiary/5 light:bg-tertiary-dark/5',
            'border border-tertiary/10 light:border-tertiary-dark/10',
            'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
            'hover:border-tertiary/20 light:hover:border-tertiary-dark/20',
            'transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            'group'
          )}
          onClick={() => {
            // TODO: POMO-162 will implement content navigation
            console.log('Navigate to:', item.id);
          }}
        >
          <div className="flex items-start gap-3">
            <item.icon className="w-5 h-5 text-tertiary light:text-tertiary-dark group-hover:text-secondary light:group-hover:text-secondary-dark transition-colors flex-shrink-0 mt-0.5" />
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
