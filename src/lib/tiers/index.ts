/**
 * Tier System for Particle
 *
 * This module provides feature gating and tier management.
 *
 * @example
 * // Check if feature is available
 * const hasYearView = useFeature('yearView');
 *
 * @example
 * // Gate a component
 * <FeatureGate feature="advancedStats">
 *   <FocusHeatmap />
 * </FeatureGate>
 *
 * @example
 * // Check limits
 * const maxProjects = useTierLimit('maxActiveProjects');
 */

// Types
export type {
  AuthMode,
  TierFeature,
  TierLimitKey,
  TierConfig,
} from './config';

// Config
export {
  LOCAL_CONFIG,
  FREE_CONFIG,
  FLOW_CONFIG,
  getTierConfig,
  TIER_NAMES,
  FEATURE_INFO,
} from './config';

// Hooks
export {
  useAuthMode,
  useFeature,
  useTierLimit,
  useTierConfig,
  useIsPremium,
  useHasAccount,
} from './hooks';

// Components
export { FeatureGate, UpgradePrompt } from './FeatureGate';
