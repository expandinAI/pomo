/**
 * AI Coach Library
 *
 * Provides the foundation for the Particle Coach including:
 * - Type definitions
 * - Prompt templates
 * - Context building from session data
 * - Pattern detection algorithms
 */

// Types
export type {
  CoachContext,
  SessionSummary,
  ProjectBreakdown,
  DetectedPattern,
  PatternType,
  RecentActivity,
  ChatRequest,
  InsightRequest,
  IntentionContext,
} from './types';

// Context Builder
export { buildCoachContext, formatContextForPrompt } from './context-builder';

// Prompts
export {
  COACH_SYSTEM_PROMPT,
  buildSystemPrompt,
  getInsightPrompt,
  INSIGHT_PROMPTS,
  EVENING_INSIGHT_PROMPT,
  EXAMPLE_INTERACTIONS,
} from './prompts';

// Pattern Detection
export {
  detectTimeOfDayPattern,
  detectDayOfWeekPattern,
  detectProjectFocusPattern,
  detectSessionLengthPattern,
  detectAllPatterns,
} from './patterns';

// Insight Types (client-safe)
export type { GeneratedInsight, InsightType } from './insight-types';

// Insight Generation (server-only - do not import on client)
// Use: import { generateInsight } from '@/lib/coach/insight-generator'
// in API routes only
