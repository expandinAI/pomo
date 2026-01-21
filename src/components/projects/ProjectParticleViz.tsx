'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ProjectParticleVizProps {
  /** Number of particles to visualize */
  particleCount: number;
  /** Brightness value (0.3-1.0) for dot opacity */
  brightness: number;
  /** Maximum number of dots to display (default: 100) */
  maxVisible?: number;
  /** Total focus time in seconds */
  totalDuration: number;
}

/**
 * Visual representation of particles as a dot grid
 *
 * Shows particles as dots arranged in a responsive grid.
 * Each dot's opacity is based on the project's brightness setting.
 * If there are more particles than maxVisible, shows "+ X more".
 */
export function ProjectParticleViz({
  particleCount,
  brightness,
  maxVisible = 100,
  totalDuration,
}: ProjectParticleVizProps) {
  const visibleCount = Math.min(particleCount, maxVisible);
  const overflow = particleCount - visibleCount;

  // Create array of dot indices
  const dots = useMemo(
    () => Array.from({ length: visibleCount }, (_, i) => i),
    [visibleCount]
  );

  // Format duration as hours and minutes
  const formattedDuration = useMemo(() => {
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, [totalDuration]);

  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Particle Count */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <span className="text-4xl font-bold text-primary light:text-primary-dark tabular-nums">
          {particleCount}
        </span>
        <span className="ml-2 text-lg text-secondary light:text-secondary-dark">
          {particleCount === 1 ? 'Particle' : 'Particles'}
        </span>
      </motion.div>

      {/* Dot Grid */}
      {particleCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-1.5 max-w-md mb-4"
        >
          {dots.map((i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.005, duration: 0.15 }}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: `rgba(255, 255, 255, ${brightness})` }}
            />
          ))}
          {overflow > 0 && (
            <span className="text-xs text-tertiary light:text-tertiary-dark self-center ml-1">
              +{overflow} more
            </span>
          )}
        </motion.div>
      )}

      {/* Total Focus Time */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-tertiary light:text-tertiary-dark"
      >
        {formattedDuration} total focus time
      </motion.p>
    </div>
  );
}
