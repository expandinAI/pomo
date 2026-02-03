'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSessionStore } from '@/contexts/SessionContext';
import {
  selectParticleOfWeek,
  savePOTW,
  getCurrentPOTW,
  type ParticleOfWeek,
} from '@/lib/coach/particle-of-week';
import type { CompletedSession } from '@/lib/session-storage';

interface UseParticleOfWeekReturn {
  /** The current week's Particle of the Week */
  potw: ParticleOfWeek | null;
  /** Check if a session ID is the POTW */
  isPOTW: (sessionId: string) => boolean;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook to access the Particle of the Week
 *
 * Automatically selects and caches the POTW based on sessions.
 * The POTW is the longest work session of the current week,
 * with special narratives for overflow, early bird, or weekend sessions.
 *
 * @example
 * ```tsx
 * const { potw, isPOTW } = useParticleOfWeek();
 *
 * // Check if a specific session is the POTW
 * const isGold = isPOTW(session.id);
 *
 * // Display POTW narrative
 * if (potw) {
 *   console.log(potw.narrative.opening);
 * }
 * ```
 */
export function useParticleOfWeek(): UseParticleOfWeekReturn {
  const { sessions } = useSessionStore();
  const [potw, setPotw] = useState<ParticleOfWeek | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check/generate POTW on mount and when sessions change
  useEffect(() => {
    if (sessions.length === 0) {
      setIsLoading(false);
      return;
    }

    // Check if we already have a POTW for this week
    const existing = getCurrentPOTW();

    // Verify the existing POTW session still exists in our sessions
    const existingSessionStillExists = existing
      ? sessions.some(s => s.id === existing.sessionId)
      : false;

    if (existing && existingSessionStillExists) {
      // Check if there's a longer session now (POTW might need update)
      const newPotw = selectParticleOfWeek(sessions as CompletedSession[], 0);

      if (newPotw && newPotw.sessionId !== existing.sessionId) {
        // A longer session exists, update POTW
        savePOTW(newPotw);
        setPotw(newPotw);
      } else {
        // Use existing POTW
        setPotw(existing);
      }
    } else {
      // Generate new POTW
      const newPotw = selectParticleOfWeek(sessions as CompletedSession[], 0);
      if (newPotw) {
        savePOTW(newPotw);
        setPotw(newPotw);
      }
    }

    setIsLoading(false);
  }, [sessions]);

  // Check if a session is the POTW
  const isPOTW = useCallback((sessionId: string): boolean => {
    return potw?.sessionId === sessionId;
  }, [potw]);

  return { potw, isPOTW, isLoading };
}
