/**
 * Brightness Calculation for Year Grid
 *
 * Calculates visual brightness for grid cells based on particle count,
 * using a logarithmic scale for natural distribution.
 */

/**
 * Calculate the brightness value for a grid cell
 *
 * Uses logarithmic scaling to provide a natural distribution where:
 * - 0 particles → barely visible (0.08)
 * - Low activity → subtle visibility (0.15-0.4)
 * - High activity → prominent (0.6-0.85)
 * - Peak activity → full brightness (1.0)
 *
 * @param particleCount - Number of particles (sessions) for the day
 * @param personalMax - Maximum particles achieved in any single day
 * @returns Brightness value from 0.08 to 1.0
 */
export function calculateBrightness(
  particleCount: number,
  personalMax: number
): number {
  // Empty day: barely visible
  if (particleCount === 0) return 0.08;

  // No reference max: treat as minimal
  if (personalMax === 0) return 0.08;

  // Logarithmic scale for natural distribution
  // log(1) = 0, so we add 1 to avoid log(0) and ensure minimum activity shows
  const logCount = Math.log(particleCount + 1);
  const logMax = Math.log(personalMax + 1);
  const normalized = logCount / logMax;

  // Range: 0.15 (minimum visible) to 1.0 (peak)
  return 0.15 + normalized * 0.85;
}
