# Particle – Feature Roadmap

## Web-App vs. Native App (Icebox)

**App-Name:** Particle (vorher Pomo)
**Datum:** Januar 2026
**Basierend auf:** Session Competitor Analysis

---

## Executive Summary

Diese Roadmap unterteilt alle Features in:

1. **🌐 WEB-APP** – Jetzt umsetzbar mit Next.js/React
2. **🖥️ NATIVE ICEBOX** – Später mit Electron/Tauri oder Swift

**Kritische Session-Learnings:**
- Overflow Mode ist MUST-HAVE (auch in Web machbar)
- Website/App Blocking braucht Native
- System DND braucht Native
- Keyboard-First ist unser Web-Differentiator

---

## Teil 1: Session-Learnings – Kritische Features

### Was Session besser macht (und wir kopieren MÜSSEN)

| # | Feature | Kritikalität | Web möglich? | Warum kritisch |
|---|---------|-------------|--------------|----------------|
| 1 | **Overflow Mode** | 🔴 KRITISCH | ✅ JA | Flow-State respektieren |
| 2 | **Intentions/Task vor Session** | 🔴 KRITISCH | ✅ JA | Fokus-Klarheit |
| 3 | **Session-Kategorien** | 🟡 HOCH | ✅ JA | Tracking & Analytics |
| 4 | **Visuelle Phase-Unterscheidung** | 🔴 KRITISCH | ✅ JA | Work vs Break klar |
| 5 | **Statistiken & Analytics** | 🔴 KRITISCH | ✅ JA | Wert der App |
| 6 | **Cross-Device Sync** | 🟡 HOCH | ✅ JA | Nahtloses Arbeiten |
| 7 | **Background Sounds** | 🟢 MITTEL | ✅ JA | Nice-to-have |
| 8 | **Reflection nach Session** | 🟢 MITTEL | ✅ JA | Für Stats interessant |
| 9 | **Website Blocking** | 🔴 KRITISCH | ❌ NEIN | Braucht Browser Extension |
| 10 | **App Blocking** | 🔴 KRITISCH | ❌ NEIN | Braucht Native |
| 11 | **System DND** | 🔴 KRITISCH | ❌ NEIN | Braucht Native |
| 12 | **Slack Integration** | 🟡 HOCH | ⚠️ API | OAuth möglich |
| 13 | **Calendar Sync** | 🟡 HOCH | ⚠️ API | Google Calendar API |
| 14 | **Mini Player / Menu Bar** | 🟡 HOCH | ❌ NEIN | Braucht Native |
| 15 | **Dynamic Island** | 🟢 NIEDRIG | ❌ NEIN | Nur iOS |

---

## Teil 2: WEB-APP Features (Jetzt bauen)

### 🌐 Phase 1: MVP (Wochen 1-4)

**Ziel:** Besser als Pomofocus, Keyboard-First

| Feature | Session hat? | Unsere Version | Priorität |
|---------|:------------:|----------------|-----------|
| **Timer mit Overflow Mode** | ✅ | Timer läuft weiter nach Ende, zeigt +Zeit | P0 |
| **Keyboard Shortcuts** | ❌ | Space=Start/Pause, R=Reset, B=Break | P0 |
| **Command Palette (Cmd+K)** | ❌ | Fuzzy-Search für alle Actions | P0 |
| **Deep Work Presets** | ❌ | 25/5, 52/17, 90/20 | P0 |
| **Quick Task Input** | ⚠️ Intentions | Task vor Session eingeben | P0 |
| **Dark Mode (Monochrome)** | ✅ | #0D0D0D, #4F6EF7 Accent | P0 |
| **Große Timer-Anzeige** | ✅ | JetBrains Mono, zentriert | P0 |
| **Phase-Visualisierung** | ✅ | Subtile Farbänderung Work/Break | P0 |
| **Session Counter** | ✅ | "Session 3/4" Anzeige | P0 |
| **Reversible Actions** | ✅ | Undo bei Abandon (5 Sek) | P0 |

**Technische Umsetzung:**

```typescript
// Overflow Mode Logik
const [isOverflow, setIsOverflow] = useState(false);
const [overflowTime, setOverflowTime] = useState(0);

useEffect(() => {
  if (remainingTime <= 0 && isRunning) {
    setIsOverflow(true);
    setOverflowTime(prev => prev + 1);
  }
}, [remainingTime, isRunning]);

// Display: "25:00" → "00:00" → "+00:01" → "+00:02"
```

---

### 🌐 Phase 2: Analytics & Integration (Wochen 5-8)

**Ziel:** Session-Level Analytics, erste Integrations

| Feature | Session hat? | Unsere Version | Priorität |
|---------|:------------:|----------------|-----------|
| **Session History** | ✅ | Liste aller Sessions mit Dauer | P1 |
| **Daily/Weekly Stats** | ✅ | Focus-Zeit pro Tag/Woche | P1 |
| **Focus Score** | ⚠️ Analytics | Berechneter Score (0-100) | P1 |
| **Streak Counter** | ✅ | Tage in Folge mit Sessions | P1 |
| **Kategorien/Tags** | ✅ | Sessions gruppieren | P1 |
| **Heatmap** | ❌ | GitHub-Style Aktivitäts-Grid | P1 |
| **Export (CSV/JSON)** | ⚠️ | Daten-Export für Power-User | P1 |
| **Local Storage Sync** | ✅ | Ohne Account speichern | P1 |

**Focus Score Formel:**

```typescript
// Focus Score = Gewichteter Durchschnitt
const focusScore = (
  (completedSessions / targetSessions) * 40 +  // Session-Completion
  (focusMinutes / targetMinutes) * 30 +         // Zeit-Ziel
  (streak / 7) * 20 +                            // Streak-Bonus
  (noInterruptions ? 10 : 0)                     // Unterbrechungsfrei
);
```

---

### 🌐 Phase 3: Cloud & Collaboration (Wochen 9-12)

**Ziel:** Account-System, API-Integrations

| Feature | Session hat? | Unsere Version | Priorität |
|---------|:------------:|----------------|-----------|
| **User Accounts** | ✅ | Optional, für Sync | P2 |
| **Cloud Sync** | ✅ | Sessions über Geräte | P2 |
| **Google Calendar Sync** | ⚠️ Apple only | Sessions als Events | P2 |
| **Slack Status** | ✅ | "Focusing on [Task]" | P2 |
| **Linear Import** | ⚠️ Copy only | Tasks aus Linear ziehen | P2 |
| **Notion Integration** | ❌ | Session-Log zu Notion | P2 |
| **PWA Support** | ❌ | Installierbar, Offline-fähig | P2 |
| **Notifications API** | ✅ | Browser Notifications | P2 |

---

### 🌐 Phase 4: Premium Features (Wochen 13-16)

**Ziel:** Monetarisierung, Power-User Features

| Feature | Session hat? | Unsere Version | Priorität |
|---------|:------------:|----------------|-----------|
| **Background Sounds** | ✅ | Lo-Fi, White Noise, Nature | P3 |
| **Custom Presets** | ✅ | Eigene Zeiten speichern | P3 |
| **Goals & Targets** | ⚠️ | Tages-/Wochenziele setzen | P3 |
| **Reflection Prompts** | ✅ | "Was hast du erreicht?" | P3 |
| **Team Dashboard** | ❌ | Shared Focus Sessions | P3 |
| **Pomodoro Estimation** | ⚠️ | "~4 Pomodoros für Task" | P3 |
| **Themes** | ❌ | Alternative Monochrome-Paletten | P3 |

---

## Teil 3: NATIVE APP Icebox (Später bauen)

### 🖥️ Icebox A: Browser Extension (Electron nicht nötig)

**Technologie:** Chrome/Firefox Extension

| Feature | Session hat? | Warum Native nötig | Priorität |
|---------|:------------:|-------------------|-----------|
| **Website Blocking** | ✅ | Browser-API für URL-Block | Icebox |
| **Tab Tracking** | ❌ | Welche Tabs während Focus? | Icebox |
| **Auto-Start bei Site** | ❌ | "Start Session wenn GitHub" | Icebox |

---

### 🖥️ Icebox B: Desktop App (Electron/Tauri)

**Technologie:** Electron oder Tauri

| Feature | Session hat? | Warum Native nötig | Priorität |
|---------|:------------:|-------------------|-----------|
| **System DND (macOS)** | ✅ | macOS Focus Mode API | Icebox |
| **App Blocking** | ✅ | OS-Level App Control | Icebox |
| **Menu Bar Timer** | ✅ | Native Menu Bar Item | Icebox |
| **Global Shortcuts** | ⚠️ | Systemweite Hotkeys | Icebox |
| **Auto-Launch** | ✅ | Bei Login starten | Icebox |
| **Tray Icon** | ✅ | Status in System Tray | Icebox |

**Electron/Tauri Entscheidung:**

| Aspekt | Electron | Tauri |
|--------|----------|-------|
| Bundle Size | ~150MB | ~10MB |
| Performance | Mittel | Hoch |
| Web-Code Reuse | 100% | 100% |
| Native Features | Gut | Sehr gut |
| **Empfehlung** | - | ✅ Tauri |

---

### 🖥️ Icebox C: Mobile App (React Native / Swift)

**Technologie:** React Native oder Swift (iOS first)

| Feature | Session hat? | Warum Native nötig | Priorität |
|---------|:------------:|-------------------|-----------|
| **iOS App** | ✅ | Mobile Experience | Icebox |
| **Dynamic Island** | ✅ | iOS 16+ Feature | Icebox |
| **Lock Screen Widget** | ✅ | iOS Widget API | Icebox |
| **Apple Watch** | ⚠️ | WatchOS App | Icebox |
| **Haptic Feedback** | ✅ | Native Vibration | Icebox |
| **Background Timer** | ✅ | Timer wenn App closed | Icebox |

---

## Teil 4: Feature-Matrix – Was wann

```
ZEIT →

Woche 1-4        Woche 5-8        Woche 9-12       Woche 13-16      ICEBOX
─────────────────────────────────────────────────────────────────────────────
WEB MVP          ANALYTICS        CLOUD            PREMIUM          NATIVE
─────────────────────────────────────────────────────────────────────────────
• Timer          • History        • Accounts       • Sounds         • Extension
• Overflow       • Stats          • Cloud Sync     • Custom         • Desktop
• Keyboard       • Focus Score    • Calendar       • Reflection     • Mobile
• Cmd+K          • Streak         • Slack          • Teams          • Watch
• Presets        • Categories     • Linear         • Goals
• Tasks          • Heatmap        • Notion         • Themes
• Dark Mode      • Export         • PWA
• Phase-Visual                    • Notifications
```

---

## Teil 5: Session-Learnings → Particle Actions

### 🔴 KRITISCHE Session-Features für Web-App

| Session Feature | Particle Implementation | Sprint |
|-----------------|------------------------|--------|
| **Overflow Mode** | Timer zeigt +Zeit, kein Auto-Stop | Sprint 1 |
| **Intentions** | Quick Task Input vor Session | Sprint 1 |
| **Phase Sounds** | Subtiler Ton bei Wechsel | Sprint 2 |
| **Categories** | Tags für Sessions | Sprint 2 |
| **Analytics** | Focus Score, Streaks | Sprint 2 |
| **Reflection** | Optional nach Session | Sprint 4 |

### 🟡 WICHTIGE Session-Features (API-basiert)

| Session Feature | Particle Implementation | Sprint |
|-----------------|------------------------|--------|
| **Slack Integration** | OAuth + Status API | Sprint 3 |
| **Calendar Sync** | Google Calendar API | Sprint 3 |
| **Cross-Device** | Cloud Sync mit Account | Sprint 3 |

### 🔵 ICEBOX Session-Features (Native nötig)

| Session Feature | Warum Icebox | Technologie |
|-----------------|--------------|-------------|
| **System DND** | macOS API nötig | Tauri/Electron |
| **Website Blocking** | Browser-Injection | Extension |
| **App Blocking** | OS-Level | Tauri/Electron |
| **Menu Bar** | Native UI | Tauri/Electron |
| **Dynamic Island** | iOS only | Swift |

---

## Teil 6: Konkrete Sprint-Planung

### Sprint 1: Core Timer (2 Wochen)

**Session-Learnings angewendet:**

```
User Stories:
├── Timer mit Overflow Mode
│   └── "Als User will ich nach 25min weiterarbeiten können"
├── Keyboard Shortcuts
│   └── "Als Power-User will ich ohne Maus arbeiten"
├── Command Palette
│   └── "Als User will ich mit Cmd+K alles steuern"
├── Quick Task
│   └── "Als User will ich vor Session mein Ziel eingeben" ← SESSION
└── Deep Work Presets
    └── "Als User will ich 52/17 und 90/20 nutzen"
```

### Sprint 2: Analytics (2 Wochen)

**Session-Learnings angewendet:**

```
User Stories:
├── Session History
│   └── "Als User will ich vergangene Sessions sehen" ← SESSION
├── Focus Score
│   └── "Als User will ich meinen Fokus quantifizieren"
├── Streak Counter
│   └── "Als User will ich meine Serie sehen" ← SESSION
├── Categories/Tags
│   └── "Als User will ich Sessions kategorisieren" ← SESSION
└── Heatmap
    └── "Als User will ich Aktivität im Grid sehen"
```

### Sprint 3: Integrations (2 Wochen)

**Session-Learnings angewendet:**

```
User Stories:
├── Google Calendar Sync
│   └── "Als User will ich Sessions im Kalender" ← SESSION
├── Slack Status
│   └── "Als User will ich Auto-Status in Slack" ← SESSION
├── Linear Import
│   └── "Als User will ich Tasks aus Linear ziehen"
└── Cloud Sync
    └── "Als User will ich überall meine Daten" ← SESSION
```

### Sprint 4: Polish & Premium (2 Wochen)

**Session-Learnings angewendet:**

```
User Stories:
├── Background Sounds
│   └── "Als User will ich Ambient-Sounds" ← SESSION
├── Reflection Prompts
│   └── "Als User will ich nach Session reflektieren" ← SESSION
├── Custom Presets
│   └── "Als User will ich eigene Timer speichern" ← SESSION
└── PWA Support
    └── "Als User will ich Particle installieren"
```

---

## Teil 7: Technische Architektur

### Web-App Stack (bestätigt)

```
Frontend:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS 3.4
├── Framer Motion 11
└── Lucide Icons

State:
├── Zustand (Client State)
├── React Query (Server State)
└── localStorage (Offline First)

Backend (Phase 3):
├── Supabase (Auth + DB)
├── PostgreSQL
└── Edge Functions

APIs:
├── Google Calendar API
├── Slack API (OAuth)
├── Linear API (GraphQL)
└── Notion API
```

### Native Stack (Icebox)

```
Desktop (Icebox B):
├── Tauri 2.0
├── Rust Backend
└── Shared React Frontend

Mobile (Icebox C):
├── React Native
│   └── Shared Hooks/State
└── ODER Swift (iOS-only)

Extension (Icebox A):
├── Chrome Extension (Manifest V3)
└── Firefox Add-on
```

---

## Fazit

### Web-App Fokus (Jetzt)

| Priorität | Features |
|-----------|----------|
| **P0** | Timer, Overflow, Keyboard, Cmd+K, Presets, Tasks |
| **P1** | Analytics, Focus Score, Streak, Categories |
| **P2** | Calendar, Slack, Linear, Cloud Sync |
| **P3** | Sounds, Reflection, Teams, PWA |

### Native Icebox (Später)

| Priorität | Features | Technologie |
|-----------|----------|-------------|
| **Icebox A** | Website Blocking | Browser Extension |
| **Icebox B** | System DND, Menu Bar, App Blocking | Tauri Desktop |
| **Icebox C** | iOS App, Dynamic Island | React Native/Swift |

### Session-Differenzierung

**Was wir von Session übernehmen:**
- ✅ Overflow Mode
- ✅ Categories
- ✅ Reflection
- ✅ Calendar Sync
- ✅ Slack Integration

**Was wir BESSER machen:**
- ⭐ Keyboard-First (Session hat das nicht!)
- ⭐ Command Palette (Session hat das nicht!)
- ⭐ Deep Work Presets (Session hat nur Pomodoro!)
- ⭐ Linear Integration (Session nur Copy-Paste!)
- ⭐ Web-First (Session nur Apple!)

---

*Particle – Der Keyboard-First Focus Timer für Profis*
