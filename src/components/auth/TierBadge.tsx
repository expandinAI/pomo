'use client';

import { cn } from '@/lib/utils';
import type { UserTier } from '@/lib/auth/hooks';

interface TierBadgeProps {
  tier: UserTier;
  className?: string;
}

/**
 * TierBadge - Displays the user's subscription tier
 *
 * - "Particle" for free users (subtle styling)
 * - "Particle Flow" for paid users (highlighted styling)
 */
export function TierBadge({ tier, className }: TierBadgeProps) {
  const isFlow = tier === 'flow';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
        isFlow
          ? 'bg-white/10 text-white'
          : 'bg-tertiary/20 light:bg-tertiary-dark/20 text-secondary light:text-secondary-dark',
        className
      )}
    >
      {isFlow ? 'Particle Flow' : 'Particle'}
    </span>
  );
}
