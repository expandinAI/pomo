/**
 * Supabase Module
 *
 * Provides Supabase client, hooks, and types for the Particle app.
 *
 * @example
 * // In a component
 * import { useSupabase, useSupabaseUser } from '@/lib/supabase';
 *
 * function MyComponent() {
 *   const supabase = useSupabase();
 *   const { user, isLoading } = useSupabaseUser();
 *   // ...
 * }
 *
 * @example
 * // In an API route
 * import { createSupabaseAdminClient } from '@/lib/supabase';
 *
 * export async function POST(req: Request) {
 *   const supabase = createSupabaseAdminClient();
 *   // ...
 * }
 */

// Client
export {
  createSupabaseClient,
  createSupabaseAdminClient,
  isSupabaseConfigured,
} from './client';

// Hooks
export { useSupabase, useSupabaseUser, useSupabaseReady } from './hooks';

// Types
export type {
  Database,
  Json,
  User,
  UserInsert,
  UserUpdate,
  Session,
  SessionInsert,
  SessionUpdate,
  Project,
  ProjectInsert,
  ProjectUpdate,
  UserSettings,
  UserSettingsInsert,
  UserSettingsUpdate,
  UserTier,
  SubscriptionStatus,
  SessionMode,
  Theme,
} from './types';
