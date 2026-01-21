'use client';

interface ParticleDotsProps {
  /** Number of particles to display */
  count: number;
  /** Maximum dots to show before truncating */
  max?: number;
}

/**
 * Visual representation of particles as dots
 *
 * Shows up to `max` dots, with "+N" for overflow.
 *
 * @example
 * ```tsx
 * <ParticleDots count={8} max={12} />
 * // Renders: ●●●●●●●●
 *
 * <ParticleDots count={15} max={12} />
 * // Renders: ●●●●●●●●●●●● +3
 * ```
 */
export function ParticleDots({ count, max = 12 }: ParticleDotsProps) {
  if (count === 0) return null;

  const visibleCount = Math.min(count, max);
  const overflow = count - max;

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-[2px]">
        {Array.from({ length: visibleCount }).map((_, i) => (
          <span
            key={i}
            className="w-[5px] h-[5px] rounded-full bg-primary light:bg-primary-light"
            aria-hidden="true"
          />
        ))}
      </div>
      {overflow > 0 && (
        <span className="text-[10px] text-tertiary light:text-tertiary-light ml-0.5">
          +{overflow}
        </span>
      )}
    </div>
  );
}
