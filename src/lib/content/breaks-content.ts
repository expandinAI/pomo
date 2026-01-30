export const BREAKS_INTRO = "Your brain works in two modes. One of them is rest.";

export interface BreaksSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export const BREAKS_SECTIONS: BreaksSection[] = [
  {
    id: 'two-modes',
    title: 'The Two Modes',
    paragraphs: [
      'Focused Mode. Diffuse Mode.',
      'When you work, your brain is in "Focused Mode"—locked onto a task like a spotlight.',
      'But learning, problem-solving, creativity—that happens in "Diffuse Mode." When you\'re not looking. When you\'re walking. When you\'re in the shower.',
      'The best ideas don\'t come at the desk.',
      'They come when you stop searching.',
    ],
  },
  {
    id: 'pushing-through',
    title: 'Why "Pushing Through" Doesn\'t Work',
    paragraphs: [
      'Cognitive fatigue is real.',
      'After about 90 minutes of intense work, your ability to concentrate measurably declines. Your brain needs time to replenish neurotransmitters.',
      'Those who don\'t take breaks aren\'t working anymore—they\'re just sitting there.',
      'A 5-minute break isn\'t lost time.',
      'It\'s when your brain tidies up.',
    ],
  },
  {
    id: 'desktime',
    title: 'The DeskTime Study',
    paragraphs: [
      '52 minutes of work. 17 minutes of rest.',
      'In 2014, DeskTime analyzed the work habits of their most productive users. The result was surprising:',
      'The top 10% didn\'t work the longest. They worked in clear blocks—with real breaks in between.',
      'Not scrolling on their phones. Not checking emails. Real breaks.',
      'Standing up. Moving around. Letting their gaze wander.',
    ],
  },
  {
    id: 'good-break',
    title: 'What Makes a Good Break?',
    paragraphs: [
      'Active beats passive.',
      'The best break is one that leaves you refreshed—not drained.',
    ],
  },
];

export const BREAKS_CLOSING = [
  "Particle doesn't just count your work. Particle gives you space for what happens in between.",
  "Because that's where your best work is born.",
];
