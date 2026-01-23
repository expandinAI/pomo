# Pomo: Deep-Dive Research Dokument

## Das schärfste Deep-Work-Tool für Profis

**Version:** 1.0
**Datum:** Januar 2026
**Ziel:** Input für User Stories und Produktentwicklung

---

## Executive Summary

Dieses Dokument definiert die Vision für **Pomo** – ein Pomodoro- und Produktivitäts-Tool, das die Designsprache von Linear und Endel mit wissenschaftlich fundierter Deep-Work-Methodik vereint. Die Zielgruppe sind Entwickler, Designer, Knowledge Worker und Freelancer, die professionelle Werkzeuge wie Linear, Raycast und Superhuman schätzen.

**Kern-Differenzierung:**
- Tastatur-first wie Linear
- Visuell beruhigend wie Endel
- Funktional erweiterbar wie ein Schweizer Taschenmesser
- Wissenschaftlich fundiert, aber nicht akademisch

---

# Teil 1: Marktanalyse

## 1.1 Wettbewerber-Übersicht

| App | Plattformen | Preis | Design (1-10) | Stärken | Schwächen |
|-----|------------|-------|---------------|---------|-----------|
| **Pomofocus** | Web | Free / $12/Jahr | 8 | Extrem einfach, 5.27M Besucher/Monat | Keine native App, kein Offline |
| **Session** | Apple only | $4.99/Monat | 9 | Beste Apple-Integration, Slack-Status | Nur Apple, teures Abo |
| **Flow** | Apple only | Einmalkauf möglich | 9 | Einmalkauf-Option, Fullscreen-Breaks | Nur Apple-Plattformen |
| **Forest** | iOS, Android | $3.99 Einmalkauf | 8 | Echte Baumpflanzungen, Gamification | Keine Desktop-App |
| **Toggl** | Alle | $9/User/Monat | 7 | 100+ Integrationen, Teams | Pomodoro ist Nebenfunktion |
| **Focus@Will** | Alle | $52-70/Jahr | 6 | Neurowissenschaftliche Musik | Veraltete Mobile-Apps |
| **Be Focused** | Apple | $4.99-10 Einmalkauf | 5 | Günstig, Apple Watch | Veraltetes Design |
| **Tide** | iOS, Android | $60/Jahr | 9 | All-in-One Wellness, Design | Teuer, keine Desktop-App |

## 1.2 Feature-Gaps im Markt

### Was alle haben:
- Basis Pomodoro-Timer
- Anpassbare Intervalle
- Grundlegende Statistiken

### Was niemand richtig macht:

| Gap | Beschreibung | Chance für Pomo |
|-----|--------------|-----------------|
| **True Cross-Platform** | Keine App funktioniert nahtlos auf Web + Mac + Windows + iOS | Einer App, überall perfekt |
| **AI-Scheduling** | Automatische Fokus-Zeit-Planung basierend auf Kalender | Intelligente Empfehlungen |
| **Developer-Integrationen** | Keine native Verbindung zu Linear, Notion, Obsidian | Deep Integration |
| **Tastatur-First** | Die meisten Apps sind Maus-orientiert | Jede Aktion per Shortcut |
| **Team Pomodoro** | Gemeinsame Focus-Sessions für Remote-Teams | Virtual Co-Working |
| **Wissenschaftliche Defaults** | Starre 25/5-Regel ohne Alternative | Personalisierte Intervalle |

## 1.3 Positionierung

**Pomo positioniert sich als:**

> "Der intelligente Fokus-Assistent für Knowledge Worker, die Tools wie Linear, Raycast und Superhuman lieben."

**Nicht Pomo:**
- Gamified (Forest)
- Wellness-All-in-One (Tide)
- Business Time-Tracker (Toggl)
- Nur Apple (Session)

---

# Teil 2: Zielgruppen-Analyse

## 2.1 Primäre Personas

### Persona 1: Senior Developer "Max"

| Attribut | Detail |
|----------|--------|
| **Alter** | 28-40 |
| **Tools** | Linear, VS Code, Raycast, Obsidian |
| **Pain Points** | Context-Switching, Meetings unterbrechen Flow, 52% Zeit = Nicht-Coding |
| **Bedürfnisse** | 90-Min-Sessions, keine Unterbrechungen, Git-Integration |
| **Zahlungsbereitschaft** | Hoch für Tools die Zeit sparen |

**Max' typischer Tag:**
- 6:00-8:00 Deep Work (keine Slack/Email)
- 9:00-12:00 Meetings
- 14:00-18:00 Coding in 90-Min-Blöcken
- Abends: Open Source

### Persona 2: UX Designer "Lisa"

| Attribut | Detail |
|----------|--------|
| **Alter** | 25-35 |
| **Tools** | Figma, Linear, Notion, Arc Browser |
| **Pain Points** | Kreative Blöcke, zu viele Feedback-Loops |
| **Bedürfnisse** | Flexible Sessions, Inspiration während Pausen |
| **Zahlungsbereitschaft** | Mittel, Design muss perfekt sein |

**Lisa's Workflow:**
- Morgens: Research und Moodboards (25-Min-Pomodoros)
- Nachmittags: Design-Sessions (90 Min ohne Unterbrechung)
- Rituale: Musik + Kaffee = Flow-Signal

### Persona 3: Freelance Consultant "Thomas"

| Attribut | Detail |
|----------|--------|
| **Alter** | 35-50 |
| **Tools** | Notion, Toggl, Slack, Google Workspace |
| **Pain Points** | Time Tracking für Abrechnung, zu viele Kunden |
| **Bedürfnisse** | Projekt-basiertes Tracking, Exportfähige Reports |
| **Zahlungsbereitschaft** | ROI-orientiert (Zeit = Geld) |

**Thomas' Anforderungen:**
- Billable vs. Non-Billable trennen
- Wochen-Reports für Kunden
- Projekt-wechsel ohne Friction

### Persona 4: Product Manager "Sarah"

| Attribut | Detail |
|----------|--------|
| **Alter** | 30-45 |
| **Tools** | Linear, Notion, Slack, Figma (für Reviews) |
| **Pain Points** | Meeting-Overload, fragmentierte Fokuszeit |
| **Bedürfnisse** | Kalender-Integration, DND-Automation |
| **Zahlungsbereitschaft** | Hoch, wenn messbare Produktivitätssteigerung |

---

# Teil 3: Funktionale Anforderungen

## 3.1 Timer-System

### Kern-Features

| Feature | Beschreibung | Priorität |
|---------|--------------|-----------|
| **Flexible Intervalle** | 25/5, 52/17, 90/20, Custom | P0 |
| **Presets** | Pomodoro Classic, Deep Work, Sprint | P0 |
| **Automatische Pausen** | Nahtloser Übergang Arbeit → Pause | P0 |
| **Lange Pause nach X Zyklen** | Konfigurierbar (Default: 4) | P0 |
| **Session-Ziel** | "Heute: 8 Pomodoros" | P1 |
| **Stopwatch-Modus** | Für Aufgaben ohne feste Länge | P1 |

### Wissenschaftliche Grundlagen

**Pomodoro-Varianten:**

| Methode | Arbeitszeit | Pause | Anwendung |
|---------|-------------|-------|-----------|
| **Classic Pomodoro** | 25 Min | 5 Min | Einsteiger, häufige Pausen |
| **52/17 Regel** | 52 Min | 17 Min | Top 10% produktivste Worker (DeskTime) |
| **90-Min Ultradian** | 90 Min | 20-30 Min | Biologische Rhythmen, Deep Work |
| **Custom** | Frei wählbar | Frei wählbar | Personalisierung |

**Wichtig:** Nach 23-25 Minuten Unterbrechung dauert es genauso lange, wieder fokussiert zu sein.

## 3.2 Deep-Work-Funktionen

### Philosophie-Auswahl

| Philosophie | Beschreibung | Pomo-Implementation |
|-------------|--------------|---------------------|
| **Rhythmisch** | Feste tägliche Blöcke | Tägliche Routine mit festen Zeiten |
| **Bimodal** | Intensive Phasen + offene Phasen | "Focus Days" im Kalender markieren |
| **Journalistisch** | Spontane Deep Work wenn möglich | Quick-Start ohne Setup |

### Shutdown-Ritual

**Cal Newport's Empfehlung, in Pomo integriert:**

1. **Finaler Task-Check** – Offene Aufgaben reviewen
2. **Inbox-Zero-Versuch** – Letzte E-Mails/Nachrichten
3. **Morgen planen** – Top 3 Tasks für morgen
4. **Terminierungsphrase** – "Shutdown complete" (konfigurierbar)

**Dauer:** 3-5 Minuten, vom Timer geführt

### Distraction-Blocking

| Feature | Beschreibung | Priorität |
|---------|--------------|-----------|
| **Website-Blocking** | Konfigurierbare Blocklist | P0 |
| **App-Blocking** | Slack, Discord, etc. blockieren | P0 |
| **System DND** | Automatisch Focus Mode aktivieren | P0 |
| **Slack Status** | "In Focus Session" automatisch | P1 |
| **Commitment Mode** | Kann nicht vorzeitig beenden | P2 |

## 3.3 Task-Management

### Integration-First Ansatz

**Pomo ist KEIN Task-Manager.** Stattdessen: Deep Integration mit existierenden Tools.

| Integration | Feature | Priorität |
|-------------|---------|-----------|
| **Linear** | Issues direkt verknüpfen, Status updaten | P0 |
| **Notion** | Datenbank-Items als Tasks | P1 |
| **Todoist** | Tasks synchronisieren | P1 |
| **GitHub** | Issues als Focus-Tasks | P2 |
| **Obsidian** | Daily Note Integration | P2 |

### Minimales internes Task-System

| Feature | Beschreibung |
|---------|--------------|
| **Quick Task** | "Was arbeitest du gerade?" – Ein Textfeld |
| **Deep/Shallow Tag** | Aufgabe klassifizieren |
| **Pomodoro-Schätzung** | "~3 Pomodoros" |
| **Verknüpfung** | Link zu Linear/Notion/etc. |

## 3.4 Analytics & Insights

### Dashboard-Metriken

| Metrik | Visualisierung | Insight |
|--------|----------------|---------|
| **Deep Work Zeit** | Balkendiagramm (Tag/Woche/Monat) | Trend über Zeit |
| **Fokus-Score** | 0-100 | Unterbrechungen, Session-Completion |
| **Produktivste Stunden** | Heatmap | Wann bin ich am besten? |
| **Streak** | Tage-Counter | Motivation |
| **Projekt-Verteilung** | Pie Chart | Wohin geht die Zeit? |

### Export & Integration

- **CSV Export** für Freelancer-Abrechnung
- **API** für Custom Dashboards
- **Webhook** für Automationen (Zapier, Make)

## 3.5 Cross-Platform Sync

| Plattform | Features | Priorität |
|-----------|----------|-----------|
| **macOS (Native)** | Vollständig, Menu Bar, Shortcuts | P0 |
| **iOS** | Timer, Widgets, Apple Watch | P1 |
| **Web** | Fallback, Einstellungen | P1 |
| **Windows** | Native App | P2 |
| **iPadOS** | Optimiert für iPad | P2 |

**Sync-Prinzip:** Echtzeit über alle Geräte, offline-fähig mit konfliktfreier Synchronisation.

---

# Teil 4: Design-System

## 4.1 Design-Philosophie

### Inspiriert von Linear & Endel

| Von Linear | Von Endel |
|------------|-----------|
| Monochrome Palette | Fluid Animationen |
| Keyboard-First | Ambient Interface |
| Information Density | Beruhigende Ästhetik |
| Professional Aesthetic | Flow-State Support |
| Subtle Micro-Interactions | Sound-Integration |

### Design-Prinzipien

1. **Tastatur-First**: Jede Aktion ohne Maus möglich
2. **Progressive Complexity**: Einfach starten, Power-Features entdecken
3. **Invisible Details**: Perfektion in den Details, die man nicht bewusst bemerkt
4. **Dark Mode Default**: Optimiert für lange Fokus-Sessions
5. **Zero-Config**: Sofort produktiv, ohne Setup

## 4.2 Farbpalette

### Monochrome Basis

| Name | Hex | Verwendung |
|------|-----|------------|
| **Background** | `#0D0D0D` | Haupthintergrund (nicht #000000!) |
| **Surface** | `#161616` | Cards, Panels |
| **Surface Elevated** | `#1F1F1F` | Hover States, Elevated Elements |
| **Border** | `#2A2A2A` | Subtile Trennlinien |
| **Text Primary** | `#F5F5F5` | Haupttext (nicht #FFFFFF!) |
| **Text Secondary** | `#A0A0A0` | Sekundärer Text |
| **Text Muted** | `#666666` | Hinweise, Timestamps |

### Akzentfarben

| Name | Hex | Verwendung |
|------|-----|------------|
| **Accent** | `#4F6EF7` | Primäre Aktionen, Links |
| **Success** | `#34D399` | Abgeschlossene Sessions |
| **Warning** | `#FBBF24` | Pausen-Erinnerungen |
| **Focus** | `#8B5CF6` | Aktive Session-Indikator |

**Prinzip:** Farben sparsam einsetzen. In monochromem System = maximale Aufmerksamkeit.

### Light Mode (Optional)

| Name | Hex | Verwendung |
|------|-----|------------|
| **Background** | `#FAFAFA` | Haupthintergrund |
| **Surface** | `#FFFFFF` | Cards |
| **Text Primary** | `#1A1A1A` | Haupttext |

## 4.3 Typografie

### Font Stack

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", monospace;
```

### Skala

| Style | Size | Weight | Line Height | Verwendung |
|-------|------|--------|-------------|------------|
| **Display** | 48px | 700 | 1.1 | Timer-Anzeige |
| **H1** | 24px | 600 | 1.3 | Sektions-Titel |
| **H2** | 18px | 600 | 1.4 | Sub-Sektionen |
| **Body** | 14px | 400 | 1.5 | Fließtext |
| **Small** | 12px | 400 | 1.4 | Hinweise, Labels |
| **Mono** | 13px | 500 | 1.4 | Timer, Stats |

### Typografie-Regeln

- **Kein Letter-Spacing** bei Body-Text unter 18px
- **Negatives Letter-Spacing** (-0.02em) bei Display-Text
- **Inter optimiert für** 14px (4x Baseline Grid)

## 4.4 Spacing & Layout

### 4px Baseline Grid

| Token | Value | Verwendung |
|-------|-------|------------|
| `--space-1` | 4px | Icon Padding |
| `--space-2` | 8px | Inline Spacing |
| `--space-3` | 12px | Kompakte Gaps |
| `--space-4` | 16px | Standard Padding |
| `--space-6` | 24px | Section Gaps |
| `--space-8` | 32px | Large Containers |

### Border Radius

| Token | Value | Verwendung |
|-------|-------|------------|
| `--radius-sm` | 4px | Buttons, Inputs |
| `--radius-md` | 8px | Cards, Dropdowns |
| `--radius-lg` | 12px | Modals, Panels |
| `--radius-full` | 9999px | Badges, Avatars |

**Prinzip:** Kleine Radii = Professionelle Aesthetic (Linear-Stil)

## 4.5 Keyboard UX

### Command Palette (Cmd+K)

**Funktionen:**
- Globale Suche
- Schnellstart Session
- Navigation
- Settings-Zugriff
- Action-Ausführung

**Design:**
- Fuzzy Search
- Recent Commands priorisiert
- Kategorisierte Ergebnisse
- Shortcut-Hints in jedem Eintrag

### Shortcut-System

**Globale Shortcuts:**

| Shortcut | Aktion |
|----------|--------|
| `Cmd+K` | Command Palette |
| `Space` | Start/Pause Timer |
| `Escape` | Stop Session |
| `S` | Skip to Break |
| `R` | Reset Timer |
| `Cmd+,` | Settings |

**Navigation (G-Prefix, wie Linear):**

| Shortcut | Aktion |
|----------|--------|
| `G T` | Go to Timer |
| `G S` | Go to Stats |
| `G H` | Go to History |
| `G P` | Go to Projects |

**Quick Actions:**

| Shortcut | Aktion |
|----------|--------|
| `N` | New Session |
| `T` | New Task |
| `D` | Toggle DND |
| `1-4` | Select Preset (1=25min, 2=52min, etc.) |

### 100ms-Regel

Jede Aktion muss sich **instantan** anfühlen. Keine wahrnehmbare Verzögerung.

## 4.6 Animationen

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| **Hover** | 100ms | ease-out |
| **Micro-Interactions** | 150-200ms | ease-in-out |
| **Panel Transitions** | 250-300ms | ease-in-out |
| **Timer Updates** | 0ms | none (instant) |

### Animation-Typen

**Endel-Inspired:**
- **Breathing Indicator**: Subtile Pulsation während aktiver Session
- **Flow Visualization**: Abstrakte, fließende Linien im Hintergrund
- **Smooth Transitions**: Nahtlose Übergänge zwischen States

**Linear-Inspired:**
- **Hover Elevation**: Subtle scale-up mit Schatten
- **Safe Triangle**: Sub-Menu-Navigation wie Linear
- **Instant Feedback**: Sofortige visuelle Bestätigung

### Reduced Motion

`prefers-reduced-motion` respektieren:
- Keine Animationen
- Instant State Changes
- Alternative Cues (Sound, Text)

## 4.7 Icons

### Style

- **Stroke Width**: 1.5px
- **Size**: 20x20px Grid
- **Style**: Monochrome Line Icons
- **Library**: Lucide Icons (konsistent mit Linear)

### Semantik

| Icon | Bedeutung |
|------|-----------|
| `play-circle` | Start Session |
| `pause-circle` | Pause |
| `stop-circle` | Stop/End |
| `coffee` | Break |
| `zap` | Focus Mode |
| `bar-chart-2` | Statistics |
| `settings` | Settings |
| `command` | Shortcuts |

## 4.8 Sound-Design (Optional)

### Endel-Inspired Approach

| Trigger | Sound |
|---------|-------|
| **Session Start** | Subtle chime (C major) |
| **Session End** | Soft completion tone |
| **Break Start** | Relaxing transition |
| **Warning (1 min)** | Gentle notification |

**Prinzipien:**
- Nicht störend
- 440 Hz Stimmung
- Pentatonische Skala
- Deaktivierbar

---

# Teil 5: UI/UX Patterns

## 5.1 Information Architecture

```
Pomo
├── Timer (Hauptansicht)
│   ├── Active Session
│   ├── Presets
│   └── Quick Task
├── Statistics
│   ├── Today
│   ├── Week
│   ├── Month
│   └── All Time
├── History
│   └── Session Log
├── Projects
│   └── Time per Project
├── Integrations
│   ├── Linear
│   ├── Notion
│   └── Calendar
└── Settings
    ├── Timer
    ├── Notifications
    ├── Shortcuts
    ├── Blocking
    ├── Integrations
    └── Account
```

## 5.2 Timer-View (Hauptansicht)

### Layout

```
┌─────────────────────────────────────────────────┐
│  ← Pomo                           [DND] [≡]    │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│                   25:00                         │
│              [████████░░░░░]                    │
│                                                 │
│           Working on: API Integration           │
│                                                 │
│              [▶ Start Session]                  │
│                                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ 25m  │ │ 52m  │ │ 90m  │ │Custom│          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
│                                                 │
│  Today: ●●●●○○○○  4/8 Sessions                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Interaktionen

- **Click Timer**: Start/Pause
- **Scroll auf Timer**: Zeit anpassen (±1 min)
- **Preset Click**: Wechselt Modus
- **Task Click**: Quick Edit
- **Drag auf Progress**: Spulen

## 5.3 Statistics-View

### Layout

```
┌─────────────────────────────────────────────────┐
│  Statistics                      [D] [W] [M]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Deep Work Time         Focus Score            │
│  ┌─────────────┐       ┌─────────────┐         │
│  │   4h 32m    │       │     87      │         │
│  │   ▲ 12%     │       │   ●●●●○     │         │
│  └─────────────┘       └─────────────┘         │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  ▁▂▃▅▇▅▃▂▁▂▃▄▅▆▇▆▅▄▃▂▁                │   │
│  │  Mo Di Mi Do Fr Sa So                   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Peak Hours                                     │
│  ┌───────────────────────────────────────┐     │
│  │ 6  ░░███░░░░░░░░░███░░░░░░░░          │     │
│  │ 12 ░░░░░░░░░░░░░░░░░░░░░░░░░          │     │
│  │ 18 ░░░░░░░░░░░███░░░░░░░░░░░          │     │
│  └───────────────────────────────────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 5.4 Command Palette

### Layout

```
┌─────────────────────────────────────────────────┐
│  🔍 Type a command or search...                 │
├─────────────────────────────────────────────────┤
│  Recent                                         │
│  ├─ Start 25min Session                    ⏎   │
│  └─ Open Statistics                        G S │
│                                                 │
│  Actions                                        │
│  ├─ Start Session                          ⏎   │
│  ├─ New Task                               T   │
│  ├─ Toggle Do Not Disturb                  D   │
│  └─ Open Settings                          ⌘,  │
│                                                 │
│  Navigation                                     │
│  ├─ Go to Timer                            G T │
│  ├─ Go to Statistics                       G S │
│  └─ Go to History                          G H │
└─────────────────────────────────────────────────┘
```

## 5.5 Menu Bar Integration (macOS)

### Collapsed State

```
[●] 23:45
```

### Expanded State

```
┌─────────────────────────┐
│  ● Focus Session        │
│  23:45 remaining        │
├─────────────────────────┤
│  ▶ Start/Pause     ␣   │
│  ■ End Session     ⎋   │
│  → Skip to Break   S   │
├─────────────────────────┤
│  Today: 4/8 Sessions    │
├─────────────────────────┤
│  Open Pomo         ⌘O   │
│  Preferences       ⌘,   │
│  Quit              ⌘Q   │
└─────────────────────────┘
```

## 5.6 Notifications

### Session End

```
┌─────────────────────────────────────┐
│  ☕ Time for a break!               │
│  You completed 25 minutes of focus. │
│                                     │
│  [Skip Break]  [Start 5min Break]   │
└─────────────────────────────────────┘
```

### Break End

```
┌─────────────────────────────────────┐
│  ⚡ Ready to focus?                 │
│  Break is over. Start next session? │
│                                     │
│  [Not Yet]  [Start Session]         │
└─────────────────────────────────────┘
```

---

# Teil 6: Technical Considerations

## 6.1 Technologie-Stack (Empfehlung)

### Desktop (macOS)

| Layer | Technologie | Grund |
|-------|-------------|-------|
| **Framework** | Swift + SwiftUI | Native Performance, Apple-Integration |
| **Alternative** | Tauri + React | Cross-Platform, Web-Skills nutzbar |
| **State** | Swift Combine / Zustand | Reaktives State Management |
| **Storage** | CoreData / SQLite | Offline-First |
| **Sync** | CloudKit / Custom Sync | Apple-Ökosystem-Integration |

### iOS

| Layer | Technologie |
|-------|-------------|
| **Framework** | Swift + SwiftUI |
| **Widgets** | WidgetKit |
| **Watch** | WatchOS mit Complications |
| **Notifications** | UNUserNotificationCenter |

### Web (Fallback)

| Layer | Technologie |
|-------|-------------|
| **Framework** | Next.js / Remix |
| **Styling** | Tailwind CSS |
| **State** | Zustand |
| **Backend** | Serverless (Vercel/Cloudflare) |

## 6.2 Sync-Architektur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   macOS     │     │   Cloud     │     │   iOS       │
│   App       │◄───►│   Sync      │◄───►│   App       │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Local SQLite        Conflict           Local SQLite
                     Resolution
```

**Prinzip:** Offline-First mit optimistischen Updates und konfliktfreier Synchronisation (CRDT-basiert).

## 6.3 Integrations-API

### Linear Integration

```typescript
// Beispiel: Issue mit Pomo verknüpfen
interface PomoSession {
  id: string;
  duration: number;
  task?: {
    source: 'linear' | 'notion' | 'manual';
    externalId?: string;
    title: string;
  };
  completedAt: Date;
}
```

### Webhook Events

```typescript
// Session-Events für Automationen
type WebhookEvent =
  | { type: 'session.started'; data: SessionStarted }
  | { type: 'session.completed'; data: SessionCompleted }
  | { type: 'session.cancelled'; data: SessionCancelled }
  | { type: 'break.started'; data: BreakStarted }
  | { type: 'daily.goal.reached'; data: DailyGoalReached };
```

---

# Teil 7: Roadmap-Empfehlung

## Phase 1: MVP (3-4 Monate)

**Ziel:** Bestes Pomodoro-Tool für Mac-Power-User

| Feature | Priorität |
|---------|-----------|
| Native macOS App | P0 |
| Flexibler Timer (25/52/90/Custom) | P0 |
| Keyboard-First (Command Palette, Shortcuts) | P0 |
| Menu Bar Integration | P0 |
| Minimales Task-System | P0 |
| Dark Mode (Default) | P0 |
| Distraction-Blocking (Websites) | P0 |
| Basis-Statistiken | P0 |
| System DND Integration | P0 |

## Phase 2: Expansion (2-3 Monate)

**Ziel:** Cross-Platform + Integrationen

| Feature | Priorität |
|---------|-----------|
| iOS App mit Widgets | P1 |
| Apple Watch Support | P1 |
| Cloud Sync | P1 |
| Linear Integration | P1 |
| Notion Integration | P1 |
| Advanced Statistics | P1 |
| Slack Status Integration | P1 |
| App-Blocking (macOS) | P1 |

## Phase 3: Differenzierung (2-3 Monate)

**Ziel:** Unique Features

| Feature | Priorität |
|---------|-----------|
| Shutdown Ritual | P2 |
| AI Scheduling | P2 |
| Team Sessions | P2 |
| Windows App | P2 |
| Web App | P2 |
| GitHub Integration | P2 |
| API für Entwickler | P2 |

## Phase 4: Growth (Ongoing)

| Feature | Priorität |
|---------|-----------|
| Obsidian Plugin | P3 |
| Sound Landscapes (Endel-inspired) | P3 |
| Todoist/Asana Integration | P3 |
| Biometrisches Feedback | P3 |
| Enterprise Features | P3 |

---

# Teil 8: Pricing-Empfehlung

## Modell: Freemium + Fair Pricing

### Free Tier

- Unbegrenzte Sessions
- 3 Presets
- 7 Tage Statistik-History
- 1 Integration
- Standard Blocking

### Pro Tier ($5/Monat ODER $49 Lifetime)

- Alles in Free
- Unbegrenzte Statistik-History
- Alle Presets + Custom
- Alle Integrationen
- Advanced Blocking
- Cloud Sync
- Priority Support

### Team Tier ($4/User/Monat)

- Alles in Pro
- Team Sessions
- Team Analytics
- Admin Controls
- SSO (Enterprise)

**Prinzip:** Respekt vor User-Präferenzen (Abo ODER Einmalkauf). Großzügiger Free-Tier ohne Nerv-Limits.

---

# Anhang

## A. Quellen

### Wettbewerber
- Pomofocus.io, Session, Flow, Forest, Toggl, Focus@Will, Be Focused, Tide

### Design-Inspiration
- Linear (linear.app) – Design System, Keyboard UX
- Endel (endel.io) – Animationen, Sound Design
- Raycast – Command Palette, Performance
- Arc Browser – Spaces, Innovation
- Things 3 – Minimalismus
- Superhuman – 100ms-Regel

### Wissenschaftliche Grundlagen
- Francesco Cirillo: Pomodoro Technique
- Cal Newport: Deep Work
- DeskTime: 52/17 Research
- Nathaniel Kleitman: Ultradian Rhythms

### UI/UX Best Practices
- Apple Human Interface Guidelines
- Nielsen Norman Group: Progressive Disclosure
- WCAG: Keyboard Accessibility
- LogRocket: Dark Mode Best Practices

## B. Glossar

| Begriff | Definition |
|---------|------------|
| **Pomodoro** | 25-Minuten-Arbeitseinheit nach Francesco Cirillo |
| **Deep Work** | Fokussierte Arbeit ohne Ablenkung (Cal Newport) |
| **Ultradian Rhythm** | 90-120 Minuten biologischer Zyklus |
| **Flow State** | Zustand optimaler Konzentration und Leistung |
| **Shallow Work** | Administrative, wenig kognitive Aufgaben |
| **Shutdown Ritual** | Strukturierter Arbeitsabschluss |

---

*Dieses Dokument dient als Grundlage für User Stories und Produktentwicklung. Alle Empfehlungen basieren auf Marktforschung, wissenschaftlichen Erkenntnissen und Best Practices erfolgreicher Produktivitäts-Apps.*
