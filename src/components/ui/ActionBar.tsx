'use client';

import { motion } from 'framer-motion';
import {
  CalendarDays,
  FolderKanban,
  Target,
  BarChart3,
  Command,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  onOpenTimeline: () => void;
  onOpenProjects: () => void;
  onOpenGoals: () => void;
  onOpenStats: () => void;
  onOpenCommands: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  tooltip: string;
  children: React.ReactNode;
}

function ActionButton({ onClick, label, tooltip, children }: ActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        'text-tertiary light:text-tertiary-dark',
        'hover:text-secondary light:hover:text-secondary-dark',
        'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
        'transition-colors duration-fast',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
      )}
      aria-label={label}
      title={tooltip}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', ...SPRING.default }}
    >
      {children}
    </motion.button>
  );
}

function Divider() {
  return (
    <div className="w-px h-5 bg-tertiary/20 light:bg-tertiary-dark/20 mx-1" />
  );
}

/**
 * ActionBar - Discoverable entry point for all features
 *
 * Layout: [ Timeline  Projects  Goal ] | [ Stats ] | [ ⌘  Settings  Theme ]
 *              Primary (daily use)       Analytics       System
 */
export function ActionBar({
  onOpenTimeline,
  onOpenProjects,
  onOpenGoals,
  onOpenStats,
  onOpenCommands,
  onOpenSettings,
  onToggleTheme,
  theme,
}: ActionBarProps) {
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-0.5">
      {/* Primary Group - Daily Use */}
      <ActionButton
        onClick={onOpenTimeline}
        label="Open timeline"
        tooltip="Timeline · G T"
      >
        <CalendarDays className="w-5 h-5" />
      </ActionButton>

      <ActionButton
        onClick={onOpenProjects}
        label="Open projects"
        tooltip="Projects · G P"
      >
        <FolderKanban className="w-5 h-5" />
      </ActionButton>

      <ActionButton
        onClick={onOpenGoals}
        label="Open daily goal"
        tooltip="Daily Goal · G O"
      >
        <Target className="w-5 h-5" />
      </ActionButton>

      <Divider />

      {/* Analytics Group */}
      <ActionButton
        onClick={onOpenStats}
        label="Open statistics"
        tooltip="Statistics · G S"
      >
        <BarChart3 className="w-5 h-5" />
      </ActionButton>

      <Divider />

      {/* System Group */}
      <ActionButton
        onClick={onOpenCommands}
        label="Open command palette"
        tooltip="Commands · ⌘K"
      >
        <Command className="w-5 h-5" />
      </ActionButton>

      <ActionButton
        onClick={onOpenSettings}
        label="Open settings"
        tooltip="Settings · ⌘,"
      >
        <Settings className="w-5 h-5" />
      </ActionButton>

      {/* Theme Toggle with rotation animation */}
      <motion.button
        onClick={onToggleTheme}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          'text-tertiary light:text-tertiary-dark',
          'hover:text-secondary light:hover:text-secondary-dark',
          'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
          'transition-colors duration-fast',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title="Theme · D"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 180 : 0, opacity: 1 }}
          transition={{ type: 'spring', ...SPRING.gentle }}
          aria-hidden="true"
        >
          {isDark ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
