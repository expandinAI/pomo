'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParticleAuth } from '@/lib/auth/hooks';
import { hasLocalData } from '@/lib/sync';

const STORAGE_KEY = 'particle:initial-sync-completed';
const SKIPPED_KEY = 'particle:initial-sync-skipped';

interface UseUpgradeFlowReturn {
  /** Whether the upgrade modal should be shown */
  showUpgradeModal: boolean;
  /** The user ID for the upgrade (Clerk user ID) */
  upgradeUserId: string | null;
  /** Mark upgrade as complete */
  completeUpgrade: () => void;
  /** Skip the upgrade for now */
  skipUpgrade: () => void;
  /** Force show the upgrade modal (for retrying after skip) */
  triggerUpgrade: () => void;
}

/**
 * Hook for managing the Local → Cloud upgrade flow
 *
 * Detects when a user has just signed in and has local data to sync.
 * Tracks whether the initial sync has been completed or skipped.
 *
 * Flow:
 * 1. User signs up/in (status changes from anonymous to authenticated)
 * 2. Hook checks if there's local data to sync
 * 3. If yes and not already synced/skipped, show upgrade modal
 * 4. After sync complete, mark as done
 */
export function useUpgradeFlow(): UseUpgradeFlowReturn {
  const auth = useParticleAuth();
  const [showModal, setShowModal] = useState(false);
  const [upgradeUserId, setUpgradeUserId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Check if we should show upgrade modal when auth state changes
  useEffect(() => {
    if (auth.status !== 'authenticated') {
      // Not logged in, nothing to do
      setShowModal(false);
      setUpgradeUserId(null);
      setHasChecked(false);
      return;
    }

    // Already checked this session
    if (hasChecked) return;

    // Extract userId from authenticated state
    const currentUserId = auth.userId;

    async function checkUpgradeNeeded() {
      try {
        // Check if already completed or skipped
        const completed = localStorage.getItem(STORAGE_KEY) === 'true';
        const skipped = localStorage.getItem(SKIPPED_KEY) === 'true';

        if (completed) {
          // Already synced, nothing to do
          setHasChecked(true);
          return;
        }

        // Check if there's local data to sync
        const hasData = await hasLocalData();

        if (!hasData) {
          // No local data, mark as complete (nothing to sync)
          localStorage.setItem(STORAGE_KEY, 'true');
          setHasChecked(true);
          return;
        }

        // User has local data and hasn't synced yet
        // Show modal unless they previously skipped
        if (!skipped) {
          setUpgradeUserId(currentUserId);
          setShowModal(true);
        }

        setHasChecked(true);
      } catch (err) {
        console.error('[useUpgradeFlow] Error checking upgrade status:', err);
        setHasChecked(true);
      }
    }

    checkUpgradeNeeded();
  }, [auth, hasChecked]);

  const completeUpgrade = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.removeItem(SKIPPED_KEY);
    setShowModal(false);
    setUpgradeUserId(null);
  }, []);

  const skipUpgrade = useCallback(() => {
    localStorage.setItem(SKIPPED_KEY, 'true');
    setShowModal(false);
    setUpgradeUserId(null);
  }, []);

  const triggerUpgrade = useCallback(() => {
    if (auth.status === 'authenticated') {
      localStorage.removeItem(SKIPPED_KEY);
      setUpgradeUserId(auth.userId);
      setShowModal(true);
    }
  }, [auth]);

  return {
    showUpgradeModal: showModal,
    upgradeUserId,
    completeUpgrade,
    skipUpgrade,
    triggerUpgrade,
  };
}
