# Roadmap

High-level overview of features and milestones.

---

## Current Focus

> **Intelligent Particles** - AI Woven Into Every Moment

**Goal:** Transform AI from "a feature" to "the soul of the app"
**Status:** Stories refined, ready for development

---

## Next: Intelligent Particles (10x AI)

> "The best AI is the one you don't notice. It manifests not as a feature, but as a feeling: this app understands me."

### Layer 1: Silent Intelligence (No API, rein lokal)

Lokale Pattern-Auswertung ohne API-Calls. Funktioniert offline, instant, fuer alle Tiers.

| Story | Feature | Points | Status | Details |
|-------|---------|--------|--------|---------|
| POMO-380 | Session Start Nudge | 2 | 📋 Backlog | Personalisierter Einzeiler unter Start-Button basierend auf Patterns |
| POMO-384 | Silent Intelligence | 3 | 📋 Backlog | Smart Preset Highlighting, Task Prediction, Intelligent Empty States |

**POMO-380 — "The Whisper Before You Begin"**
- Nudge unter Start-Button (und unter IntentionDisplay wenn vorhanden)
- 6 Nudge-Typen mit klarer Prioritaet: Intention > Time Peak > Project > Progress > Task > Reminder
- Mindestens 10 Work-Sessions noetig, sonst keine Nudge
- Nutzt bestehende `detectAllPatterns()`, `useIntention()`, `useSessionStore()`

**POMO-384 — "The App Thinks With You"**
- A) Smart Preset Highlighting: Subtiler Ring (`ring-1 ring-tertiary/20`) auf empfohlenem Preset
- B) Task Prediction: Wiederkehrende Tasks als Placeholder mit `?`-Suffix (Tab = accept)
- C) Intelligent Empty States: "Welcome back" / "Your most productive day" / "Peak focus window"
- ~~D) Smart Default Duration~~ — entfernt (zu invasiv, widerspricht User-Kontrolle)

### Layer 2: Contextual Moments (API-enhanced fuer Flow, lokal fuer Free)

AI-generierte Momente an Schluesselpunkten. Flow-Tier nutzt API, Free-Tier bekommt lokale Templates.

| Story | Feature | Points | Status | Details |
|-------|---------|--------|--------|---------|
| POMO-381 | Particle Memory | 5 | 📋 Backlog | Jedes Particle erhaelt einen einzigartigen Memory-Satz |
| POMO-382 | Intention-Coach Bridge | 3 | 📋 Backlog | Intention verknuepft mit Morning Context + Evening Insight + Coach |
| POMO-383 | Weekly Narrative | 3 | 📋 Backlog | 3-Satz-Geschichte ueber die Woche im Coach |

**POMO-381 — "Every Particle Remembers"**
- Neues `memory?: string` Feld auf `DBSession` (Dexie v4→v5)
- Nur Work-Sessions nach COMPLETE (nicht SKIP, nicht Break)
- Fire-and-forget: Session wird sofort gespeichert, Memory asynchron nachgeliefert
- ~40-60% der Sessions bekommen ein Memory (nicht jede ist bemerkenswert)
- 10 Memory-Typen: Duration Milestone, Daily Record, Return After Break, Deep Work, etc.
- Anzeige in ParticleDetailOverlay (Quote-Style) + Timeline-Tooltip

**POMO-382 — "The Compass Speaks"**
- A) Morning Context: Beim Tippen in IntentionOverlay → historische Stats zum Thema zeigen
- B) Evening Insight: AI-Satz in EveningReflection ueber Alignment-Split ("3 of 5 aligned...")
- C) Coach Awareness: `CoachContext` um `todayIntention` erweitern
- Morning = rein lokal ($0), Evening = 1 API-Query/Tag (Flow), Coach = Teil des System-Prompts

**POMO-383 — "The Story of Your Week"**
- 3-Satz-Narrative ueber die abgeschlossene Woche im CoachView (ueber POTW)
- Lokaler Fallback: 3 variable Saetze (Arc/Detail/Highlight) mit ~27 Kombinationen
- Caching: localStorage, 1 Generierung pro Woche, automatische Invalidierung am Montag
- < 3 Particles → "A quiet week. Sometimes rest is the work."

**Total: 16 Story Points**

### The 3-Layer AI Architecture

```
Layer 3: Coach Modal (G C)        ← EXISTS (POMO-319-326)
         Deep analysis, chat, export
         300 queries/month (Flow)

Layer 2: Contextual Moments       ← NEW (POMO-381, 382, 383)
         Particle Memory, Evening Insight,
         Intention Bridge, Weekly Narrative
         API-enhanced (Flow) + local fallback (Free)

Layer 1: Silent Intelligence      ← NEW (POMO-380, 384)
         Start Nudge, Smart Presets,
         Task Prediction, Empty States
         100% local, no API, all tiers
```

### Alle Stories sind unabhaengig

Keine Story blockt eine andere. Empfohlene Reihenfolge nach Impact:

```
1. POMO-380 (2 SP) — Highest impact/effort ratio, sofort spuerbar
2. POMO-384 (3 SP) — Subtile Verbesserungen ueberall
3. POMO-381 (5 SP) — Groesstes Feature, braucht DB-Migration
4. POMO-382 (3 SP) — Verknuepft bestehende Features
5. POMO-383 (3 SP) — Wochenrhythmus, am wenigsten dringend
```

### API-Quota Impact (Flow Tier: 300/Monat)

| Story | Queries/Event | Frequency | ~Queries/Monat |
|-------|--------------|-----------|----------------|
| POMO-381 Memory | 1 per session | ~5/Tag | ~150 |
| POMO-382 Evening | 1 per day | ~1/Tag | ~30 |
| POMO-383 Narrative | 1 per week | ~1/Woche | ~4 |
| Coach Chat/Insights | varies | varies | ~116 (remaining) |
| **Total** | | | **~300** |

**Hinweis:** Bei 5 Sessions/Tag wird das Quota knapp. Alternative: Memories rein lokal generieren (auch fuer Flow) und API-Budget fuer Chat/Insights reservieren.

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

### Phase 4: Intelligence (Future)

| Story | Feature | Points | Status | Note |
|-------|---------|--------|--------|------|
| POMO-362 | Coach prompt integration | 3 | 📋 Future | Teilweise abgedeckt durch POMO-382 |
| POMO-363 | Auto-alignment detection | 5 | 📋 Future | |
| POMO-364 | Alignment statistics for Coach | 5 | 📋 Future | |
| POMO-365 | Supabase sync for intentions | 3 | 📋 Future | |

**Total Phase 4: 16 SP**

**Daily Intentions Done: 35 SP (Phase 1-3 complete)**

---

## Later: Phase 3 - Native Apps

> Mac & iOS

**Goal:** Native desktop and mobile experience
**Status:** After Intelligent Particles

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
│  PHASE 2.6: Intelligent Particles             16 SP              │
│  ─────────────────────────────────────                          │
│  ☐ Silent Intelligence (local patterns)        5 SP  ← CURRENT  │
│  ☐ Contextual Moments (API-enhanced)          11 SP              │
│                                                                  │
│  PHASE 3: Native Apps                         ~80 SP             │
│  ─────────────────────────────────────                          │
│  ☐ Native Mac App (Swift/SwiftUI)            ~50 SP  LATER       │
│  ☐ Native iOS App (SwiftUI, reduced scope)   ~30 SP              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  REMAINING: ~96 Story Points                                     │
│  At ~5 SP/week: ~19 weeks (~5 months)                           │
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
  Intelligent Particles ← CURRENT
   (all 5 stories independent)
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

### v2.3 - Intelligent Particles ← CURRENT
- [ ] Session Start Nudge (POMO-380)
- [ ] Silent Intelligence: Smart Presets, Task Prediction, Empty States (POMO-384)
- [ ] Particle Memory (POMO-381)
- [ ] Intention-Coach Bridge: Morning Context + Evening Insight (POMO-382)
- [ ] Weekly Narrative (POMO-383)

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
- Smart Default Duration (ex POMO-384-D) – Reason: Zu invasiv, widerspricht User-Kontrolle

---

*Last updated: 2026-02-05 (Stories refined, Daily Intentions Phase 1-3 complete, Intelligent Particles current focus)*
