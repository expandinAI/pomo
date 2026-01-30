'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTrial } from '@/lib/trial';
import { useParticleAuth } from '@/lib/auth';
import { SPRING } from '@/styles/design-tokens';

/**
 * TrialBadge - Shows trial status in the header
 *
 * Displays:
 * - "Trial: X days" when trial is active
 * - Orange color when expiring soon (≤ 3 days)
 * - Nothing when no active trial
 */
export function TrialBadge() {
  const auth = useParticleAuth();
  const trial = useTrial();

  // Only show for authenticated users with active trial
  if (auth.status !== 'authenticated' || !trial.isActive) {
    return null;
  }

  const isExpiringSoon = trial.isExpiringSoon;
  const daysText = trial.daysRemaining === 1 ? 'day' : 'days';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', ...SPRING.gentle }}
      className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${
          isExpiringSoon
            ? 'bg-orange-500/10 text-orange-400'
            : 'bg-accent/10 light:bg-accent-dark/10 text-secondary light:text-secondary-dark'
        }
      `}
      title={`Trial ends ${trial.endsAt ? new Date(trial.endsAt).toLocaleDateString() : 'soon'}`}
    >
      <Sparkles className="w-3 h-3" />
      <span>
        Trial: {trial.daysRemaining} {daysText}
      </span>
    </motion.div>
  );
}
