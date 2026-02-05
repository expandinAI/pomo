'use client';

import { cn } from '@/lib/utils';

interface WeekIntentionsSummaryProps {
  totalParticles: number;
  intentionalPercentage: number | null;
  daysWithIntention: number;
}

export function WeekIntentionsSummary({
  totalParticles,
  intentionalPercentage,
  daysWithIntention,
}: WeekIntentionsSummaryProps) {
  if (totalParticles === 0 && daysWithIntention === 0) {
    return (
      <div className="text-center text-sm text-tertiary/50 light:text-tertiary-dark/50 py-2">
        No intentions this week
      </div>
    );
  }

  const parts: string[] = [];

  if (totalParticles > 0) {
    parts.push(`${totalParticles} particle${totalParticles !== 1 ? 's' : ''}`);
  }

  if (intentionalPercentage !== null) {
    parts.push(`${intentionalPercentage}% intentional`);
  }

  parts.push(`${daysWithIntention} of 7 days`);

  return (
    <div className={cn(
      'text-center text-xs',
      'text-tertiary light:text-tertiary-dark'
    )}>
      {parts.join(' · ')}
    </div>
  );
}
