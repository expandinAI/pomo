'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

export type IntroPhase =
  | 'silence'      // Schwarzer Screen
  | 'genesis'      // Partikel erscheint
  | 'truth1'       // "Great works..." + ein Punkt
  | 'truth2'       // "...many small ones" + Punkte teilen sich
  | 'invitation'   // "Ready?" + Punkte vereinen sich
  | 'transition'   // Übergang zur App
  | 'complete';    // Intro fertig

export interface UseIntroReturn {
  /** Whether initialization is complete (safe to render content) */
  isReady: boolean;
  /** Whether the intro should be displayed */
  showIntro: boolean;
  /** Current phase of the intro */
  phase: IntroPhase;
  /** Whether the intro is being skipped */
  isSkipping: boolean;
  /** Skip the intro */
  skip: () => void;
  /** Mark intro as complete (called at end of transition) */
  markComplete: () => void;
}

// ============================================================================
// Constants (exported for use in IntroExperience and other components)
// ============================================================================

export const INTRO_TIMING: Record<Exclude<IntroPhase, 'complete'>, number> = {
  silence: 1500,      // 1.5s - brief pause
  genesis: 1500,      // 1.5s - particle appears
  truth1: 3000,       // 3s - "Great works..." + one particle
  truth2: 4500,       // 4.5s - "...many small ones" + particles divide
  invitation: 2500,   // 2.5s - "Ready?" + particles converge
  transition: 1200,   // 1.2s - gentle fade to app
} as const;

export const INTRO_PHASE_ORDER: IntroPhase[] = [
  'silence',
  'genesis',
  'truth1',
  'truth2',
  'invitation',
  'transition',
  'complete',
];

// ============================================================================
// Storage
// ============================================================================

const STORAGE_KEY = 'particle:intro-seen';

const hasSeenIntro = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR-safe: assume seen
  return localStorage.getItem(STORAGE_KEY) === 'true';
};

const markIntroSeen = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, 'true');
};

/** Reset intro state (for replay feature in POMO-175) */
export const resetIntro = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

// ============================================================================
// Helper: Get next phase
// ============================================================================

const getNextPhase = (current: IntroPhase): IntroPhase => {
  const currentIndex = INTRO_PHASE_ORDER.indexOf(current);
  if (currentIndex === -1 || currentIndex >= INTRO_PHASE_ORDER.length - 1) {
    return 'complete';
  }
  return INTRO_PHASE_ORDER[currentIndex + 1];
};

// ============================================================================
// Hook
// ============================================================================

export function useIntro(): UseIntroReturn {
  // Start with isReady false - we don't know yet if intro should show
  const [isReady, setIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [phase, setPhase] = useState<IntroPhase>('silence');
  const [isSkipping, setIsSkipping] = useState(false);

  // Track if we've initialized from localStorage
  const hasInitialized = useRef(false);

  // Timer ref for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const seen = hasSeenIntro();
    if (!seen) {
      setShowIntro(true);
      setPhase('silence');
    }
    // Mark as ready - we now know whether to show intro or not
    setIsReady(true);
  }, []);

  // Phase transition timer
  useEffect(() => {
    // Don't run timer if intro is not showing or already complete
    if (!showIntro || phase === 'complete') {
      return;
    }

    // Get timing for current phase
    const timing = INTRO_TIMING[phase as Exclude<IntroPhase, 'complete'>];
    if (!timing) return;

    // Schedule next phase
    timerRef.current = setTimeout(() => {
      const next = getNextPhase(phase);
      setPhase(next);
    }, timing);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showIntro, phase]);

  // Handle phase completion
  useEffect(() => {
    if (phase === 'complete' && showIntro) {
      markIntroSeen();
      setShowIntro(false);
    }
  }, [phase, showIntro]);

  // Skip function - jumps to complete
  const skip = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsSkipping(true);
    setPhase('complete');
  }, []);

  // Manual completion (fallback, normally handled by phase === 'complete')
  const markComplete = useCallback(() => {
    markIntroSeen();
    setShowIntro(false);
  }, []);

  return {
    isReady,
    showIntro,
    phase,
    isSkipping,
    skip,
    markComplete,
  };
}

// ============================================================================
// Utility Hook: Reduced Motion Preference
// ============================================================================

export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
