'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export type ParticleStyle = 'rise-fall' | 'shine-gather' | 'shuffle';
export type ResolvedParticleStyle = 'rise-fall' | 'shine-gather';

const STORAGE_KEY = 'particle_style';
const DEFAULT_STYLE: ParticleStyle = 'rise-fall';
const VALID_STYLES: ParticleStyle[] = ['rise-fall', 'shine-gather', 'shuffle'];

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
  const [isLoaded, setIsLoaded] = useState(false);

  // For shuffle: resolve once on mount
  const [shuffleResolution] = useState<ResolvedParticleStyle>(() => {
    return Math.random() > 0.5 ? 'rise-fall' : 'shine-gather';
  });

  // Load settings on mount
  useEffect(() => {
    const saved = loadStyle();
    setStyleState(saved);
    setIsLoaded(true);
  }, []);

  const setStyle = useCallback((newStyle: ParticleStyle) => {
    setStyleState(newStyle);
    saveStyle(newStyle);
  }, []);

  // Resolved style: for shuffle, use the session-stable resolution
  const resolvedStyle = useMemo<ResolvedParticleStyle>(() => {
    if (style === 'shuffle') {
      return shuffleResolution;
    }
    return style;
  }, [style, shuffleResolution]);

  return { style, setStyle, resolvedStyle, isLoaded };
}
