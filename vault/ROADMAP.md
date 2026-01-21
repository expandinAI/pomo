# Roadmap

High-level Überblick über Features und Milestones.

---

## Aktueller Fokus

> MVP Feature-Complete - Ready for Analytics & Monetization

**Ziel:** Analytics Foundation + Premium Gate
**Status:** Sprints 1-5 abgeschlossen, 30 Stories done

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

**UI Transformation** - Von "Guter Timer" zu "Das schärfste Deep-Work-Tool"

| Feature | Stories | Points | Status |
|---------|---------|--------|--------|
| [[features/design-system-update]] | POMO-050 bis 055 | 13 | ✅ Done |
| [[features/immersive-visual-experience]] | POMO-090 bis 092 | 21 | ✅ Done |
| [[features/command-palette]] | POMO-056 bis 060 | 18 | ✅ Done |
| [[features/quick-task-system]] | POMO-061 bis 065 | 12 | ✅ Done |
| [[features/extended-presets]] | POMO-066 bis 071 | 12 | ✅ Done |
| [[features/keyboard-ux]] | POMO-072 bis 077 | 14 | ✅ Done |
| [[features/system-integrations]] | POMO-078 bis 082 | 29 | Backlog |
| [[features/statistics-dashboard]] | POMO-083 bis 089 | 31 | ✅ Done |

**P0 Total: ~118 Story Points (43 Stories)**

---

## Remaining Analytics

| Feature | ID | Priorität | Aufwand | Status |
|---------|-----|-----------|---------|--------|
| Weekly Focus Report | POMO-029 | P1 | M | ✅ Done |
| Focus Heatmap | POMO-030 | P1 | M | ✅ Done |
| Total Hours Counter | POMO-031 | P1 | S | Backlog |
| Export Data (CSV) | POMO-032 | P2 | S | Backlog |

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

### v0.2.0 - UI Transformation 🚧
- [x] Design System Update (monochrome, sharper)
- [x] **Immersive Visual Experience** (Dark-first, Particles, Grain, Endel-inspired)
- [x] Command Palette (Cmd+K)
- [x] Quick Task System
- [x] Extended Presets (52/17, 90min)
- [x] Keyboard-First UX (G-prefix, Focus Trap, Vim Nav)
- [ ] System Integrations (DND, Blocking)
- [x] Statistics Dashboard ✅

**Stories:** POMO-050 bis POMO-092 (43 total)

### v1.0 - Premium Launch
- [x] Weekly Focus Report
- [x] Focus Heatmap
- [ ] Premium paywall
- [ ] Payment integration
- [ ] License system

**Zieldatum:** TBD

### v1.1 - Polish & Growth
- [ ] Focus reminders
- [ ] Browser notifications
- [ ] ProductHunt launch

**Zieldatum:** TBD

### v2.0 - Web Feature-Complete
- [ ] **Project Tracking** - [[features/project-tracking]] (21 SP)
- [x] **Year View** (`G Y`) - GitHub-style Contribution Graph ✅
- [ ] **Sound Design 2.0** - Endel-inspired Chimes & Themes
- [ ] Cloud Sync

**Zieldatum:** TBD

### v3.0 - Native Apps
- [ ] **macOS App** (Swift/SwiftUI) - Menu Bar, System DND, Global Shortcuts
- [ ] iOS App (SwiftUI, shared code with macOS)
- [ ] Apple Watch Companion

**Strategie:** Web App = "Golden Master" -> dann Native portieren

**Zieldatum:** TBD

---

## Platform Strategy

```
Phase 1: Web Feature-Complete
├── Project Tracking
├── Year View (G Y)
├── Sound Design 2.0
└── Cloud Sync
    |
    v
Phase 2: Native macOS App
├── 1:1 Feature Parity mit Web
├── Menu Bar Integration
├── System DND
├── Global Shortcuts (auch im Hintergrund)
└── Offline-First
    |
    v
Phase 3: iOS App (optional)
├── Shared SwiftUI Code
├── Widgets
└── Apple Watch
```

**Warum diese Reihenfolge:**
- Kein Feature-Drift zwischen Plattformen
- Web als lebende Spezifikation für Native
- User-Feedback auf Web vor Native-"Einbetonierung"
- Native macOS = Core-Differentiator für Zielgruppe (Devs, Designer)

---

## Pricing Model

```
┌─────────────────────────────────────────────────────────┐
│                   PARTICLE FREE                         │
├─────────────────────────────────────────────────────────┤
│ ✓ Flexible Timer (25/5, 52/17, 90/20)                  │
│ ✓ Dark Mode (Default)                                   │
│ ✓ Keyboard-First UX                                     │
│ ✓ Command Palette (Cmd+K)                              │
│ ✓ Quick Tasks                                           │
│ ✓ Basic Stats (7 Tage)                                 │
│ ✓ PWA Installation                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 PARTICLE PREMIUM                        │
│              $49/Jahr ODER $99 Lifetime                 │
├─────────────────────────────────────────────────────────┤
│ Alles aus Free, plus:                                   │
│ ✓ Unbegrenzte Stats-History                            │
│ ✓ Project Tracking                                      │
│ ✓ Year View (G Y)                                       │
│ ✓ Premium Sounds & Themes                              │
│ ✓ Cloud Sync (alle Geräte)                             │
│ ✓ CSV Export                                            │
│ ✓ Priority Support                                      │
└─────────────────────────────────────────────────────────┘
```

**Philosophie:** Großzügiger Free-Tier. Premium = Power-Features, nicht Nerv-Limits.

---

*Zuletzt aktualisiert: 2026-01-21*
