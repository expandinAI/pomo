'use client';

import { motion } from 'framer-motion';

interface StatsPeriod {
  particles: number;
  duration: number;
}

interface ProjectStatsCardsProps {
  thisWeek: StatsPeriod;
  thisMonth: StatsPeriod;
  allTime: StatsPeriod;
}

/**
 * Stats cards showing This Week / This Month / All Time breakdown
 */
export function ProjectStatsCards({
  thisWeek,
  thisMonth,
  allTime,
}: ProjectStatsCardsProps) {
  const cards = [
    { label: 'This Week', ...thisWeek },
    { label: 'This Month', ...thisMonth },
    { label: 'All Time', ...allTime },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + idx * 0.05 }}
          className="p-4 rounded-xl bg-tertiary/5 light:bg-tertiary-dark/5 border border-tertiary/10 light:border-tertiary-dark/10 text-center"
        >
          {/* Particle Count */}
          <div className="text-2xl font-bold text-primary light:text-primary-dark tabular-nums">
            {card.particles}
          </div>
          <div className="text-xs text-tertiary light:text-tertiary-dark mb-2">
            {card.particles === 1 ? 'Particle' : 'Particles'}
          </div>

          {/* Duration */}
          <div className="text-sm text-secondary light:text-secondary-dark">
            {formatDuration(card.duration)}
          </div>

          {/* Period Label */}
          <div className="mt-2 text-xs text-tertiary light:text-tertiary-dark font-medium">
            {card.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Format duration in seconds to a readable string
 * Uses Math.round for user-friendly display (90s → "2m", not "1m")
 */
function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);

  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${totalMinutes}m`;
}
