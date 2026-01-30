'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useMemo, useCallback } from 'react';

export type UserTier = 'free' | 'flow';

export type AuthState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; userId: string; email: string | null; tier: UserTier };

// Check if Clerk is configured
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Custom auth hook for Particle
 * Returns the current authentication state with user info
 * Returns anonymous if Clerk is not configured
 */
export function useParticleAuth(): AuthState {
  // These hooks are safe to call even without ClerkProvider - they will return defaults
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  return useMemo(() => {
    // If Clerk is not configured, always return anonymous
    if (!isClerkConfigured) {
      return { status: 'anonymous' };
    }

    if (!isLoaded) {
      return { status: 'loading' };
    }

    if (!isSignedIn || !user || !userId) {
      return { status: 'anonymous' };
    }

    const tier = (user.publicMetadata?.tier as UserTier) || 'free';

    return {
      status: 'authenticated',
      userId,
      email: user.primaryEmailAddress?.emailAddress || null,
      tier,
    };
  }, [isLoaded, isSignedIn, user, userId]);
}

/**
 * Simple boolean check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const auth = useParticleAuth();
  return auth.status === 'authenticated';
}

/**
 * Get Supabase JWT token from Clerk
 * Used for authenticated Supabase requests (POMO-301)
 * Returns null if Clerk is not configured
 */
export function useSupabaseToken(): () => Promise<string | null> {
  const { getToken } = useAuth();

  return useCallback(async () => {
    if (!isClerkConfigured) {
      return null;
    }
    return getToken({ template: 'supabase' });
  }, [getToken]);
}
