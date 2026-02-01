'use client';

import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { useAIQuota, getDaysUntilReset, getQuotaPercentage } from '@/lib/ai-quota';

interface QuotaIndicatorProps {
  /** Whether to show the compact version (no subtitle) */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * QuotaIndicator - Displays AI Coach query quota status
 *
 * Shows the current usage, progress bar, and days until reset.
 * Adapts appearance based on usage level:
 * - Normal: Standard appearance
 * - Warning (90%+): Amber warning state
 * - Limit Reached: Red error state
 */
export function QuotaIndicator({ compact = false, className = '' }: QuotaIndicatorProps) {
  const { quota, isLoading, error } = useAIQuota();

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 text-tertiary ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        {!compact && <span className="text-sm">Loading...</span>}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-500 ${className}`}>
        <XCircle className="w-4 h-4" />
        {!compact && <span className="text-sm">Error loading quota</span>}
      </div>
    );
  }

  // No quota available (non-Flow user)
  if (!quota) {
    return null;
  }

  const percentage = getQuotaPercentage(quota);
  const daysUntilReset = getDaysUntilReset();

  // Determine visual state
  const isWarning = quota.isWarning;
  const isLimitReached = quota.isLimitReached;

  // Color classes based on state
  const getBarColor = () => {
    if (isLimitReached) return 'bg-red-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-primary light:bg-primary-dark';
  };

  const getTextColor = () => {
    if (isLimitReached) return 'text-red-500';
    if (isWarning) return 'text-amber-500';
    return 'text-secondary light:text-secondary-dark';
  };

  const getIcon = () => {
    if (isLimitReached) return <XCircle className="w-4 h-4" />;
    if (isWarning) return <AlertTriangle className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 ${getTextColor()}`}>
          {getIcon()}
          <span className="text-sm font-medium">AI Coach</span>
        </div>
        <span className={`text-sm font-mono ${getTextColor()}`}>
          {quota.used}/{quota.limit}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-tertiary/20 light:bg-tertiary-dark/20 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getBarColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Subtitle */}
      {!compact && (
        <div className="flex items-center justify-between text-xs text-tertiary light:text-tertiary-dark">
          <span>
            {isLimitReached
              ? 'Monthly limit reached'
              : isWarning
                ? `${quota.remaining} queries remaining`
                : 'Queries this month'}
          </span>
          <span>
            Resets in {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * QuotaIndicatorCompact - Minimal inline quota display
 *
 * Shows just the usage count for use in headers or tight spaces.
 */
export function QuotaIndicatorCompact({ className = '' }: { className?: string }) {
  const { quota, isLoading } = useAIQuota();

  if (isLoading) {
    return <Loader2 className={`w-3 h-3 animate-spin text-tertiary ${className}`} />;
  }

  if (!quota) {
    return null;
  }

  const getTextColor = () => {
    if (quota.isLimitReached) return 'text-red-500';
    if (quota.isWarning) return 'text-amber-500';
    return 'text-tertiary light:text-tertiary-dark';
  };

  return (
    <span className={`text-xs font-mono ${getTextColor()} ${className}`}>
      {quota.used}/{quota.limit}
    </span>
  );
}
