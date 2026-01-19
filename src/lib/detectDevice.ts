/**
 * Device capability detection utilities for adaptive quality
 */

export type QualityLevel = 'low' | 'medium' | 'high';

export interface DeviceCapabilities {
  isMobile: boolean;
  isLowEnd: boolean;
  prefersReducedMotion: boolean;
  recommendedQuality: QualityLevel;
}

/**
 * Detect device capabilities for adaptive visual quality
 *
 * Checks:
 * - Mobile device via user agent
 * - Low-end device via hardware concurrency
 * - Reduced motion preference
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isMobile: false,
      isLowEnd: false,
      prefersReducedMotion: false,
      recommendedQuality: 'high',
    };
  }

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const isLowEnd = hardwareConcurrency <= 4;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Determine recommended quality based on device capabilities
  let recommendedQuality: QualityLevel = 'high';

  if (prefersReducedMotion) {
    recommendedQuality = 'low';
  } else if (isMobile || isLowEnd) {
    recommendedQuality = 'low';
  } else if (hardwareConcurrency <= 8) {
    recommendedQuality = 'medium';
  }

  return {
    isMobile,
    isLowEnd,
    prefersReducedMotion,
    recommendedQuality,
  };
}

/**
 * Get particle count based on quality level
 */
export function getParticleCountForQuality(quality: QualityLevel): number {
  switch (quality) {
    case 'low':
      return 10;
    case 'medium':
      return 15;
    case 'high':
    default:
      return 20;
  }
}
