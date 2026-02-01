/**
 * OpenRouter Client Configuration
 *
 * Uses the OpenAI SDK with OpenRouter's API endpoint.
 * OpenRouter provides access to various AI models including Claude.
 */

import OpenAI from 'openai';

/**
 * OpenRouter client instance
 *
 * Configured to use OpenRouter's API with appropriate headers.
 * The API key is expected in OPENROUTER_API_KEY environment variable.
 */
export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://particle.app',
    'X-Title': 'Particle Coach',
  },
});

/**
 * Default model for the AI Coach
 *
 * Can be overridden via OPENROUTER_MODEL environment variable.
 * Claude Haiku 4.5 is the default (fast and cost-effective).
 */
export const COACH_MODEL =
  process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
