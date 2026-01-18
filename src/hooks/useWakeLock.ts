'use client';

import { useCallback, useRef, useEffect } from 'react';

interface UseWakeLockReturn {
  request: () => Promise<boolean>;
  release: () => Promise<void>;
  isSupported: boolean;
  isActive: boolean;
}

/**
 * Hook for managing the Screen Wake Lock API
 * Prevents the screen from sleeping during active timer sessions
 */
export function useWakeLock(): UseWakeLockReturn {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isActiveRef = useRef(false);

  // Check if Wake Lock API is supported
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  // Request wake lock
  const request = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    // Already have an active lock
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      return true;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      isActiveRef.current = true;

      // Handle release event (e.g., when tab becomes hidden)
      wakeLockRef.current.addEventListener('release', () => {
        isActiveRef.current = false;
      });

      return true;
    } catch {
      // Wake lock request failed (user denied, low battery, etc.)
      isActiveRef.current = false;
      return false;
    }
  }, [isSupported]);

  // Release wake lock
  const release = useCallback(async (): Promise<void> => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignore release errors
      }
      wakeLockRef.current = null;
      isActiveRef.current = false;
    }
  }, []);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActiveRef.current) {
        // Page became visible and we had an active lock - try to re-acquire
        if (wakeLockRef.current?.released) {
          await request();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSupported, request]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current && !wakeLockRef.current.released) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  return {
    request,
    release,
    isSupported,
    isActive: isActiveRef.current,
  };
}
