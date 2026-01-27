// src/lib/wellbeing-hints.ts

export interface WellbeingHint {
  id: string;
  text: string;
  category: 'hydration' | 'eyes' | 'movement' | 'mindfulness';
}

export const WELLBEING_HINTS: WellbeingHint[] = [
  { id: 'water-1', text: 'Time for a sip of water?', category: 'hydration' },
  { id: 'water-2', text: 'Your body appreciates hydration', category: 'hydration' },
  { id: 'eyes-1', text: 'Look into the distance for a moment', category: 'eyes' },
  { id: 'eyes-2', text: 'Give your eyes a little rest', category: 'eyes' },
  { id: 'move-1', text: 'Good moment to stand up', category: 'movement' },
  { id: 'move-2', text: 'A little stretch feels good', category: 'movement' },
  { id: 'mind-1', text: 'Take a deep breath', category: 'mindfulness' },
  { id: 'mind-2', text: 'Enjoy the moment', category: 'mindfulness' },
];

export function getRandomHint(excludeId?: string): WellbeingHint {
  const available = excludeId
    ? WELLBEING_HINTS.filter(h => h.id !== excludeId)
    : WELLBEING_HINTS;
  return available[Math.floor(Math.random() * available.length)];
}
