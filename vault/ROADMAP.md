# Roadmap

High-level Überblick über Features und Milestones.

---

## Aktueller Fokus

> **Cloud Sync & Accounts** - Clerk Auth, Supabase, Multi-Device

**Ziel:** Von reiner Web-App zu Multi-Platform-Produkt mit Monetarisierung
**Status:** Local-First abgeschlossen, 300er-Serie bereit

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

### v0.2.0 - UI Transformation

| Feature | Stories | Points | Status |
|---------|---------|--------|--------|
| [[features/design-system-update]] | POMO-050 bis 055 | 13 | ✅ Done |
| [[features/immersive-visual-experience]] | POMO-090 bis 092 | 21 | ✅ Done |
| [[features/command-palette]] | POMO-056 bis 060 | 18 | ✅ Done |
| [[features/quick-task-system]] | POMO-061 bis 065 | 12 | ✅ Done |
| [[features/extended-presets]] | POMO-066 bis 071 | 12 | ✅ Done |
| [[features/keyboard-ux]] | POMO-072 bis 077 | 14 | ✅ Done |
| [[features/statistics-dashboard]] | POMO-083 bis 089 | 31 | ✅ Done |

### v1.0 - Feature Complete

| Feature | Stories | Points | Status |
|---------|---------|--------|--------|
| Sound Engine & Settings | POMO-120 bis 124 | ~15 | ✅ Done |
| Night Mode | POMO-130 bis 139 | ~20 | ✅ Done |
| Learn Panel & Onboarding | POMO-160 bis 166 | ~18 | ✅ Done |
| Intro Animation | POMO-170 bis 175 | ~13 | ✅ Done |

### v1.1 - Local-First Persistence

| Feature | Stories | Points | Status |
|---------|---------|--------|--------|
| [[features/local-first-persistence]] | POMO-200 bis 206 | 17 | ✅ Done |

---

## Now: Cloud Sync & Accounts

### Phase 1: Cloud Sync (300er-Serie)

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-300 | Clerk Setup | 3 | 🔜 Next |
| POMO-301 | Supabase Schema | 5 | 🔜 Next |
| POMO-302 | Auth UI | 5 | 🔜 Next |
| POMO-303 | Account Tiers | 3 | 🔜 Next |
| POMO-304 | Upgrade Flow | 5 | 🔜 Next |
| POMO-305 | Sync Service | 8 | 🔜 Next |
| POMO-306 | Conflict Resolution | 5 | 🔜 Next |
| POMO-307 | Trial Management | 3 | 🔜 Next |
| POMO-308 | Settings Sync | 3 | 🔜 Next |

**Total: 37 Story Points**

### Phase 2: Monetization & Compliance

| Feature | Stories | Points | Status | Prio |
|---------|---------|--------|--------|------|
| [[features/payment-integration]] | TBD | ~15 | Draft | P1 |
| [[features/gdpr-data-privacy]] | TBD | ~12 | Draft | P1 |

**Total Phase 2: ~27 Story Points**

### Phase 3: Native Apps

| Feature | Stories | Points | Status | Prio |
|---------|---------|--------|--------|------|
| [[features/native-mac-app]] | TBD | ~50 | Draft | P2 |
| [[features/native-ios-app]] | TBD | ~30 | Draft | P2 |

**Total Phase 3: ~80 Story Points**

---

## Architecture Decisions

Dokumentiert in [[decisions/]]:

| ADR | Entscheidung |
|-----|--------------|
| [[decisions/ADR-001-multi-platform-architecture]] | Native Swift für Mac/iOS, Supabase + Clerk |
| [[decisions/ADR-002-schema-evolution]] | Additive-Only Schema, Partial Updates |
| [[decisions/ADR-003-sync-strategy]] | Near-Time Sync (Event Push + 30s Polling) |

---

## Platform Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARTICLE ROADMAP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: Foundation                          ~54 SP             │
│  ─────────────────────────────────────                          │
│  ✅ Local-First Persistence (IndexedDB)       17 SP  DONE        │
│  ☐ Cloud Sync & Accounts (Clerk + Supabase)  37 SP  ← NEXT      │
│                                                                  │
│  PHASE 2: Monetization & Compliance           ~27 SP             │
│  ─────────────────────────────────────                          │
│  ☐ Payment Integration (Stripe)              ~15 SP             │
│  ☐ GDPR & Data Privacy                       ~12 SP             │
│                                                                  │
│  PHASE 3: Native Apps                         ~80 SP             │
│  ─────────────────────────────────────                          │
│  ☐ Native Mac App (Swift/SwiftUI)            ~50 SP             │
│  ☐ Native iOS App (SwiftUI, reduced scope)   ~30 SP             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  REMAINING: ~144 Story Points                                    │
│  Bei ~5 SP/Woche: ~29 Wochen (~7 Monate)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Abhängigkeiten

```
Local-First Persistence ✅
         │
         ▼
Cloud Sync & Accounts ← NEXT
         │
    ┌────┴────┐
    ▼         ▼
Payment    GDPR
    │         │
    └────┬────┘
         ▼
   Native Mac App
         │
         ▼
   Native iOS App
```

---

## Tech Stack

| Komponente | Technologie | Status |
|------------|-------------|--------|
| **Web Frontend** | Next.js 14 | ✅ Done |
| **Local Storage (Web)** | IndexedDB (Dexie.js) | ✅ Done |
| **Auth** | Clerk | 🔜 Next |
| **Database** | Supabase (PostgreSQL) | 🔜 Next |
| **Payments** | Stripe | 📋 Später |
| **Mac App** | Swift/SwiftUI | 📋 Später |
| **iOS App** | SwiftUI | 📋 Später |
| **Local Storage (Native)** | SwiftData/SQLite | 📋 Später |

---

## Pricing Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      PARTICLE FREE                               │
│                    (Kein Account nötig)                          │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Voller Timer (alle Presets)                                   │
│ ✓ Projects                                                       │
│ ✓ Dark Mode + Default Theme                                      │
│ ✓ Keyboard-First UX                                              │
│ ✓ Basis-Statistiken (7 Tage)                                    │
│ ✓ PWA Installation                                               │
│ ✗ Cloud Sync                                                     │
│ ✗ Multi-Device                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PARTICLE PLUS                                 │
│                 (Kostenloser Account)                            │
├─────────────────────────────────────────────────────────────────┤
│ Alles aus Free, plus:                                            │
│ ✓ Cloud Sync                                                     │
│ ✓ Multi-Device (Web, Mac, iOS)                                  │
│ ✓ Cloud Backup                                                   │
│ ✓ 10 Custom Presets                                              │
│ ✗ Year View                                                      │
│ ✗ Advanced Stats                                                 │
│ ✗ Alle Themes                                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PARTICLE FLOW                                 │
│              9€/Monat oder 79€/Jahr                              │
│                 (14 Tage kostenlos testen)                       │
├─────────────────────────────────────────────────────────────────┤
│ Alles aus Plus, plus:                                            │
│ ✓ Year View (G Y)                                                │
│ ✓ Advanced Statistics                                            │
│ ✓ Alle Themes                                                    │
│ ✓ Unbegrenzte Presets                                           │
│ ✓ Priority Support                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Philosophie:**
- Free = Voll nutzbar ohne Account (Local-First)
- Plus = Kostenloser Account für Sync
- Flow = Premium für Power-Features

---

## Native App Scope

### Mac App (Voller Scope)

| Feature | Enthalten |
|---------|-----------|
| Timer | ✓ |
| Projects | ✓ |
| Statistics | ✓ |
| Year View | ✓ (Flow) |
| Settings | ✓ |
| Menubar | ✓ |
| Focus Mode | ✓ |
| AppleScript | ✓ |
| Notifications | ✓ |

### iOS App (Reduzierter Scope)

| Feature | Enthalten |
|---------|-----------|
| Timer | ✓ |
| Projects (auswählen) | ✓ |
| Heute-Ansicht | ✓ |
| Basis-Stats | ✓ (vereinfacht) |
| Widgets | ✓ |
| Live Activities | ✓ |
| Year View | ✗ → Web/Mac |
| Advanced Stats | ✗ → Web/Mac |
| Full Settings | ✗ → Web/Mac |

**Philosophie:** iOS = "Linear-Style" – unterwegs kurz was erledigen, nicht am Handy arbeiten.

---

## Milestones

### v1.0 - Web Feature-Complete ✅
- [x] Core timer with Web Worker
- [x] Dark/Light mode + themes
- [x] Custom timer presets
- [x] Session history (localStorage)
- [x] Sounds + ambient soundscapes
- [x] Full accessibility
- [x] Statistics Dashboard
- [x] Year View
- [x] Project Tracking
- [x] Night Mode
- [x] Learn Panel & Onboarding
- [x] Intro Animation

### v1.1 - Local-First ✅
- [x] IndexedDB Migration
- [x] SessionContext (unified storage)
- [x] ProjectContext (unified storage)
- [x] Settings Migration
- [x] Migration UI

### v2.0 - Multi-Platform Foundation 🚧
- [ ] Clerk Auth Integration
- [ ] Supabase Cloud Sync
- [ ] Account Tiers (Free/Plus/Flow)
- [ ] Trial System (14 Tage)

### v2.1 - Monetization
- [ ] Stripe Payment Integration
- [ ] Subscription Management
- [ ] GDPR Compliance (Export, Deletion)

### v3.0 - Native Mac App
- [ ] SwiftUI App
- [ ] Menubar Integration
- [ ] Focus Mode Integration
- [ ] AppleScript Support
- [ ] Shared Swift Package

### v3.1 - Native iOS App
- [ ] SwiftUI App (reduced scope)
- [ ] Widgets
- [ ] Live Activities
- [ ] Shared Swift Package (with Mac)

---

## Icebox

Parked ideas:

- Sound Creation Tools (POMO-125) – Grund: Nice-to-have, nicht kritisch
- Phase Ambient Sounds (POMO-137) – Grund: Nach Cloud Sync evaluieren
- Offline Queue (POMO-205) – Grund: Nach Sync-Implementierung
- Social/Team features – Grund: "Focus is personal" philosophy
- Gamification (streaks, badges) – Grund: "Calm over anxiety" principle
- Apple Watch App – Grund: Nach iOS evaluieren
- Android App – Grund: iOS/Mac Fokus zuerst
- Weekly Email Report (POMO-156) – Grund: Nach Account-System

---

*Zuletzt aktualisiert: 2026-01-30*
