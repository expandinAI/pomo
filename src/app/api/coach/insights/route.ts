import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { generateInsight } from '@/lib/coach/insight-generator';
import type { InsightType } from '@/lib/coach/insight-types';
import {
  AI_QUERY_LIMIT,
  needsMonthlyReset,
} from '@/lib/ai-quota/quota-service';
import type { CoachContext } from '@/lib/coach/types';

/**
 * Insight request body
 */
interface InsightRequestBody {
  type: InsightType;
  context: CoachContext;
}

/**
 * POST /api/coach/insights
 *
 * Generates an AI insight based on user context.
 * Requires Flow subscription and counts against quota.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: InsightRequestBody = await request.json();
    const { type, context } = body;

    // Validate insight type
    const validTypes: InsightType[] = ['daily', 'weekly', 'pattern', 'session'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid insight type' },
        { status: 400 }
      );
    }

    if (!context) {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      );
    }

    // Check user has Flow tier and quota
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userData as {
      tier: string;
      ai_queries_this_month: number;
      ai_queries_reset_at: string | null;
    };

    // Check Flow tier
    if (user.tier !== 'flow') {
      return NextResponse.json(
        { error: 'AI Coach requires Flow subscription' },
        { status: 403 }
      );
    }

    // Check and update quota
    let currentCount = user.ai_queries_this_month;
    const shouldReset = needsMonthlyReset(user.ai_queries_reset_at);

    if (shouldReset) {
      currentCount = 0;
    }

    if (currentCount >= AI_QUERY_LIMIT) {
      return NextResponse.json(
        { error: 'Monthly AI query limit reached' },
        { status: 429 }
      );
    }

    // Increment quota counter
    const newCount = currentCount + 1;
    const { error: updateError } = await supabase
      .from('users')
      .update({
        ai_queries_this_month: newCount,
        ai_queries_reset_at: shouldReset
          ? new Date().toISOString()
          : user.ai_queries_reset_at,
      } as never)
      .eq('clerk_id', userId);

    if (updateError) {
      console.error('[Coach Insights] Failed to update quota:', updateError);
      // Continue anyway - don't block the user for a quota tracking issue
    }

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('[Coach Insights] OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    console.log('[Coach Insights] Generating insight for user:', userId);
    console.log('[Coach Insights] Context summary:', {
      totalParticles: context.sessionSummary?.totalParticles,
      todayParticles: context.sessionSummary?.todayParticles,
    });

    // Generate the insight
    const insight = await generateInsight(type, context);

    console.log('[Coach Insights] Generated successfully:', insight.title);
    return NextResponse.json({ insight });
  } catch (error) {
    console.error('[Coach Insights] Error:', error);
    console.error('[Coach Insights] Error stack:', error instanceof Error ? error.stack : 'No stack');

    // Handle OpenRouter specific errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service authentication failed' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (
        error.message.includes('parse') ||
        error.message.includes('Invalid insight')
      ) {
        return NextResponse.json(
          { error: 'Failed to generate insight. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
