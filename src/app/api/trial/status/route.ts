import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { isTrialExpired } from '@/lib/trial';

/**
 * GET /api/trial/status
 *
 * Returns the trial status from Supabase (source of truth).
 * Used by client to verify if trial has expired.
 */
export async function GET(): Promise<Response> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('tier, subscription_status, trial_started_at, trial_ends_at')
      .eq('clerk_id', userId)
      .single();

    if (fetchError || !userData) {
      // User doesn't exist in Supabase yet - no trial
      return NextResponse.json({
        hasUsedTrial: false,
        isExpired: false,
        trialEndsAt: null,
      });
    }

    const user = userData as {
      tier: string;
      subscription_status: string | null;
      trial_started_at: string | null;
      trial_ends_at: string | null;
    };

    const hasUsedTrial = !!user.trial_started_at;
    const isExpired = isTrialExpired(user.trial_ends_at, user.subscription_status);

    return NextResponse.json({
      hasUsedTrial,
      isExpired,
      trialEndsAt: user.trial_ends_at,
      tier: user.tier,
      subscriptionStatus: user.subscription_status,
    });
  } catch (error) {
    console.error('[Trial] Status error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
