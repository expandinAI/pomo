'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export type ParticleStyle = 'rise-fall' | 'shine-gather' | 'orbit-drift' | 'shuffle';
export type ResolvedParticleStyle = 'rise-fall' | 'shine-gather' | 'orbit-drift';

const STORAGE_KEY = 'particle_style';
const PARALLAX_STORAGE_KEY = 'particle_parallax';
const DEFAULT_STYLE: ParticleStyle = 'rise-fall';
const DEFAULT_PARALLAX = true;
const VALID_STYLES: ParticleStyle[] = ['rise-fall', 'shine-gather', 'orbit-drift', 'shuffle'];
const RESOLVED_STYLES: ResolvedParticleStyle[] = ['rise-fall', 'shine-gather', 'orbit-drift'];

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
    setStyleState(savedStyle);
    setParallaxState(savedParallax);
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

  // Resolved style: for shuffle, use the session-stable resolution
  const resolvedStyle = useMemo<ResolvedParticleStyle>(() => {
    if (style === 'shuffle') {
      return shuffleResolution;
    }
    return style;
  }, [style, shuffleResolution]);

  return { style, setStyle, resolvedStyle, parallaxEnabled, setParallaxEnabled, isLoaded };
}
