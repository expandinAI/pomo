'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useAmbientEffectsSettings } from '@/hooks/useAmbientEffectsSettings';

export type VisualState = 'idle' | 'focus' | 'break' | 'completed';

interface AmbientEffectsContextValue {
  visualState: VisualState;
  setVisualState: (state: VisualState) => void;
  effectsEnabled: boolean;
  setEffectsEnabled: (enabled: boolean) => void;
  toggleEffects: () => void;
  isLoaded: boolean;
}

const AmbientEffectsContext = createContext<AmbientEffectsContextValue | null>(null);

interface AmbientEffectsProviderProps {
  children: ReactNode;
}

export function AmbientEffectsProvider({ children }: AmbientEffectsProviderProps) {
  const [visualState, setVisualStateInternal] = useState<VisualState>('idle');
  const { effectsEnabled, setEffectsEnabled, toggleEffects, isLoaded } = useAmbientEffectsSettings();

  const setVisualState = useCallback((state: VisualState) => {
    setVisualStateInternal(state);
  }, []);

  const value = useMemo(
    () => ({
      visualState,
      setVisualState,
      effectsEnabled,
      setEffectsEnabled,
      toggleEffects,
      isLoaded,
    }),
    [visualState, setVisualState, effectsEnabled, setEffectsEnabled, toggleEffects, isLoaded]
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
