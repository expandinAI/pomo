---
type: story
status: backlog
priority: p1
effort: 5
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, view, overlay]
---

# POMO-321: Coach View (G C)

## User Story

> Als **Flow-User**
> möchte ich **den Coach-Bereich öffnen können**,
> damit **ich Insights lesen und mit dem Coach chatten kann**.

## Kontext

Link zum Feature: [[features/ai-coach]]

Zentraler View für alle Coach-Interaktionen. Zeigt aktuellen Insight und Chat-History.

## Akzeptanzkriterien

- [ ] Öffnet sich bei Klick auf Coach-Partikel
- [ ] Öffnet sich bei G C Shortcut
- [ ] Zeigt aktuellen/letzten Insight prominent
- [ ] Zeigt Chat-History darunter
- [ ] Chat-Input am unteren Rand
- [ ] Quota-Anzeige (247/300)
- [ ] Schließen mit × oder Escape
- [ ] Smooth Slide-In Animation

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── coach/
│       ├── CoachView.tsx         # NEU: Hauptkomponente
│       ├── InsightCard.tsx       # NEU: Insight-Darstellung
│       ├── ChatHistory.tsx       # NEU: Nachrichtenliste
│       └── QuotaIndicator.tsx    # NEU: Limit-Anzeige
├── hooks/
│   └── useCoach.ts               # NEU: Coach-State
└── app/
    └── page.tsx                  # Modal einbinden
```

### Implementierungshinweise
- Overlay-Pattern wie andere Views (Timeline, Stats)
- Focus-Trap im Modal
- Keyboard-Navigation
- Scroll für Chat-History

## UI/UX

```
┌─────────────────────────────────────────────────────────────────┐
│  Coach                                247/300            [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✨ Aktueller Insight                                            │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  Du hast heute 127% mehr fokussiert als an einem                 │
│  typischen Freitag.                                              │
│                                                                   │
│  Das ist bemerkenswert! Normalerweise arbeitest du               │
│  freitags ~3 Stunden, heute waren es bereits 6.8 Stunden.        │
│                                                                   │
│  Was ich beobachte:                                              │
│  • Früher Start (8:14 statt 9:30)                               │
│  • Weniger Projektwechsel                                        │
│  • Längere Sessions                                              │
│                                                                   │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  💬 Chat                                                         │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Du: Warum war ich heute so produktiv?                     │  │
│  │                                                            │  │
│  │ Coach: Ich sehe ein paar Faktoren...                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Frag mich etwas...                                    ↵ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Layout-Struktur
- Header: Titel + Quota + Close
- Main: Scrollable Content
  - Insight Card (wenn vorhanden)
  - Chat History
- Footer: Chat Input (fixed)

## Definition of Done

- [ ] View-Komponente implementiert
- [ ] G C Shortcut registriert
- [ ] Insight-Card zeigt aktuellen Insight
- [ ] Chat-History scrollbar
- [ ] Quota-Anzeige korrekt
- [ ] Keyboard-Accessible
- [ ] Responsive (Mobile + Desktop)
