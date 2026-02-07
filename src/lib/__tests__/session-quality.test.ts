import { describe, it, expect } from 'vitest';
import { getSessionQuality } from '../session-quality';

describe('getSessionQuality', () => {
  it('returns Quick Focus for 10 min session', () => {
    const result = getSessionQuality(600);
    expect(result).toEqual({ type: 'quick_focus', label: 'Quick Focus' });
  });

  it('returns null at 15 min boundary (not Quick Focus)', () => {
    const result = getSessionQuality(900);
    expect(result).toBeNull();
  });

  it('returns null for 25 min session (standard)', () => {
    const result = getSessionQuality(1500);
    expect(result).toBeNull();
  });

  it('returns Deep Work at 45 min boundary', () => {
    const result = getSessionQuality(2700);
    expect(result).toEqual({ type: 'deep_work', label: 'Deep Work' });
  });

  it('returns Deep Work for 60 min session', () => {
    const result = getSessionQuality(3600);
    expect(result).toEqual({ type: 'deep_work', label: 'Deep Work' });
  });

  it('returns Overflow Champion when duration > 150% of estimated', () => {
    // 2500s actual, 1500s estimated, 1000s overflow → 167%
    const result = getSessionQuality(2500, 1500, 1000);
    expect(result).toEqual({ type: 'overflow_champion', label: 'Overflow Champion' });
  });

  it('returns Overflow Champion over Deep Work for 90 min with overflow', () => {
    // 5400s actual, 3000s estimated, 2400s overflow → 180%
    const result = getSessionQuality(5400, 3000, 2400);
    expect(result).toEqual({ type: 'overflow_champion', label: 'Overflow Champion' });
  });

  it('returns null when no estimatedDuration (cannot be Overflow Champion)', () => {
    const result = getSessionQuality(2000);
    expect(result).toBeNull();
  });

  it('returns Overflow Champion over Quick Focus for short but overflowed session', () => {
    // 600s actual, 300s estimated, 300s overflow → 200%
    const result = getSessionQuality(600, 300, 300);
    expect(result).toEqual({ type: 'overflow_champion', label: 'Overflow Champion' });
  });

  it('returns null when overflow exists but ratio is not exceeded', () => {
    // 1400s actual, 1200s estimated, 200s overflow → 117% (< 150%)
    const result = getSessionQuality(1400, 1200, 200);
    expect(result).toBeNull();
  });

  it('returns Deep Work when overflow exists but ratio not exceeded and duration >= 45 min', () => {
    // 3000s actual, 2700s estimated, 300s overflow → 111% (< 150%)
    const result = getSessionQuality(3000, 2700, 300);
    expect(result).toEqual({ type: 'deep_work', label: 'Deep Work' });
  });
});
