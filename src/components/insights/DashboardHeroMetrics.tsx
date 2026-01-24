'use client';

import { motion } from 'framer-motion';
import { Clock, Sparkles, Zap } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';

interface DashboardHeroMetricsProps {
  totalHours: string;      // Formatted total hours (all-time)
  particleCount: number;   // Filtered by time range
  focusScore: number;      // Filtered by time range (0-100)
}

interface HeroMetricProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  delay?: number;
}

function HeroMetric({ value, label, icon, delay = 0 }: HeroMetricProps) {
  const reducedMotion = prefersReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: 'spring', ...SPRING.gentle, delay }
      }
      className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4 text-center"
    >
      {/* Icon */}
      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-accent/10 light:bg-accent-dark/10 flex items-center justify-center">
        <div className="text-accent light:text-accent-dark">
          {icon}
        </div>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-primary light:text-primary-dark tracking-tight leading-none tabular-nums">
        {value}
      </p>

      {/* Label */}
      <p className="text-xs text-tertiary light:text-tertiary-dark mt-1.5">
        {label}
      </p>
    </motion.div>
  );
}

/**
 * Hero Metrics Section - Shows the three key statistics at a glance
 * - Total Focus: Lifetime hours (not filtered)
 * - Particles: Count filtered by time range
 * - Focus Score: Score filtered by time range
 */
export function DashboardHeroMetrics({
  totalHours,
  particleCount,
  focusScore,
}: DashboardHeroMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <HeroMetric
        value={totalHours}
        label="Total Focus"
        icon={<Clock className="w-5 h-5" />}
        delay={0}
      />
      <HeroMetric
        value={particleCount}
        label={particleCount === 1 ? 'Particle' : 'Particles'}
        icon={<Sparkles className="w-5 h-5" />}
        delay={0.05}
      />
      <HeroMetric
        value={`${focusScore}%`}
        label="Focus Score"
        icon={<Zap className="w-5 h-5" />}
        delay={0.1}
      />
    </div>
  );
}
