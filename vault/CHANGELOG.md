# 📝 Changelog

Dokumentation aller abgeschlossenen Stories und Releases.

---

## [Unreleased]

### Added
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
