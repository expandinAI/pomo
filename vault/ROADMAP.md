# Roadmap

High-level overview of features and milestones.

---

## Current Focus

> **Phase 2: Monetization & AI Coach** - Payment, AI Coach, GDPR

**Goal:** Revenue-ready product with AI-powered coaching
**Status:** Phase 1 complete, Phase 2 ready to start

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

### v2.0 - Cloud Sync & Accounts (Phase 1) ✅

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

**Total Phase 1: 40 Story Points** ✅

---

## Now: Phase 2 - Monetization & AI Coach

### Priority Order (decided)

1. **Payment Integration** (revenue first)
2. **AI Coach** (killer feature)
3. **GDPR Compliance** (before launch)

### Payment Integration

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-311 | Stripe Setup & Checkout | 3 | 📋 Ready |
| POMO-312 | Payment Webhook Handler | 3 | 📋 Ready |
| POMO-313 | Tier Upgrade Logic | 3 | 📋 Ready |
| POMO-314 | Billing Portal | 2 | 📋 Ready |
| POMO-315 | AI Query Counter | 3 | 📋 Ready |
| POMO-316 | Upgrade Modal UI | 3 | 📋 Ready |
| POMO-317 | Lifetime Purchase | 3 | 📋 Ready |
| POMO-318 | Trial Email Automation | 4 | 📋 Ready |

**Total: 24 Story Points**

### AI Coach

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-319 | Coach Particle UI | 3 | 📋 Ready |
| POMO-320 | Toast Notification System | 3 | 📋 Ready |
| POMO-321 | Coach View | 5 | 📋 Ready |
| POMO-322 | Chat Interface | 5 | 📋 Ready |
| POMO-323 | Insight Engine Backend | 8 | 📋 Ready |
| POMO-324 | Master Prompt & Tuning | 3 | 📋 Ready |
| POMO-325 | Export Function | 3 | 📋 Ready |
| POMO-326 | Coach Settings | 2 | 📋 Ready |

**Total: 32 Story Points**

### GDPR & Data Privacy

| Story | Feature | Points | Status |
|-------|---------|--------|--------|
| POMO-327 | Data Export API + UI | 3 | 📋 Ready |
| POMO-328 | Account Deletion Flow | 5 | 📋 Ready |
| POMO-329 | Deletion Cron Job | 2 | 📋 Ready |
| POMO-330 | Privacy Settings UI | 2 | 📋 Ready |
| POMO-331 | Privacy Policy Page | 2 | 📋 Ready |

**Total: 14 Story Points**

**Phase 2 Total: ~70 Story Points**

---

## Next: Phase 3 - Native Apps

| Feature | Stories | Points | Status |
|---------|---------|--------|--------|
| [[features/native-mac-app]] | TBD | ~50 | Draft |
| [[features/native-ios-app]] | TBD | ~30 | Draft |

**Total Phase 3: ~80 Story Points**

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
│  PHASE 2: Monetization & AI                   ~70 SP             │
│  ─────────────────────────────────────                          │
│  ☐ Payment Integration (Stripe)              24 SP  ← NEXT      │
│  ☐ AI Coach                                  32 SP              │
│  ☐ GDPR & Data Privacy                       14 SP              │
│                                                                  │
│  PHASE 3: Native Apps                         ~80 SP             │
│  ─────────────────────────────────────                          │
│  ☐ Native Mac App (Swift/SwiftUI)            ~50 SP             │
│  ☐ Native iOS App (SwiftUI, reduced scope)   ~30 SP             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  REMAINING: ~150 Story Points                                    │
│  At ~5 SP/week: ~30 weeks (~7 months)                           │
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
Payment    AI Coach
    │         │
    └────┬────┘
         ▼
      GDPR
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
| **Payments** | Stripe | 📋 Next |
| **AI** | Anthropic Claude Haiku | 📋 Next |
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
- Free = Fully usable without account (Local-First)
- Plus = Free account for sync
- Flow = Premium with AI Coach as killer feature

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

### v2.1 - Monetization & AI Coach 🔜
- [ ] Stripe Payment Integration
- [ ] Subscription Management
- [ ] AI Coach (Coach Particle, Insights, Chat)
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

- Sound Creation Tools (POMO-125) – Reason: Nice-to-have, not critical
- Phase Ambient Sounds (POMO-137) – Reason: Evaluate after Cloud Sync
- Offline Queue (POMO-205) – Reason: After Sync implementation
- Social/Team features – Reason: "Focus is personal" philosophy
- Gamification (streaks, badges) – Reason: "Calm over anxiety" principle
- Apple Watch App – Reason: Evaluate after iOS
- Android App – Reason: iOS/Mac focus first
- Weekly Email Report (POMO-156) – Reason: After Account system

---

*Last updated: 2026-01-31 (Phase 1 complete, Phase 2 ready)*
