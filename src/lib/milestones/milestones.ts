/**
 * Milestone Definitions
 *
 * Milestones are meaningful moments in a user's focus journey.
 * They celebrate accumulation and dedication, not streaks or gamification.
 *
 * Philosophy: "Die Arbeit eines Lebens besteht aus vielen Partikeln."
 */

export type MilestoneCategory = 'count' | 'time' | 'streak' | 'special';

export interface MilestoneDefinition {
  id: string;
  name: string;
  reflection: string;
  category: MilestoneCategory;
  /** Threshold value for automatic detection (particles, hours, days) */
  threshold?: number;
}

/**
 * All milestone definitions
 *
 * Reflections are poetic, not cheesy. They acknowledge the work
 * without being condescending or gamified.
 */
export const MILESTONES: MilestoneDefinition[] = [
  // Count-based milestones (particle accumulation)
  {
    id: 'first-particle',
    name: 'First Particle',
    reflection: 'One particle. One decision. Everything starts here.',
    category: 'count',
    threshold: 1,
  },
  {
    id: 'ten-particles',
    name: 'Ten Particles',
    reflection: 'Ten times you chose to begin. Ten times you stayed. This is how mountains move.',
    category: 'count',
    threshold: 10,
  },
  {
    id: 'fifty-particles',
    name: 'Fifty Particles',
    reflection: 'Fifty particles of intention. Each one a quiet victory over the noise.',
    category: 'count',
    threshold: 50,
  },
  {
    id: 'hundred-particles',
    name: 'Hundred Particles',
    reflection: 'A hundred particles. Not just time—a hundred moments where you chose what matters.',
    category: 'count',
    threshold: 100,
  },
  {
    id: 'five-hundred-particles',
    name: 'Five Hundred Particles',
    reflection: 'Five hundred particles. A constellation of focus. Your universe is taking shape.',
    category: 'count',
    threshold: 500,
  },
  {
    id: 'thousand-particles',
    name: 'Thousand Particles',
    reflection: 'A thousand particles. This is no longer practice. This is who you are.',
    category: 'count',
    threshold: 1000,
  },

  // Time-based milestones (hours accumulated)
  {
    id: 'ten-hours',
    name: 'Ten Hours',
    reflection: 'Ten hours of presence. A full day, given to what matters. This is the foundation.',
    category: 'time',
    threshold: 10,
  },
  {
    id: 'fifty-hours',
    name: 'Fifty Hours',
    reflection: 'Fifty hours. Not spent—invested. In yourself. In your craft. In your future.',
    category: 'time',
    threshold: 50,
  },
  {
    id: 'hundred-hours',
    name: 'Hundred Hours',
    reflection: 'A hundred hours of focus. This is what dedication looks like when no one is watching.',
    category: 'time',
    threshold: 100,
  },
  {
    id: 'five-hundred-hours',
    name: 'Five Hundred Hours',
    reflection: 'Five hundred hours. Masters are made in the quiet accumulation of focused time. You are on that path.',
    category: 'time',
    threshold: 500,
  },
  {
    id: 'thousand-hours',
    name: 'Thousand Hours',
    reflection: 'A thousand hours. The work speaks now. You have earned the right to be heard.',
    category: 'time',
    threshold: 1000,
  },

  // Streak-based milestones (consecutive days)
  {
    id: 'one-week',
    name: 'One Week',
    reflection: 'Seven days without breaking the chain. The hardest part is behind you.',
    category: 'streak',
    threshold: 7,
  },
  {
    id: 'two-weeks',
    name: 'Two Weeks',
    reflection: 'Fourteen days. The resistance is fading. Focus is becoming natural.',
    category: 'streak',
    threshold: 14,
  },
  {
    id: 'one-month',
    name: 'One Month',
    reflection: 'Thirty days. A full month of choosing focus. This is not discipline anymore—this is identity.',
    category: 'streak',
    threshold: 30,
  },
  {
    id: 'three-months',
    name: 'Three Months',
    reflection: 'Ninety days. A quarter of transformation. You are not the same person who started.',
    category: 'streak',
    threshold: 90,
  },

  // Special milestones (triggered by specific events)
  {
    id: 'deep-work',
    name: 'Deep Work',
    reflection: 'Ninety unbroken minutes. You touched the deep. Most never do.',
    category: 'special',
    // Triggered when completing a 90-min session
  },
  {
    id: 'first-project',
    name: 'First Project',
    reflection: 'Your focus now has a name. Purpose has entered the room.',
    category: 'special',
    // Triggered when creating the first project
  },
];

/**
 * Get milestone by ID
 */
export function getMilestoneById(id: string): MilestoneDefinition | undefined {
  return MILESTONES.find((m) => m.id === id);
}

/**
 * Get all count-based milestones sorted by threshold
 */
export function getCountMilestones(): MilestoneDefinition[] {
  return MILESTONES
    .filter((m) => m.category === 'count' && m.threshold !== undefined)
    .sort((a, b) => (a.threshold ?? 0) - (b.threshold ?? 0));
}

/**
 * Get all time-based milestones sorted by threshold (hours)
 */
export function getTimeMilestones(): MilestoneDefinition[] {
  return MILESTONES
    .filter((m) => m.category === 'time' && m.threshold !== undefined)
    .sort((a, b) => (a.threshold ?? 0) - (b.threshold ?? 0));
}

/**
 * Get all streak-based milestones sorted by threshold (days)
 */
export function getStreakMilestones(): MilestoneDefinition[] {
  return MILESTONES
    .filter((m) => m.category === 'streak' && m.threshold !== undefined)
    .sort((a, b) => (a.threshold ?? 0) - (b.threshold ?? 0));
}

/**
 * Get all special milestones
 */
export function getSpecialMilestones(): MilestoneDefinition[] {
  return MILESTONES.filter((m) => m.category === 'special');
}
