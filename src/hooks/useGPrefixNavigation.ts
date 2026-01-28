'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface GPrefixCallbacks {
  onTimeline: () => void;
  onStats: () => void;
  onHistory: () => void;
  onSettings: () => void;
  onYear?: () => void;
  onProjects?: () => void;
  onGoals?: () => void;
  onRhythm?: () => void;
  onMilestones?: () => void;
  onLearn?: () => void;
}

/**
 * Hook for G-prefix (vim-like) navigation shortcuts
 *
 * G T = Open Timeline (day view)
 * G S = Open Statistics Dashboard (Overview tab)
 * G H = Open Statistics Dashboard (History tab)
 * G Y = Open Year View
 * G P = Open Projects
 * G O = Open Goals (Daily Goal)
 * G R = Open Rhythm (estimation insights)
 * G M = Open Milestones
 * G L = Open Learn panel
 * G , = Open Settings
 *
 * After pressing G, user has 1 second to press the second key
 */
export function useGPrefixNavigation(callbacks: GPrefixCallbacks): { isGPressed: boolean } {
  const [isGPressed, setIsGPressed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearGTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ignore if any modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // First key: G
      if (e.key === 'g' && !isGPressed) {
        setIsGPressed(true);
        clearGTimeout();

        // Reset after 1 second if no second key is pressed
        timeoutRef.current = setTimeout(() => {
          setIsGPressed(false);
        }, 1000);
        return;
      }

      // Second key after G
      if (isGPressed) {
        clearGTimeout();
        setIsGPressed(false);

        switch (e.key) {
          case 't':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onTimeline();
            break;
          case 's':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onStats();
            break;
          case 'h':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onHistory();
            break;
          case 'y':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onYear?.();
            break;
          case 'p':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onProjects?.();
            break;
          case 'o':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onGoals?.();
            break;
          case 'r':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onRhythm?.();
            break;
          case 'm':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onMilestones?.();
            break;
          case 'l':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onLearn?.();
            break;
          case ',':
            e.preventDefault();
            e.stopImmediatePropagation();
            callbacks.onSettings();
            break;
          default:
            // Any other key resets the G state
            break;
        }
      }
    }

    // Use capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      clearGTimeout();
    };
  }, [isGPressed, callbacks, clearGTimeout]);

  return { isGPressed };
}
