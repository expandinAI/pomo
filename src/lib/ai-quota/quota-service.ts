/**
 * AI Quota Service for Particle
 *
 * Handles AI Coach query limits and monthly resets.
 * Flow users get 300 queries per month with automatic reset.
 */

/** Maximum AI queries per month for Flow users */
export const AI_QUERY_LIMIT = 300;

/** Threshold percentage at which to show warning (90%) */
export const WARNING_THRESHOLD = 0.9;

/** Warning is shown when usage reaches this count */
export const WARNING_COUNT = Math.floor(AI_QUERY_LIMIT * WARNING_THRESHOLD);

/**
 * AI Quota status information
 */
export interface AIQuotaStatus {
  /** Whether the user can make another query */
  allowed: boolean;
  /** Number of queries used this month */
  used: number;
  /** Maximum queries allowed per month */
  limit: number;
  /** Remaining queries this month */
  remaining: number;
  /** Date when the quota resets */
  resetAt: Date;
  /** Whether usage is at warning level (>= 90%) */
  isWarning: boolean;
  /** Whether limit has been reached */
  isLimitReached: boolean;
}

/**
 * Calculate quota status from usage data
 *
 * @param used - Number of queries used this month
 * @param resetAt - ISO date string when quota was last reset (or null)
 * @returns AIQuotaStatus object
 */
export function calculateQuotaStatus(
  used: number,
  resetAt: string | null
): AIQuotaStatus {
  const remaining = Math.max(0, AI_QUERY_LIMIT - used);
  const isLimitReached = used >= AI_QUERY_LIMIT;
  const isWarning = used >= WARNING_COUNT && !isLimitReached;

  return {
    allowed: !isLimitReached,
    used,
    limit: AI_QUERY_LIMIT,
    remaining,
    resetAt: getNextMonthStart(),
    isWarning,
    isLimitReached,
  };
}

/**
 * Get the start of the current month (UTC)
 *
 * @returns Date object for the first day of current month at 00:00:00 UTC
 */
export function getMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
}

/**
 * Get the start of the next month (UTC)
 *
 * @returns Date object for the first day of next month at 00:00:00 UTC
 */
export function getNextMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}

/**
 * Check if the quota needs to be reset for a new month
 *
 * @param resetAt - ISO date string when quota was last reset (or null)
 * @returns true if the reset date is before the current month start
 */
export function needsMonthlyReset(resetAt: string | null): boolean {
  // If never reset, definitely needs reset
  if (!resetAt) return true;

  const resetDate = new Date(resetAt);
  const monthStart = getMonthStart();

  // Reset needed if the last reset was before the current month started
  return resetDate < monthStart;
}

/**
 * Calculate days until the quota resets
 *
 * @returns Number of days until the first of next month
 */
export function getDaysUntilReset(): number {
  const now = new Date();
  const nextMonth = getNextMonthStart();
  const diffMs = nextMonth.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format remaining quota for display
 *
 * @param status - AIQuotaStatus object
 * @returns Formatted string like "247/300"
 */
export function formatQuotaDisplay(status: AIQuotaStatus): string {
  return `${status.used}/${status.limit}`;
}

/**
 * Get quota percentage used (0-100)
 *
 * @param status - AIQuotaStatus object
 * @returns Percentage of quota used
 */
export function getQuotaPercentage(status: AIQuotaStatus): number {
  return Math.min(100, Math.round((status.used / status.limit) * 100));
}
