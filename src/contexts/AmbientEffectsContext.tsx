'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useAmbientEffectsSettings } from '@/hooks/useAmbientEffectsSettings';
import { useAdaptiveQuality, type VisualMode } from '@/hooks/useAdaptiveQuality';
import { useParticleStyle, type ParticleStyle, type ResolvedParticleStyle, type ParticlePace } from '@/hooks/useParticleStyle';
import type { QualityLevel, DeviceCapabilities } from '@/lib/detectDevice';

export type VisualState = 'idle' | 'focus' | 'break' | 'slowing' | 'converging' | 'completed';

interface AmbientEffectsContextValue {
  // Visual state
  visualState: VisualState;
  setVisualState: (state: VisualState) => void;

  // Pause state (freeze particles without unmounting)
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;

  // Convergence target for end-of-session animation
  convergenceTarget: { x: number; y: number } | null;
  setConvergenceTarget: (target: { x: number; y: number } | null) => void;

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

  // Burst position (for celebration animation)
  burstPosition: { x: number; y: number } | null;
  setBurstPosition: (pos: { x: number; y: number } | null) => void;

  // Trigger burst animation (controlled by Timer based on celebration settings)
  shouldTriggerBurst: boolean;
  setShouldTriggerBurst: (value: boolean) => void;

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
  const [convergenceTarget, setConvergenceTargetInternal] = useState<{ x: number; y: number } | null>(null);
  const [burstPosition, setBurstPositionInternal] = useState<{ x: number; y: number } | null>(null);
  const [shouldTriggerBurst, setShouldTriggerBurstInternal] = useState(false);
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

  const setConvergenceTarget = useCallback((target: { x: number; y: number } | null) => {
    setConvergenceTargetInternal(target);
  }, []);

  const setBurstPosition = useCallback((pos: { x: number; y: number } | null) => {
    setBurstPositionInternal(pos);
  }, []);

  const setShouldTriggerBurst = useCallback((value: boolean) => {
    setShouldTriggerBurstInternal(value);
  }, []);

  // All settings must be loaded before we consider the context ready
  const isLoaded = settingsLoaded && qualityLoaded && styleLoaded;

  const value = useMemo(
    () => ({
      visualState,
      setVisualState,
      isPaused,
      setIsPaused,
      convergenceTarget,
      setConvergenceTarget,
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
      burstPosition,
      setBurstPosition,
      shouldTriggerBurst,
      setShouldTriggerBurst,
      isLoaded,
    }),
    [
      visualState,
      setVisualState,
      isPaused,
      setIsPaused,
      convergenceTarget,
      setConvergenceTarget,
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
      burstPosition,
      setBurstPosition,
      shouldTriggerBurst,
      setShouldTriggerBurst,
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
