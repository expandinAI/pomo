/**
 * Trial Management for Particle Flow
 *
 * 14-day free trial of Flow features.
 *
 * @example
 * // Check trial status
 * const trial = useTrial();
 * if (trial.isActive) {
 *   // Show Flow features
 * }
 *
 * @example
 * // Start a trial
 * const { startTrial, isLoading } = useStartTrial();
 * await startTrial();
 */

// Service functions
export {
  TRIAL_DURATION_DAYS,
  TRIAL_EXPIRING_SOON_DAYS,
  type TrialStatus,
  calculateTrialStatus,
  getTrialDaysRemaining,
  calculateTrialEndDate,
  isTrialExpired,
} from './trial-service';

// React hooks
export {
  useTrial,
  useTrialExpiringSoon,
  useCanStartTrial,
  useStartTrial,
  useTrialExpirationCheck,
} from './hooks';
