// src/lib/intentions/utils.test.ts

import { describe, it, expect } from 'vitest';
import {
  getParticleColorClass,
  getParticleHexColor,
  isReactiveParticle,
  getParticleLightModeClass,
  getParticleClasses,
} from './utils';

describe('Particle Color Utilities', () => {
  describe('getParticleColorClass', () => {
    it('returns white bg classes for aligned', () => {
      expect(getParticleColorClass('aligned')).toBe('bg-white dark:bg-primary');
    });

    it('returns tertiary bg class for reactive', () => {
      expect(getParticleColorClass('reactive')).toBe('bg-tertiary');
    });

    it('returns white bg classes for none', () => {
      expect(getParticleColorClass('none')).toBe('bg-white dark:bg-primary');
    });

    it('returns white bg classes for undefined (defaults to none)', () => {
      expect(getParticleColorClass(undefined)).toBe('bg-white dark:bg-primary');
    });
  });

  describe('getParticleHexColor', () => {
    it('returns #FFFFFF for aligned', () => {
      expect(getParticleHexColor('aligned')).toBe('#FFFFFF');
    });

    it('returns #525252 for reactive', () => {
      expect(getParticleHexColor('reactive')).toBe('#525252');
    });

    it('returns #FFFFFF for none', () => {
      expect(getParticleHexColor('none')).toBe('#FFFFFF');
    });

    it('returns #FFFFFF for undefined', () => {
      expect(getParticleHexColor(undefined)).toBe('#FFFFFF');
    });
  });

  describe('isReactiveParticle', () => {
    it('returns true for reactive', () => {
      expect(isReactiveParticle('reactive')).toBe(true);
    });

    it('returns false for aligned', () => {
      expect(isReactiveParticle('aligned')).toBe(false);
    });

    it('returns false for none', () => {
      expect(isReactiveParticle('none')).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isReactiveParticle(undefined)).toBe(false);
    });
  });

  describe('getParticleLightModeClass', () => {
    it('returns light mode classes for aligned', () => {
      expect(getParticleLightModeClass('aligned')).toBe(
        'light:shadow-sm light:ring-1 light:ring-tertiary/20'
      );
    });

    it('returns empty string for reactive', () => {
      expect(getParticleLightModeClass('reactive')).toBe('');
    });

    it('returns light mode classes for none', () => {
      expect(getParticleLightModeClass('none')).toBe(
        'light:shadow-sm light:ring-1 light:ring-tertiary/20'
      );
    });
  });

  describe('getParticleClasses', () => {
    it('combines color and light mode classes for aligned', () => {
      expect(getParticleClasses('aligned')).toBe(
        'bg-white dark:bg-primary light:shadow-sm light:ring-1 light:ring-tertiary/20'
      );
    });

    it('returns only color class for reactive (no light mode enhancement needed)', () => {
      expect(getParticleClasses('reactive')).toBe('bg-tertiary');
    });
  });
});
