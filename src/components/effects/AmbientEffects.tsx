'use client';

import { useAmbientEffects } from '@/contexts/AmbientEffectsContext';
import { ParticleField } from './ParticleField';
import { ParticleBurst } from './ParticleBurst';

/**
 * AmbientEffects - Container component for all ambient visual effects
 *
 * Renders effects based on the current visual state and visual mode:
 * - idle: No effects
 * - focus: Blue glow (0.8), normal speed particles
 * - break: Warm glow (0.4), slow particles
 * - converging: Particles fly toward session counter
 * - completed: Blue glow (1.0), particles + burst
 *
 * Visual Modes:
 * - minimal: Only grain texture (no particles)
 * - ambient: Full effects
 * - auto: Adapts based on device capabilities
 *
 * Respects effectsEnabled setting and prefers-reduced-motion.
 */
export function AmbientEffects() {
  const {
    visualState,
    isPaused,
    effectsEnabled,
    isLoaded,
    particleCount,
    showParticles,
    showBurst,
    deviceCapabilities,
    resolvedParticleStyle,
    parallaxEnabled,
    paceMultiplier,
    convergenceTarget,
  } = useAmbientEffects();

  // Don't render anything if:
  // - Settings haven't loaded yet
  // - Effects are disabled
  // - User prefers reduced motion
  // - State is idle
  if (!isLoaded || !effectsEnabled || deviceCapabilities.prefersReducedMotion || visualState === 'idle') {
    return null;
  }

  // Determine effect configuration based on visual state
  const particleMode: 'work' | 'break' = visualState === 'break' ? 'break' : 'work';
  const shouldShowBurst = showBurst && visualState === 'completed';
  const isConverging = visualState === 'converging';
  const isCompleted = visualState === 'completed';

  // Don't show particles during 'completed' state
  // The convergence animation has finished - particles should not restart
  const shouldShowParticles = showParticles && !isCompleted;

  return (
    <>
      {shouldShowParticles && (
        <ParticleField
          isActive={true}
          isPaused={isPaused}
          mode={particleMode}
          particleCount={particleCount}
          style={resolvedParticleStyle}
          parallaxEnabled={parallaxEnabled}
          paceMultiplier={paceMultiplier}
          isConverging={isConverging}
          convergenceTarget={convergenceTarget}
        />
      )}
      <ParticleBurst isActive={shouldShowBurst} />
    </>
  );
}
