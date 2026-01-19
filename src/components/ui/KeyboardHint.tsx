'use client';

import { cn } from '@/lib/utils';
import { formatShortcut } from '@/lib/platform';

interface KeyboardHintProps {
  shortcut: string;
  className?: string;
  visible?: boolean;
}

/**
 * Displays a keyboard shortcut hint next to interactive elements
 *
 * Usage:
 * <button>
 *   Start <KeyboardHint shortcut="Space" />
 * </button>
 */
export function KeyboardHint({ shortcut, className, visible = true }: KeyboardHintProps) {
  if (!visible) return null;

  return (
    <kbd
      className={cn(
        'ml-2 px-1.5 py-0.5 text-xs rounded',
        'bg-surface-elevated/50 light:bg-surface-elevated-dark/50',
        'text-tertiary light:text-tertiary-dark',
        'border border-subtle/50 light:border-subtle-dark/50',
        'opacity-60 group-hover:opacity-100 transition-opacity',
        className
      )}
    >
      {formatShortcut(shortcut)}
    </kbd>
  );
}
