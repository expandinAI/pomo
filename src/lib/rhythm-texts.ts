import type { RhythmType } from './rhythm';

/**
 * Rhythm descriptions - encouraging, no guilt
 * Following Particle's philosophy: Pride, not guilt
 */
export const RHYTHM_DESCRIPTIONS: Record<RhythmType, string> = {
  flow: "You take more time than planned. That's not a mistake – that's flow.",
  structure:
    "You work more focused than you think. Your buffers are built in.",
  precision: 'Your inner timer is precise. You know your rhythm.',
};

/**
 * Short rhythm labels for UI
 */
export const RHYTHM_LABELS: Record<RhythmType, string> = {
  flow: 'Flow',
  structure: 'Structure',
  precision: 'Precision',
};

/**
 * Rhythm hints for not-enough-data state
 */
export const RHYTHM_NOT_ENOUGH_DATA_HINT =
  'Collect at least 5 particles with estimates to discover your rhythm.';

/**
 * Get description for rhythm type
 */
export function getRhythmDescription(type: RhythmType): string {
  return RHYTHM_DESCRIPTIONS[type];
}

/**
 * Get short label for rhythm type
 */
export function getRhythmLabel(type: RhythmType): string {
  return RHYTHM_LABELS[type];
}
