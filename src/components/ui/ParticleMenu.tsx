'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  FolderKanban,
  Target,
  BarChart3,
  Activity,
  Clock,
  Calendar,
  GraduationCap,
  Trophy,
} from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

interface ParticleMenuProps {
  onOpenTimeline: () => void;
  onOpenRhythm: () => void;
  onOpenProjects: () => void;
  onOpenGoals: () => void;
  onOpenStats: () => void;
  onOpenHistory?: () => void;
  onOpenYear?: () => void;
  onOpenMilestones?: () => void;
  onOpenLearn?: () => void;
  /** When true, menu opens automatically (triggered by G key) */
  isGPressed?: boolean;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  /** The key to press after G (e.g., 'T' for G T) */
  key: string;
  onClick: () => void;
}

/**
 * ParticleMenu - A single particle that expands into a navigation list
 *
 * Philosophy: One white dot. Click or press G to reveal all views.
 * The menu shows available destinations with their keyboard shortcuts.
 */
export function ParticleMenu({
  onOpenTimeline,
  onOpenRhythm,
  onOpenProjects,
  onOpenGoals,
  onOpenStats,
  onOpenHistory,
  onOpenYear,
  onOpenMilestones,
  onOpenLearn,
  isGPressed = false,
}: ParticleMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openedViaKeyboard, setOpenedViaKeyboard] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Build menu items based on available callbacks
  const menuItems: MenuItem[] = [
    { id: 'timeline', icon: <CalendarDays className="w-4 h-4" />, label: 'Timeline', key: 'T', onClick: onOpenTimeline },
    { id: 'stats', icon: <BarChart3 className="w-4 h-4" />, label: 'Statistics', key: 'S', onClick: onOpenStats },
    ...(onOpenHistory ? [{ id: 'history', icon: <Clock className="w-4 h-4" />, label: 'History', key: 'H', onClick: onOpenHistory }] : []),
    { id: 'projects', icon: <FolderKanban className="w-4 h-4" />, label: 'Projects', key: 'P', onClick: onOpenProjects },
    { id: 'goals', icon: <Target className="w-4 h-4" />, label: 'Goals', key: 'O', onClick: onOpenGoals },
    { id: 'rhythm', icon: <Activity className="w-4 h-4" />, label: 'Rhythm', key: 'R', onClick: onOpenRhythm },
    ...(onOpenYear ? [{ id: 'year', icon: <Calendar className="w-4 h-4" />, label: 'Year View', key: 'Y', onClick: onOpenYear }] : []),
    ...(onOpenMilestones ? [{ id: 'milestones', icon: <Trophy className="w-4 h-4" />, label: 'Milestones', key: 'M', onClick: onOpenMilestones }] : []),
    ...(onOpenLearn ? [{ id: 'learn', icon: <GraduationCap className="w-4 h-4" />, label: 'Learn', key: 'L', onClick: onOpenLearn }] : []),
  ];

  // Open menu when G is pressed
  useEffect(() => {
    if (isGPressed && !isOpen) {
      setIsOpen(true);
      setOpenedViaKeyboard(true);
    }
  }, [isGPressed, isOpen]);

  // Close menu when G is released (timeout expired)
  useEffect(() => {
    if (!isGPressed && openedViaKeyboard) {
      // Small delay to allow the second key to be processed
      const timer = setTimeout(() => {
        setIsOpen(false);
        setOpenedViaKeyboard(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isGPressed, openedViaKeyboard]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenedViaKeyboard(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setOpenedViaKeyboard(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    setIsOpen(false);
    setOpenedViaKeyboard(false);
    item.onClick();
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    setOpenedViaKeyboard(false);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* The Particle - trigger button */}
      <motion.button
        onClick={handleButtonClick}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          'transition-colors duration-fast',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          isOpen
            ? 'bg-primary light:bg-primary-dark'
            : 'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10'
        )}
        aria-label={isOpen ? 'Close menu' : 'Open navigation menu (G)'}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <motion.div
          className={cn(
            'w-2 h-2 rounded-full',
            isOpen
              ? 'bg-background light:bg-background-dark'
              : 'bg-secondary light:bg-secondary-dark'
          )}
          animate={{
            scale: isOpen ? 0.8 : 1,
          }}
          transition={{ type: 'spring', ...SPRING.snappy }}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            className={cn(
              'absolute top-full right-0 mt-2',
              'min-w-[200px]',
              'bg-surface light:bg-surface-dark',
              'border border-tertiary/20 light:border-tertiary-dark/20',
              'rounded-xl shadow-xl',
              'overflow-hidden',
              'z-50'
            )}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', ...SPRING.snappy }}
          >
            {/* Header when opened via G */}
            {openedViaKeyboard && (
              <motion.div
                className="px-4 py-2 border-b border-tertiary/10 light:border-tertiary-dark/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-xs text-tertiary light:text-tertiary-dark">
                  Go to…
                </span>
              </motion.div>
            )}

            <div className="py-1">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  role="menuitem"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5',
                    'text-secondary light:text-secondary-dark',
                    'hover:text-primary light:hover:text-primary-dark',
                    'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
                    'transition-colors duration-fast',
                    'focus:outline-none focus-visible:bg-tertiary/10'
                  )}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.02,
                    duration: 0.12,
                  }}
                >
                  <span className="text-tertiary light:text-tertiary-dark">
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>
                  {/* Keyboard shortcut - highlight the key when G is pressed */}
                  <span className="flex items-center gap-0.5 font-mono text-xs">
                    <span className="text-tertiary/50 light:text-tertiary-dark/50">G</span>
                    <span className={cn(
                      'px-1.5 py-0.5 rounded',
                      openedViaKeyboard
                        ? 'bg-primary/10 text-primary light:bg-primary-dark/10 light:text-primary-dark font-semibold'
                        : 'text-tertiary light:text-tertiary-dark'
                    )}>
                      {item.key}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
