'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type DailyIntention,
  ORIGINAL_INTRO,
  getDailyIntention,
  getRandomIntention,
} from '@/lib/content/daily-intentions';

// ============================================================================
// Types
// ============================================================================

export type IntroPhase =
  | 'silence'      // Schwarzer Screen
  | 'genesis'      // Partikel erscheint
  | 'truth1'       // Main text appears
  | 'truth2'       // Brief pause
  | 'invitation'   // Subtext appears (if any)
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
  /** Current intention to display */
  currentIntention: DailyIntention;
  /** Whether this is the original intro (first time) or daily intention */
  isOriginalIntro: boolean;
  /** Skip the intro */
  skip: () => void;
  /** Mark intro as complete (called at end of transition) */
  markComplete: () => void;
  /** Replay the intro from the beginning */
  replay: () => void;
  /** Show a random daily intention */
  showInspiration: () => void;
}

// ============================================================================
// Constants (exported for use in IntroExperience and other components)
// ============================================================================

export const INTRO_TIMING: Record<Exclude<IntroPhase, 'complete'>, number> = {
  silence: 1000,      // 1s - brief pause
  genesis: 1400,      // 1.4s - particle appears, breathes
  truth1: 2200,       // 2.2s - "Great things start small."
  truth2: 800,        // 0.8s - brief breath between texts
  invitation: 2200,   // 2.2s - "This small."
  transition: 2000,   // 2s - gentle fade to app
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
const DAILY_INTENTION_KEY = 'particle:daily-intention-enabled';
const LAST_INTENTION_DATE_KEY = 'particle:last-intention-date';

const hasSeenIntro = (): boolean => {
  if (typeof window === 'undefined') return true; // SSR-safe: assume seen
  return localStorage.getItem(STORAGE_KEY) === 'true';
};

const markIntroSeen = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, 'true');
};

const isDailyIntentionEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DAILY_INTENTION_KEY) === 'true';
};

const hasSeenIntentionToday = (): boolean => {
  if (typeof window === 'undefined') return true;
  const lastDate = localStorage.getItem(LAST_INTENTION_DATE_KEY);
  const today = new Date().toISOString().split('T')[0];
  return lastDate === today;
};

const markIntentionSeenToday = (): void => {
  if (typeof window === 'undefined') return;
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(LAST_INTENTION_DATE_KEY, today);
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
  const [currentIntention, setCurrentIntention] = useState<DailyIntention>(ORIGINAL_INTRO);
  const [isOriginalIntro, setIsOriginalIntro] = useState(true);

  // Track if we've initialized from localStorage
  const hasInitialized = useRef(false);

  // Timer ref for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const seen = hasSeenIntro();
    const dailyEnabled = isDailyIntentionEnabled();
    const seenToday = hasSeenIntentionToday();

    if (!seen) {
      // First-time user: show original intro
      setShowIntro(true);
      setPhase('silence');
      setCurrentIntention(ORIGINAL_INTRO);
      setIsOriginalIntro(true);
    } else if (dailyEnabled && !seenToday) {
      // Returning user with daily intention enabled, hasn't seen today's
      setShowIntro(true);
      setPhase('silence');
      setCurrentIntention(getDailyIntention());
      setIsOriginalIntro(false);
    }
    // else: returning user, either daily intention off or already seen today

    // Mark as ready - we now know whether to show intro or not
    setIsReady(true);

    // Cleanup: Reset ref for StrictMode remount
    // Without this, StrictMode's second mount sees hasInitialized=true
    // and returns early, leaving isReady=false (black screen bug)
    return () => {
      hasInitialized.current = false;
    };
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
      if (!isOriginalIntro) {
        // Mark daily intention as seen for today
        markIntentionSeenToday();
      }
      setShowIntro(false);
    }
  }, [phase, showIntro, isOriginalIntro]);

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

  // Replay the intro from the beginning (always shows original)
  const replay = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Reset state to beginning with original intro
    setPhase('silence');
    setIsSkipping(false);
    setCurrentIntention(ORIGINAL_INTRO);
    setIsOriginalIntro(true);
    setShowIntro(true);
  }, []);

  // Show a random daily intention
  const showInspiration = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Reset state to beginning with random intention
    setPhase('silence');
    setIsSkipping(false);
    setCurrentIntention(getRandomIntention());
    setIsOriginalIntro(false);
    setShowIntro(true);
  }, []);

  return {
    isReady,
    showIntro,
    phase,
    isSkipping,
    currentIntention,
    isOriginalIntro,
    skip,
    markComplete,
    replay,
    showInspiration,
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
