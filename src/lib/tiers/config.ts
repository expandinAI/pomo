/**
 * Tier Configuration for Particle
 *
 * Defines features and limits for each auth mode:
 * - 'local': No account, local-only (no sync)
 * - 'free': Free Particle account (basic sync)
 * - 'flow': Flow subscription (all features)
 */

/** Auth modes determine feature access */
export type AuthMode = 'local' | 'free' | 'flow';

/** Features that can be gated by tier */
export type TierFeature =
  | 'sync' // Cloud sync of particles
  | 'yearView' // Year grid visualization
  | 'advancedStats' // Focus heatmap, advanced analytics
  | 'unlimitedProjects' // No project limit
  | 'allAmbientSounds' // Premium ambient sounds
  | 'allThemes'; // Premium themes

/** Limits that vary by tier */
export type TierLimitKey =
  | 'maxActiveProjects'
  | 'maxPresets'
  | 'historyDays'; // How far back history is available

/** Configuration for a tier */
export interface TierConfig {
  mode: AuthMode;
  features: Record<TierFeature, boolean>;
  limits: Record<TierLimitKey, number | 'unlimited'>;
}

/** Local mode - no account, local storage only */
export const LOCAL_CONFIG: TierConfig = {
  mode: 'local',
  features: {
    sync: false,
    yearView: false,
    advancedStats: false,
    unlimitedProjects: false,
    allAmbientSounds: false,
    allThemes: false,
  },
  limits: {
    maxActiveProjects: 3,
    maxPresets: 4,
    historyDays: 30,
  },
};

/** Free tier - Particle account, basic features */
export const FREE_CONFIG: TierConfig = {
  mode: 'free',
  features: {
    sync: true,
    yearView: false,
    advancedStats: false,
    unlimitedProjects: false,
    allAmbientSounds: false,
    allThemes: false,
  },
  limits: {
    maxActiveProjects: 5,
    maxPresets: 4,
    historyDays: 90,
  },
};

/** Flow tier - full premium access */
export const FLOW_CONFIG: TierConfig = {
  mode: 'flow',
  features: {
    sync: true,
    yearView: true,
    advancedStats: true,
    unlimitedProjects: true,
    allAmbientSounds: true,
    allThemes: true,
  },
  limits: {
    maxActiveProjects: 'unlimited',
    maxPresets: 'unlimited',
    historyDays: 'unlimited',
  },
};

/** Get tier config by auth mode */
export function getTierConfig(mode: AuthMode): TierConfig {
  switch (mode) {
    case 'flow':
      return FLOW_CONFIG;
    case 'free':
      return FREE_CONFIG;
    default:
      return LOCAL_CONFIG;
  }
}

/** Human-readable tier names */
export const TIER_NAMES: Record<AuthMode, string> = {
  local: 'Local',
  free: 'Particle',
  flow: 'Flow',
};

/** Feature descriptions for upgrade prompts */
export const FEATURE_INFO: Record<TierFeature, { name: string; description: string }> = {
  sync: {
    name: 'Cloud Sync',
    description: 'Sync particles across devices',
  },
  yearView: {
    name: 'Year View',
    description: 'Visualize your year in particles',
  },
  advancedStats: {
    name: 'Advanced Stats',
    description: 'Discover your focus patterns',
  },
  unlimitedProjects: {
    name: 'Unlimited Projects',
    description: 'Create as many projects as you need',
  },
  allAmbientSounds: {
    name: 'Premium Sounds',
    description: 'Access all ambient soundscapes',
  },
  allThemes: {
    name: 'Premium Themes',
    description: 'Customize with exclusive themes',
  },
};
