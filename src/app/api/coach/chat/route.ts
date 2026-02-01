import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import { openrouter, COACH_MODEL } from '@/lib/openrouter';
import { buildSystemPrompt } from '@/lib/coach/prompts';
import {
  AI_QUERY_LIMIT,
  needsMonthlyReset,
} from '@/lib/ai-quota/quota-service';
import type { CoachContext } from '@/lib/coach/types';

/**
 * Chat request body
 */
interface ChatRequestBody {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  context: CoachContext;
}

/**
 * POST /api/coach/chat
 *
 * Handles chat messages with the AI Coach.
 * Returns a streaming response from the AI.
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: ChatRequestBody = await request.json();
    const { message, history, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
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
      console.error('[Coach Chat] Failed to update quota:', updateError);
      // Continue anyway - don't block the user for a quota tracking issue
    }

    // Build the system prompt with context
    const systemPrompt = buildSystemPrompt(context);

    // Prepare messages for OpenRouter
    // Limit history to last 10 messages to control costs
    // (Long conversations can accumulate thousands of tokens)
    const MAX_HISTORY_MESSAGES = 10;
    const recentHistory = (history || []).slice(-MAX_HISTORY_MESSAGES);

    const apiHistory = recentHistory.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    }));

    // Check if OpenRouter API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Create streaming response
    const stream = await openrouter.chat.completions.create({
      model: COACH_MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...apiHistory,
        { role: 'user', content: message },
      ],
    });

    // Create a ReadableStream to return the response
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          console.error('[Coach Chat] Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Coach Chat] Error:', error);

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
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
