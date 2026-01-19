'use client';

import { useAmbientEffects } from '@/contexts/AmbientEffectsContext';
import { prefersReducedMotion } from '@/lib/utils';
import { ParticleField } from './ParticleField';
import { ParticleBurst } from './ParticleBurst';

/**
 * AmbientEffects - Container component for all ambient visual effects
 *
 * Renders effects based on the current visual state:
 * - idle: No effects
 * - focus: Blue glow (0.8), normal speed particles
 * - break: Warm glow (0.4), slow particles
 * - completed: Blue glow (1.0), particles + burst
 *
 * Respects effectsEnabled setting and prefers-reduced-motion.
 */
export function AmbientEffects() {
  const { visualState, effectsEnabled, isLoaded } = useAmbientEffects();
  const reducedMotion = prefersReducedMotion();

  // Don't render anything if:
  // - Settings haven't loaded yet
  // - Effects are disabled
  // - User prefers reduced motion
  // - State is idle
  if (!isLoaded || !effectsEnabled || reducedMotion || visualState === 'idle') {
    return null;
  }

  // Determine effect configuration based on visual state
  // Note: visualState is never 'idle' here due to early return above
  const particleSpeed = visualState === 'break' ? 'slow' : 'normal';
  const showBurst = visualState === 'completed';

  return (
    <>
      <ParticleField
        isActive={true}
        speed={particleSpeed}
      />
      <ParticleBurst isActive={showBurst} />
    </>
  );
}
