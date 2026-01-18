# Roadmap

High-level Überblick über Features und Milestones.

---

## Aktueller Fokus

> MVP Feature-Complete - Ready for Analytics & Monetization

**Ziel:** Analytics Foundation + Premium Gate
**Status:** Sprints 1-5 abgeschlossen, 28 Stories done

---

## Completed

### v0.1.0 - MVP Foundation (Sprints 1-5)

| Sprint | Features | Status |
|--------|----------|--------|
| **Sprint 0** | Initial Setup (Next.js 14, Tailwind, TypeScript, Core Timer, Breathing Animation, PWA Manifest) | ✅ Done |
| **Sprint 1** | Web Worker for background accuracy, Audio notifications | ✅ Done |
| **Sprint 2** | Dark/Light mode, Keyboard shortcuts, Timer animations, Custom presets, Session history, 6 sounds, 4 themes | ✅ Done |
| **Sprint 3-4** | Micro-animations, Haptic feedback, Sound refinements, 5 Ambient soundscapes (Web Audio) | ✅ Done |
| **Sprint 5** | Extended shortcuts, Screen reader (ARIA), Loading skeletons, Wake Lock, Performance (<100KB) | ✅ Done |

**Completed Stories:** POMO-001 through POMO-028 (28 total)

---

## Now (Nächste Iteration)

Analytics Foundation - transformiere Session-Daten in Insights

| Feature | ID | Priorität | Aufwand |
|---------|-----|-----------|---------|
| Weekly Focus Report | POMO-029 | P1 | M |
| Focus Heatmap | POMO-030 | P1 | M |
| Total Hours Counter | POMO-031 | P1 | S |
| Export Data (CSV) | POMO-032 | P2 | S |

---

## Next (Folgende Iteration)

Premium Gate & Monetization

| Feature | ID | Priorität | Aufwand |
|---------|-----|-----------|---------|
| Premium Gate (Paywall UI) | POMO-033 | P1 | M |
| Lemon Squeezy Integration | POMO-034 | P1 | L |
| License Key System | POMO-035 | P1 | M |
| Settings Page Redesign | POMO-036 | P2 | M |

---

## Later (Backlog)

Features nach v1.0 Launch:

| Feature | ID | Priorität | Notes |
|---------|-----|-----------|-------|
| Focus Reminders | POMO-037 | P2 | Gentle notifications |
| Browser Notifications | POMO-038 | P2 | Native push support |
| Cloud Sync | POMO-040 | P3 | Supabase/Firebase |
| iOS App | POMO-041 | P3 | React Native / Capacitor |
| macOS Menu Bar | POMO-042 | P3 | Tauri |
| Daily Intention | POMO-043 | P3 | "What's your focus today?" |
| Pomodoro Templates | POMO-044 | P3 | Deep Work, Study, Create |

---

## Icebox

Parked ideas:

- Social/Team features - Grund: "Focus is personal" philosophy
- Gamification (streaks, badges) - Grund: "Calm over anxiety" principle
- Complex dashboards - Grund: Minimalism first

---

## Milestones

### v0.1.0 - MVP Feature-Complete ✅
- [x] Core timer with Web Worker
- [x] Dark/Light mode + 4 themes
- [x] Custom timer presets
- [x] Session history (localStorage)
- [x] 6 sounds + 5 ambient soundscapes
- [x] Haptic feedback
- [x] Full accessibility (ARIA, keyboard)
- [x] PWA installable
- [x] Performance <100KB

### v1.0 - Premium Launch
- [ ] Weekly Focus Report
- [ ] Focus Heatmap
- [ ] Premium paywall
- [ ] Payment integration
- [ ] License system

**Zieldatum:** TBD

### v1.1 - Polish & Growth
- [ ] Focus reminders
- [ ] Browser notifications
- [ ] ProductHunt launch

**Zieldatum:** TBD

### v2.0 - Sync & Native
- [ ] Cloud sync
- [ ] iOS app
- [ ] macOS menu bar app

**Zieldatum:** TBD

---

## Pricing Model

```
┌─────────────────────────────────────────────────────────┐
│                      POMO FREE                          │
├─────────────────────────────────────────────────────────┤
│ ✓ Basic Timer (25/5/15 Minuten)                        │
│ ✓ Dark/Light Mode                                       │
│ ✓ Keyboard Shortcuts                                    │
│ ✓ Basic Sound                                           │
│ ✓ PWA Installation                                      │
│ ✓ Breathing Animation                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   POMO PREMIUM                          │
│                    $4.99 einmalig                       │
├─────────────────────────────────────────────────────────┤
│ Alles aus Free, plus:                                   │
│ ✓ Custom Timer Lengths                                  │
│ ✓ Premium Sounds (6 Chimes)                            │
│ ✓ Color Themes (Sunrise, Ocean, Forest, Midnight)      │
│ ✓ Ambient Soundscapes (Rain, Forest, Cafe, Ocean...)   │
│ ✓ Weekly Focus Report                                   │
│ ✓ Focus Heatmap                                         │
│ ✓ Session History (30 Tage)                            │
│ ✓ Data Export                                           │
└─────────────────────────────────────────────────────────┘
```

---

*Zuletzt aktualisiert: 2026-01-18*
