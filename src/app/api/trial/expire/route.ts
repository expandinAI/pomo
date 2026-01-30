import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import type { User } from '@/lib/supabase/types';
import { isTrialExpired } from '@/lib/trial';

/**
 * POST /api/trial/expire
 *
 * Expires a user's trial and downgrades them to free tier.
 * Called by client-side check when trial has expired.
 *
 * Updates both:
 * - Supabase: tier → 'free', subscription_status → 'cancelled'
 * - Clerk: publicMetadata.tier → 'free'
 */
export async function POST(): Promise<Response> {
  try {
    // Verify authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get Supabase admin client
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get user's current trial status
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('id, tier, subscription_status, trial_ends_at')
      .eq('clerk_id', userId)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Type assertion for user data
    const user = userData as Pick<User, 'id' | 'tier' | 'subscription_status' | 'trial_ends_at'>;

    // Verify trial is actually expired
    if (!isTrialExpired(user.trial_ends_at, user.subscription_status)) {
      return NextResponse.json(
        { error: 'Trial is not expired' },
        { status: 400 }
      );
    }

    // Update Supabase - downgrade to free
    // Note: The `as never` cast is required because service role bypasses RLS type inference
    const { error: updateError } = await supabase
      .from('users')
      .update({
        tier: 'free',
        subscription_status: 'cancelled',
      } as never)
      .eq('id', user.id);

    if (updateError) {
      console.error('[Trial] Supabase expire error:', updateError);
      return NextResponse.json(
        { error: 'Failed to expire trial' },
        { status: 500 }
      );
    }

    // Update Clerk metadata - remove trial status
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        tier: 'free',
        // Keep trialStartedAt and trialEndsAt for history
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Trial expired, downgraded to free tier',
    });
  } catch (error) {
    console.error('[Trial] Expire error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
