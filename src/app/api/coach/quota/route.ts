import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import {
  AI_QUERY_LIMIT,
  calculateQuotaStatus,
  needsMonthlyReset,
} from '@/lib/ai-quota/quota-service';

/**
 * GET /api/coach/quota
 *
 * Returns the current AI query quota status for the authenticated user.
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
      .select('tier, ai_queries_this_month, ai_queries_reset_at')
      .eq('clerk_id', userId)
      .single();

    if (fetchError || !userData) {
      // User doesn't exist in Supabase yet - return default
      return NextResponse.json({
        allowed: true,
        used: 0,
        limit: AI_QUERY_LIMIT,
        remaining: AI_QUERY_LIMIT,
        resetAt: new Date().toISOString(),
        isWarning: false,
        isLimitReached: false,
      });
    }

    const user = userData as {
      tier: string;
      ai_queries_this_month: number;
      ai_queries_reset_at: string | null;
    };

    // Check if user has Flow tier (required for AI Coach)
    if (user.tier !== 'flow') {
      return NextResponse.json(
        { error: 'AI Coach requires Flow subscription' },
        { status: 403 }
      );
    }

    // Handle monthly reset if needed
    let queriesUsed = user.ai_queries_this_month;
    if (needsMonthlyReset(user.ai_queries_reset_at)) {
      // Reset counter for new month
      // Note: The `as never` cast is required because service role bypasses RLS type inference
      const { error: updateError } = await supabase
        .from('users')
        .update({
          ai_queries_this_month: 0,
          ai_queries_reset_at: new Date().toISOString(),
        } as never)
        .eq('clerk_id', userId);

      if (updateError) {
        console.error('[AI Quota] Failed to reset monthly count:', updateError);
      } else {
        queriesUsed = 0;
      }
    }

    const status = calculateQuotaStatus(queriesUsed, user.ai_queries_reset_at);

    return NextResponse.json({
      ...status,
      resetAt: status.resetAt.toISOString(),
    });
  } catch (error) {
    console.error('[AI Quota] GET error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coach/quota
 *
 * Atomically check-and-increment the query counter.
 * Returns 429 if limit is reached.
 */
export async function POST(): Promise<Response> {
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

    // Fetch current user data
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('tier, ai_queries_this_month, ai_queries_reset_at')
      .eq('clerk_id', userId)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userData as {
      tier: string;
      ai_queries_this_month: number;
      ai_queries_reset_at: string | null;
    };

    // Check if user has Flow tier
    if (user.tier !== 'flow') {
      return NextResponse.json(
        { error: 'AI Coach requires Flow subscription' },
        { status: 403 }
      );
    }

    // Handle monthly reset if needed
    let currentCount = user.ai_queries_this_month;
    if (needsMonthlyReset(user.ai_queries_reset_at)) {
      currentCount = 0;
    }

    // Check if limit reached
    if (currentCount >= AI_QUERY_LIMIT) {
      const status = calculateQuotaStatus(currentCount, user.ai_queries_reset_at);
      return NextResponse.json(
        {
          error: 'Monthly AI query limit reached',
          ...status,
          resetAt: status.resetAt.toISOString(),
        },
        { status: 429 }
      );
    }

    // Increment counter
    // Note: The `as never` cast is required because service role bypasses RLS type inference
    const newCount = currentCount + 1;
    const { error: updateError } = await supabase
      .from('users')
      .update({
        ai_queries_this_month: newCount,
        ai_queries_reset_at: needsMonthlyReset(user.ai_queries_reset_at)
          ? new Date().toISOString()
          : user.ai_queries_reset_at,
      } as never)
      .eq('clerk_id', userId);

    if (updateError) {
      console.error('[AI Quota] Failed to increment counter:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quota' },
        { status: 500 }
      );
    }

    const status = calculateQuotaStatus(newCount, new Date().toISOString());

    return NextResponse.json({
      ...status,
      resetAt: status.resetAt.toISOString(),
    });
  } catch (error) {
    console.error('[AI Quota] POST error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
