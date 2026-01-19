'use client';

import { prefersReducedMotion } from '@/lib/utils';

/**
 * NoiseOverlay - SVG-based grain texture for depth and premium feel
 *
 * Uses SVG feTurbulence filter for a subtle film grain effect.
 * Respects prefers-reduced-motion for accessibility.
 * Performance: Pure CSS/SVG, no JS animation loops.
 *
 * Design notes:
 * - Uses 'soft-light' blend mode which works well on both dark and light backgrounds
 * - Opacity set to 15% for visible but subtle grain on dark backgrounds
 * - Filter uses fractalNoise for organic film-like texture
 */
export function NoiseOverlay() {
  const reducedMotion = prefersReducedMotion();

  // Don't render noise for users who prefer reduced motion
  if (reducedMotion) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.15] light:opacity-[0.08]"
      style={{ mixBlendMode: 'soft-light' }}
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
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
