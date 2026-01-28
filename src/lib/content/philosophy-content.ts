export const PHILOSOPHY_INTRO = [
  "A single white dot on a black canvas.",
  "Still. Unassuming. And yet: the foundation of everything you create.",
];

export interface PhilosophySection {
  id: string;
  title: string;
  emphasis?: string;
  paragraphs: string[];
}

export const PHILOSOPHY_SECTIONS: PhilosophySection[] = [
  {
    id: 'what-is-particle',
    title: 'What Is a Particle?',
    emphasis: "A life's work is made of many particles.",
    paragraphs: [
      'Every great novel was written word by word.',
      'Every masterpiece was painted brushstroke by brushstroke.',
      'Every career was built—focus session by focus session.',
      'Particle by particle.',
      'Other apps count tomatoes. Or trees. Or points in a game.',
      'We count something different: The bundled energy of your attention. Made visible. One dot at a time.',
      "At the end of a year, you don't see statistics. You see yourself—in what you've created.",
    ],
  },
  {
    id: 'pride-not-guilt',
    title: 'Pride, Not Guilt',
    emphasis: 'No red badges. No lost streaks.',
    paragraphs: [
      'Most productivity apps work with guilt:',
      '"You broke your streak!" "You\'re below your goal today!" "Your tree died!"',
      'Particle works with pride.',
      "You don't collect points to please an app. You collect particles because they show who you are.",
      "There's no punishment for rest. There's only beauty for focus.",
      "When you look at your particles, you don't see what you missed. You see what you built.",
    ],
  },
  {
    id: 'less-but-better',
    title: 'Less, But Better',
    emphasis: 'Black. White. Dots. Done.',
    paragraphs: [
      'In a world of colorful apps, notifications, and dopamine hits, we chose a different path: Reduction.',
      'Dieter Rams said it best: "Less, but better."',
      'We asked ourselves: What can we remove?',
      'Colors? Gone. Badges? Gone. Gamification? Gone. Notifications that interrupt you? Gone.',
      'What remains is the essential: A timer. A particle. Your work.',
      'Every pixel must earn its place.',
    ],
  },
  {
    id: 'mirror-not-game',
    title: 'A Mirror, Not a Game',
    emphasis: "Particle isn't a game. Particle is a mirror.",
    paragraphs: [
      "Forest lets you grow trees. Nice. But it's not your life. It's a simulation.",
      "Habitica turns productivity into a role-playing game. Fun. But your work isn't a game.",
      'Particle simply shows you what you do. Dot by dot. Day by day.',
      'When you look at your collected particles, you see yourself. Your work. Your journey.',
      "Not what the app wants from you. But what you've created.",
    ],
  },
];

export const PHILOSOPHY_CLOSING = [
  "Particle is more than an app.",
  "It's an invitation to think differently about focus.",
  "Not as a duty. Not as a game. But as something that becomes visible.",
  "Particle by particle.",
];
