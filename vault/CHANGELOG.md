	# 📝 Changelog

Dokumentation aller abgeschlossenen Stories und Releases.

---

## [Unreleased]

### Added
- **UI Interaction Sounds (POMO-124, 2 SP)**:
  - Sanftes organisches "Pop" bei Timer-Start (wie ein Partikel, das an seinen Platz gleitet)
  - Weiches "Release" bei Timer-Pause (wie ein sanftes Ausatmen)
  - Default aktiviert, kann in Settings deaktiviert werden
  - Respektiert globale Lautstärke und Mute-Einstellungen
  - Philosophie: Sound als taktiles Feedback – fühlbar, nicht störend
- **Night Mode (POMO-130, 2 SP)**:
  - Dimmt alle weißen Elemente zu #A0A0A0 für reduzierte Augenbelastung
  - Toggle via D-Taste oder ActionBar-Button (Sonne/Mond)
  - Partikel und Glow-Effekte ebenfalls gedimmt
  - Einstellung wird in localStorage gespeichert
  - Philosophie: "Sanctuary of calm" – auch nachts
- **Random Task Picker (POMO-146, 1 SP)**:
  - `R` Taste wählt zufällig einen unerledigten Task
  - Gepickter Task springt an Position 1 mit `→` Indikator
  - Sanfte Animation: Andere Tasks dimmen, gepickter Task highlighted
  - Toast "Need 2+ tasks to pick" bei weniger als 2 Tasks
  - Reset bei Task-Änderung oder Session-Start
  - Command Palette: "Random Pick" (R)
  - Dezenter Keyboard Hint im Task-Input bei 2+ Tasks
  - Philosophie: Entscheidungslähmung überwinden – "Just pick one"
- **Milestones – Quiet Markers on Your Journey (POMO-148, 5 SP)**:
  - 10 bedeutungsvolle Milestones (First Particle bis Thousand Particles)
  - "Moment" Overlay mit Partikel-Konvergenz-Animation
  - Gong-Sound (Singing Bowl, 2.5s Decay)
  - Journey View als vertikale Timeline (G M Shortcut)
  - "Relive" Feature: Vergangene Milestones erneut erleben
  - Keyboard-Navigation (↑/↓, Enter, Escape)
  - Philosophie: "Markers, not badges" – Reflexion statt Gamification
- **Rhythm View – Estimation Insights (POMO-143, 3 SP)**:
  - Neuer "Rhythmus" Navigations-Punkt (G R Shortcut)
  - Globale Rhythmus-Berechnung aus allen Partikeln mit Schätzung
  - Drei Rhythmus-Typen: Flow, Struktur, Präzision
  - Zahlen-Visualisierung: "25 min → 32 min" (geschätzt → tatsächlich)
  - Pro-Projekt-Aufschlüsselung mit Mini-Zahlen
  - Projekt-Filter Dropdown im Header
  - Rückwärts-Kompatibilität: Alte Partikel ohne Overflow werden einbezogen
  - `estimatedDuration` Feld im Datenmodell für neue Sessions
  - Philosophie: "Particle ist ein Spiegel, kein Richter"
- **Inline Task Completion (POMO-148, 2 SP)**:
  - Tasks mit `-` Prefix als erledigt markieren
  - Live-Preview mit Durchstreichen-Styling
  - "(X done)" Zähler in Total-Zeile
  - Timer läuft weiter bei Esc (nur visuelles Update)
  - Cmd+Enter startet neue Session
  - ADHD-friendly: Mini-Erfolge ohne Flow-Unterbrechung
- **Auto-Start Next Session (POMO-135, 3 SP)**:
  - Automatischer Start der nächsten Session nach Countdown
  - Konfigurierbare Countdown-Dauer (3s / 5s / 10s)
  - StatusMessage zeigt "Break in 5 · Space to cancel"
  - Space/Escape zum Abbrechen des Countdowns
  - Shift+A Shortcut zum Togglen
  - Command Palette Integration
  - Autostart-Chime Sound
  - Overflow-Kompatibilität
- **Multi-Task Input (POMO-141, 3 SP)**:
  - Multi-Line Task-Eingabe für schnelle Planung
  - Enter für neue Zeile, Cmd+Enter zum Starten
  - Live Total-Zeit Berechnung aus allen Tasks
  - Kompakte Anzeige mit Styling (Task weiß, Dauer grau)
  - Edit-Modus beim Klick auf kompakte Anzeige
  - Konsistent für Single- und Multi-Task Eingaben
  - Patterns: "Emails 10", "Call 15", "Meeting 30" → Total: 55min
- **Gold Particle Celebration (POMO-142, 3 SP)**:
  - Opt-in Celebration Animation bei Session-Ende
  - Drei Intensitätsstufen: Subtle, Full, Deluxe
  - Deluxe: 100 goldene Partikel mit Glow und Sound
  - Gold als "verdiente Farbe" - bricht bewusst das S/W-Schema
  - Trigger-Optionen: Every Session oder nur bei Daily Goal
  - Settings UI mit Toggle und Sub-Options
  - Respektiert prefers-reduced-motion
- **Particle History & Search (POMO-161, 5 SP)**:
  - Vollständiger History Tab im Statistics Dashboard
  - Debounced Suchfeld (300ms) für Task-Namen
  - Type-Filter: All/Work/Break Toggle
  - Project-Filter: Dropdown mit allen Projekten
  - Paginierte Liste mit "Load More" (50 initial)
  - Gruppierung nach Datum mit Focus-Zeit pro Tag
  - Edit Modal: Task-Name und Projekt bearbeiten
  - Delete mit Confirmation
  - Keyboard: `/` fokussiert Suchfeld, `Escape` schließt Modal
  - Counter: "Showing X of Y particles"
  - Empty States für keine Particles / keine Treffer
- **Smart Task Input (POMO-136, 3 SP)**:
  - "Meeting 30" → Task "Meeting" + 30min Timer startet sofort
  - Patterns: "30m Meeting", "1h", "Deep work 1.5h"
  - Live-Preview unter Input zeigt erkannte Duration
  - Preset-Anzeige aktualisiert sich auf Override-Duration
  - Max 180 min mit "Maximum 180 min" Feedback
  - 3 Interaktionen: T → tippen → Enter = Flow
- **Daily Goals (POMO-134, 5 SP)**:
  - Tägliches Partikel-Ziel setzen (1-9)
  - SessionCounter transformiert sich zu Goal-Progress-Anzeige
  - G O Shortcut öffnet Goal-Overlay (vim-style Navigation)
  - Keyboard-first: Direkteingabe 1-9, 0 für "No Goal"
  - "Daily Goal reached!" Celebration bei Zielerreichung
  - Command Palette Integration (Set Daily Goal)
  - Klick auf Session-Dots öffnet Overlay
  - Persistenz in localStorage, Reset um Mitternacht
  - Philosophie: Goal = Kompass, nicht Peitsche
- **Project Tracking (POMO-100 bis POMO-107, 16 SP)**:
  - Projekt-Datenmodell mit ID, Name, Brightness, Archiv-Status
  - CRUD-Operationen für Projekte (Erstellen, Bearbeiten, Archivieren, Wiederherstellen)
  - ProjectSelector Dropdown im Timer mit P-Shortcut und P 0-9 Quick Selection
  - ProjectListModal (G P) mit J/K Navigation, E/A für Edit/Archive
  - ProjectDetailModal mit Partikel-Visualisierung, Stats-Cards und Session-Liste
  - Project Breakdown im Statistics Dashboard mit Zeit-Range-Filter
  - Klickbare Projekte navigieren von Stats zu Project Detail
  - Keyboard Shortcuts im Help Modal dokumentiert (Projects Kategorie)
  - Command Palette Integration: New Project, Go to Projects, Switch Project
  - Brightness-basierte visuelle Unterscheidung der Projekte
  - "No Project" Kategorie für unzugeordnete Partikel
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
- **Total Hours Counter (POMO-031, 2 SP)**:
  - Lifetime Focus Time Anzeige im Statistics Dashboard
  - Expandierbare Details: Total Particles, Average Session, First Date
  - Ermutigende Messages basierend auf Fortschritt
  - getLifetimeStats() Funktion in session-analytics.ts
- **Export Data CSV (POMO-032, 2 SP)**:
  - CSV Export aller Sessions mit einem Klick
  - UTF-8 BOM für Excel-Kompatibilität
  - Filename mit Datum (particle-sessions-YYYY-MM-DD.csv)
  - Feedback States: success, empty, idle
- **Session History Filters (POMO-087, 3 SP)**:
  - Type Filter: All / Work / Breaks
  - Task-Suche für schnelles Finden
  - Gefilterte Stats werden in Summary angezeigt
  - Reset bei Modal-Schließung
- **Weekly Report Summary (POMO-088, 5 SP)**:
  - Top 3 Tasks der Woche mit Zeit-Aggregation
  - Vergleich vs. Vorwoche (+Xh / -Xh)
  - Best Day Anzeige mit Trophy-Icon
  - Integriert in Statistics Dashboard
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
- **Rebrand: Pomo → Particle**:
  - App-Name geändert von "Pomo" zu "Particle"
  - Sessions heißen jetzt "Particles" (gesammelt, nicht abgeschlossen)
  - "X sessions completed" → "X Particles collected"
  - Preset "Pomodoro (25/5)" → "Classic (25/5)"
  - Alle localStorage Keys migriert (pomo_* → particle_*)
  - Custom Events umbenannt (pomo:* → particle:*)
  - PWA Manifest, Service Worker, Meta Tags aktualisiert
  - Tab-Titel zeigt "Particle - Focus Timer"
  - Migration-Logik für bestehende Nutzerdaten implementiert
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
- [[stories/done/POMO-124-ui-sounds]]
- [[stories/done/POMO-135-auto-start-next]]
- [[stories/done/POMO-143-estimation-trend-analytics]]
- [[stories/done/POMO-141-total-list-time]]
- [[stories/done/POMO-161-particle-history-search]]
- [[stories/done/POMO-134-daily-goals]]
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
- [[stories/done/POMO-031-total-hours-counter]]
- [[stories/done/POMO-032-export-data]]
- [[stories/done/POMO-087-session-timeline]]
- [[stories/done/POMO-088-weekly-report]]

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
