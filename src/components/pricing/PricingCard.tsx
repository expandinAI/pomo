'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';

interface PricingCardProps {
  plan: 'monthly' | 'yearly';
  price: string;
  period: string;
  badge?: string;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * PricingCard - Selectable card for pricing plan
 *
 * Shows price and period, with optional savings badge.
 * Selected state shows accent border and background.
 */
export function PricingCard({
  plan,
  price,
  period,
  badge,
  isSelected,
  onSelect,
}: PricingCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      className={`
        relative flex-1 p-4 rounded-xl border-2 transition-colors
        focus:outline-none
        ${isSelected
          ? 'border-accent light:border-accent-dark bg-accent/5 light:bg-accent-dark/5'
          : 'border-tertiary/20 light:border-tertiary-dark/20 hover:border-tertiary/40 light:hover:border-tertiary-dark/40'
        }
      `}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', ...SPRING.snappy }}
    >
      {/* Savings Badge */}
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-medium bg-green-500 text-white rounded-full whitespace-nowrap">
          {badge}
        </span>
      )}

      {/* Plan name */}
      <p className="text-sm text-tertiary light:text-tertiary-dark mb-1 capitalize">
        {plan}
      </p>

      {/* Price */}
      <p className="text-2xl font-semibold text-primary light:text-primary-dark">
        {price}
      </p>

      {/* Period */}
      <p className="text-sm text-secondary light:text-secondary-dark">
        {period}
      </p>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white light:bg-neutral-900 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', ...SPRING.bouncy }}
        >
          <Check className="w-3 h-3 text-black light:text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}
