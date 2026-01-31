'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseFlowCelebrationReturn {
  /** Whether the celebration should be shown */
  showCelebration: boolean;
  /** Dismiss the celebration overlay */
  dismiss: () => void;
}

/**
 * Hook for detecting successful Stripe checkout and triggering celebration
 *
 * Flow:
 * 1. User completes Stripe checkout
 * 2. Stripe redirects to /?checkout=success
 * 3. Hook detects URL param and shows celebration
 * 4. After dismiss, URL params are cleaned up
 *
 * No localStorage needed - each checkout return = celebration
 * Page reload after dismiss won't re-trigger (URL params removed)
 */
export function useFlowCelebration(): UseFlowCelebrationReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Check for checkout success on mount
  useEffect(() => {
    // Only process once per session
    if (hasProcessed) return;

    const checkoutStatus = searchParams.get('checkout');

    if (checkoutStatus === 'success') {
      setShowCelebration(true);
      setHasProcessed(true);
    }
  }, [searchParams, hasProcessed]);

  const dismiss = useCallback(() => {
    setShowCelebration(false);

    // Clean up URL params to prevent re-trigger on refresh
    // Use replaceState to avoid adding to browser history
    const url = new URL(window.location.href);
    url.searchParams.delete('checkout');

    // Use router.replace for Next.js compatibility
    router.replace(url.pathname, { scroll: false });
  }, [router]);

  return {
    showCelebration,
    dismiss,
  };
}
