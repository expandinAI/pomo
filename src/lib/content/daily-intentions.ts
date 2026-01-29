/**
 * Daily Intention Statements
 *
 * Curated collection of meditative, philosophical statements
 * that embody Particle's DNA: calm focus, meaningful work, small moments.
 *
 * Each intention has TWO lines for the animation flow:
 * - text: First line (truth1 phase)
 * - subtext: Second line (invitation phase)
 *
 * Guidelines for adding new statements:
 * - Line 1: Sets up the thought (4-8 words)
 * - Line 2: The twist/payoff (2-5 words)
 * - Together they create a moment of reflection
 */

export interface DailyIntention {
  /** The main statement (shown during truth1) */
  text: string;
  /** The second line - the twist (shown during invitation) */
  subtext: string;
}

/**
 * The original intro - shown to first-time users
 */
export const ORIGINAL_INTRO: DailyIntention = {
  text: 'Great things start small.',
  subtext: 'This small.',
};

/**
 * Collection of daily intentions
 * Randomly selected for returning users with feature enabled
 */
export const DAILY_INTENTIONS: DailyIntention[] = [
  // Presence & Focus
  {
    text: 'The only moment is this one.',
    subtext: 'Be in it.',
  },
  {
    text: 'One breath. One task.',
    subtext: 'Nothing more.',
  },
  {
    text: 'Your attention is a gift.',
    subtext: 'Give it wisely.',
  },
  {
    text: 'Not perfect.',
    subtext: 'Present.',
  },
  {
    text: 'Clear the noise.',
    subtext: 'Find the signal.',
  },

  // Work & Craft
  {
    text: 'The work is the reward.',
    subtext: 'Start now.',
  },
  {
    text: 'Small today.',
    subtext: 'Significant tomorrow.',
  },
  {
    text: 'Every masterpiece started here.',
    subtext: 'With one moment.',
  },
  {
    text: 'Depth over speed.',
    subtext: 'Always.',
  },
  {
    text: 'What matters most?',
    subtext: 'Do that.',
  },

  // Time & Patience
  {
    text: 'Minutes become monuments.',
    subtext: 'Starting now.',
  },
  {
    text: 'Trust the process.',
    subtext: 'Trust yourself.',
  },
  {
    text: 'Slow is smooth.',
    subtext: 'Smooth is fast.',
  },
  {
    text: 'Time well spent.',
    subtext: 'Never lost.',
  },
  {
    text: 'Plant seeds today.',
    subtext: 'Harvest tomorrow.',
  },

  // Calm & Clarity
  {
    text: 'Clarity comes from stillness.',
    subtext: 'Be still.',
  },
  {
    text: 'Less noise.',
    subtext: 'More signal.',
  },
  {
    text: 'Simplify first.',
    subtext: 'Then begin.',
  },
  {
    text: 'In the quiet.',
    subtext: 'Answers emerge.',
  },
  {
    text: 'Calm is a superpower.',
    subtext: 'Use it.',
  },

  // Beginning & Commitment
  {
    text: "Begin before you're ready.",
    subtext: 'Begin now.',
  },
  {
    text: 'Show up.',
    subtext: "That's the hardest part.",
  },
  {
    text: 'One step.',
    subtext: 'Then another.',
  },
  {
    text: 'Start where you are.',
    subtext: 'Not where you wish.',
  },
  {
    text: 'The path is made by walking.',
    subtext: 'Walk.',
  },

  // Meaning & Purpose
  {
    text: 'Make it matter.',
    subtext: 'Make it count.',
  },
  {
    text: 'Your work echoes forward.',
    subtext: 'What will it say?',
  },
  {
    text: 'Create something true.',
    subtext: 'Starting here.',
  },
  {
    text: 'What would make today enough?',
    subtext: 'Do that.',
  },
  {
    text: 'Leave it better.',
    subtext: 'Than you found it.',
  },

  // ============================================================================
  // Extended Collection (50 more)
  // ============================================================================

  // Presence & Focus (Extended)
  {
    text: 'Where is your mind?',
    subtext: 'Bring it here.',
  },
  {
    text: 'Distractions will wait.',
    subtext: 'This cannot.',
  },
  {
    text: 'Full attention.',
    subtext: 'Full results.',
  },
  {
    text: 'Scatter nothing.',
    subtext: 'Focus everything.',
  },
  {
    text: 'The mind wanders.',
    subtext: 'Gently return.',
  },

  // Work & Craft (Extended)
  {
    text: 'Good enough rarely is.',
    subtext: 'Go deeper.',
  },
  {
    text: 'The details matter.',
    subtext: 'Attend to them.',
  },
  {
    text: 'Craftsmanship is care.',
    subtext: 'Care deeply.',
  },
  {
    text: 'Build what lasts.',
    subtext: 'Not what trends.',
  },
  {
    text: 'Your standards define you.',
    subtext: 'Raise them.',
  },

  // Time & Patience (Extended)
  {
    text: 'Rushing creates debt.',
    subtext: 'Patience pays.',
  },
  {
    text: 'There is enough time.',
    subtext: 'Use it well.',
  },
  {
    text: 'Compound interest applies to effort.',
    subtext: 'Start early.',
  },
  {
    text: 'Rome took centuries.',
    subtext: "You have today.",
  },
  {
    text: 'Progress hides in days.',
    subtext: 'Trust the weeks.',
  },

  // Calm & Clarity (Extended)
  {
    text: 'Overwhelm is a choice.',
    subtext: 'Choose clarity.',
  },
  {
    text: 'Breathe first.',
    subtext: 'Decide second.',
  },
  {
    text: 'Chaos outside.',
    subtext: 'Order within.',
  },
  {
    text: 'Peace is productive.',
    subtext: 'Protect it.',
  },
  {
    text: 'Still water runs deep.',
    subtext: 'Be still.',
  },

  // Beginning & Commitment (Extended)
  {
    text: 'Motivation fades.',
    subtext: 'Discipline remains.',
  },
  {
    text: 'The hardest step?',
    subtext: 'The first one.',
  },
  {
    text: 'Commit fully.',
    subtext: 'Or not at all.',
  },
  {
    text: 'Hesitation is heavy.',
    subtext: 'Action is light.',
  },
  {
    text: 'Decide once.',
    subtext: 'Execute daily.',
  },

  // Meaning & Purpose (Extended)
  {
    text: 'Why are you here?',
    subtext: 'Remember that.',
  },
  {
    text: 'Busy is not meaningful.',
    subtext: 'Be meaningful.',
  },
  {
    text: 'Work without purpose wanders.',
    subtext: 'Find yours.',
  },
  {
    text: 'Impact over activity.',
    subtext: 'Always.',
  },
  {
    text: 'What will you be proud of?',
    subtext: 'Do that.',
  },

  // Rest & Recovery (New)
  {
    text: 'Rest is not weakness.',
    subtext: "It's wisdom.",
  },
  {
    text: 'A tired mind makes poor choices.',
    subtext: 'Rest first.',
  },
  {
    text: 'Recovery is part of the work.',
    subtext: 'Honor it.',
  },
  {
    text: 'You cannot pour from empty.',
    subtext: 'Refill.',
  },
  {
    text: 'Pause is not stopping.',
    subtext: "It's preparing.",
  },

  // Simplicity (New)
  {
    text: 'Complexity is easy.',
    subtext: 'Simplicity is hard.',
  },
  {
    text: 'What can you remove?',
    subtext: 'Remove it.',
  },
  {
    text: 'More is not better.',
    subtext: 'Better is better.',
  },
  {
    text: 'Subtract before you add.',
    subtext: 'Always.',
  },
  {
    text: 'Essence over excess.',
    subtext: 'Find the core.',
  },

  // Growth & Learning (New)
  {
    text: 'Every expert was once lost.',
    subtext: 'Keep going.',
  },
  {
    text: 'Mistakes are tuition.',
    subtext: 'Pay attention.',
  },
  {
    text: 'Comfort is a trap.',
    subtext: 'Grow instead.',
  },
  {
    text: "You don't know yet.",
    subtext: 'Yet.',
  },
  {
    text: 'Feedback is a gift.',
    subtext: 'Accept it.',
  },

  // Resistance & Obstacles (New)
  {
    text: 'The obstacle is the path.',
    subtext: 'Walk through.',
  },
  {
    text: 'Resistance means you care.',
    subtext: 'Push through.',
  },
  {
    text: 'Hard is not impossible.',
    subtext: 'Just hard.',
  },
  {
    text: 'Fear points to growth.',
    subtext: 'Follow it.',
  },
  {
    text: 'Stuck is temporary.',
    subtext: 'Move anyway.',
  },

  // Self & Identity (New)
  {
    text: 'You are what you do daily.',
    subtext: 'Choose wisely.',
  },
  {
    text: 'Your future self is watching.',
    subtext: 'Make them proud.',
  },
  {
    text: 'Actions reveal values.',
    subtext: 'What do yours say?',
  },
  {
    text: 'Be the person who does the work.',
    subtext: 'Be that person.',
  },
  {
    text: 'Integrity is doing it alone.',
    subtext: 'Do it.',
  },
];

/**
 * Get a random daily intention
 * Uses date as seed for consistent daily selection
 */
export function getDailyIntention(date: Date = new Date()): DailyIntention {
  // Use date string as seed for pseudo-random but consistent daily selection
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const seed = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = seed % DAILY_INTENTIONS.length;
  return DAILY_INTENTIONS[index];
}

/**
 * Get a completely random intention (different each time)
 */
export function getRandomIntention(): DailyIntention {
  const index = Math.floor(Math.random() * DAILY_INTENTIONS.length);
  return DAILY_INTENTIONS[index];
}
