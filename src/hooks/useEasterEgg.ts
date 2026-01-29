'use client';

import { useEffect, useRef, useCallback } from 'react';

// ============================================================================
// Constants
// ============================================================================

const BUFFER_TIMEOUT = 5000; // 5 seconds - reset buffer after inactivity
const MAX_BUFFER_LENGTH = 10; // Maximum buffer size to check against

// ============================================================================
// Types
// ============================================================================

export interface EasterEggConfig {
  /** The secret word to type */
  word: string;
  /** Callback when the word is typed */
  onTrigger: () => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Easter egg hook that triggers callbacks when the user types secret words.
 *
 * Supports multiple easter eggs:
 * - "intro" → Replay the original intro
 * - "focus" → Show a random inspiration
 *
 * - Ignores input while focused on text fields
 * - Ignores input with modifier keys pressed
 * - Resets after 5 seconds of inactivity
 *
 * @param easterEggs - Array of easter egg configurations
 */
export function useEasterEggs(easterEggs: EasterEggConfig[]): void {
  const bufferRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset the buffer
  const resetBuffer = useCallback(() => {
    bufferRef.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Build a set of all characters used in easter egg words for quick lookup
    const easterEggChars = new Set<string>();
    for (const egg of easterEggs) {
      for (const char of egg.word.toLowerCase()) {
        easterEggChars.add(char);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // Ignore if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // Only handle single character keys (a-z)
      if (e.key.length !== 1 || !/^[a-zA-Z]$/.test(e.key)) {
        return;
      }

      const key = e.key.toLowerCase();

      // If we have a buffer and this key could be part of an easter egg,
      // prevent other shortcuts from firing
      if (bufferRef.current.length > 0 && easterEggChars.has(key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }

      // Clear existing timeout and set a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(resetBuffer, BUFFER_TIMEOUT);

      // Add character to buffer
      bufferRef.current += key;

      // Keep buffer length manageable
      if (bufferRef.current.length > MAX_BUFFER_LENGTH) {
        bufferRef.current = bufferRef.current.slice(-MAX_BUFFER_LENGTH);
      }

      // Check if any easter egg is triggered
      for (const egg of easterEggs) {
        if (bufferRef.current.endsWith(egg.word.toLowerCase())) {
          resetBuffer();
          egg.onTrigger();
          break;
        }
      }
    }

    // Use capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [easterEggs, resetBuffer]);
}

/**
 * Convenience hook for a single easter egg
 * @deprecated Use useEasterEggs instead for multiple easter eggs
 */
export function useEasterEgg(onTrigger: () => void): void {
  useEasterEggs([{ word: 'focus', onTrigger }]);
}
