'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'particle:rhythm-onboarding-completed';

interface UseOnboardingReturn {
  /** Whether onboarding has been completed (persisted) */
  hasCompletedOnboarding: boolean;
  /** Whether the onboarding overlay is currently visible */
  isOnboardingVisible: boolean;
  /** Show the onboarding overlay (called on first start attempt) */
  showOnboarding: () => void;
  /** Hide the onboarding overlay and mark as completed */
  completeOnboarding: () => void;
}

/**
 * Hook for managing first-run onboarding state
 *
 * New flow:
 * 1. Timer appears immediately
 * 2. On first start attempt, showOnboarding() is called
 * 3. After user selects a rhythm, completeOnboarding() is called
 * 4. Timer starts immediately after
 */
export function useOnboarding(): UseOnboardingReturn {
  // Default to true to avoid triggering onboarding during hydration
  const [hasCompleted, setHasCompleted] = useState(true);
  // Whether the overlay is currently shown
  const [isVisible, setIsVisible] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setHasCompleted(stored === 'true');
  }, []);

  const showOnboarding = useCallback(() => {
    setIsVisible(true);
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasCompleted(true);
    setIsVisible(false);
  }, []);

  return {
    hasCompletedOnboarding: hasCompleted,
    isOnboardingVisible: isVisible,
    showOnboarding,
    completeOnboarding,
  };
}
