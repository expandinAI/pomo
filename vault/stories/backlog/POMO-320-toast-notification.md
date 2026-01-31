---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, toast, notification]
---

# POMO-320: Toast Notification System

## User Story

> Als **Flow-User**
> möchte ich **Coach-Insights als kurze Nachrichten sehen**,
> damit **ich informiert werde ohne meine Arbeit zu unterbrechen**.

## Kontext

Link zum Feature: [[features/ai-coach]]

Toast erscheint oberhalb des Coach-Partikels, zeigt kurzen Insight, verschwindet nach 5 Sekunden.

## Akzeptanzkriterien

- [ ] Toast erscheint oberhalb des Coach-Partikels
- [ ] Zeigt ✨ Icon + kurzen Text (max 2 Zeilen)
- [ ] Slide-Up Animation beim Erscheinen
- [ ] Auto-Hide nach 5 Sekunden
- [ ] Fade-Out Animation
- [ ] Klick auf Toast → öffnet Coach View mit diesem Insight
- [ ] Nach Hide → Coach-Partikel beginnt zu pulsieren
- [ ] Nicht während laufender Session zeigen

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── coach/
│       ├── CoachToast.tsx        # NEU
│       └── CoachParticle.tsx     # Integration
├── hooks/
│   └── useCoachNotifications.ts  # NEU: Notification-Logic
```

### Implementierungshinweise
- `AnimatePresence` für Ein/Ausblenden
- Toast-Queue für mehrere Insights
- Nur einen Toast gleichzeitig zeigen
- Local Storage: Letzte Toast-Zeit (Cooldown)

### Animation
```typescript
// Enter
initial={{ opacity: 0, y: 20, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ type: 'spring', duration: 0.4 }}

// Exit
exit={{ opacity: 0, y: 10 }}
transition={{ duration: 0.3 }}
```

## UI/UX

```
┌─────────────────────────────────────────┐
│  ✨ Du hast heute 127% mehr fokussiert  │
│     als an einem typischen Freitag      │
└─────────────────────────────────────────┘
                    ↓
                   ✨
            (Coach-Partikel)
```

**Styling:**
- Background: `bg-surface`
- Border: `border-tertiary/20`
- Border-Radius: `rounded-xl`
- Padding: `px-4 py-3`
- Shadow: `shadow-lg`
- Max-Width: `max-w-sm`

## Testing

### Manuell zu testen
- [ ] Toast erscheint bei neuem Insight
- [ ] Auto-Hide nach 5 Sekunden
- [ ] Klick öffnet Coach View
- [ ] Partikel pulsiert nach Toast-Hide
- [ ] Kein Toast während Timer läuft

## Definition of Done

- [ ] Toast-Komponente implementiert
- [ ] Animation smooth
- [ ] Klick-Handler funktioniert
- [ ] Session-Awareness (nicht stören)
- [ ] Cooldown zwischen Toasts
