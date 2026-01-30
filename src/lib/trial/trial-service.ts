/**
 * Trial Service for Particle Flow
 *
 * Handles trial status calculation and validation.
 * The 14-day trial gives users full access to Flow features.
 */

/** Trial duration in days */
export const TRIAL_DURATION_DAYS = 14;

/** Days remaining when trial is considered "expiring soon" */
export const TRIAL_EXPIRING_SOON_DAYS = 3;

/**
 * Trial status information
 */
export interface TrialStatus {
  /** Whether user has an active trial right now */
  isActive: boolean;
  /** Whether user has ever started a trial (can't trial again) */
  hasUsed: boolean;
  /** Days remaining in trial (0 if expired or not started) */
  daysRemaining: number;
  /** ISO date when trial ends (null if never trialed) */
  endsAt: string | null;
  /** Whether trial is expiring within TRIAL_EXPIRING_SOON_DAYS */
  isExpiringSoon: boolean;
}

/**
 * Calculate trial status from trial end date and subscription status
 *
 * @param trialEndsAt - ISO date string when trial ends (or null)
 * @param subscriptionStatus - Current subscription status from database
 * @returns TrialStatus object
 */
export function calculateTrialStatus(
  trialEndsAt: string | null,
  subscriptionStatus: string | null
): TrialStatus {
  // Never started a trial
  if (!trialEndsAt) {
    return {
      isActive: false,
      hasUsed: false,
      daysRemaining: 0,
      endsAt: null,
      isExpiringSoon: false,
    };
  }

  const now = new Date();
  const endDate = new Date(trialEndsAt);
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Trial has been used (whether active or expired)
  const hasUsed = true;

  // Active only if status is 'trialing' AND not expired
  const isActive = subscriptionStatus === 'trialing' && daysRemaining > 0;

  // Expiring soon if active and <= 3 days remaining
  const isExpiringSoon = isActive && daysRemaining <= TRIAL_EXPIRING_SOON_DAYS;

  return {
    isActive,
    hasUsed,
    daysRemaining,
    endsAt: trialEndsAt,
    isExpiringSoon,
  };
}

/**
 * Get days remaining in trial
 *
 * @param trialEndsAt - ISO date string when trial ends (or null)
 * @returns Number of days remaining (0 if expired or not started)
 */
export function getTrialDaysRemaining(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;

  const now = new Date();
  const endDate = new Date(trialEndsAt);
  return Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
}

/**
 * Calculate trial end date from start date
 *
 * @param startDate - Date when trial starts (defaults to now)
 * @returns ISO date string for trial end
 */
export function calculateTrialEndDate(startDate: Date = new Date()): string {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);
  return endDate.toISOString();
}

/**
 * Check if a trial has expired
 *
 * @param trialEndsAt - ISO date string when trial ends
 * @param subscriptionStatus - Current subscription status
 * @returns true if trial has expired and user should be downgraded
 */
export function isTrialExpired(
  trialEndsAt: string | null,
  subscriptionStatus: string | null
): boolean {
  if (!trialEndsAt || subscriptionStatus !== 'trialing') {
    return false;
  }

  const now = new Date();
  const endDate = new Date(trialEndsAt);
  return now > endDate;
}
