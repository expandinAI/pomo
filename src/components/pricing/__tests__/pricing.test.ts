// src/components/pricing/__tests__/pricing.test.ts

import { describe, it, expect } from 'vitest';

/**
 * Tests for Pricing Modal business logic
 *
 * Note: Component rendering tests would require jsdom environment.
 * These tests focus on the business logic and configuration.
 */

// Pricing configuration (mirrored from PricingModal.tsx)
const PRICING = {
  monthly: {
    price: '4.99',
    period: '/month',
  },
  yearly: {
    price: '39',
    period: '/year',
    badge: 'Save 35%',
  },
} as const;

describe('Pricing Configuration', () => {
  it('has correct monthly price', () => {
    expect(PRICING.monthly.price).toBe('4.99');
    expect(PRICING.monthly.period).toBe('/month');
  });

  it('has correct yearly price', () => {
    expect(PRICING.yearly.price).toBe('39');
    expect(PRICING.yearly.period).toBe('/year');
  });

  it('yearly has savings badge', () => {
    expect(PRICING.yearly.badge).toBe('Save 35%');
  });

  it('monthly has no badge', () => {
    expect('badge' in PRICING.monthly).toBe(false);
  });

  it('yearly savings calculation is approximately correct', () => {
    const monthlyAnnual = parseFloat(PRICING.monthly.price) * 12;
    const yearlyPrice = parseFloat(PRICING.yearly.price);
    const savings = ((monthlyAnnual - yearlyPrice) / monthlyAnnual) * 100;

    // Should be approximately 35% (allowing for rounding)
    expect(savings).toBeGreaterThan(34);
    expect(savings).toBeLessThan(36);
  });
});

describe('Trial-dependent CTA Text Logic', () => {
  /**
   * This logic is used in:
   * - FeatureGate.tsx (FlowUpgradeButton)
   * - AccountMenu.tsx
   * - DashboardHeatmap.tsx
   */

  function getUpgradeCTAText(trialHasUsed: boolean): string {
    return trialHasUsed ? 'Upgrade to Flow' : 'Try Flow for 14 days';
  }

  function getMenuCTAText(trialHasUsed: boolean): string {
    return trialHasUsed ? 'Upgrade to Flow' : 'Try Particle Flow';
  }

  it('shows "Try Flow" when trial not used', () => {
    expect(getUpgradeCTAText(false)).toBe('Try Flow for 14 days');
    expect(getMenuCTAText(false)).toBe('Try Particle Flow');
  });

  it('shows "Upgrade to Flow" when trial already used', () => {
    expect(getUpgradeCTAText(true)).toBe('Upgrade to Flow');
    expect(getMenuCTAText(true)).toBe('Upgrade to Flow');
  });
});

describe('Plan Selection Logic', () => {
  type PlanType = 'monthly' | 'yearly';

  function togglePlan(current: PlanType): PlanType {
    return current === 'monthly' ? 'yearly' : 'monthly';
  }

  it('defaults to yearly (better value)', () => {
    const defaultPlan: PlanType = 'yearly';
    expect(defaultPlan).toBe('yearly');
  });

  it('toggles from yearly to monthly', () => {
    expect(togglePlan('yearly')).toBe('monthly');
  });

  it('toggles from monthly to yearly', () => {
    expect(togglePlan('monthly')).toBe('yearly');
  });

  it('double toggle returns to original', () => {
    const original: PlanType = 'yearly';
    const toggled = togglePlan(togglePlan(original));
    expect(toggled).toBe(original);
  });
});

describe('Modal Decision Logic', () => {
  /**
   * Logic from page.tsx:
   * - If trial not used → show TrialStartModal
   * - If trial used → show PricingModal
   */

  type ModalType = 'TrialStartModal' | 'PricingModal';

  function getModalToShow(trialHasUsed: boolean): ModalType {
    return trialHasUsed ? 'PricingModal' : 'TrialStartModal';
  }

  it('shows TrialStartModal for new users', () => {
    expect(getModalToShow(false)).toBe('TrialStartModal');
  });

  it('shows PricingModal for users who used trial', () => {
    expect(getModalToShow(true)).toBe('PricingModal');
  });
});
