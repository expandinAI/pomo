// src/lib/intentions/utils.ts

import type { IntentionAlignment } from '@/lib/db/types';
import { PARTICLE_COLORS, PARTICLE_LIGHT_MODE_CLASSES } from '@/styles/design-tokens';

/**
 * Returns Tailwind classes for particle background based on alignment
 *
 * @param alignment - The session's intention alignment
 * @returns Tailwind class string for particle background
 *
 * @example
 * getParticleColorClass('aligned')   // 'bg-white dark:bg-primary'
 * getParticleColorClass('reactive')  // 'bg-tertiary'
 * getParticleColorClass('none')      // 'bg-white dark:bg-primary'
 * getParticleColorClass(undefined)   // 'bg-white dark:bg-primary'
 */
export function getParticleColorClass(
  alignment: IntentionAlignment | undefined
): string {
  const key = alignment ?? 'none';
  const colors = PARTICLE_COLORS[key];

  if (key === 'reactive') {
    return colors.bg; // Gray stays gray in both modes
  }

  // Aligned/None: white in dark mode, needs dark text in light mode
  return `${colors.bg} dark:${colors.bgDark}`;
}

/**
 * Returns hex color for particle based on alignment
 * Useful for canvas/SVG rendering
 *
 * @param alignment - The session's intention alignment
 * @returns Hex color string
 *
 * @example
 * getParticleHexColor('aligned')   // '#FFFFFF'
 * getParticleHexColor('reactive')  // '#525252'
 * getParticleHexColor(undefined)   // '#FFFFFF'
 */
export function getParticleHexColor(
  alignment: IntentionAlignment | undefined
): string {
  const key = alignment ?? 'none';
  return PARTICLE_COLORS[key].hex;
}

/**
 * Checks if a particle is reactive (for conditional styling)
 *
 * @param alignment - The session's intention alignment
 * @returns true if alignment is 'reactive', false otherwise
 *
 * @example
 * isReactiveParticle('reactive')  // true
 * isReactiveParticle('aligned')   // false
 * isReactiveParticle(undefined)   // false
 */
export function isReactiveParticle(
  alignment: IntentionAlignment | undefined
): boolean {
  return alignment === 'reactive';
}

/**
 * Returns light mode specific classes for particle styling
 * Adds subtle shadow/ring for visibility on light backgrounds
 *
 * @param alignment - The session's intention alignment
 * @returns Tailwind class string for light mode enhancements
 *
 * @example
 * getParticleLightModeClass('aligned')   // 'light:shadow-sm light:ring-1 light:ring-tertiary/20'
 * getParticleLightModeClass('reactive')  // ''
 */
export function getParticleLightModeClass(
  alignment: IntentionAlignment | undefined
): string {
  const key = alignment ?? 'none';
  return PARTICLE_LIGHT_MODE_CLASSES[key];
}

/**
 * Returns combined particle styling classes (color + light mode enhancements)
 *
 * @param alignment - The session's intention alignment
 * @returns Combined Tailwind class string
 *
 * @example
 * getParticleClasses('aligned')   // 'bg-white dark:bg-primary light:shadow-sm light:ring-1 light:ring-tertiary/20'
 * getParticleClasses('reactive')  // 'bg-tertiary'
 */
export function getParticleClasses(
  alignment: IntentionAlignment | undefined
): string {
  const colorClass = getParticleColorClass(alignment);
  const lightModeClass = getParticleLightModeClass(alignment);

  return lightModeClass ? `${colorClass} ${lightModeClass}` : colorClass;
}
