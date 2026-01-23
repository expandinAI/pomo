# Pomo UI Transformation Plan

## Von "Guter Pomodoro-Timer" zu "Das schärfste Deep-Work-Tool"

**Version:** 1.0
**Datum:** Januar 2026
**Zweck:** Input für Product Owner zur User-Story-Erstellung

---

## Executive Summary

Die aktuelle Pomo-App ist bereits eine solide, gut gebaute Pomodoro-Anwendung mit Premium-Animationen und guter Accessibility. Um sie jedoch zum "schärfsten Deep-Work-Tool" zu transformieren – vergleichbar mit Linear und Endel – müssen wir fundamentale Design- und Funktionsänderungen vornehmen.

**Kernprinzip der Transformation:**
> Vom "freundlichen Timer" zum "professionellen Produktivitätswerkzeug"

---

## Teil 1: Gap-Analyse

### 1.1 Design-System Gaps

| Aspekt | Aktuell | Ziel (Linear/Endel) | Gap |
|--------|---------|---------------------|-----|
| **Farbpalette** | Warm Stone-Töne (Teal/Blue/Emerald/Violet) | Monochrom Schwarz-Weiß mit einem Akzent | Fundamental anders |
| **Dark Mode Background** | `#0C0A09` (Stone 950) | `#0D0D0D` (reines Grau) | Leichte Anpassung |
| **Akzentfarben** | 4 bunte Themes (Sunrise/Ocean/Forest/Midnight) | Ein dezenter Blau-Akzent `#4F6EF7` | Reduktion auf 1 |
| **Border Radius** | 8-16px (freundlich, rund) | 4-8px (scharf, professionell) | Kleiner, schärfer |
| **Typografie** | Inter (gut) | Inter + JetBrains Mono für Timer | Font ergänzen |
| **Information Density** | Luftig, großzügig | Kompakter, effizienter | Dichter packen |

### 1.2 Interaktions-Gaps

| Aspekt | Aktuell | Ziel | Gap |
|--------|---------|------|-----|
| **Command Palette** | ❌ Nicht vorhanden | ✅ Cmd+K für alles | Komplett neu |
| **Shortcuts** | 12 Shortcuts, verstreut | 30+ Shortcuts, G-Prefix Navigation | Massiv erweitern |
| **Hover-Target-Shortcuts** | ❌ | ✅ Shortcut wirkt auf Hover-Element | Neues Konzept |
| **Vim-ähnliche Navigation** | ❌ | ✅ J/K für Listen | Implementieren |
| **Instant Feedback** | ✅ Gut (Framer Motion) | ✅ Noch schneller (<100ms) | Optimieren |

### 1.3 Funktions-Gaps

| Funktion | Aktuell | Ziel | Priorität |
|----------|---------|------|-----------|
| **Task-Verknüpfung** | ❌ | "Was arbeitest du gerade?" | P0 |
| **Linear Integration** | ❌ | Issues verknüpfen | P1 |
| **Distraction Blocking** | ❌ | Website/App-Blocking | P0 |
| **System DND** | ❌ | macOS Focus Mode | P0 |
| **Shutdown Ritual** | ❌ | Geführter Abschluss | P2 |
| **52/17 und 90-Min-Presets** | ❌ (nur 25/5/15) | Wissenschaftliche Varianten | P0 |
| **Focus Score** | ❌ | 0-100 basierend auf Sessions | P1 |
| **Menu Bar App** | ❌ (nur Web) | Native macOS Menu Bar | P0 |

### 1.4 Animations-Gaps

| Aspekt | Aktuell | Ziel | Änderung |
|--------|---------|------|----------|
| **Breathing Animation** | ✅ Vorhanden | ✅ Endel-artiger, flüssiger | Verfeinern |
| **Background Flow** | ❌ | Subtile, abstrakte Linien | Neu |
| **Transition Timing** | 150-500ms | 100-300ms (schneller) | Beschleunigen |
| **Celebration** | Scale-Pulse | Subtiler, professioneller | Dezenter |

---

## Teil 2: Design-Token-Transformation

### 2.1 Farbpalette NEU

#### Monochrome Basis (ersetzt Stone-Palette)

```typescript
// VORHER: Warme Stone-Töne
const oldColors = {
  background: '#0C0A09',  // Stone 950
  surface: '#1C1917',     // Stone 900
  textPrimary: '#FAFAF9', // Stone 50
}

// NACHHER: Neutrale Grautöne (Linear-Style)
const newColors = {
  // Backgrounds
  background: '#0D0D0D',      // Nicht #000000 - zu hart
  backgroundElevated: '#111111',
  surface: '#161616',
  surfaceHover: '#1A1A1A',
  surfaceActive: '#1F1F1F',

  // Borders
  border: '#2A2A2A',
  borderSubtle: '#222222',
  borderFocus: '#4F6EF7',

  // Text
  textPrimary: '#F5F5F5',     // Nicht #FFFFFF - zu grell
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  textDisabled: '#444444',

  // Single Accent (statt 4 Themes)
  accent: '#4F6EF7',          // Linear Blue
  accentHover: '#6B82F9',
  accentMuted: '#4F6EF720',   // 12% opacity

  // Semantic
  success: '#34D399',
  warning: '#FBBF24',
  error: '#EF4444',
  focus: '#8B5CF6',
}
```

#### Light Mode (optional, sekundär)

```typescript
const lightColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E5E5E5',
  accent: '#4F6EF7',
}
```

### 2.2 Typografie NEU

```typescript
// VORHER
const oldTypo = {
  fontFamily: 'Inter',
  timerSize: '6rem / 8rem',
  timerWeight: 300, // light
}

// NACHHER
const newTypo = {
  // Font Families
  fontSans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  fontMono: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',

  // Timer spezifisch
  timer: {
    fontFamily: 'fontMono',  // Monospace für Timer!
    fontSize: {
      sm: '3rem',    // 48px - Mobile
      md: '4rem',    // 64px - Tablet
      lg: '5rem',    // 80px - Desktop
      xl: '6rem',    // 96px - Large Desktop
    },
    fontWeight: 500,  // Medium statt Light
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },

  // UI Text
  display: { size: '2rem', weight: 700, lineHeight: 1.1 },
  h1: { size: '1.5rem', weight: 600, lineHeight: 1.3 },
  h2: { size: '1.125rem', weight: 600, lineHeight: 1.4 },
  body: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
  small: { size: '0.75rem', weight: 400, lineHeight: 1.4 },
  mono: { size: '0.8125rem', weight: 500, lineHeight: 1.4 },
}
```

### 2.3 Spacing NEU

```typescript
// VORHER: Großzügig
const oldSpacing = {
  containerPadding: '2rem', // 32px
}

// NACHHER: Kompakter (4px Grid)
const newSpacing = {
  px: '1px',
  0.5: '2px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',

  // Container-spezifisch
  containerSm: '12px',  // Labels, Chips
  containerMd: '16px',  // Buttons, Inputs
  containerLg: '24px',  // Cards, Modals
  containerXl: '32px',  // Sections
}
```

### 2.4 Border Radius NEU

```typescript
// VORHER: Freundlich rund
const oldRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
}

// NACHHER: Scharf, professionell
const newRadius = {
  none: '0px',
  sm: '4px',      // Buttons, Inputs
  md: '6px',      // Cards, Dropdowns
  lg: '8px',      // Modals
  xl: '12px',     // Large Panels
  full: '9999px', // Pills, Avatars
}
```

### 2.5 Shadows NEU

```typescript
// VORHER: Weiche Shadows
const oldShadows = {
  soft: '0 1px 2px rgba(28, 25, 23, 0.05)',
}

// NACHHER: Subtiler, für Dark Mode optimiert
const newShadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
  xl: '0 16px 32px rgba(0, 0, 0, 0.6)',

  // Glow für Akzente
  glow: '0 0 20px rgba(79, 110, 247, 0.3)',
  glowSm: '0 0 10px rgba(79, 110, 247, 0.2)',
}
```

### 2.6 Animation Tokens NEU

```typescript
// VORHER
const oldAnimations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
}

// NACHHER: Schneller, Linear-Style
const newAnimations = {
  // Durations
  instant: '0ms',
  fast: '100ms',      // Hover, Micro
  normal: '150ms',    // Transitions
  moderate: '200ms',  // Panels
  slow: '300ms',      // Modals

  // Easings
  linear: 'linear',
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',

  // Springs (Framer Motion)
  springDefault: { stiffness: 500, damping: 30 },
  springGentle: { stiffness: 300, damping: 35 },
  springSnappy: { stiffness: 600, damping: 35 },
}
```

---

## Teil 3: Komponenten-Transformation

### 3.1 Timer Display

#### VORHER
```
┌────────────────────────────┐
│                            │
│          25:00             │  ← Inter Light, 6-8rem
│                            │
│    [Work] [Break] [Long]   │  ← Bunte Tabs
│                            │
└────────────────────────────┘
```

#### NACHHER
```
┌────────────────────────────┐
│                            │
│         25:00              │  ← JetBrains Mono Medium, schärfer
│      ────────────          │  ← Progress Bar (minimalistisch)
│                            │
│    API Integration         │  ← Task-Label (optional)
│                            │
│   Work · 4/8 Sessions      │  ← Status Line (kompakt)
│                            │
└────────────────────────────┘
```

**Änderungen:**
- Font: JetBrains Mono statt Inter
- Progress: Lineare Bar statt Kreis
- Task-Label prominent anzeigen
- Session-Counter in Status-Line integriert
- Weniger vertikaler Platz

### 3.2 Controls

#### VORHER
```
    ↶     [▶ PLAY]     ⏭
```

#### NACHHER
```
[▶]  Space to start · R to reset · S to skip
```

**Änderungen:**
- Nur ein prominenter Button
- Shortcuts direkt als Hint anzeigen
- Ghost-Buttons für sekundäre Aktionen
- Keyboard-First Kommunikation

### 3.3 Session Type Selector

#### VORHER
```
┌───────────────────────────────────┐
│ [Work]  [Short Break]  [Long]    │
└───────────────────────────────────┘
```

#### NACHHER
```
┌─────────────────────────────────────────┐
│  25m  │  52m  │  90m  │  Custom  │      │  ← Preset Tabs
├─────────────────────────────────────────┤
│  Work  ·  5m Break  ·  15m Long Break   │  ← Current Config
└─────────────────────────────────────────┘
```

**Änderungen:**
- Presets prominent (25/52/90/Custom)
- Konfiguration subtil darunter
- Keyboard: 1, 2, 3, 4 für Presets

### 3.4 Command Palette (NEU)

```
┌─────────────────────────────────────────────────────┐
│  ⌘ Type a command or search...                      │
├─────────────────────────────────────────────────────┤
│  Recent                                             │
│    Start 25min Session                         ⏎    │
│    Open Statistics                             G S  │
│                                                     │
│  Timer                                              │
│    Start Session                               ⏎    │
│    Pause Session                               Space│
│    Reset Timer                                 R    │
│    Skip to Break                               S    │
│                                                     │
│  Navigation                                         │
│    Go to Timer                                 G T  │
│    Go to Statistics                            G S  │
│    Go to History                               G H  │
│    Go to Settings                              G ,  │
│                                                     │
│  Integrations                                       │
│    Link Linear Issue...                        L I  │
│    Toggle DND                                  D    │
│    Block Distracting Sites                     B    │
└─────────────────────────────────────────────────────┘
```

### 3.5 Quick Task Input (NEU)

```
┌─────────────────────────────────────────────────────┐
│  What are you working on?                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ API Integration for auth module      [~3 🍅]│   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Recent: API docs · Bug fix · Code review          │
│  Link: [Linear] [Notion] [GitHub]                  │
└─────────────────────────────────────────────────────┘
```

### 3.6 Statistics Dashboard (Überarbeitet)

#### VORHER
- Session History (Liste)
- Weekly Report (Modal)
- Focus Heatmap (Modal)

#### NACHHER
```
┌─────────────────────────────────────────────────────┐
│  Statistics                        [D] [W] [M] [Y] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  4h 32m      │  │    87        │                │
│  │  Deep Work   │  │  Focus Score │                │
│  │  ▲ 12%       │  │  ●●●●○       │                │
│  └──────────────┘  └──────────────┘                │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ▁▂▃▅▇▅▃▂▁▂▃▄▅▆▇▆▅▄▃▂▁                      │   │
│  │ Mo  Di  Mi  Do  Fr  Sa  So                  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Peak Hours                   Today's Sessions     │
│  ┌─────────────────┐         ┌─────────────────┐  │
│  │ 6am  ████       │         │ 09:15  25m Work │  │
│  │ 9am  ██         │         │ 09:45  5m Break │  │
│  │ 2pm  ██████     │         │ 09:50  25m Work │  │
│  │ 5pm  ███        │         │ ...             │  │
│  └─────────────────┘         └─────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.7 Settings Panel (Überarbeitet)

#### VORHER
- Modal mit Tabs
- Duration Sliders
- Theme Picker (4 Farben)
- Sound Toggles

#### NACHHER
```
┌─────────────────────────────────────────────────────┐
│  Settings                                     ⌘,   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TIMER                                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ Presets                                     │   │
│  │ ○ Pomodoro (25/5/15)                        │   │
│  │ ○ Deep Work (52/17/30)                      │   │
│  │ ● 90-Min Blocks (90/20/30)                  │   │
│  │ ○ Custom                                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  FOCUS                                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ [ ] Auto-start breaks                       │   │
│  │ [ ] Auto-start next session                 │   │
│  │ [✓] Breathing exercise before work          │   │
│  │ [✓] Enable System DND                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  BLOCKING                                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ Blocked Sites: twitter.com, reddit.com      │   │
│  │ [Edit List...]                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  SOUND                                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ Notification Sound    [✓]                   │   │
│  │ Ambient Sound         [Rain ▼]              │   │
│  │ Volume                [━━━━━○━━━]           │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  APPEARANCE                                         │
│  ┌─────────────────────────────────────────────┐   │
│  │ Theme     [Dark ▼]                          │   │
│  │ Accent    [● Blue]                          │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  INTEGRATIONS                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Linear    [Connect...]                      │   │
│  │ Notion    [Connected ✓]                     │   │
│  │ Slack     [Connect...]                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Teil 4: Neue Komponenten

### 4.1 Command Palette

**Komponente:** `CommandPalette.tsx`

**Features:**
- Cmd+K Trigger
- Fuzzy Search
- Kategorisierte Ergebnisse
- Recent Commands
- Shortcut Hints
- Keyboard Navigation (↑/↓/Enter/Esc)

**Props:**
```typescript
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  recentCommands: string[];
}

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  category: 'timer' | 'navigation' | 'integration' | 'settings';
  action: () => void;
  icon?: React.ReactNode;
}
```

### 4.2 Quick Task Input

**Komponente:** `QuickTaskInput.tsx`

**Features:**
- Inline Textfeld
- Pomodoro-Schätzung (1-8)
- Recent Tasks Autocomplete
- Integration Links (Linear/Notion/GitHub)
- Deep/Shallow Tag

**Props:**
```typescript
interface QuickTaskInputProps {
  value: string;
  onChange: (value: string) => void;
  estimatedPomodoros: number;
  onEstimateChange: (n: number) => void;
  linkedItem?: {
    type: 'linear' | 'notion' | 'github';
    id: string;
    title: string;
  };
  onLink: (type: string) => void;
}
```

### 4.3 Focus Score Card

**Komponente:** `FocusScoreCard.tsx`

**Features:**
- Score 0-100
- Visual Indicator (Dots oder Bar)
- Trend (↑/↓/→)
- Tooltip mit Details

**Berechnung:**
```typescript
focusScore = (
  completedSessions / plannedSessions * 40 +
  (1 - interruptions / totalMinutes) * 30 +
  streakBonus * 20 +
  consistencyBonus * 10
)
```

### 4.4 Distraction Blocker

**Komponente:** `DistractionBlocker.tsx`

**Features:**
- Website Blocklist Management
- Active/Inactive Toggle
- Block während Session
- Whitelist für Notfälle

**Integration:**
- Browser Extension (später)
- `/etc/hosts` Manipulation (macOS native)
- DNS-Level Blocking

### 4.5 System DND Integration

**Komponente:** `DNDManager.tsx`

**Features:**
- macOS Focus Mode Trigger
- Slack Status Update
- Kalender-Blocker
- Automatisch bei Session-Start

### 4.6 Shutdown Ritual

**Komponente:** `ShutdownRitual.tsx`

**Flow:**
1. "Ready to end your work day?"
2. Review open tasks
3. Plan tomorrow (Top 3)
4. Clear inbox prompt
5. "Shutdown complete" Phrase
6. Stats Summary

**Dauer:** 3-5 Minuten, Timer-geführt

### 4.7 Menu Bar Component (macOS)

**Für spätere native App:**

```
┌─────────────────────────┐
│  ● 23:45               │  ← Collapsed
└─────────────────────────┘

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

---

## Teil 5: Keyboard UX Erweiterung

### 5.1 Vollständige Shortcut-Map

#### Globale Shortcuts

| Shortcut | Aktion | Priorität |
|----------|--------|-----------|
| `Cmd+K` | Command Palette | P0 |
| `Space` | Start/Pause Timer | P0 |
| `Escape` | Stop Session / Close Modal | P0 |
| `R` | Reset Timer | P0 |
| `S` | Skip to Break | P0 |
| `T` | Quick Task Input fokussieren | P0 |
| `D` | Toggle DND | P1 |
| `M` | Mute/Unmute | P0 |
| `?` | Show Shortcuts Help | P0 |
| `Cmd+,` | Open Settings | P0 |

#### Preset-Shortcuts

| Shortcut | Aktion | Priorität |
|----------|--------|-----------|
| `1` | 25-Min Pomodoro | P0 |
| `2` | 52-Min Deep Work | P0 |
| `3` | 90-Min Block | P0 |
| `4` | Custom | P1 |

#### Navigation (G-Prefix)

| Shortcut | Aktion | Priorität |
|----------|--------|-----------|
| `G T` | Go to Timer | P0 |
| `G S` | Go to Statistics | P0 |
| `G H` | Go to History | P1 |
| `G P` | Go to Projects | P2 |
| `G ,` | Go to Settings | P0 |

#### Integration Shortcuts

| Shortcut | Aktion | Priorität |
|----------|--------|-----------|
| `L I` | Link Linear Issue | P1 |
| `L N` | Link Notion Page | P2 |
| `L G` | Link GitHub Issue | P2 |

#### Time Adjustment (Paused)

| Shortcut | Aktion | Priorität |
|----------|--------|-----------|
| `↑` | +1 Minute | P0 |
| `↓` | -1 Minute | P0 |
| `Shift+↑` | +5 Minuten | P1 |
| `Shift+↓` | -5 Minuten | P1 |

### 5.2 Shortcut Discovery

**Immer sichtbar machen:**
- Shortcuts im UI anzeigen (neben Buttons)
- Command Palette zeigt alle Shortcuts
- Tooltip bei Hover zeigt Shortcut
- Onboarding: "Press ? for shortcuts"

---

## Teil 6: Animation Refinements

### 6.1 Zu beschleunigende Animationen

| Animation | Aktuell | Neu | Grund |
|-----------|---------|-----|-------|
| Modal Open | 300ms | 200ms | Schneller = professioneller |
| Button Hover | 150ms | 100ms | Instant Feedback |
| Tab Switch | 300ms | 150ms | Responsiver |
| Dropdown | 300ms | 200ms | Snappier |

### 6.2 Neue Animationen

#### Background Flow (Endel-inspired)

```typescript
// Subtile, abstrakte Linien im Hintergrund
// Nur während aktiver Session
// Reduzierte Opacity (5-10%)
// Langsame, flüssige Bewegung (20-30s Zyklus)

const BackgroundFlow = () => (
  <motion.svg
    className="absolute inset-0 opacity-5 pointer-events-none"
    animate={{
      d: [path1, path2, path3, path1],
    }}
    transition={{
      duration: 30,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);
```

#### Timer Digit Transition

```typescript
// Smooth Y-Slide für Ziffern
// Spring animation für natürliches Gefühl

const digitVariants = {
  enter: { y: -20, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

// Transition
transition: {
  type: "spring",
  stiffness: 500,
  damping: 30,
}
```

#### Session Complete

```typescript
// Dezenter als aktuell
// Kurzer Glow + Subtle Scale

const celebrationVariants = {
  initial: { scale: 1, filter: "brightness(1)" },
  animate: {
    scale: [1, 1.02, 1],
    filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"],
  },
};

// 400ms statt 600ms
transition: { duration: 0.4, ease: "easeOut" }
```

### 6.3 Reduced Motion

```typescript
// Alle Animationen respektieren prefers-reduced-motion
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animation = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 0.2, ease: 'easeOut' };
```

---

## Teil 7: Feature-Liste für User Stories

### 7.1 P0 Features (MVP-Erweiterung)

| ID | Feature | Beschreibung | Komponenten |
|----|---------|--------------|-------------|
| **F-001** | Command Palette | Cmd+K für alle Aktionen | `CommandPalette.tsx` |
| **F-002** | Quick Task Input | "Was arbeitest du?" Feld | `QuickTaskInput.tsx` |
| **F-003** | Erweiterte Presets | 25/52/90/Custom | `PresetSelector.tsx` |
| **F-004** | Design Token Update | Monochrome Palette | `tailwind.config.js`, `globals.css` |
| **F-005** | Timer Font Update | JetBrains Mono | `TimerDisplay.tsx` |
| **F-006** | Schärfere Radii | 4-8px statt 8-16px | Global |
| **F-007** | G-Prefix Navigation | G+T, G+S, G+H, etc. | `useKeyboardShortcuts.ts` |
| **F-008** | System DND Integration | macOS Focus Mode | `DNDManager.tsx` |
| **F-009** | Schnellere Animationen | 100-200ms statt 150-500ms | `design-tokens.ts` |
| **F-010** | Focus Score | 0-100 Score berechnen | `FocusScoreCard.tsx` |

### 7.2 P1 Features (Expansion)

| ID | Feature | Beschreibung | Komponenten |
|----|---------|--------------|-------------|
| **F-011** | Linear Integration | Issues verknüpfen | `LinearIntegration.tsx` |
| **F-012** | Distraction Blocking | Website-Blocklist | `DistractionBlocker.tsx` |
| **F-013** | Slack Status | Auto-Update bei Session | `SlackIntegration.tsx` |
| **F-014** | Statistics Dashboard | Erweiterte Analytics | `StatisticsDashboard.tsx` |
| **F-015** | Background Flow | Endel-artige Animation | `BackgroundFlow.tsx` |
| **F-016** | Vim Navigation | J/K in Listen | `useVimNavigation.ts` |
| **F-017** | Hover-Target-Shortcuts | Shortcut auf Hover-Element | `useHoverShortcuts.ts` |

### 7.3 P2 Features (Differenzierung)

| ID | Feature | Beschreibung | Komponenten |
|----|---------|--------------|-------------|
| **F-018** | Shutdown Ritual | Geführter Tagesabschluss | `ShutdownRitual.tsx` |
| **F-019** | Notion Integration | Pages verknüpfen | `NotionIntegration.tsx` |
| **F-020** | GitHub Integration | Issues verknüpfen | `GitHubIntegration.tsx` |
| **F-021** | Team Sessions | Gemeinsam fokussieren | `TeamSession.tsx` |
| **F-022** | AI Scheduling | Fokuszeit-Empfehlungen | `AIScheduler.tsx` |

---

## Teil 8: User Stories (Vorlage für Product Owner)

### Epic 1: Command Palette

**US-001: Command Palette öffnen**
> Als Power-User möchte ich mit Cmd+K eine Command Palette öffnen können, um schnell jede Aktion auszuführen ohne die Maus zu benutzen.

**Akzeptanzkriterien:**
- [ ] Cmd+K (Mac) / Ctrl+K (Windows) öffnet die Palette
- [ ] Fokus ist sofort im Suchfeld
- [ ] Escape schließt die Palette
- [ ] Backdrop ist semi-transparent
- [ ] Animation < 200ms

**US-002: Command Suche**
> Als User möchte ich in der Command Palette nach Befehlen suchen können, um schnell die richtige Aktion zu finden.

**Akzeptanzkriterien:**
- [ ] Fuzzy Search funktioniert ("stt" findet "Start Timer")
- [ ] Ergebnisse sind nach Relevanz sortiert
- [ ] Kategorien sind sichtbar (Timer, Navigation, Settings)
- [ ] Shortcuts werden neben jedem Befehl angezeigt
- [ ] Max 10 Ergebnisse sichtbar, Rest scrollbar

**US-003: Recent Commands**
> Als wiederkehrender User möchte ich meine letzten Befehle sehen, um häufige Aktionen schneller auszuführen.

**Akzeptanzkriterien:**
- [ ] Letzte 5 Befehle werden angezeigt
- [ ] "Recent" Sektion ist ganz oben
- [ ] Befehle werden in LocalStorage gespeichert
- [ ] Duplikate werden vermieden

---

### Epic 2: Design System Update

**US-004: Monochrome Farbpalette**
> Als User möchte ich ein professionelles, monochromes Design sehen, das nicht von meiner Arbeit ablenkt.

**Akzeptanzkriterien:**
- [ ] Hintergrund ist #0D0D0D (Dark) / #FAFAFA (Light)
- [ ] Ein Akzent-Blau (#4F6EF7) für Aktionen
- [ ] Keine bunten Theme-Optionen mehr
- [ ] Kontraste erfüllen WCAG AA

**US-005: Schärfere Border Radii**
> Als User möchte ich schärfere, professionellere Ecken sehen, die zu einem Tool wie Linear passen.

**Akzeptanzkriterien:**
- [ ] Buttons: 4px Radius
- [ ] Cards: 6px Radius
- [ ] Modals: 8px Radius
- [ ] Keine Radii > 12px außer Pills

**US-006: Timer mit Monospace Font**
> Als User möchte ich den Timer in einer Monospace-Schrift sehen, damit die Ziffern nicht springen.

**Akzeptanzkriterien:**
- [ ] JetBrains Mono für Timer
- [ ] tabular-nums aktiviert
- [ ] Ziffern bleiben bei Änderung stabil
- [ ] Font wird beim ersten Laden gecacht

---

### Epic 3: Quick Task System

**US-007: Task vor Session eingeben**
> Als User möchte ich vor dem Start einer Session angeben können, woran ich arbeite, um fokussierter zu sein.

**Akzeptanzkriterien:**
- [ ] Textfeld "What are you working on?"
- [ ] Optional (kann leer bleiben)
- [ ] Task wird in Session-History gespeichert
- [ ] Recent Tasks als Autocomplete

**US-008: Pomodoro-Schätzung**
> Als User möchte ich schätzen können, wie viele Pomodoros eine Aufgabe braucht, um meinen Fortschritt zu tracken.

**Akzeptanzkriterien:**
- [ ] Dropdown/Buttons für 1-8 Pomodoros
- [ ] Default ist 1
- [ ] Wird mit Task gespeichert
- [ ] In Stats als "geschätzt vs. tatsächlich" angezeigt

---

### Epic 4: Erweiterte Presets

**US-009: 52/17 Deep Work Preset**
> Als Knowledge Worker möchte ich den wissenschaftlich fundierten 52/17-Rhythmus nutzen können.

**Akzeptanzkriterien:**
- [ ] Preset "Deep Work": 52min Arbeit, 17min Pause
- [ ] Keyboard Shortcut: 2
- [ ] Lange Pause nach 2 Zyklen (30min)

**US-010: 90-Minuten Ultradian Preset**
> Als Deep Work Praktizierender möchte ich 90-Minuten-Blöcke nutzen können, die meinem biologischen Rhythmus entsprechen.

**Akzeptanzkriterien:**
- [ ] Preset "90-Min Block": 90min Arbeit, 20min Pause
- [ ] Keyboard Shortcut: 3
- [ ] Optionale Breathing-Übung nach 45min

---

### Epic 5: System Integration

**US-011: macOS DND aktivieren**
> Als Mac-User möchte ich, dass automatisch der Fokus-Modus aktiviert wird, wenn ich eine Session starte.

**Akzeptanzkriterien:**
- [ ] AppleScript/Shortcuts Integration
- [ ] DND bei Session-Start aktivieren
- [ ] DND bei Session-Ende deaktivieren
- [ ] Setting zum Deaktivieren
- [ ] Funktioniert nur auf macOS

**US-012: Slack Status Update**
> Als Slack-User möchte ich, dass mein Status automatisch auf "Fokussiert" gesetzt wird.

**Akzeptanzkriterien:**
- [ ] Slack OAuth Integration
- [ ] Status: "🍅 In Focus Session" bei Start
- [ ] Status zurücksetzen bei Ende
- [ ] Custom Status Text einstellbar

---

### Epic 6: Statistics Dashboard

**US-013: Focus Score anzeigen**
> Als User möchte ich einen Focus Score sehen, der mir zeigt, wie gut ich heute fokussiert habe.

**Akzeptanzkriterien:**
- [ ] Score von 0-100
- [ ] Basiert auf: Completion Rate, Unterbrechungen, Streak
- [ ] Trend-Indikator (↑/↓/→)
- [ ] Tooltip erklärt Berechnung

**US-014: Peak Hours Heatmap**
> Als User möchte ich sehen, zu welchen Tageszeiten ich am produktivsten bin.

**Akzeptanzkriterien:**
- [ ] Heatmap mit 24h x 7 Tagen
- [ ] Dunklere Farbe = mehr Fokuszeit
- [ ] Hover zeigt Details
- [ ] Mindestens 7 Tage Daten nötig

---

### Epic 7: Keyboard-First UX

**US-015: G-Prefix Navigation**
> Als Power-User möchte ich mit G+Buchstabe navigieren können, wie in Linear.

**Akzeptanzkriterien:**
- [ ] G T → Timer View
- [ ] G S → Statistics View
- [ ] G H → History View
- [ ] G , → Settings
- [ ] Visual Feedback bei G-Press

**US-016: Shortcut Hints im UI**
> Als neuer User möchte ich Shortcuts direkt im UI sehen, um sie schneller zu lernen.

**Akzeptanzkriterien:**
- [ ] Shortcuts neben Buttons anzeigen
- [ ] In grauer, kleinerer Schrift
- [ ] Ausblendbar über Setting
- [ ] Tooltips zeigen auch Shortcuts

---

## Teil 9: Migrations-Plan

### Phase 1: Design Tokens (1-2 Tage)

1. `tailwind.config.js` aktualisieren
2. `globals.css` CSS-Variablen anpassen
3. `design-tokens.ts` erweitern
4. Farb-Themes reduzieren auf 1 Akzent
5. Border Radii anpassen

### Phase 2: Typography (1 Tag)

1. JetBrains Mono Font laden
2. Timer Display umstellen
3. Font-Skala vereinheitlichen

### Phase 3: Core Components (3-5 Tage)

1. Command Palette implementieren
2. Quick Task Input erstellen
3. Preset Selector erweitern
4. Timer Controls vereinfachen

### Phase 4: Keyboard UX (2-3 Tage)

1. Command Registry erstellen
2. G-Prefix Navigation implementieren
3. Shortcut Hints hinzufügen
4. Shortcuts Help Modal erweitern

### Phase 5: Animations (1-2 Tage)

1. Timing beschleunigen
2. Spring-Configs anpassen
3. Background Flow (optional)
4. Reduced Motion testen

### Phase 6: Integrations (5-7 Tage)

1. System DND (macOS)
2. Distraction Blocking (Basis)
3. Slack Integration (OAuth)
4. Linear Integration (OAuth)

---

## Fazit

Diese Transformation bringt Pomo von einem "guten Pomodoro-Timer" zu einem "professionellen Deep-Work-Tool" auf Linear/Endel-Niveau. Die wichtigsten Änderungen sind:

1. **Design:** Monochrom, schärfer, professioneller
2. **Interaktion:** Command Palette, G-Navigation, Keyboard-First
3. **Funktion:** Task-Verknüpfung, Integrationen, System DND
4. **Animation:** Schneller, subtiler, Endel-inspiriert

Der Product Owner kann aus diesem Dokument direkt User Stories ableiten und priorisieren.

---

*Ende des Transformations-Dokuments*
