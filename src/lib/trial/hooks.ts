'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParticleAuth } from '@/lib/auth';
import {
  type TrialStatus,
  calculateTrialStatus,
} from './trial-service';

/**
 * Hook to get current trial status
 *
 * Reads from Clerk publicMetadata for fast client-side access.
 * No network request needed - data is already available from auth state.
 *
 * @returns TrialStatus object
 */
export function useTrial(): TrialStatus {
  const { user, isLoaded } = useUser();

  return useMemo(() => {
    // Return default while loading
    if (!isLoaded || !user) {
      return {
        isActive: false,
        hasUsed: false,
        daysRemaining: 0,
        endsAt: null,
        isExpiringSoon: false,
      };
    }

    const metadata = user.publicMetadata as {
      tier?: string;
      trialStartedAt?: string;
      trialEndsAt?: string;
      subscriptionStatus?: string;
    };

    // If user has active subscription, they're not trialing
    if (metadata.subscriptionStatus === 'active') {
      return {
        isActive: false,
        hasUsed: true,
        daysRemaining: 0,
        endsAt: null,
        isExpiringSoon: false,
      };
    }

    // If no trial data in metadata, user hasn't trialed
    if (!metadata.trialEndsAt) {
      return {
        isActive: false,
        hasUsed: !!metadata.trialStartedAt, // Started but no end = error state, treat as used
        daysRemaining: 0,
        endsAt: null,
        isExpiringSoon: false,
      };
    }

    // Calculate status based on metadata
    // User is trialing if tier is 'flow' and they have a trial end date
    const isTrialing = metadata.tier === 'flow' && !!metadata.trialEndsAt;

    return calculateTrialStatus(
      metadata.trialEndsAt,
      isTrialing ? 'trialing' : 'active'
    );
  }, [isLoaded, user]);
}

/**
 * Hook to check if trial is expiring soon
 *
 * @returns boolean - true if trial is active and expiring within 3 days
 */
export function useTrialExpiringSoon(): boolean {
  const trial = useTrial();
  return trial.isExpiringSoon;
}

/**
 * Hook to check if user can start a trial
 *
 * @returns boolean - true if user is authenticated and hasn't used trial
 */
export function useCanStartTrial(): boolean {
  const auth = useParticleAuth();
  const trial = useTrial();

  return auth.status === 'authenticated' && !trial.hasUsed;
}

interface UseStartTrialResult {
  /** Function to start the trial */
  startTrial: () => Promise<void>;
  /** Whether trial start is in progress */
  isLoading: boolean;
  /** Error message if trial start failed */
  error: string | null;
  /** Whether trial start succeeded */
  success: boolean;
}

/**
 * Hook to start a Flow trial
 *
 * Calls the API route which updates both Supabase and Clerk.
 */
export function useStartTrial(): UseStartTrialResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useUser();

  const startTrial = useCallback(async () => {
    if (!user) {
      setError('You must be signed in to start a trial');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start trial');
      }

      // Reload user to get updated metadata
      await user.reload();

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start trial');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { startTrial, isLoading, error, success };
}

/**
 * Hook to check and handle expired trials
 *
 * On mount, fetches trial status from Supabase (source of truth) and
 * expires the trial if needed. This ensures Clerk metadata stays in sync.
 */
export function useTrialExpirationCheck(): void {
  const auth = useParticleAuth();
  const { user } = useUser();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once per session, and only for authenticated users
    if (auth.status !== 'authenticated' || hasChecked) {
      return;
    }

    const checkAndExpireTrial = async () => {
      try {
        // Fetch trial status from Supabase (source of truth)
        const statusResponse = await fetch('/api/trial/status');

        if (!statusResponse.ok) {
          setHasChecked(true);
          return;
        }

        const status = await statusResponse.json();

        // If trial has expired according to Supabase, call expire API
        if (status.isExpired) {
          const expireResponse = await fetch('/api/trial/expire', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (expireResponse.ok) {
            // Reload user to get updated metadata
            await user?.reload();
          }
        }
      } catch (error) {
        console.error('[Trial] Failed to check trial status:', error);
      } finally {
        setHasChecked(true);
      }
    };

    checkAndExpireTrial();
  }, [auth.status, hasChecked, user]);
}
