import type { RhythmType } from './rhythm';

/**
 * Rhythm descriptions - encouraging, no guilt
 * Following Particle's philosophy: Pride, not guilt
 */
export const RHYTHM_DESCRIPTIONS: Record<RhythmType, string> = {
  flow: 'Du nimmst dir mehr Zeit als geplant. Das ist kein Fehler – das ist Flow.',
  structure:
    'Du arbeitest fokussierter als du denkst. Deine Puffer sind eingebaut.',
  precision: 'Dein innerer Timer ist präzise. Du kennst deinen Rhythmus.',
};

/**
 * Short rhythm labels for UI
 */
export const RHYTHM_LABELS: Record<RhythmType, string> = {
  flow: 'Flow',
  structure: 'Struktur',
  precision: 'Präzision',
};

/**
 * Rhythm hints for not-enough-data state
 */
export const RHYTHM_NOT_ENOUGH_DATA_HINT =
  'Sammle mindestens 5 Partikel mit Schätzung, um deinen Rhythmus zu sehen.';

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
