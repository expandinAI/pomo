/**
 * Insight Generator for the Particle Coach
 *
 * Generates AI-powered insights based on user session data.
 * Uses OpenRouter with JSON response format for reliable parsing.
 *
 * NOTE: This file is SERVER-ONLY due to openrouter import.
 * For client-side type imports, use insight-types.ts instead.
 */

import { openrouter, COACH_MODEL } from '@/lib/openrouter';
import { buildSystemPrompt, getInsightPrompt } from './prompts';
import type { CoachContext } from './types';
import type { InsightType, GeneratedInsight } from './insight-types';

// Re-export types for convenience in server code
export type { InsightType, GeneratedInsight } from './insight-types';

/**
 * Raw response from the AI (before type addition)
 */
interface AIInsightResponse {
  title: string;
  content: string;
  highlights?: string[];
}

/**
 * Generate an insight using the AI
 *
 * @param type - Type of insight to generate
 * @param context - User's coach context with session data
 * @returns Generated insight with title, content, and optional highlights
 * @throws Error if AI generation fails or response is invalid
 */
export async function generateInsight(
  type: InsightType,
  context: CoachContext
): Promise<GeneratedInsight> {
  console.log('[InsightGenerator] Building prompts...');
  const systemPrompt = buildSystemPrompt(context);
  const insightPrompt = getInsightPrompt(type);

  console.log('[InsightGenerator] Calling OpenRouter...');
  const response = await openrouter.chat.completions.create({
    model: COACH_MODEL,
    max_tokens: 512,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `${insightPrompt}

Respond in JSON format:
{
  "title": "Short title (3-5 words)",
  "content": "Main insight text (2-4 sentences)",
  "highlights": ["Optional bullet 1", "Optional bullet 2"]
}`,
      },
    ],
  });

  console.log('[InsightGenerator] OpenRouter response received');
  let text = response.choices[0]?.message?.content;

  if (!text) {
    console.error('[InsightGenerator] No content in response');
    throw new Error('No response from AI');
  }

  // Strip markdown code block wrappers if present
  text = text.trim();
  if (text.startsWith('```json')) {
    text = text.slice(7); // Remove ```json
  } else if (text.startsWith('```')) {
    text = text.slice(3); // Remove ```
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3); // Remove trailing ```
  }
  text = text.trim();

  console.log('[InsightGenerator] Cleaned response:', text.substring(0, 200));

  let parsed: AIInsightResponse;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    console.error('[InsightGenerator] Failed to parse JSON:', e);
    console.error('[InsightGenerator] Text was:', text);
    throw new Error('Failed to parse AI response');
  }

  // Validate required fields
  if (!parsed.title || !parsed.content) {
    throw new Error('Invalid insight response: missing required fields');
  }

  return {
    type,
    title: parsed.title,
    content: parsed.content,
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : undefined,
  };
}
