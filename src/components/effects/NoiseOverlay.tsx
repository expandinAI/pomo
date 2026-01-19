'use client';

import { prefersReducedMotion } from '@/lib/utils';

/**
 * NoiseOverlay - SVG-based grain texture for depth and premium feel
 *
 * Uses SVG feTurbulence filter for a subtle film grain effect.
 * Respects prefers-reduced-motion for accessibility.
 * Performance: Pure CSS/SVG, no JS animation loops.
 */
export function NoiseOverlay() {
  const reducedMotion = prefersReducedMotion();

  // Don't render noise for users who prefer reduced motion
  if (reducedMotion) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      style={{ mixBlendMode: 'overlay' }}
      aria-hidden="true"
    >
      <svg
        className="h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#noise-filter)"
        />
      </svg>
    </div>
  );
}
