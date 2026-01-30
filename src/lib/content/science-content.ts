export const SCIENCE_INTRO = "Focus isn't magic. It's biology.";
export const SCIENCE_SUBINTRO = "Here's what science knows about your brain—and how Particle builds on it.";

export interface ScienceSection {
  id: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  particleNote?: string;
}

export const SCIENCE_SECTIONS: ScienceSection[] = [
  {
    id: 'cirillo',
    title: 'The Origin',
    subtitle: 'Francesco Cirillo (1980s)',
    paragraphs: [
      'A kitchen timer shaped like a tomato.',
      '1987, University of Rome. Francesco Cirillo, a student, struggles with focus. He reaches for a kitchen timer—a red tomato—and sets it for 10 minutes.',
      '"Can you focus for just 10 minutes?"',
      'He could. So he increased it to 25.',
      'The Pomodoro Technique was born.',
      'Today, decades later, it\'s one of the most practiced focus methods in the world.',
    ],
    particleNote: "Particle's Classic rhythm (25 min) is based on Cirillo's discovery.",
  },
  {
    id: 'kleitman',
    title: 'Ultradian Rhythms',
    subtitle: 'Nathaniel Kleitman (1950s)',
    paragraphs: [
      'Your body runs on 90-minute cycles.',
      'Nathaniel Kleitman, the "father of sleep research," discovered something remarkable in the 1950s:',
      'Not just during sleep—even while awake, your body follows a rhythm. About every 90 minutes, your brain shifts between phases of higher and lower activity.',
      'The BRAC cycle (Basic Rest-Activity Cycle) explains why 90 minutes often feels "natural"—and why a break is due afterward.',
    ],
    particleNote: "Particle's 90-Min rhythm follows this biological clock.",
  },
  {
    id: 'desktime',
    title: 'The DeskTime Study',
    subtitle: '2014',
    paragraphs: [
      'What do the most productive people do differently?',
      'The company DeskTime analyzed the work habits of millions of users. The question: What sets the top 10% apart?',
      'The answer surprised everyone:',
      'They didn\'t work the longest. They worked 52 minutes at a stretch—followed by 17 minutes of real rest.',
      'No multitasking. No half-breaks with emails. Full concentration, then complete recovery.',
    ],
    particleNote: "Particle's Deep Work rhythm (52/17) is based on this study.",
  },
  {
    id: 'flow',
    title: 'Flow State',
    subtitle: 'Mihaly Csikszentmihalyi',
    paragraphs: [
      'The state where time disappears.',
      'Psychologist Mihaly Csikszentmihalyi (pronounced "cheek-sent-me-hi") coined the term "Flow"—that state of complete absorption where hours feel like minutes.',
      'Flow happens when: The task is challenging enough (not boring), but achievable (not overwhelming), you get clear feedback, and you\'re undisturbed.',
      'Particle creates the frame. Flow emerges on its own.',
    ],
  },
  {
    id: 'attention-residue',
    title: 'Attention Residue',
    subtitle: 'Sophie Leroy (2009)',
    paragraphs: [
      'Why multitasking doesn\'t work.',
      'Researcher Sophie Leroy discovered the phenomenon of "Attention Residue":',
      'When you switch between tasks, part of your attention stays stuck on the previous task. Your brain needs time to fully transition.',
      'That\'s why constant switching feels so exhausting—and why focused blocks work so well.',
      'One particle. One task. Full attention.',
    ],
  },
];

export const SCIENCE_CLOSING = [
  "Science gives us direction. But your body knows itself best.",
  "Try the rhythms. Observe what works. Trust your experience.",
  "Research shows the way. You walk it.",
];
