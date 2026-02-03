/**
 * Account Deletion Service
 *
 * Handles the complete deletion of a user account:
 * 1. Cancel Stripe subscription (if any)
 * 2. Delete user from Supabase (CASCADE deletes sessions, projects, settings)
 * 3. Delete user from Clerk (triggers automatic logout)
 *
 * POMO-328
 */

import { clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

// Create Supabase admin client inline to avoid circular dependencies
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

/**
 * Delete a user account and all associated data
 *
 * @param clerkId - The Clerk user ID to delete
 * @returns Result object indicating success or failure
 *
 * Deletion order:
 * 1. Stripe subscription (cancel to stop billing)
 * 2. Supabase user (CASCADE handles related tables)
 * 3. Clerk user (triggers logout)
 */
export async function deleteAccount(clerkId: string): Promise<DeleteAccountResult> {
  console.log(`[Account Deletion] Starting deletion for user ${clerkId}`);

  try {
    // 1. Get user from Supabase
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, stripe_customer_id, subscription_id, is_lifetime')
      .eq('clerk_id', clerkId)
      .single();

    if (fetchError || !user) {
      console.error('[Account Deletion] User not found:', fetchError);
      return {
        success: false,
        error: 'User not found',
      };
    }

    console.log(`[Account Deletion] Found user ${user.id}, subscription: ${user.subscription_id}`);

    // 2. Cancel Stripe subscription (if exists and not lifetime)
    if (user.subscription_id && !user.is_lifetime) {
      try {
        await stripe.subscriptions.cancel(user.subscription_id);
        console.log(`[Account Deletion] Cancelled Stripe subscription ${user.subscription_id}`);
      } catch (stripeError) {
        // Log but don't fail - subscription might already be cancelled
        console.error('[Account Deletion] Failed to cancel Stripe subscription:', stripeError);
        // Continue with deletion anyway
      }
    }

    // 3. Delete user from Supabase
    // CASCADE will handle: sessions, projects, user_settings
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      console.error('[Account Deletion] Failed to delete from Supabase:', deleteError);
      return {
        success: false,
        error: 'Failed to delete user data',
      };
    }

    console.log(`[Account Deletion] Deleted user from Supabase`);

    // 4. Delete user from Clerk (this will sign them out automatically)
    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(clerkId);
      console.log(`[Account Deletion] Deleted user from Clerk`);
    } catch (clerkError) {
      // This is more serious - the user data is already gone but Clerk account remains
      console.error('[Account Deletion] Failed to delete from Clerk:', clerkError);
      return {
        success: false,
        error: 'Account data deleted but authentication cleanup failed. Please contact support.',
      };
    }

    console.log(`[Account Deletion] Successfully deleted account for ${clerkId}`);

    return { success: true };
  } catch (error) {
    console.error('[Account Deletion] Unexpected error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}
