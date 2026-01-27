// src/hooks/useWellbeingHint.ts

import { useState, useEffect, useRef } from 'react';
import { getRandomHint, type WellbeingHint } from '@/lib/wellbeing-hints';

interface UseWellbeingHintOptions {
  isBreak: boolean;
  enabled?: boolean;         // Default: true
  rotationInterval?: number; // Default: 35000ms
  initialDelay?: number;     // Default: 3000ms
}

export function useWellbeingHint({
  isBreak,
  enabled = true,
  rotationInterval = 35000,
  initialDelay = 3000
}: UseWellbeingHintOptions): string | null {
  const [hint, setHint] = useState<WellbeingHint | null>(null);
  const lastHintId = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only show hints during breaks when enabled
    if (!isBreak || !enabled) {
      setHint(null);
      lastHintId.current = undefined;
      return;
    }

    // Initial hint after delay
    const initialTimeout = setTimeout(() => {
      const newHint = getRandomHint();
      setHint(newHint);
      lastHintId.current = newHint.id;
    }, initialDelay);

    // Rotation interval (starts after initial delay + first rotation interval)
    const interval = setInterval(() => {
      const newHint = getRandomHint(lastHintId.current);
      setHint(newHint);
      lastHintId.current = newHint.id;
    }, rotationInterval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isBreak, enabled, rotationInterval, initialDelay]);

  return hint?.text ?? null;
}
