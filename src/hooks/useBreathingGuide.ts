'use client';

import { useState, useEffect } from 'react';

export type BreathingAction = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

export interface BreathingPhase {
  action: BreathingAction;
  countdown: number;
}

const BOX_BREATHING = [
  { action: 'inhale' as const, duration: 4 },
  { action: 'hold-in' as const, duration: 4 },
  { action: 'exhale' as const, duration: 4 },
  { action: 'hold-out' as const, duration: 4 },
];

/**
 * Hook that tracks the current phase of box breathing.
 * Syncs with the Box Breathing animation timing (16s cycle).
 *
 * @param isActive - Whether breathing guidance should be active
 * @returns Current breathing phase with action and countdown, or null if inactive
 */
export function useBreathingGuide(isActive: boolean): BreathingPhase | null {
  const [phase, setPhase] = useState<BreathingPhase | null>(null);

  useEffect(() => {
    if (!isActive) {
      setPhase(null);
      return;
    }

    let phaseIndex = 0;
    let countdown = BOX_BREATHING[0].duration;
    setPhase({ action: BOX_BREATHING[0].action, countdown });

    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        phaseIndex = (phaseIndex + 1) % BOX_BREATHING.length;
        countdown = BOX_BREATHING[phaseIndex].duration;
      }
      setPhase({ action: BOX_BREATHING[phaseIndex].action, countdown });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return phase;
}
