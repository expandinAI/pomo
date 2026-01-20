# 📝 Changelog

Dokumentation aller abgeschlossenen Stories und Releases.

---

## [Unreleased]

### Added
- **Particle Animation Modes (STORY-PARTICLE-ANIMATION-MODES, 8 SP)**:
  - Drei wählbare Partikel-Animationsstile
  - Rise & Fall: Vertikale Bewegung (Aufstieg/Sinken)
  - Shine & Gather: Radiale Expansion vom Zentrum
  - Orbit & Drift: Orbitale Kreisbewegung um Timer
  - Shuffle-Option für zufällige Auswahl pro Session
  - Particle Style Selector in Settings
  - CSS-only Animationen für GPU-Beschleunigung
  - animation-fill-mode: backwards für saubere Starts
- **Extended Presets System (POMO-066 bis POMO-071, 12 SP)**:
  - PresetSelector Komponente ersetzt SessionType mit 4 Presets
  - Pomodoro (25/5/15, 4 Sessions) - Classic Francesco Cirillo Technik
  - Deep Work (52/17/30, 2 Sessions) - Basiert auf DeskTime Studie
  - 90-Min (90/20/30, 2 Sessions) - Basiert auf Kleitman's Ultradian Rhythmus
  - Custom Preset mit persistenten Benutzereinstellungen
  - Keyboard Shortcuts 1-4 für schnellen Preset-Wechsel
  - CustomPresetEditor mit Slidern für alle Parameter
  - SessionCounter passt sich an sessionsUntilLong des aktiven Presets an
  - Preset-Info unter Tabs zeigt aktuelle Break-Dauer
  - Tooltips mit wissenschaftlicher Erklärung zu jedem Preset
  - Command Palette Integration (Switch to Pomodoro/Deep Work/90-Min/Custom)
  - presetId wird bei Session-Completion gespeichert für spätere Stats
- **Keyboard-First UX (POMO-072 bis POMO-077, 14 SP)**:
  - Focus Trap für alle Modals (Tab-Navigation bleibt im Modal)
  - Erweiterte Timer-Shortcuts (Shift+↑/↓ für ±5 Min, E für End Confirmation)
  - G-Prefix Navigation (G+T Timer, G+S Stats, G+H History, G+, Settings)
  - Erweitertes Help Modal mit Kategorien und Suche
  - Keyboard Hints neben Buttons (optional)
  - Vim Navigation (J/K) in Command Palette
- **Quick Task System (POMO-061 bis POMO-065, 12 SP)**:
  - QuickTaskInput Komponente unter Timer
  - Pomodoro-Schätzung (1-4 Pomodoros)
  - Recent Tasks Autocomplete mit Pfeiltasten-Navigation
  - Tasks werden in Session History angezeigt
  - T-Shortcut fokussiert Task-Feld
  - Enter im Task-Feld startet Session
- **Parallax Depth Effect (POMO-096)**:
  - 3D-Tiefenillusion für Partikel
  - Große Partikel (nah) bewegen sich schneller
  - Kleine Partikel (fern) bewegen sich langsamer
  - Depth-basierte Opacity und Blur für Tiefenwirkung
  - Toggle in Settings UI (Depth Effect)
  - Funktioniert mit allen Animationsmodi
- **Particle Pace Modes (POMO-097)**:
  - Drei Geschwindigkeitsmodi für Partikelanimationen
  - Drift (1.4x) - träumerisch, meditativ
  - Flow (1.0x) - ausbalanciert, natürlich (Default)
  - Pulse (0.7x) - energetischer, aber still calm
  - Segmented Control in Settings UI
  - Kombiniert mit Parallax Depth Effect
- **Focus Pattern Layout Fix (POMO-095)**:
  - Heatmap-Grid horizontal zentriert im Modal
  - Symmetrische Abstände links/rechts
- **Particle Pause/Freeze (POMO-094)**:
  - Partikel frieren bei Timer-Pause an aktueller Position ein
  - Bei Resume setzen Partikel Bewegung nahtlos fort
  - CSS animation-play-state für flüssige Übergänge
- **Streak Tracking (POMO-086, 3 SP)**:
  - Aktuelle Streak: Aufeinanderfolgende Tage mit Work-Sessions
  - Längste Streak aller Zeiten als Referenz
  - Zentriertes MetricCard Layout im Dashboard
- **Focus Score (POMO-083, 5 SP)**:
  - 0-100 Score basierend auf Volume (50%), Session Count (30%), Streak Bonus (20%)
  - Dynamische Subtitles: "Great focus!" / "Keep going" / "Start a session"
  - Reagiert auf Time Range Filter (D/W/M/All)
  - isPaused State im AmbientEffectsContext
- **Glasmorphismus UI-Effekt (POMO-093)**:
  - Partikel fließen visuell "unter" SessionType und QuickTaskInput
  - Glaseffekt mit backdrop-blur für matte Oberflächen
  - Neue Z-Index Hierarchie (Partikel z-10, Glasflächen z-20)
  - Funktioniert in Dark und Light Mode
- **UI Transformation Backlog** - 7 Feature-Specs, 40 Stories (POMO-050 bis POMO-089)
  - Design System Update (monochrome, sharper borders)
  - Command Palette (Cmd+K)
  - Quick Task System
  - Extended Presets (52/17 Deep Work, 90min Ultradian)
  - Keyboard-First UX (G-prefix navigation)
  - System Integrations (DND, Website Blocking)
  - Statistics Dashboard (Focus Score, Streak, Timeline)
- **Adaptive Quality + Visual Modes (POMO-092)**:
  - Device Capability Detection (Mobile, Low-end, Reduced Motion)
  - Visual Mode Selector (Minimal | Ambient | Auto)
  - Adaptive Partikelanzahl (10-20 basierend auf Device)
  - Verbesserte Grain-Textur (soft-light blend, 15% opacity)
- **Command Palette (POMO-056 bis POMO-060, 18 SP)**:
  - Cmd+K / Ctrl+K öffnet Command Palette
  - Fuzzy Search mit fuse.js
  - Keyboard Navigation (↑↓ Enter Escape)
  - Recent Commands mit LocalStorage
  - Kategorisierte Commands (Timer, Navigation, Settings)
  - Commands: Start/Pause, Reset, Skip, Toggle Theme, Toggle Mute, Open Settings

### Changed
- ROADMAP.md aktualisiert mit v0.2.0 UI Transformation Milestone
- **Design System Update (POMO-050 bis POMO-055, 13 SP)** - Komplett implementiert:
  - Monochrome Farbpalette mit blauem Akzent (#4F6EF7)
  - Schärfere Border Radii (4px/6px/8px statt 8px/12px/16px)
  - Monospace Font (JetBrains Mono) für Timer Display
  - Schnellere Animationen (100ms/150ms/300ms)
  - Kompaktere Button Heights (32px/36px/40px)
  - Dunklere Schatten für mehr Tiefe
  - Color Theme System entfernt (vereinfacht auf Dark/Light)
- **Pure Monochrome Design (POMO-092)**:
  - Blaue Akzentfarbe entfernt
  - Dark Mode: Weiß (#FFFFFF) als Akzent
  - Light Mode: Schwarz (#171717) als Akzent
  - Maximaler Kontrast bei allen interaktiven Elementen

### Fixed
-

### Stories completed
- [[stories/done/POMO-066-preset-selector]]
- [[stories/done/POMO-067-deep-work-preset]]
- [[stories/done/POMO-068-ultradian-preset]]
- [[stories/done/POMO-069-custom-preset]]
- [[stories/done/POMO-070-session-counter]]
- [[stories/done/POMO-071-preset-stats]]
- [[stories/done/POMO-093-glassmorphismus-effekt]]
- [[stories/done/POMO-050-monochrome-palette]]
- [[stories/done/POMO-051-border-radii]]
- [[stories/done/POMO-052-monospace-font]]
- [[stories/done/POMO-053-faster-animations]]
- [[stories/done/POMO-054-compact-layout]]
- [[stories/done/POMO-055-dark-shadows]]
- [[stories/done/POMO-090-immersive-dark-foundation]]
- [[stories/done/POMO-091-ambient-effects]]
- [[stories/done/POMO-092-adaptive-quality-visual-modes]]
- [[stories/done/POMO-056-command-palette-ui]]
- [[stories/done/POMO-057-fuzzy-search]]
- [[stories/done/POMO-058-keyboard-navigation]]
- [[stories/done/POMO-059-recent-commands]]
- [[stories/done/POMO-060-command-registry]]
- [[stories/done/POMO-061-task-input]]
- [[stories/done/POMO-062-pomodoro-estimate]]
- [[stories/done/POMO-063-recent-tasks]]
- [[stories/done/POMO-064-task-history]]
- [[stories/done/POMO-065-deep-shallow-tag]]
- [[stories/done/POMO-072-g-prefix-navigation]]
- [[stories/done/POMO-073-shortcut-hints]]
- [[stories/done/POMO-074-help-modal]]
- [[stories/done/POMO-075-timer-shortcuts]]
- [[stories/done/POMO-076-focus-trap]]
- [[stories/done/POMO-077-vim-navigation]]
- [[stories/done/POMO-094-particle-pause-freeze]]
- [[stories/done/POMO-095-focus-pattern-layout]]
- [[stories/done/POMO-096-parallax-depth-effect]]
- [[stories/done/POMO-097-particle-pace-modes]]

---

## [v0.1.0] - {{date}}

Erster Release / MVP

### Added
- Initial Setup
- ...

### Stories completed
- [[stories/done/...]]

---

<!-- Template für neue Releases:

## [vX.Y.Z] - YYYY-MM-DD

### Added
- Neue Features

### Changed  
- Änderungen an bestehendem Verhalten

### Fixed
- Bugfixes

### Removed
- Entfernte Features

### Stories completed
- [[stories/done/feature-01-story]]
- [[stories/done/feature-02-story]]

-->
