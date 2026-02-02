'use client';

import { useState, useEffect } from 'react';

interface DeviceType {
  /** True if the device has a coarse pointer (touch screen) */
  isTouchDevice: boolean;
  /** True if viewport width is < 640px */
  isMobileViewport: boolean;
  /** True after initial client-side detection completes */
  isLoaded: boolean;
}

/**
 * useDeviceType
 *
 * Detects device characteristics for responsive UI decisions.
 * Uses media queries for both touch detection and viewport size.
 *
 * Returns:
 * - isTouchDevice: true for touch screens (phones, tablets)
 * - isMobileViewport: true when viewport is < 640px (Tailwind sm breakpoint)
 * - isLoaded: true after hydration (avoids SSR mismatch)
 */
export function useDeviceType(): DeviceType {
  const [state, setState] = useState<DeviceType>({
    isTouchDevice: false,
    isMobileViewport: false,
    isLoaded: false,
  });

  useEffect(() => {
    const touchQuery = window.matchMedia('(pointer: coarse)');
    const viewportQuery = window.matchMedia('(max-width: 639px)');

    const updateState = () => {
      setState({
        isTouchDevice: touchQuery.matches,
        isMobileViewport: viewportQuery.matches,
        isLoaded: true,
      });
    };

    updateState();
    touchQuery.addEventListener('change', updateState);
    viewportQuery.addEventListener('change', updateState);

    return () => {
      touchQuery.removeEventListener('change', updateState);
      viewportQuery.removeEventListener('change', updateState);
    };
  }, []);

  return state;
}
