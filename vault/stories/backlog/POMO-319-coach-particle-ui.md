---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, ui, particle]
---

# POMO-319: Coach Particle UI

## User Story

> Als **Flow-User**
> möchte ich **den Coach-Partikel sehen können**,
> damit **ich weiß, dass mein Coach für mich da ist**.

## Kontext

Link zum Feature: [[features/ai-coach]]

Der Coach manifestiert sich als eigener ✨ Sparkle-Partikel, der unten im Screen schwebt.

## Akzeptanzkriterien

- [ ] Coach-Partikel erscheint für Flow-User
- [ ] Position: Unten zentriert, 24px vom Bottom
- [ ] Symbol: ✨ (Sparkle Emoji oder Custom Icon)
- [ ] Idle-State: Statisch, subtle
- [ ] Active-State: Pulsiert wenn neuer Insight wartet
- [ ] Klick öffnet Coach View
- [ ] Keyboard: G C öffnet Coach View
- [ ] Nicht sichtbar für Free/Plus User

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── coach/
│       ├── CoachParticle.tsx     # NEU
│       └── index.ts
└── app/
    └── page.tsx                  # Einbinden
```

### Implementierungshinweise
- Framer Motion für Pulsier-Animation
- `useFeatureAccess('aiCoach')` für Visibility
- `useCoachInsights()` Hook für Insight-Status
- Breathing-Animation ähnlich wie ParticleMenu-Dot

### Animation
```typescript
// Idle State
{ opacity: 0.6, scale: 1 }

// Active State (neuer Insight)
animate={{
  opacity: [0.5, 1, 0.5],
  scale: [1, 1.2, 1],
}}
transition={{
  duration: 3,
  repeat: Infinity,
  ease: 'easeInOut',
}}
```

## UI/UX

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                              ●                          [·]      │
│                           Timer                    ParticleMenu  │
│                                                                   │
│                                                                   │
│                                                                   │
│                                                                   │
│                             ✨  ← Coach-Partikel                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Hover:** Leichtes Scale-Up, Cursor: Pointer
**Touch:** Touch-Target 44x44px

## Definition of Done

- [ ] Komponente implementiert
- [ ] Idle-State korrekt
- [ ] Pulsier-Animation funktioniert
- [ ] Klick öffnet Coach View
- [ ] G C Shortcut funktioniert
- [ ] Nur für Flow-User sichtbar
