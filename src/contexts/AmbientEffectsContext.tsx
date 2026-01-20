'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useAmbientEffectsSettings } from '@/hooks/useAmbientEffectsSettings';
import { useAdaptiveQuality, type VisualMode } from '@/hooks/useAdaptiveQuality';
import { useParticleStyle, type ParticleStyle, type ResolvedParticleStyle, type ParticlePace } from '@/hooks/useParticleStyle';
import type { QualityLevel, DeviceCapabilities } from '@/lib/detectDevice';

export type VisualState = 'idle' | 'focus' | 'break' | 'completed';

interface AmbientEffectsContextValue {
  // Visual state
  visualState: VisualState;
  setVisualState: (state: VisualState) => void;

  // Pause state (freeze particles without unmounting)
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;

  // Effects toggle
  effectsEnabled: boolean;
  setEffectsEnabled: (enabled: boolean) => void;
  toggleEffects: () => void;

  // Visual mode (minimal | ambient | auto)
  visualMode: VisualMode;
  setVisualMode: (mode: VisualMode) => void;

  // Adaptive quality
  quality: QualityLevel;
  deviceCapabilities: DeviceCapabilities;
  particleCount: number;
  showParticles: boolean;
  showBurst: boolean;

  // Particle style
  particleStyle: ParticleStyle;
  setParticleStyle: (style: ParticleStyle) => void;
  resolvedParticleStyle: ResolvedParticleStyle;

  // Parallax depth effect
  parallaxEnabled: boolean;
  setParallaxEnabled: (enabled: boolean) => void;

  // Particle pace
  pace: ParticlePace;
  setPace: (pace: ParticlePace) => void;
  paceMultiplier: number;

  // Loading state
  isLoaded: boolean;
}

const AmbientEffectsContext = createContext<AmbientEffectsContextValue | null>(null);

interface AmbientEffectsProviderProps {
  children: ReactNode;
}

export function AmbientEffectsProvider({ children }: AmbientEffectsProviderProps) {
  const [visualState, setVisualStateInternal] = useState<VisualState>('idle');
  const [isPaused, setIsPausedInternal] = useState(false);
  const { effectsEnabled, setEffectsEnabled, toggleEffects, isLoaded: settingsLoaded } = useAmbientEffectsSettings();
  const {
    visualMode,
    setVisualMode,
    quality,
    deviceCapabilities,
    particleCount,
    showParticles,
    showBurst,
    isLoaded: qualityLoaded,
  } = useAdaptiveQuality();
  const {
    style: particleStyle,
    setStyle: setParticleStyle,
    resolvedStyle: resolvedParticleStyle,
    parallaxEnabled,
    setParallaxEnabled,
    pace,
    setPace,
    paceMultiplier,
    isLoaded: styleLoaded,
  } = useParticleStyle();

  const setVisualState = useCallback((state: VisualState) => {
    setVisualStateInternal(state);
  }, []);

  const setIsPaused = useCallback((paused: boolean) => {
    setIsPausedInternal(paused);
  }, []);

  // All settings must be loaded before we consider the context ready
  const isLoaded = settingsLoaded && qualityLoaded && styleLoaded;

  const value = useMemo(
    () => ({
      visualState,
      setVisualState,
      isPaused,
      setIsPaused,
      effectsEnabled,
      setEffectsEnabled,
      toggleEffects,
      visualMode,
      setVisualMode,
      quality,
      deviceCapabilities,
      particleCount,
      showParticles,
      showBurst,
      particleStyle,
      setParticleStyle,
      resolvedParticleStyle,
      parallaxEnabled,
      setParallaxEnabled,
      pace,
      setPace,
      paceMultiplier,
      isLoaded,
    }),
    [
      visualState,
      setVisualState,
      isPaused,
      setIsPaused,
      effectsEnabled,
      setEffectsEnabled,
      toggleEffects,
      visualMode,
      setVisualMode,
      quality,
      deviceCapabilities,
      particleCount,
      showParticles,
      showBurst,
      particleStyle,
      setParticleStyle,
      resolvedParticleStyle,
      parallaxEnabled,
      setParallaxEnabled,
      pace,
      setPace,
      paceMultiplier,
      isLoaded,
    ]
  );

  return (
    <AmbientEffectsContext.Provider value={value}>
      {children}
    </AmbientEffectsContext.Provider>
  );
}

export function useAmbientEffects(): AmbientEffectsContextValue {
  const context = useContext(AmbientEffectsContext);
  if (!context) {
    throw new Error('useAmbientEffects must be used within an AmbientEffectsProvider');
  }
  return context;
}
