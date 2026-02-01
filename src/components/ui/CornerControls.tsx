'use client';

import { motion } from 'framer-motion';
import { Command, Settings, Sun, Moon, BookOpen } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

interface CornerButtonProps {
  onClick: () => void;
  label: string;
  tooltip: string;
  hint?: string;
  children: React.ReactNode;
}

function CornerButton({ onClick, label, tooltip, hint, children }: CornerButtonProps) {
  const handleMouseEnter = () => {
    if (hint) {
      window.dispatchEvent(new CustomEvent('particle:ui-hint', { detail: { hint } }));
    }
  };

  const handleMouseLeave = () => {
    if (hint) {
      window.dispatchEvent(new CustomEvent('particle:ui-hint', { detail: { hint: null } }));
    }
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center',
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

/**
 * Command Palette Button (bottom-left, next to ShortcutsHelp)
 */
interface CommandButtonProps {
  onOpenCommands: () => void;
}

export function CommandButton({ onOpenCommands }: CommandButtonProps) {
  return (
    <CornerButton
      onClick={onOpenCommands}
      label="Open command palette"
      tooltip="Commands · ⌘K"
      hint="Command Palette · ⌘K"
    >
      <Command className="w-4 h-4" />
    </CornerButton>
  );
}

/**
 * Library Button (bottom-right, standalone)
 * Opens the Library panel with guides and philosophy
 */
interface LibraryButtonProps {
  onOpenLibrary: () => void;
}

export function LibraryButton({ onOpenLibrary }: LibraryButtonProps) {
  return (
    <CornerButton
      onClick={onOpenLibrary}
      label="Open library"
      tooltip="Library · L"
      hint="Library · L"
    >
      <BookOpen className="w-4 h-4" />
    </CornerButton>
  );
}

/**
 * Bottom-right corner controls
 * - Learn (L)
 * - Night Mode (D)
 * - Settings (⌘,)
 */
interface BottomRightControlsProps {
  onOpenLearn: () => void;
  onToggleNightMode: () => void;
  onOpenSettings: () => void;
  nightModeEnabled: boolean;
}

export function BottomRightControls({
  onOpenLearn,
  onToggleNightMode,
  onOpenSettings,
  nightModeEnabled,
}: BottomRightControlsProps) {
  const handleNightModeEnter = () => {
    window.dispatchEvent(new CustomEvent('particle:ui-hint', {
      detail: { hint: nightModeEnabled ? 'Day Mode · D' : 'Night Mode · D' }
    }));
  };

  const handleNightModeLeave = () => {
    window.dispatchEvent(new CustomEvent('particle:ui-hint', { detail: { hint: null } }));
  };

  return (
    <div className="flex items-center gap-1">
      {/* Learn Button */}
      <CornerButton
        onClick={onOpenLearn}
        label="Open learn section"
        tooltip="Learn · L"
        hint="Library · L"
      >
        <BookOpen className="w-4 h-4" />
      </CornerButton>

      {/* Night Mode Toggle with rotation animation */}
      <motion.button
        onClick={onToggleNightMode}
        onMouseEnter={handleNightModeEnter}
        onMouseLeave={handleNightModeLeave}
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center',
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
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </motion.div>
      </motion.button>

      <CornerButton
        onClick={onOpenSettings}
        label="Open settings"
        tooltip="Settings · ⌘,"
        hint="Settings · ⌘,"
      >
        <Settings className="w-4 h-4" />
      </CornerButton>
    </div>
  );
}
