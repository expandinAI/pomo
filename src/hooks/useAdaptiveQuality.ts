'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  detectDeviceCapabilities,
  getParticleCountForQuality,
  type QualityLevel,
  type DeviceCapabilities,
} from '@/lib/detectDevice';

export type VisualMode = 'minimal' | 'ambient' | 'auto';

const STORAGE_KEY = 'pomo_visual_mode';
const DEFAULT_MODE: VisualMode = 'auto';

function loadVisualMode(): VisualMode {
  if (typeof window === 'undefined') {
    return DEFAULT_MODE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['minimal', 'ambient', 'auto'].includes(stored)) {
      return stored as VisualMode;
    }
    return DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

function saveVisualMode(mode: VisualMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
}

export interface AdaptiveQualityState {
  visualMode: VisualMode;
  setVisualMode: (mode: VisualMode) => void;
  quality: QualityLevel;
  deviceCapabilities: DeviceCapabilities;
  particleCount: number;
  showParticles: boolean;
  showBurst: boolean;
  isLoaded: boolean;
}

/**
 * Hook for adaptive quality and visual mode management
 *
 * Visual Modes:
 * - minimal: Only grain texture, no particles
 * - ambient: Full effects (standard)
 * - auto: Adapts based on device capabilities
 */
export function useAdaptiveQuality(): AdaptiveQualityState {
  const [visualMode, setVisualModeState] = useState<VisualMode>(DEFAULT_MODE);
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    isLowEnd: false,
    prefersReducedMotion: false,
    recommendedQuality: 'high',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings and detect device capabilities on mount
  useEffect(() => {
    const savedMode = loadVisualMode();
    const capabilities = detectDeviceCapabilities();

    setVisualModeState(savedMode);
    setDeviceCapabilities(capabilities);
    setIsLoaded(true);
  }, []);

  // Listen for reduced motion preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent): void => {
      setDeviceCapabilities((prev) => ({
        ...prev,
        prefersReducedMotion: e.matches,
        recommendedQuality: e.matches ? 'low' : prev.recommendedQuality,
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setVisualMode = useCallback((mode: VisualMode) => {
    setVisualModeState(mode);
    saveVisualMode(mode);
  }, []);

  // Determine effective quality based on mode and device
  const quality = useMemo<QualityLevel>(() => {
    if (visualMode === 'minimal') {
      return 'low';
    }
    if (visualMode === 'auto') {
      return deviceCapabilities.recommendedQuality;
    }
    // ambient mode: use high unless device is struggling
    return deviceCapabilities.prefersReducedMotion ? 'low' : 'high';
  }, [visualMode, deviceCapabilities]);

  // Particle count based on quality
  const particleCount = useMemo(() => {
    return getParticleCountForQuality(quality);
  }, [quality]);

  // Determine if particles should be shown
  const showParticles = useMemo(() => {
    if (deviceCapabilities.prefersReducedMotion) return false;
    if (visualMode === 'minimal') return false;
    return true;
  }, [visualMode, deviceCapabilities.prefersReducedMotion]);

  // Determine if burst effect should be shown
  const showBurst = useMemo(() => {
    if (deviceCapabilities.prefersReducedMotion) return false;
    if (visualMode === 'minimal') return false;
    return true;
  }, [visualMode, deviceCapabilities.prefersReducedMotion]);

  return {
    visualMode,
    setVisualMode,
    quality,
    deviceCapabilities,
    particleCount,
    showParticles,
    showBurst,
    isLoaded,
  };
}
