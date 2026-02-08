# Roadmap

High-level overview of features and milestones.

---

## Current Focus

> **v3.0 — Essential Particle** — Von "love to use" zu "can't live without"

**Goal:** Make Particle essential, not just enjoyable
**Status:** 10x Review complete, stories ready

---

## Next: v3.0 — Essential Particle (10x)

> "The 10x leap is making Particle something you CAN'T live without."

### Quick Wins (Ship Now)

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-400 | Chat Persistence | 3 | ✅ Done |
| POMO-401 | Session Quality Indicator | 2 | ✅ Done |
| POMO-402 | Monthly Recap Card | 3 | ✅ Done |
| POMO-403 | Task Intelligence Surface | 2 | ✅ Done |

### Core Features

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-410 | Deep Work Insights | 5 | 📋 Backlog |
| POMO-411 | Burnout Detection | 5 | 📋 Backlog |
| POMO-412 | Focus Blocks | 8 | 📋 Backlog |

### Strategic (Explore)

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-420 | Particle Invoicing | 13 | 📋 Later |
| POMO-421 | Particle Wrapped | 13 | 📋 Later |
| POMO-422 | Particle Co-Focus | 13 | 📋 Later |
| POMO-423 | Particle Legacy (3D) | 21 | 📋 Later |

**Quick Wins: 10 SP | Core: 18 SP | Strategic: 60 SP**

### Empfohlene Reihenfolge

```
1. POMO-400 Chat Persistence     (3 SP) — Coach feels broken without it
2. POMO-401 Session Quality      (2 SP) — Subtle delight, zero risk
3. POMO-403 Task Intelligence    (2 SP) — Data exists, just surface it
4. POMO-402 Monthly Recap        (3 SP) — Reuse POTW infra, viral
5. POMO-410 Deep Work Insights   (5 SP) — Overflow data → user-facing
6. POMO-411 Burnout Detection    (5 SP) — Anti-gamification perfected
7. POMO-412 Focus Blocks         (8 SP) — Chain particles, plan mornings
```

---

## Done: Intelligent Particles (v2.3) ✅

> "The best AI is the one you don't notice. It manifests not as a feature, but as a feeling: this app understands me."

### Layer 1: Silent Intelligence ✅

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-380 | Session Start Nudge | 2 | ✅ Done |
| POMO-384 | Silent Intelligence | 3 | ✅ Done |

### Layer 2: Contextual Moments ✅

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-381 | Particle Memory | 5 | ✅ Done |
| POMO-382 | Intention-Coach Bridge | 3 | ✅ Done |
| POMO-383 | Weekly Narrative | 3 | ✅ Done |

### Infrastructure

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-385 | Coach Briefing Redesign | 3 | ✅ Done |
| POMO-390 | Intention Cloud Sync | 5 | ✅ Done |

**Total: 24 Story Points ✅**

### The 3-Layer AI Architecture

```
Layer 3: Coach Modal (G C)        ✅ (POMO-319-326)
         Deep analysis, chat, export
         300 queries/month (Flow)

Layer 2: Contextual Moments       ✅ (POMO-381, 382, 383)
         Particle Memory, Evening Insight,
         Intention Bridge, Weekly Narrative
         API-enhanced (Flow) + local fallback (Free)

Layer 1: Silent Intelligence      ✅ (POMO-380, 384)
         Start Nudge, Smart Presets,
         Task Prediction, Empty States
         100% local, no API, all tiers
```

---

## Done: Daily Intentions ✅

### Phase 1: Core (MVP) ✅

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-350 | Intention data model & storage | 2 | ✅ Done |
| POMO-351 | IntentionOverlay (unified) | 5 | ✅ Done |
| POMO-352 | Intention display below timer | 2 | ✅ Done |
| POMO-353 | Keyboard shortcut G I + Shift+I | 2 | ✅ Done |

**Total Phase 1: 11 SP (✅ Complete)**

### Phase 2: Visual Language ✅

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-354 | Aligned/Reactive particle colors | 1 | ✅ Done |
| POMO-355 | Alignment toggle in ParticleDetail | 3 | ✅ Done |
| POMO-356 | Session counter with colors | 2 | ✅ Done |
| POMO-357 | Timeline with alignment styling | 3 | ✅ Done |

**Total Phase 2: 9 SP (✅ Complete)**

### Phase 3: Reflection & Gap ✅

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-358 | Evening reflection UI | 5 | ✅ Done |
| POMO-359 | Intention status (done/partial/deferred) | 2 | ✅ Done |
| POMO-360 | Week intentions view with gap | 5 | ✅ Done |
| POMO-361 | "Tomorrow" → Intention suggestion | 3 | ✅ Done |

**Total Phase 3: 15 SP (✅ Complete)**

### Phase 4: Intelligence ✅

| Story | Feature | Points | Status | Note |
|-------|---------|--------|--------|------|
| POMO-362+364 | Coach Intention Intelligence | 3 | ✅ Done | Weekly context, alignment trends, deferral chains |
| POMO-363 | Auto-alignment detection | 5 | ✅ Done | Automatic alignment in all 3 COMPLETE paths |
| POMO-390 | Intention Cloud Sync | 5 | ✅ Done | Replaces POMO-365, full bidirectional sync |

**Total Phase 4: 13 SP ✅**

**Daily Intentions Complete: 48 SP (all 4 phases done)**

---

## Later: Native Apps

> Mac & iOS

**Goal:** Native desktop and mobile experience
**Status:** After Essential Particle

| Feature | Stories | Points | Status |
|---------|---------|--------|--------|
| [[features/native-mac-app]] | TBD | ~50 | 📋 Later |
| [[features/native-ios-app]] | TBD | ~30 | Draft |

**Total Phase 3: ~80 Story Points**

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
| [[features/design-system-update]] | POMO-050 to 055 | 13 | ✅ Done |
| [[features/immersive-visual-experience]] | POMO-090 to 092 | 21 | ✅ Done |
| [[features/command-palette]] | POMO-056 to 060 | 18 | ✅ Done |
| [[features/quick-task-system]] | POMO-061 to 065 | 12 | ✅ Done |
| [[features/extended-presets]] | POMO-066 to 071 | 12 | ✅ Done |
| [[features/keyboard-ux]] | POMO-072 to 077 | 14 | ✅ Done |
| [[features/statistics-dashboard]] | POMO-083 to 089 | 31 | ✅ Done |

### v1.0 - Feature Complete

| Feature | Stories | Points | Status |
|---------|---------|--------|--------|
| Sound Engine & Settings | POMO-120 to 124 | ~15 | ✅ Done |
| Night Mode | POMO-130 to 139 | ~20 | ✅ Done |
| Learn Panel & Onboarding | POMO-160 to 166 | ~18 | ✅ Done |
| Intro Animation | POMO-170 to 175 | ~13 | ✅ Done |

### v1.1 - Local-First Persistence

| Feature | Stories | Points | Status |
|---------|---------|--------|--------|
| [[features/local-first-persistence]] | POMO-200 to 206 | 17 | ✅ Done |

### v2.0 - Cloud Sync & Accounts ✅

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-300 | Clerk Setup | 3 | ✅ Done |
| POMO-301 | Supabase Schema | 5 | ✅ Done |
| POMO-302 | Auth UI | 5 | ✅ Done |
| POMO-303 | Account Tiers | 3 | ✅ Done |
| POMO-304 | Upgrade Flow | 5 | ✅ Done |
| POMO-305 | Sync Service | 8 | ✅ Done |
| POMO-306 | Conflict Resolution | 5 | ✅ Done |
| POMO-307 | Trial Management | 3 | ✅ Done |
| POMO-308 | Settings Sync | 3 | ✅ Done |

**Total: 40 Story Points ✅**

### v2.1 - Monetization & AI Coach ✅

#### Payment Integration

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-311 | Stripe Setup & Checkout | 3 | ✅ Done |
| POMO-312 | Payment Webhook Handler | 3 | ✅ Done |
| POMO-313 | Tier Upgrade Logic | 3 | ✅ Done |
| POMO-314 | Billing Portal | 2 | ✅ Done |
| POMO-316 | Upgrade Modal UI | 3 | ✅ Done |
| POMO-317 | Lifetime Purchase | 3 | ✅ Done |

**Total: 17 SP ✅**

#### AI Coach

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-315 | AI Query Counter & Limits | 3 | ✅ Done |
| POMO-319 | Coach Particle UI | 3 | ✅ Done |
| POMO-320 | Coach Insight Status Preview | 3 | ✅ Done |
| POMO-321 | Coach View | 5 | ✅ Done |
| POMO-322 | Chat Interface | 5 | ✅ Done |
| POMO-323 | Insight Engine Backend | 8 | ✅ Done |
| POMO-324 | Master Prompt & Tuning | 3 | ✅ Done |
| POMO-325 | Export Function | 3 | ✅ Done |
| POMO-326 | Coach Settings | 2 | ✅ Done |

**Total: 35 SP ✅**

#### GDPR & Data Privacy

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-327 | Data Export API + UI | 3 | ✅ Done |
| POMO-328 | Account Deletion Flow | 5 | ✅ Done |
| POMO-330 | Privacy Settings UI | 2 | ✅ Done |
| POMO-331 | Privacy Policy Page | 2 | ✅ Done |

**Total: 12 SP ✅**

**v2.1 Total: ~64 Story Points ✅**

### v2.2 - Daily Intentions ✅

| Phase | Stories | Points | Status |
|-------|---------|--------|--------|
| Phase 1: Core | POMO-350 to 353 | 11 | ✅ Done |
| Phase 2: Visual Language | POMO-354 to 357 | 9 | ✅ Done |
| Phase 3: Reflection & Gap | POMO-358 to 361 | 15 | ✅ Done |

**Total: 35 SP ✅**

---

## Architecture Decisions

Documented in [[decisions/]]:

| ADR | Decision |
|-----|----------|
| [[decisions/ADR-001-multi-platform-architecture]] | Native Swift for Mac/iOS, Supabase + Clerk |
| [[decisions/ADR-002-schema-evolution]] | Additive-Only Schema, Partial Updates |
| [[decisions/ADR-003-sync-strategy]] | Near-Time Sync (Event Push + 30s Polling) |

---

## Platform Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARTICLE ROADMAP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: Foundation                          ~57 SP             │
│  ─────────────────────────────────────                          │
│  ✅ Local-First Persistence (IndexedDB)       17 SP  DONE        │
│  ✅ Cloud Sync & Accounts (Clerk + Supabase)  40 SP  DONE        │
│                                                                  │
│  PHASE 2: Monetization & AI                   ~64 SP             │
│  ─────────────────────────────────────                          │
│  ✅ Payment Integration (Stripe)              17 SP  DONE        │
│  ✅ AI Coach                                  35 SP  DONE        │
│  ✅ GDPR & Data Privacy                       12 SP  DONE        │
│                                                                  │
│  PHASE 2.5: Daily Intentions                  ~35 SP             │
│  ─────────────────────────────────────                          │
│  ✅ Core + Visual Language + Reflection        35 SP  DONE        │
│                                                                  │
│  PHASE 2.6: Intelligent Particles             24 SP              │
│  ─────────────────────────────────────                          │
│  ✅ Silent Intelligence + Contextual Moments   24 SP  DONE        │
│                                                                  │
│  PHASE 2.7: Daily Intentions Phase 4          13 SP              │
│  ─────────────────────────────────────                          │
│  ✅ Coach Intelligence + Auto-Alignment + Sync 13 SP  DONE        │
│                                                                  │
│  PHASE 3: Essential Particle (10x)             ~28 SP             │
│  ─────────────────────────────────────                          │
│  ☐ Quick Wins (Chat, Quality, Recap, Tasks)   10 SP  ← CURRENT   │
│  ☐ Core (Deep Work, Burnout, Focus Blocks)    18 SP              │
│                                                                  │
│  PHASE 3b: Strategic Bets                     ~60 SP             │
│  ─────────────────────────────────────                          │
│  ☐ Invoicing, Wrapped, Co-Focus, Legacy      ~60 SP  EXPLORE     │
│                                                                  │
│  PHASE 4: Native Apps                         ~80 SP             │
│  ─────────────────────────────────────                          │
│  ☐ Native Mac App (Swift/SwiftUI)            ~50 SP  LATER       │
│  ☐ Native iOS App (SwiftUI, reduced scope)   ~30 SP              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  REMAINING: ~80 Story Points (Native Apps) + Next 10x TBD       │
└─────────────────────────────────────────────────────────────────┘
```

### Dependencies

```
Local-First Persistence ✅
         │
         ▼
Cloud Sync & Accounts ✅
         │
    ┌────┴────┐
    ▼         ▼
Payment ✅  AI Coach ✅
    │         │
    └────┬────┘
         ▼
      GDPR ✅
         │
         ▼
  Daily Intentions ✅
         │
         ▼
  Intelligent Particles ✅
         │
         ▼
  Essential Particle (10x) ← CURRENT
   (Quick Wins → Core → Strategic)
         │
         ▼
   Native Mac App
         │
         ▼
   Native iOS App
```

---

## Tech Stack

| Component | Technology | Status |
|-----------|------------|--------|
| **Web Frontend** | Next.js 14 | ✅ Done |
| **Local Storage (Web)** | IndexedDB (Dexie.js) | ✅ Done |
| **Auth** | Clerk | ✅ Done |
| **Database** | Supabase (PostgreSQL) | ✅ Done |
| **Payments** | Stripe | ✅ Done |
| **AI** | Claude Haiku (via OpenRouter) | ✅ Done |
| **Mac App** | Swift/SwiftUI | 📋 Later |
| **iOS App** | SwiftUI | 📋 Later |
| **Local Storage (Native)** | SwiftData/SQLite | 📋 Later |

---

## Pricing Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      PARTICLE FREE                               │
│                    (No account required)                         │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Full Timer (all presets)                                      │
│ ✓ Projects                                                       │
│ ✓ Dark Mode + Default Theme                                      │
│ ✓ Keyboard-First UX                                              │
│ ✓ Basic Statistics (7 days)                                     │
│ ✓ PWA Installation                                               │
│ ✓ Silent Intelligence (local patterns)                           │
│ ✓ Local Particle Memories (template-based)                       │
│ ✗ Cloud Sync                                                     │
│ ✗ AI Coach                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PARTICLE PLUS                                 │
│                 (Free account)                                   │
├─────────────────────────────────────────────────────────────────┤
│ Everything in Free, plus:                                        │
│ ✓ Cloud Sync                                                     │
│ ✓ Multi-Device (Web, Mac, iOS)                                  │
│ ✓ Cloud Backup                                                   │
│ ✓ 10 Custom Presets                                              │
│ ✗ Year View                                                      │
│ ✗ AI Coach                                                       │
│ ✗ All Themes                                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PARTICLE FLOW                                 │
│        €4.99/month · €39/year · €99 Lifetime*                   │
│                 (14-day free trial)                              │
├─────────────────────────────────────────────────────────────────┤
│ Everything in Plus, plus:                                        │
│ ✓ AI Coach (300 queries/month)                                  │
│ ✓ AI-generated Particle Memories                                │
│ ✓ AI Evening Insights & Weekly Narratives                       │
│ ✓ Year View (G Y)                                                │
│ ✓ Advanced Statistics                                            │
│ ✓ All Themes                                                     │
│ ✓ Unlimited Presets                                              │
│ ✓ Export for invoicing                                           │
│                                                                   │
│ * Lifetime only during special promotions                        │
└─────────────────────────────────────────────────────────────────┘
```

**Philosophy:**
- Free = Fully usable without account (Local-First) + local intelligence
- Plus = Free account for sync
- Flow = Premium with AI Coach + AI-enhanced moments as killer features

---

## Native App Scope

### Mac App (Full Scope)

| Feature | Included |
|---------|----------|
| Timer | ✓ |
| Projects | ✓ |
| Statistics | ✓ |
| Year View | ✓ (Flow) |
| Settings | ✓ |
| Menubar | ✓ |
| Focus Mode | ✓ |
| AppleScript | ✓ |
| Notifications | ✓ |

### iOS App (Reduced Scope)

| Feature | Included |
|---------|----------|
| Timer | ✓ |
| Projects (select) | ✓ |
| Today View | ✓ |
| Basic Stats | ✓ (simplified) |
| Widgets | ✓ |
| Live Activities | ✓ |
| Year View | ✗ → Web/Mac |
| Advanced Stats | ✗ → Web/Mac |
| Full Settings | ✗ → Web/Mac |

**Philosophy:** iOS = "Linear-Style" – quick tasks on the go, not working on phone.

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

### v2.0 - Multi-Platform Foundation ✅
- [x] Clerk Auth Setup (POMO-300)
- [x] Supabase Schema (POMO-301)
- [x] Auth UI (POMO-302)
- [x] Account Tiers (Free/Plus/Flow) (POMO-303)
- [x] Sync Service (POMO-305)
- [x] Trial System (14 days) (POMO-307)
- [x] Conflict Resolution (LWW, Server wins on tie) (POMO-306)
- [x] Settings Sync (POMO-308)

### v2.1 - Monetization & AI Coach ✅
- [x] Stripe Payment Integration
- [x] Subscription Management
- [x] AI Coach (Coach Particle, Insights, Chat)
- [x] GDPR Compliance (Export, Deletion, Privacy Policy)

### v2.2 - Daily Intentions ✅
- [x] Intention data model + overlay + display + shortcuts (Phase 1)
- [x] Aligned/Reactive colors + alignment toggle + counter + timeline (Phase 2)
- [x] Evening reflection + intention status + week view + tomorrow suggestion (Phase 3)

### v2.3 - Intelligent Particles ✅
- [x] Session Start Nudge (POMO-380)
- [x] Silent Intelligence: Smart Presets, Task Prediction, Empty States (POMO-384)
- [x] Particle Memory (POMO-381)
- [x] Intention-Coach Bridge: Morning Context + Evening Insight (POMO-382)
- [x] Weekly Narrative (POMO-383)
- [x] Coach Briefing Redesign (POMO-385)
- [x] Coach Intention Intelligence (POMO-362+364)
- [x] Auto-Alignment Detection (POMO-363)
- [x] Intention Cloud Sync (POMO-390)

### v3.0 - Essential Particle (10x) ← CURRENT
- [x] Chat Persistence (POMO-400)
- [x] Session Quality Indicator (POMO-401)
- [x] Monthly Recap Card (POMO-402)
- [x] Task Intelligence Surface (POMO-403)
- [ ] Deep Work Insights (POMO-410)
- [ ] Burnout Detection (POMO-411)
- [ ] Focus Blocks (POMO-412)

### v4.0 - Native Mac App
- [ ] SwiftUI App
- [ ] Menubar Integration
- [ ] Focus Mode Integration
- [ ] AppleScript Support
- [ ] Shared Swift Package

### v4.1 - Native iOS App
- [ ] SwiftUI App (reduced scope)
- [ ] Widgets
- [ ] Live Activities
- [ ] Shared Swift Package (with Mac)

---

## Icebox

Parked ideas:

- Sound Creation Tools (POMO-125) – Reason: Nice-to-have, not critical
- Phase Ambient Sounds (POMO-137) – Reason: Evaluate after Cloud Sync
- Offline Queue (POMO-205) – Reason: After Sync implementation
- Social/Team features – Reason: "Focus is personal" philosophy
- Gamification (streaks, badges) – Reason: "Calm over anxiety" principle
- Apple Watch App – Reason: Evaluate after iOS
- Android App – Reason: iOS/Mac focus first
- Weekly Email Report (POMO-156) – Reason: After Account system
- Smart Default Duration (ex POMO-384-D) – Reason: Zu invasiv, widerspricht User-Kontrolle

---

*Last updated: 2026-02-07 (v2.3 complete, v3.0 Essential Particle roadmap set from 10x Session 2)*
