'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';

interface RhythmVisualizerProps {
  /** Estimated duration in seconds */
  estimatedSeconds: number;
  /** Actual duration in seconds */
  actualSeconds: number;
  /** Which variant to show (for demo: 'all' shows all) */
  variant?: 'dots' | 'bars' | 'single-bar' | 'numbers' | 'percent' | 'all';
}

function formatMinutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

function formatPercent(ratio: number): string {
  const diff = (ratio - 1) * 100;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${Math.round(diff)}%`;
}

/**
 * Variant 1: Two bars stacked
 */
function TwoBarsVariant({ estimatedSeconds, actualSeconds }: { estimatedSeconds: number; actualSeconds: number }) {
  const maxSeconds = Math.max(estimatedSeconds, actualSeconds);
  const estimatedPercent = (estimatedSeconds / maxSeconds) * 100;
  const actualPercent = (actualSeconds / maxSeconds) * 100;

  return (
    <div className="space-y-3 w-full">
      {/* Estimated bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-tertiary light:text-tertiary-dark w-20 text-right">geschätzt</span>
        <div className="flex-1 h-2 bg-tertiary/10 light:bg-tertiary-dark/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${estimatedPercent}%` }}
            transition={{ type: 'spring', ...SPRING.gentle, delay: 0.1 }}
            className="h-full bg-tertiary/30 light:bg-tertiary-dark/30 rounded-full"
          />
        </div>
        <span className="text-xs text-tertiary light:text-tertiary-dark w-14 tabular-nums">
          {formatMinutes(estimatedSeconds)}
        </span>
      </div>

      {/* Actual bar */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-tertiary light:text-tertiary-dark w-20 text-right">tatsächlich</span>
        <div className="flex-1 h-2 bg-tertiary/10 light:bg-tertiary-dark/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${actualPercent}%` }}
            transition={{ type: 'spring', ...SPRING.gentle, delay: 0.2 }}
            className="h-full bg-primary light:bg-primary-dark rounded-full"
          />
        </div>
        <span className="text-xs text-primary light:text-primary-dark w-14 tabular-nums font-medium">
          {formatMinutes(actualSeconds)}
        </span>
      </div>
    </div>
  );
}

/**
 * Variant 2: Single bar with marker
 */
function SingleBarVariant({ estimatedSeconds, actualSeconds }: { estimatedSeconds: number; actualSeconds: number }) {
  const ratio = actualSeconds / estimatedSeconds;
  const maxRatio = Math.max(ratio, 1.3); // Show at least 130% width
  const estimatedPosition = (1 / maxRatio) * 100;
  const actualWidth = (ratio / maxRatio) * 100;

  return (
    <div className="w-full">
      <div className="relative h-3 bg-tertiary/10 light:bg-tertiary-dark/10 rounded-full overflow-visible">
        {/* Actual bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${actualWidth}%` }}
          transition={{ type: 'spring', ...SPRING.gentle }}
          className="absolute inset-y-0 left-0 bg-primary light:bg-primary-dark rounded-full"
        />

        {/* Estimated marker */}
        <motion.div
          initial={{ opacity: 0, left: 0 }}
          animate={{ opacity: 1, left: `${estimatedPosition}%` }}
          transition={{ type: 'spring', ...SPRING.gentle, delay: 0.2 }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-5 bg-tertiary/60 light:bg-tertiary-dark/60"
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-tertiary light:text-tertiary-dark">
          {formatMinutes(estimatedSeconds)} geschätzt
        </span>
        <span className="text-primary light:text-primary-dark font-medium">
          {formatPercent(ratio)}
        </span>
      </div>
    </div>
  );
}

/**
 * Variant 3: Numbers with arrow
 */
function NumbersVariant({ estimatedSeconds, actualSeconds }: { estimatedSeconds: number; actualSeconds: number }) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Estimated */}
      <div className="text-center">
        <p className="text-2xl font-semibold text-tertiary/60 light:text-tertiary-dark/60 tabular-nums">
          {formatMinutes(estimatedSeconds)}
        </p>
        <p className="text-[10px] text-tertiary/40 light:text-tertiary-dark/40 uppercase tracking-wide mt-1">
          geschätzt
        </p>
      </div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', ...SPRING.gentle, delay: 0.2 }}
      >
        <ArrowRight className="w-5 h-5 text-tertiary/30 light:text-tertiary-dark/30" />
      </motion.div>

      {/* Actual */}
      <div className="text-center">
        <p className="text-2xl font-semibold text-primary light:text-primary-dark tabular-nums">
          {formatMinutes(actualSeconds)}
        </p>
        <p className="text-[10px] text-tertiary/40 light:text-tertiary-dark/40 uppercase tracking-wide mt-1">
          tatsächlich
        </p>
      </div>
    </div>
  );
}

/**
 * Variant 4: Percent badge
 */
function PercentVariant({ estimatedSeconds, actualSeconds }: { estimatedSeconds: number; actualSeconds: number }) {
  const ratio = actualSeconds / estimatedSeconds;
  const percentStr = formatPercent(ratio);
  const isMore = ratio > 1.05;
  const isLess = ratio < 0.95;

  let description = 'wie geplant';
  if (isMore) description = 'mehr Zeit als geplant';
  if (isLess) description = 'weniger Zeit als geplant';

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', ...SPRING.snappy }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary/10 light:bg-tertiary-dark/10"
      >
        <span className="text-2xl font-semibold text-primary light:text-primary-dark tabular-nums">
          {percentStr}
        </span>
      </motion.div>
      <p className="text-xs text-tertiary light:text-tertiary-dark mt-3">
        {description}
      </p>
      <p className="text-[10px] text-tertiary/50 light:text-tertiary-dark/50 mt-1">
        {formatMinutes(estimatedSeconds)} → {formatMinutes(actualSeconds)}
      </p>
    </div>
  );
}

/**
 * Main component that renders the selected variant
 */
export function RhythmVisualizer({ estimatedSeconds, actualSeconds, variant = 'bars' }: RhythmVisualizerProps) {
  // For demo mode, show all variants
  if (variant === 'all') {
    return (
      <div className="space-y-8">
        {/* Variant 1: Two bars */}
        <div className="p-4 rounded-lg border border-tertiary/10 light:border-tertiary-dark/10">
          <p className="text-[10px] text-tertiary/50 light:text-tertiary-dark/50 uppercase tracking-wide mb-4">
            Variante 1: Zwei Balken
          </p>
          <TwoBarsVariant estimatedSeconds={estimatedSeconds} actualSeconds={actualSeconds} />
        </div>

        {/* Variant 2: Single bar */}
        <div className="p-4 rounded-lg border border-tertiary/10 light:border-tertiary-dark/10">
          <p className="text-[10px] text-tertiary/50 light:text-tertiary-dark/50 uppercase tracking-wide mb-4">
            Variante 2: Ein Balken mit Markierung
          </p>
          <SingleBarVariant estimatedSeconds={estimatedSeconds} actualSeconds={actualSeconds} />
        </div>

        {/* Variant 3: Numbers */}
        <div className="p-4 rounded-lg border border-tertiary/10 light:border-tertiary-dark/10">
          <p className="text-[10px] text-tertiary/50 light:text-tertiary-dark/50 uppercase tracking-wide mb-4">
            Variante 3: Zahlen mit Pfeil
          </p>
          <NumbersVariant estimatedSeconds={estimatedSeconds} actualSeconds={actualSeconds} />
        </div>

        {/* Variant 4: Percent */}
        <div className="p-4 rounded-lg border border-tertiary/10 light:border-tertiary-dark/10">
          <p className="text-[10px] text-tertiary/50 light:text-tertiary-dark/50 uppercase tracking-wide mb-4">
            Variante 4: Prozent-Badge
          </p>
          <PercentVariant estimatedSeconds={estimatedSeconds} actualSeconds={actualSeconds} />
        </div>
      </div>
    );
  }

  // Single variant mode
  switch (variant) {
    case 'bars':
      return <TwoBarsVariant estimatedSeconds={estimatedSeconds} actualSeconds={actualSeconds} />;
    case 'single-bar':
      return <SingleBarVariant estimatedSeconds={estimatedSeconds} actualSeconds={actualSeconds} />;
    case 'numbers':
      return <NumbersVariant estimatedSeconds={estimatedSeconds} actualSeconds={actualSeconds} />;
    case 'percent':
      return <PercentVariant estimatedSeconds={estimatedSeconds} actualSeconds={actualSeconds} />;
    default:
      return <TwoBarsVariant estimatedSeconds={estimatedSeconds} actualSeconds={actualSeconds} />;
  }
}
