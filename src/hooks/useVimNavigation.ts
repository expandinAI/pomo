'use client';

import { useEffect, useCallback } from 'react';

interface VimNavigationOptions {
  isActive: boolean;
  itemCount: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onConfirm?: () => void;
}

/**
 * Hook for vim-style list navigation (J/K keys)
 *
 * J = Move down
 * K = Move up
 * Enter = Confirm selection (optional)
 *
 * @param options - Navigation configuration
 */
export function useVimNavigation({
  isActive,
  itemCount,
  selectedIndex,
  onSelect,
  onConfirm,
}: VimNavigationOptions): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive || itemCount === 0) return;

      // Ignore if typing in an input (but allow in Command Palette search)
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLInputElement && target.type !== 'search' && target.type !== 'text')
      ) {
        return;
      }

      switch (e.key) {
        case 'j':
        case 'J':
          // Move down (unless already at bottom)
          if (selectedIndex < itemCount - 1) {
            e.preventDefault();
            onSelect(selectedIndex + 1);
          }
          break;

        case 'k':
        case 'K':
          // Move up (unless already at top)
          if (selectedIndex > 0) {
            e.preventDefault();
            onSelect(selectedIndex - 1);
          }
          break;

        case 'Enter':
          if (onConfirm) {
            e.preventDefault();
            onConfirm();
          }
          break;
      }
    },
    [isActive, itemCount, selectedIndex, onSelect, onConfirm]
  );

  useEffect(() => {
    if (!isActive) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleKeyDown]);
}
