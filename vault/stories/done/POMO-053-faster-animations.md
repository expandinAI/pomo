---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/design-system-update]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [design-system, animation, p0]
---

# POMO-053: Schnellere Animationen

## User Story

> Als **User**
> möchte ich **schnellere, snappigere Animationen**,
> damit **das Tool sich instant und responsiv anfühlt**.

## Kontext

Link zum Feature: [[features/design-system-update]]

Reduzierung aller Animation-Dauern für ein professionelleres, schnelleres Gefühl.

## Akzeptanzkriterien

- [ ] **Given** Hover Animation, **When** ausgelöst, **Then** Dauer ist 100ms
- [ ] **Given** Micro-Interaction, **When** ausgelöst, **Then** Dauer ist 150ms
- [ ] **Given** Modal Open/Close, **When** ausgelöst, **Then** Dauer ist 200ms
- [ ] **Given** Panel Transition, **When** ausgelöst, **Then** Dauer ist 250ms
- [ ] **Given** Button Press, **When** geklickt, **Then** scale(0.98) in 50ms
- [ ] **Given** prefers-reduced-motion, **When** gesetzt, **Then** Animationen deaktiviert

## Technische Details

### Betroffene Dateien
```
src/
├── styles/design-tokens.ts
├── tailwind.config.js
└── components/**/*.tsx (Framer Motion)
```

### Neue Animation Tokens
```ts
export const animations = {
  duration: {
    instant: 0,
    fast: 100,      // Hover
    normal: 150,    // Micro-interactions
    moderate: 200,  // Modals
    slow: 300,      // Panels (max)
  },
  spring: {
    default: { stiffness: 500, damping: 30 },
    snappy: { stiffness: 600, damping: 35 },
  },
};
```

### Tailwind Config
```js
transitionDuration: {
  '50': '50ms',
  '100': '100ms',
  '150': '150ms',
  '200': '200ms',
  '250': '250ms',
}
```

### Button Press Animation
```tsx
<motion.button
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.05 }}
/>
```

## Testing

### Manuell zu testen
- [ ] Hover-Effekte fühlen sich instant an
- [ ] Modals öffnen schnell
- [ ] Button-Press-Feedback spürbar
- [ ] reduced-motion respektiert
- [ ] Keine Animation fühlt sich "träge" an

## Definition of Done

- [ ] Animation Tokens definiert
- [ ] Tailwind Config aktualisiert
- [ ] Framer Motion Komponenten angepasst
- [ ] reduced-motion getestet
