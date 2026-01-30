'use client';

import { useMemo } from 'react';
import { useParticleAuth } from '@/lib/auth';
import {
  type AuthMode,
  type TierFeature,
  type TierLimitKey,
  type TierConfig,
  getTierConfig,
} from './config';

/**
 * Get the current auth mode based on authentication state
 *
 * @returns 'local' | 'free' | 'flow'
 *
 * - 'local': Not signed in
 * - 'free': Signed in, free tier
 * - 'flow': Signed in, flow subscription
 */
export function useAuthMode(): AuthMode {
  const auth = useParticleAuth();

  return useMemo(() => {
    if (auth.status !== 'authenticated') {
      return 'local';
    }
    // Map Clerk tier to auth mode
    return auth.tier === 'flow' ? 'flow' : 'free';
  }, [auth]);
}

/**
 * Check if a specific feature is available for the current tier
 *
 * @param feature - The feature to check
 * @returns boolean - true if feature is available
 *
 * @example
 * const hasYearView = useFeature('yearView');
 * if (hasYearView) {
 *   // Render year view
 * }
 */
export function useFeature(feature: TierFeature): boolean {
  const mode = useAuthMode();

  return useMemo(() => {
    const config = getTierConfig(mode);
    return config.features[feature];
  }, [mode, feature]);
}

/**
 * Get a limit value for the current tier
 *
 * @param limitKey - The limit to check
 * @returns number | 'unlimited'
 *
 * @example
 * const maxProjects = useTierLimit('maxActiveProjects');
 * if (maxProjects !== 'unlimited' && projectCount >= maxProjects) {
 *   // Show limit reached message
 * }
 */
export function useTierLimit(limitKey: TierLimitKey): number | 'unlimited' {
  const mode = useAuthMode();

  return useMemo(() => {
    const config = getTierConfig(mode);
    return config.limits[limitKey];
  }, [mode, limitKey]);
}

/**
 * Get the full tier configuration for the current auth mode
 *
 * @returns TierConfig - Full configuration object
 *
 * Useful when you need to check multiple features/limits at once
 */
export function useTierConfig(): TierConfig {
  const mode = useAuthMode();

  return useMemo(() => {
    return getTierConfig(mode);
  }, [mode]);
}

/**
 * Check if user has premium (Flow) subscription
 *
 * @returns boolean - true if user is Flow subscriber
 *
 * @example
 * const isPremium = useIsPremium();
 * {isPremium && <PremiumBadge />}
 */
export function useIsPremium(): boolean {
  const mode = useAuthMode();
  return mode === 'flow';
}

/**
 * Check if user has an account (not local mode)
 *
 * @returns boolean - true if user is signed in
 */
export function useHasAccount(): boolean {
  const mode = useAuthMode();
  return mode !== 'local';
}
