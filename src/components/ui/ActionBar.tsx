'use client';

import { motion } from 'framer-motion';
import {
  CalendarDays,
  FolderKanban,
  Target,
  BarChart3,
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
 * ActionBar - Functional navigation icons (top-right)
 *
 * Layout: [ Timeline  Rhythm  Projects  Goals  Stats ]
 *              Primary navigation for daily use
 *
 * System controls (Commands, Settings, Night Mode) are now
 * placed in the corners (bottom-left and bottom-right)
 */
export function ActionBar({
  onOpenTimeline,
  onOpenRhythm,
  onOpenProjects,
  onOpenGoals,
  onOpenStats,
}: ActionBarProps) {
  return (
    <div className="flex items-center gap-0.5">
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

      <ActionButton
        onClick={onOpenStats}
        label="Open statistics"
        tooltip="Statistics · G S"
      >
        <BarChart3 className="w-5 h-5" />
      </ActionButton>
    </div>
  );
}
