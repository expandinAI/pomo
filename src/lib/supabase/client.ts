/**
 * Supabase Client
 *
 * Creates Supabase client instances for browser and server use.
 * Supports authentication via Clerk JWT tokens.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Check if Supabase is configured
 * Returns false if environment variables are missing
 */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Create a Supabase client with optional authentication
 *
 * @param token - Clerk JWT token for authenticated requests
 * @returns Supabase client or null if not configured
 *
 * @example
 * // Anonymous client (limited access via RLS)
 * const client = createSupabaseClient();
 *
 * @example
 * // Authenticated client
 * const { getToken } = useAuth();
 * const token = await getToken({ template: 'supabase' });
 * const client = createSupabaseClient(token);
 */
export function createSupabaseClient(
  token?: string | null
): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  const options: Parameters<typeof createClient>[2] = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  };

  // Add authorization header if token provided
  if (token) {
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, options);
}

/**
 * Create a Supabase client for server-side operations
 * Uses the service role key for admin access (bypasses RLS)
 *
 * WARNING: Only use in server-side code (API routes, server components)
 * Never expose the service role key to the client
 *
 * @returns Supabase admin client or null if not configured
 */
export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
