import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { calculateTrialEndDate, TRIAL_DURATION_DAYS } from '@/lib/trial';
import type { User } from '@/lib/supabase/types';

/**
 * POST /api/trial/start
 *
 * Starts a 14-day Flow trial for the authenticated user.
 *
 * Updates both:
 * - Supabase: tier, subscription_status, trial_started_at, trial_ends_at
 * - Clerk: publicMetadata.tier, publicMetadata.trialStartedAt, publicMetadata.trialEndsAt
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

    // Check if user exists
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, tier, trial_started_at, trial_ends_at')
      .eq('clerk_id', userId);

    if (fetchError) {
      console.error('[Trial] User fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    let user: Pick<User, 'id' | 'tier' | 'trial_started_at' | 'trial_ends_at'>;

    if (!existingUsers || existingUsers.length === 0) {
      // User doesn't exist in Supabase - create them
      // This can happen if user signed up but hasn't synced yet
      const { data: newUsers, error: createError } = await supabase
        .from('users')
        .insert({ clerk_id: userId } as never)
        .select('id, tier, trial_started_at, trial_ends_at');

      if (createError || !newUsers || newUsers.length === 0) {
        console.error('[Trial] User create error:', createError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      user = newUsers[0] as Pick<User, 'id' | 'tier' | 'trial_started_at' | 'trial_ends_at'>;
    } else {
      user = existingUsers[0] as Pick<User, 'id' | 'tier' | 'trial_started_at' | 'trial_ends_at'>;
    }

    // Check if user has already used a trial
    if (user.trial_started_at) {
      return NextResponse.json(
        { error: 'You have already used your free trial' },
        { status: 400 }
      );
    }

    // Check if user already has Flow (paid)
    if (user.tier === 'flow' || user.tier === 'pro' || user.tier === 'lifetime') {
      return NextResponse.json(
        { error: 'You already have premium access' },
        { status: 400 }
      );
    }

    // Calculate trial dates
    const now = new Date();
    const trialStartedAt = now.toISOString();
    const trialEndsAt = calculateTrialEndDate(now);

    // Update Supabase
    // Note: The `as never` cast is required because service role bypasses RLS type inference
    const { error: updateError } = await supabase
      .from('users')
      .update({
        tier: 'flow',
        subscription_status: 'trialing',
        trial_started_at: trialStartedAt,
        trial_ends_at: trialEndsAt,
      } as never)
      .eq('id', user.id);

    if (updateError) {
      console.error('[Trial] Supabase update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to start trial' },
        { status: 500 }
      );
    }

    // Update Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        tier: 'flow',
        trialStartedAt,
        trialEndsAt,
      },
    });

    return NextResponse.json({
      success: true,
      trialEndsAt,
      daysRemaining: TRIAL_DURATION_DAYS,
    });
  } catch (error) {
    console.error('[Trial] Start error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
