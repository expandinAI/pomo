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
      className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-4 flex flex-col items-center text-center"
    >
      {/* Icon */}
      {icon && (
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-accent/10 light:bg-accent-dark/10 text-accent light:text-accent-dark mb-3">
          {icon}
        </div>
      )}

      {/* Value */}
      <p className="text-2xl font-bold text-primary light:text-primary-dark tracking-tight leading-none">
        {value}
      </p>

      {/* Title */}
      <p className="text-xs text-tertiary light:text-tertiary-dark mt-1.5">
        {title}
      </p>

      {/* Subtitle or Trend */}
      {subtitle && (
        <p className="text-[10px] text-tertiary/60 light:text-tertiary-dark/60 mt-1">
          {subtitle}
        </p>
      )}
      {trend && (
        <div className={`flex items-center gap-0.5 text-[10px] mt-1 ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </motion.div>
  );
}
