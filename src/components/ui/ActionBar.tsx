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
  Activity,
} from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  onOpenTimeline: () => void;
  onOpenRhythm: () => void;
  onOpenProjects: () => void;
  onOpenGoals: () => void;
  onOpenStats: () => void;
  onOpenCommands: () => void;
  onOpenSettings: () => void;
  onToggleNightMode: () => void;
  nightModeEnabled: boolean;
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
  onOpenRhythm,
  onOpenProjects,
  onOpenGoals,
  onOpenStats,
  onOpenCommands,
  onOpenSettings,
  onToggleNightMode,
  nightModeEnabled,
}: ActionBarProps) {

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
        onClick={onOpenRhythm}
        label="Open rhythm"
        tooltip="Rhythmus · G R"
      >
        <Activity className="w-5 h-5" />
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

      {/* Night Mode Toggle with rotation animation */}
      <motion.button
        onClick={onToggleNightMode}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          'text-tertiary light:text-tertiary-dark',
          'hover:text-secondary light:hover:text-secondary-dark',
          'hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10',
          'transition-colors duration-fast',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
        )}
        aria-label={nightModeEnabled ? 'Switch to day mode' : 'Switch to night mode'}
        title="Night Mode · D"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', ...SPRING.default }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: nightModeEnabled ? 180 : 0, opacity: 1 }}
          transition={{ type: 'spring', ...SPRING.gentle }}
          aria-hidden="true"
        >
          {nightModeEnabled ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
