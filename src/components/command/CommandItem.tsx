'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import type { Command } from '@/lib/commandRegistry';

interface CommandItemProps {
  command: Command;
  isSelected: boolean;
  onSelect: (command: Command) => void;
}

export function CommandItem({ command, isSelected, onSelect }: CommandItemProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isDisabled =
    typeof command.disabled === 'function' ? command.disabled() : command.disabled;

  // Scroll into view when selected
  useEffect(() => {
    if (isSelected && buttonRef.current) {
      buttonRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [isSelected]);

  return (
    <motion.button
      ref={buttonRef}
      onClick={() => !isDisabled && onSelect(command)}
      disabled={isDisabled}
      className={`
        w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
        text-left transition-colors duration-fast
        ${isSelected
          ? 'bg-accent/10 light:bg-accent-dark/10'
          : 'hover:bg-tertiary/5 light:hover:bg-tertiary-dark/5'
        }
        ${isDisabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer'
        }
      `}
      initial={false}
      animate={{
        backgroundColor: isSelected
          ? 'rgba(255, 255, 255, 0.1)'
          : 'transparent',
      }}
      transition={{ type: 'spring', ...SPRING.snappy }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {command.icon && (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-tertiary light:text-tertiary-dark">
            {command.icon}
          </span>
        )}
        <span
          className={`
            truncate text-sm
            ${isSelected
              ? 'text-primary light:text-primary-dark'
              : 'text-secondary light:text-secondary-dark'
            }
          `}
        >
          {command.label}
        </span>
      </div>

      {command.shortcut && (
        <kbd
          className={`
            flex-shrink-0 px-1.5 py-0.5 text-xs font-mono rounded
            border border-tertiary/20 light:border-tertiary-dark/20
            ${isSelected
              ? 'bg-background/50 light:bg-background-dark/50 text-tertiary light:text-tertiary-dark'
              : 'bg-background light:bg-background-dark text-tertiary/70 light:text-tertiary-dark/70'
            }
          `}
        >
          {command.shortcut}
        </kbd>
      )}
    </motion.button>
  );
}
