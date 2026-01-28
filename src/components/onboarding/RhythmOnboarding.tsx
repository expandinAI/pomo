'use client';

import { OnboardingOverlay, OnboardingOption, OnboardingFallback } from './OnboardingOverlay';

// ============================================================================
// RHYTHM ONBOARDING - First-run rhythm preset selection
// ============================================================================
//
// This is the first onboarding a user sees. It asks them to choose their
// preferred work rhythm (Classic, Deep Work, or 90-Min).
//
// Triggered: On first timer start attempt (Space or click)
// Result: Sets the active rhythm preset
// Storage: 'particle:rhythm-onboarding-completed'
// ============================================================================

/** Rhythm preset options with full explanations */
const RHYTHM_OPTIONS: OnboardingOption[] = [
  {
    id: 'classic',
    label: 'Classic',
    sublabel: '25 min',
    description: 'The original Pomodoro technique. Short, focused sprints with frequent breaks.',
    confirmation: 'Classic rhythm selected. Short sprints, frequent breaks.',
  },
  {
    id: 'deepWork',
    label: 'Deep Work',
    sublabel: '52 min',
    description: 'Based on productivity research. Longer focus for complex, creative work.',
    confirmation: 'Deep Work rhythm selected. Longer focus, deeper immersion.',
  },
  {
    id: 'ultradian',
    label: '90-Min',
    sublabel: '90 min',
    description: 'Full ultradian cycle. Matches your natural energy rhythm.',
    confirmation: '90-Min rhythm selected. Complete energy cycles.',
  },
];

/** Fallback for users who are unsure */
const RHYTHM_FALLBACK: OnboardingFallback = {
  label: "I'm not sure – start with Classic",
  resultId: 'classic',
  confirmation: 'Starting with Classic. You can switch anytime with keys 1, 2, or 3.',
};

interface RhythmOnboardingProps {
  /** Called with the selected preset ID when onboarding completes */
  onComplete: (presetId: string) => void;
}

/**
 * RhythmOnboarding - First-run rhythm selection overlay
 *
 * Shows on first timer start attempt. Lets users choose their preferred
 * work rhythm before starting their first focus session.
 *
 * @example
 * ```tsx
 * <RhythmOnboarding onComplete={(presetId) => {
 *   applyPreset(presetId);
 *   startTimer();
 * }} />
 * ```
 */
export function RhythmOnboarding({ onComplete }: RhythmOnboardingProps) {
  return (
    <OnboardingOverlay
      title="Choose your rhythm"
      subtitle="You can switch anytime with keys 1, 2, or 3"
      options={RHYTHM_OPTIONS}
      fallback={RHYTHM_FALLBACK}
      onComplete={onComplete}
    />
  );
}
