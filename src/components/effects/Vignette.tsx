'use client';

/**
 * Vignette - CSS radial gradient for edge darkening
 *
 * Creates a subtle vignette effect that draws focus to the center
 * of the screen where the timer is displayed.
 * Only visible in dark mode for the immersive experience.
 */
export function Vignette() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 light:opacity-0"
      style={{
        background: `radial-gradient(
          ellipse at center,
          transparent 0%,
          transparent 40%,
          rgba(0, 0, 0, 0.3) 80%,
          rgba(0, 0, 0, 0.5) 100%
        )`,
      }}
      aria-hidden="true"
    />
  );
}
