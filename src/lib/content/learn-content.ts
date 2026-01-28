/**
 * Content constants for the Learn section
 */

export interface RhythmContent {
  id: 'classic' | 'deepWork' | 'ultradian';
  presetId: string;
  title: string;
  duration: string;
  paragraphs: string[];
}

export const RHYTHM_INTRO =
  'Every particle has its own rhythm. Here are three that have helped people do their best work.';

export const RHYTHM_CLOSING =
  'There is no "right" or "wrong." Only what works for you.';

export const RHYTHM_CONTENT: RhythmContent[] = [
  {
    id: 'classic',
    presetId: 'classic',
    title: 'Classic',
    duration: '25 minutes',
    paragraphs: [
      'The origin. Francesco Cirillo called it "Pomodoro"—after his kitchen timer.',
      "Short sprints. Frequent breaks. Perfect when you're just starting—or when the inner resistance feels strongest.",
    ],
  },
  {
    id: 'deepWork',
    presetId: 'deepWork',
    title: 'Deep Work',
    duration: '52 minutes',
    paragraphs: [
      'A DeskTime study found that the most productive 10% work for 52 minutes, then rest for 17.',
      'Longer focus. Deeper work. For projects that demand your full attention.',
    ],
  },
  {
    id: 'ultradian',
    presetId: 'ultradian',
    title: '90-Min',
    duration: '90 minutes',
    paragraphs: [
      'Your body follows a 90-minute rhythm. Nathaniel Kleitman discovered it in the 1950s.',
      'For flow states. For work that makes you forget that time exists.',
    ],
  },
];
