'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import { useFeature, useHasAccount } from './hooks';
import { type TierFeature, FEATURE_INFO } from './config';
import { SPRING } from '@/styles/design-tokens';

interface FeatureGateProps {
  /** The feature to gate */
  feature: TierFeature;
  /** Content to show if feature is available */
  children: ReactNode;
  /** Custom fallback when feature is locked (defaults to UpgradePrompt) */
  fallback?: ReactNode;
  /** If true, renders nothing when locked (instead of fallback) */
  hideIfLocked?: boolean;
}

/**
 * Gate content based on tier feature access
 *
 * @example
 * // With default upgrade prompt
 * <FeatureGate feature="yearView">
 *   <YearViewContent />
 * </FeatureGate>
 *
 * @example
 * // With custom fallback
 * <FeatureGate feature="advancedStats" fallback={<BasicStats />}>
 *   <AdvancedStats />
 * </FeatureGate>
 *
 * @example
 * // Hide completely when locked
 * <FeatureGate feature="allThemes" hideIfLocked>
 *   <ThemeSelector />
 * </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  hideIfLocked = false,
}: FeatureGateProps) {
  const hasFeature = useFeature(feature);

  if (hasFeature) {
    return <>{children}</>;
  }

  if (hideIfLocked) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <UpgradePrompt feature={feature} />;
}

interface UpgradePromptProps {
  feature: TierFeature;
  /** Optional custom title */
  title?: string;
  /** Optional custom description */
  description?: string;
}

/**
 * Default upgrade prompt shown when a feature is locked
 *
 * Adapts messaging based on whether user has an account:
 * - No account: Encourages creating an account
 * - Free account: Encourages trying Flow
 */
export function UpgradePrompt({ feature, title, description }: UpgradePromptProps) {
  const hasAccount = useHasAccount();
  const featureInfo = FEATURE_INFO[feature];

  const displayTitle = title ?? featureInfo.name;
  const displayDescription = description ?? featureInfo.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', ...SPRING.gentle }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center mb-5">
        <Sparkles className="w-7 h-7 text-accent light:text-accent-dark" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-primary light:text-primary-dark mb-2">
        {displayTitle}
      </h3>

      {/* Description */}
      <p className="text-sm text-tertiary light:text-tertiary-dark mb-6 max-w-xs">
        {displayDescription}
      </p>

      {/* CTA */}
      {hasAccount ? (
        <FlowUpgradeButton />
      ) : (
        <CreateAccountButton />
      )}
    </motion.div>
  );
}

/**
 * Button prompting user to try Flow
 */
function FlowUpgradeButton() {
  const handleClick = () => {
    // Dispatch event to open upgrade modal (POMO-304 will implement)
    window.dispatchEvent(new CustomEvent('particle:open-upgrade'));
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent light:bg-accent-dark text-background light:text-background-dark text-sm font-medium transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <Sparkles className="w-4 h-4" />
      Try Flow for 14 days
    </button>
  );
}

/**
 * Button prompting user to create an account
 */
function CreateAccountButton() {
  const handleClick = () => {
    // Dispatch event to open auth modal
    window.dispatchEvent(new CustomEvent('particle:open-auth'));
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-tertiary/20 light:bg-tertiary-dark/20 text-primary light:text-primary-dark text-sm font-medium transition-all hover:bg-tertiary/30 light:hover:bg-tertiary-dark/30 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <User className="w-4 h-4" />
      Create free account
    </button>
  );
}
