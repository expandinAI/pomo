'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: ReactNode;
}

/**
 * Reusable metric card for displaying statistics
 * Layout: Icon left, Value large, Title small, optional Trend indicator
 */
export function MetricCard({ title, value, subtitle, trend, icon }: MetricCardProps) {
  const reducedMotion = prefersReducedMotion();

  const TrendIcon = trend?.direction === 'up'
    ? TrendingUp
    : trend?.direction === 'down'
      ? TrendingDown
      : Minus;

  const trendColor = trend?.direction === 'up'
    ? 'text-accent light:text-accent-dark'
    : trend?.direction === 'down'
      ? 'text-tertiary light:text-tertiary-dark'
      : 'text-tertiary light:text-tertiary-dark';

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
      className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4 flex flex-col"
    >
      <div className="flex items-start justify-between mb-2">
        {icon && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent/10 light:bg-accent-dark/10 text-accent light:text-accent-dark flex-shrink-0">
            {icon}
          </div>
        )}
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="text-2xl font-bold text-primary light:text-primary-dark tracking-tight">
          {value}
        </p>
        <p className="text-xs text-tertiary light:text-tertiary-dark mt-0.5">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-tertiary/70 light:text-tertiary-dark/70 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
