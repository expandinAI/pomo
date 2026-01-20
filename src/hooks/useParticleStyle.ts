'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export type ParticleStyle = 'rise-fall' | 'shine-gather' | 'orbit-drift' | 'shuffle';
export type ResolvedParticleStyle = 'rise-fall' | 'shine-gather' | 'orbit-drift';
export type ParticlePace = 'drift' | 'flow' | 'pulse';

const STORAGE_KEY = 'particle_style';
const PARALLAX_STORAGE_KEY = 'particle_parallax';
const PACE_STORAGE_KEY = 'particle_pace';
const DEFAULT_STYLE: ParticleStyle = 'rise-fall';
const DEFAULT_PARALLAX = true;
const DEFAULT_PACE: ParticlePace = 'flow';
const VALID_STYLES: ParticleStyle[] = ['rise-fall', 'shine-gather', 'orbit-drift', 'shuffle'];
const RESOLVED_STYLES: ResolvedParticleStyle[] = ['rise-fall', 'shine-gather', 'orbit-drift'];
const VALID_PACES: ParticlePace[] = ['drift', 'flow', 'pulse'];
const PACE_MULTIPLIERS: Record<ParticlePace, number> = {
  drift: 1.4,   // Slower, dreamier
  flow: 1.0,   // Natural default
  pulse: 0.7,  // Faster, more lively
};

function loadStyle(): ParticleStyle {
  if (typeof window === 'undefined') {
    return DEFAULT_STYLE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_STYLES.includes(stored as ParticleStyle)) {
      return stored as ParticleStyle;
    }
    return DEFAULT_STYLE;
  } catch {
    return DEFAULT_STYLE;
  }
}

function saveStyle(style: ParticleStyle): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, style);
}

function loadParallax(): boolean {
  if (typeof window === 'undefined') {
    return DEFAULT_PARALLAX;
  }

  try {
    const stored = localStorage.getItem(PARALLAX_STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    return DEFAULT_PARALLAX;
  } catch {
    return DEFAULT_PARALLAX;
  }
}

function saveParallax(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PARALLAX_STORAGE_KEY, String(enabled));
}

function loadPace(): ParticlePace {
  if (typeof window === 'undefined') {
    return DEFAULT_PACE;
  }

  try {
    const stored = localStorage.getItem(PACE_STORAGE_KEY);
    if (stored && VALID_PACES.includes(stored as ParticlePace)) {
      return stored as ParticlePace;
    }
    return DEFAULT_PACE;
  } catch {
    return DEFAULT_PACE;
  }
}

function savePace(pace: ParticlePace): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PACE_STORAGE_KEY, pace);
}

/**
 * Hook for managing particle animation style preference.
 *
 * - rise-fall: Particles rise during work, sink during break
 * - shine-gather: Particles radiate outward during work, return to center during break
 * - shuffle: Randomly selects a style on app start (consistent during session)
 *
 * The resolved style is determined once on mount for shuffle mode,
 * ensuring consistent behavior throughout the session.
 */
export function useParticleStyle() {
  const [style, setStyleState] = useState<ParticleStyle>(DEFAULT_STYLE);
  const [parallaxEnabled, setParallaxState] = useState<boolean>(DEFAULT_PARALLAX);
  const [pace, setPaceState] = useState<ParticlePace>(DEFAULT_PACE);
  const [isLoaded, setIsLoaded] = useState(false);

  // For shuffle: resolve once on mount (randomly pick from all resolved styles)
  const [shuffleResolution] = useState<ResolvedParticleStyle>(() => {
    const randomIndex = Math.floor(Math.random() * RESOLVED_STYLES.length);
    return RESOLVED_STYLES[randomIndex];
  });

  // Load settings on mount
  useEffect(() => {
    const savedStyle = loadStyle();
    const savedParallax = loadParallax();
    const savedPace = loadPace();
    setStyleState(savedStyle);
    setParallaxState(savedParallax);
    setPaceState(savedPace);
    setIsLoaded(true);
  }, []);

  const setStyle = useCallback((newStyle: ParticleStyle) => {
    setStyleState(newStyle);
    saveStyle(newStyle);
  }, []);

  const setParallaxEnabled = useCallback((enabled: boolean) => {
    setParallaxState(enabled);
    saveParallax(enabled);
  }, []);

  const setPace = useCallback((newPace: ParticlePace) => {
    setPaceState(newPace);
    savePace(newPace);
  }, []);

  // Resolved style: for shuffle, use the session-stable resolution
  const resolvedStyle = useMemo<ResolvedParticleStyle>(() => {
    if (style === 'shuffle') {
      return shuffleResolution;
    }
    return style;
  }, [style, shuffleResolution]);

  // Pace multiplier: higher = slower animations, lower = faster
  const paceMultiplier = PACE_MULTIPLIERS[pace];

  return {
    style,
    setStyle,
    resolvedStyle,
    parallaxEnabled,
    setParallaxEnabled,
    pace,
    setPace,
    paceMultiplier,
    isLoaded,
  };
}
