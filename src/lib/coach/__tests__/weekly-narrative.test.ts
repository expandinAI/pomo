import { describe, it, expect } from 'vitest';
import {
  generateLocalNarrative,
  computeNarrativeStats,
  getCacheKey,
  QUIET_WEEK_FALLBACK,
  MIN_PARTICLES_FOR_NARRATIVE,
  type WeekData,
  type WeekDailyBreakdown,
  type WeekProjectDistribution,
} from '../weekly-narrative';

// ============================================
// Test Helpers
// ============================================

function baseDailyBreakdown(overrides: Partial<WeekDailyBreakdown>[] = []): WeekDailyBreakdown[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.map((day, i) => ({
    day,
    date: `2026-01-${26 + i}`,
    particles: 0,
    minutes: 0,
    ...overrides[i],
  }));
}

function baseWeekData(overrides: Partial<WeekData> = {}): WeekData {
  const dailyBreakdown = overrides.dailyBreakdown ?? baseDailyBreakdown([
    { particles: 3, minutes: 75 },
    { particles: 2, minutes: 50 },
    { particles: 4, minutes: 100 },
    { particles: 1, minutes: 25 },
    { particles: 2, minutes: 50 },
  ]);

  const totalParticles = dailyBreakdown.reduce((s, d) => s + d.particles, 0);
  const totalMinutes = dailyBreakdown.reduce((s, d) => s + d.minutes, 0);

  return {
    startDate: '2026-01-26',
    endDate: '2026-02-01',
    totalParticles: overrides.totalParticles ?? totalParticles,
    totalMinutes: overrides.totalMinutes ?? totalMinutes,
    dailyBreakdown,
    projectDistribution: overrides.projectDistribution ?? [
      { name: 'API Refactor', percentage: 45, particles: 5, minutes: 135 },
      { name: 'Design System', percentage: 35, particles: 4, minutes: 105 },
      { name: 'Docs', percentage: 20, particles: 3, minutes: 60 },
    ],
    ...overrides,
  };
}

// ============================================
// Tests
// ============================================

describe('generateLocalNarrative', () => {
  describe('Quiet week fallback', () => {
    it('returns QUIET_WEEK_FALLBACK when totalParticles < MIN_PARTICLES', () => {
      const data = baseWeekData({ totalParticles: 2 });
      expect(generateLocalNarrative(data)).toBe(QUIET_WEEK_FALLBACK);
    });

    it('returns QUIET_WEEK_FALLBACK for 0 particles', () => {
      const data = baseWeekData({
        totalParticles: 0,
        dailyBreakdown: baseDailyBreakdown(),
      });
      expect(generateLocalNarrative(data)).toBe(QUIET_WEEK_FALLBACK);
    });
  });

  describe('Arc sentence', () => {
    it('produces "full week" arc when 5+ active days', () => {
      const data = baseWeekData({
        dailyBreakdown: baseDailyBreakdown([
          { particles: 2, minutes: 50 },
          { particles: 2, minutes: 50 },
          { particles: 2, minutes: 50 },
          { particles: 2, minutes: 50 },
          { particles: 2, minutes: 50 },
        ]),
        totalParticles: 10,
      });
      expect(generateLocalNarrative(data)).toContain('a full week');
    });

    it('produces "quality over quantity" arc when <= 2 active days', () => {
      const data = baseWeekData({
        dailyBreakdown: baseDailyBreakdown([
          { particles: 5, minutes: 125 },
          { particles: 3, minutes: 75 },
        ]),
        totalParticles: 8,
      });
      expect(generateLocalNarrative(data)).toContain('quality over quantity');
    });

    it('produces neutral arc when 3-4 active days', () => {
      const data = baseWeekData({
        dailyBreakdown: baseDailyBreakdown([
          { particles: 3, minutes: 75 },
          { particles: 2, minutes: 50 },
          { particles: 4, minutes: 100 },
        ]),
        totalParticles: 9,
      });
      const narrative = generateLocalNarrative(data);
      expect(narrative).toContain('spread across 3 days');
    });
  });

  describe('Detail sentence', () => {
    it('mentions single project when only one project', () => {
      const data = baseWeekData({
        projectDistribution: [
          { name: 'API Refactor', percentage: 100, particles: 12, minutes: 300 },
        ],
      });
      expect(generateLocalNarrative(data)).toContain('All dedicated to API Refactor');
    });

    it('mentions dominant project when >= 60%', () => {
      const data = baseWeekData({
        projectDistribution: [
          { name: 'Design System', percentage: 70, particles: 8, minutes: 210 },
          { name: 'Docs', percentage: 30, particles: 4, minutes: 90 },
        ],
      });
      expect(generateLocalNarrative(data)).toContain('Design System dominated with 70%');
    });

    it('mentions variety when 3+ projects', () => {
      const data = baseWeekData({
        projectDistribution: [
          { name: 'API Refactor', percentage: 40, particles: 5, minutes: 120 },
          { name: 'Design System', percentage: 35, particles: 4, minutes: 105 },
          { name: 'Docs', percentage: 25, particles: 3, minutes: 75 },
        ],
      });
      expect(generateLocalNarrative(data)).toContain('a week of variety');
    });

    it('falls back to strongest day detail', () => {
      const data = baseWeekData({
        dailyBreakdown: baseDailyBreakdown([
          { particles: 2, minutes: 50 },
          { particles: 6, minutes: 150 },
          { particles: 2, minutes: 50 },
        ]),
        totalParticles: 10,
        projectDistribution: [
          { name: 'API Refactor', percentage: 55, particles: 6, minutes: 165 },
          { name: 'Design System', percentage: 45, particles: 4, minutes: 85 },
        ],
      });
      expect(generateLocalNarrative(data)).toContain('Tuesday was your strongest');
    });
  });

  describe('Highlight sentence', () => {
    it('mentions POTW with project name', () => {
      const data = baseWeekData({
        particleOfTheWeek: {
          task: 'Fix auth',
          projectName: 'API Refactor',
          duration: 2700, // 45 min
          reason: 'longest',
        },
      });
      expect(generateLocalNarrative(data)).toContain('Standout moment: 45 minutes on API Refactor');
    });

    it('mentions POTW without project name', () => {
      const data = baseWeekData({
        particleOfTheWeek: {
          task: 'Fix auth',
          duration: 1800, // 30 min
          reason: 'longest',
        },
      });
      expect(generateLocalNarrative(data)).toContain('Standout moment: a 30-minute deep session');
    });

    it('falls back to strongest day highlight when no POTW', () => {
      const data = baseWeekData({
        dailyBreakdown: baseDailyBreakdown([
          { particles: 3, minutes: 75 },
          { particles: 2, minutes: 50 },
          { particles: 7, minutes: 175 },
        ]),
        totalParticles: 12,
      });
      const narrative = generateLocalNarrative(data);
      expect(narrative).toContain('Wednesday was the highlight with 7 particles');
    });
  });
});

describe('computeNarrativeStats', () => {
  it('returns correct totals', () => {
    const data = baseWeekData({
      totalParticles: 15,
      totalMinutes: 375,
      projectDistribution: [
        { name: 'API Refactor', percentage: 60, particles: 9, minutes: 225 },
        { name: 'Design System', percentage: 40, particles: 6, minutes: 150 },
      ],
    });
    const stats = computeNarrativeStats(data);
    expect(stats.totalParticles).toBe(15);
    expect(stats.totalMinutes).toBe(375);
    expect(stats.projectCount).toBe(2);
  });

  it('excludes "No Project" from count', () => {
    const data = baseWeekData({
      projectDistribution: [
        { name: 'API Refactor', percentage: 70, particles: 7, minutes: 210 },
        { name: 'No Project', percentage: 30, particles: 3, minutes: 90 },
      ],
    });
    const stats = computeNarrativeStats(data);
    expect(stats.projectCount).toBe(1);
  });
});

describe('getCacheKey', () => {
  it('returns correct format', () => {
    expect(getCacheKey('2026-01-26')).toBe('particle:weekly-narrative:2026-01-26');
  });
});
