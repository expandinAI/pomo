/**
 * Supabase React Hooks
 *
 * Provides authenticated Supabase access in React components
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient, isSupabaseConfigured } from './client';
import type { Database, User, UserInsert } from './types';

/**
 * Hook to get an authenticated Supabase client
 *
 * Returns null if:
 * - User is not authenticated
 * - Supabase is not configured
 * - Token is not yet available
 *
 * @example
 * const supabase = useSupabase();
 *
 * useEffect(() => {
 *   if (!supabase) return;
 *   supabase.from('sessions').select('*').then(console.log);
 * }, [supabase]);
 */
export function useSupabase(): SupabaseClient<Database> | null {
  const { getToken, isSignedIn } = useAuth();
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !isSignedIn) {
      setClient(null);
      return;
    }

    let mounted = true;

    async function initClient() {
      try {
        // Get Clerk token for Supabase
        // Note: Configure 'supabase' JWT template in Clerk dashboard
        const token = await getToken({ template: 'supabase' });

        if (mounted && token) {
          const supabaseClient = createSupabaseClient(token);
          setClient(supabaseClient);
        }
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        if (mounted) {
          setClient(null);
        }
      }
    }

    initClient();

    return () => {
      mounted = false;
    };
  }, [getToken, isSignedIn]);

  return client;
}

/**
 * Hook to get and manage the current user in Supabase
 *
 * Automatically creates the user record on first access if it doesn't exist.
 * Returns the user from the Supabase users table.
 *
 * @example
 * const { user, isLoading, error } = useSupabaseUser();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * if (user) return <Dashboard tier={user.tier} />;
 */
export function useSupabaseUser() {
  const supabase = useSupabase();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrCreateUser = useCallback(async () => {
    if (!supabase || !clerkUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (user doesn't exist)
        throw fetchError;
      }

      if (existingUser) {
        setUser(existingUser);
      } else {
        // User doesn't exist, create them
        // Note: This requires the "Service role can insert users" RLS policy
        // The type assertion is needed because RLS makes the insert type `never`
        const newUserData = {
          clerk_id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
        } satisfies UserInsert;

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert(newUserData as never)
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setUser(newUser as User);
      }
    } catch (err) {
      console.error('Failed to fetch/create Supabase user:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, clerkUser]);

  useEffect(() => {
    if (!isClerkLoaded) return;
    fetchOrCreateUser();
  }, [isClerkLoaded, fetchOrCreateUser]);

  return {
    user,
    isLoading: !isClerkLoaded || isLoading,
    error,
    refetch: fetchOrCreateUser,
  };
}

/**
 * Hook to check if Supabase sync is available
 *
 * Returns true only when:
 * - Supabase is configured
 * - User is authenticated
 * - Supabase client is initialized
 */
export function useSupabaseReady(): boolean {
  const supabase = useSupabase();
  const { isSignedIn } = useAuth();

  return isSupabaseConfigured && !!isSignedIn && !!supabase;
}
