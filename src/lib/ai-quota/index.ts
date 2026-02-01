/**
 * AI Quota Module
 *
 * Provides quota management for AI Coach queries.
 * Flow users get 300 queries per month with automatic reset.
 *
 * @example
 * // In a component
 * import { useAIQuota } from '@/lib/ai-quota';
 *
 * function CoachComponent() {
 *   const { quota, consumeQuery, isLoading } = useAIQuota();
 *
 *   const handleQuery = async () => {
 *     const allowed = await consumeQuery();
 *     if (allowed) {
 *       // Make the AI request
 *     }
 *   };
 * }
 *
 * @example
 * // In an API route
 * import { calculateQuotaStatus, needsMonthlyReset } from '@/lib/ai-quota';
 *
 * if (needsMonthlyReset(user.ai_queries_reset_at)) {
 *   // Reset the counter
 * }
 */

// Service functions
export {
  AI_QUERY_LIMIT,
  WARNING_THRESHOLD,
  WARNING_COUNT,
  calculateQuotaStatus,
  getMonthStart,
  getNextMonthStart,
  needsMonthlyReset,
  getDaysUntilReset,
  formatQuotaDisplay,
  getQuotaPercentage,
  type AIQuotaStatus,
} from './quota-service';

// React hooks
export { useAIQuota } from './hooks';
