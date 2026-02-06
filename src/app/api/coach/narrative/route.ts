import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { openrouter, COACH_MODEL } from '@/lib/openrouter';
import { WEEKLY_NARRATIVE_PROMPT } from '@/lib/coach/prompts';
import {
  AI_QUERY_LIMIT,
  needsMonthlyReset,
} from '@/lib/ai-quota/quota-service';
import type { WeekData } from '@/lib/coach/weekly-narrative';

interface NarrativeRequestBody {
  weekData: WeekData;
}

/**
 * POST /api/coach/narrative
 *
 * Generates an AI weekly narrative from week data.
 * Requires Flow subscription and counts against quota.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: NarrativeRequestBody = await request.json();
    const { weekData } = body;

    if (!weekData) {
      return NextResponse.json(
        { error: 'weekData is required' },
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
      console.error('[Coach Narrative] Failed to update quota:', updateError);
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error('[Coach Narrative] OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Generate narrative via AI
    const userMessage = WEEKLY_NARRATIVE_PROMPT.replace(
      '{weekData}',
      JSON.stringify(weekData, null, 2)
    );

    const completion = await openrouter.chat.completions.create({
      model: COACH_MODEL,
      max_tokens: 256,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You generate weekly narrative summaries for a focus app called Particle. Respond only in JSON.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || '';

    // Strip markdown wrappers if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as { narrative: string };

    if (!parsed.narrative || typeof parsed.narrative !== 'string') {
      return NextResponse.json(
        { error: 'Invalid AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ narrative: parsed.narrative });
  } catch (error) {
    console.error('[Coach Narrative] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service authentication failed' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
