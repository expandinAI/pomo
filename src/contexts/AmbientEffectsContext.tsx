'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useAmbientEffectsSettings } from '@/hooks/useAmbientEffectsSettings';
import { useAdaptiveQuality, type VisualMode } from '@/hooks/useAdaptiveQuality';
import type { QualityLevel, DeviceCapabilities } from '@/lib/detectDevice';

export type VisualState = 'idle' | 'focus' | 'break' | 'completed';

interface AmbientEffectsContextValue {
  // Visual state
  visualState: VisualState;
  setVisualState: (state: VisualState) => void;

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

  // Loading state
  isLoaded: boolean;
}

const AmbientEffectsContext = createContext<AmbientEffectsContextValue | null>(null);

interface AmbientEffectsProviderProps {
  children: ReactNode;
}

export function AmbientEffectsProvider({ children }: AmbientEffectsProviderProps) {
  const [visualState, setVisualStateInternal] = useState<VisualState>('idle');
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

  const setVisualState = useCallback((state: VisualState) => {
    setVisualStateInternal(state);
  }, []);

  // Both settings must be loaded before we consider the context ready
  const isLoaded = settingsLoaded && qualityLoaded;

  const value = useMemo(
    () => ({
      visualState,
      setVisualState,
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
      isLoaded,
    }),
    [
      visualState,
      setVisualState,
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
