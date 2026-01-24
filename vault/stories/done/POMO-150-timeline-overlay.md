---
type: story
status: done
priority: p0
effort: 5
feature: "[[features/timeline]]"
created: 2026-01-24
updated: 2026-01-24
done_date: 2026-01-24
tags: [timeline, analytics, overlay, p0, flagship]
---

# POMO-150: Timeline Overlay

## User Story

> Als **User**
> möchte ich **meinen Tag als visuellen Zeitstrahl sehen**,
> damit **ich meinen Arbeitsrhythmus verstehen und reflektieren kann**.

## Kontext

Die Timeline ist das **Flaggschiff-Feature** von Particle. Sie zeigt den Tag als horizontalen Zeitstrahl mit Work-Partikeln, Breaks und freier Zeit. Die Ansicht ist visuell reduziert, aber informationsreich.

**Philosophie:** Nicht Analytics, sondern Reflexion. Der Rhythmus des Tages wird spürbar.

## Zugang

| Methode | Aktion |
|---------|--------|
| **Session Counter** | Klick öffnet Timeline |
| **Keyboard** | `G T` (Go to Timeline) |
| **Command Palette** | "Open Timeline" / "Go to Timeline" |

## Visuelle Hierarchie

```
┌─────────────────────────────────────────────────────────────────┐
│                                                         [×]     │
│   Timeline                                        ← Today →     │
│                                                                 │
│        Projekt A      Projekt B            Projekt A            │
│   ══════════════════════════════════════════════════════════   │
│   ░░░░░░▓▓▓▓▓▓░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░▓▓▓▓░░▓▓▓▓▓▓▓▓░░░░░░░   │
│   ══════════════════════════════════════════════════════════   │
│   6am      9am        12pm           3pm         6pm            │
│                                                                 │
│   ─────────────────────────────────────────────────────────────│
│                                                                 │
│   8 Particles    ·    5h 12m Focus    ·    08:42 – 17:30       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Drei Zustände der Zeit

| Zustand | Darstellung | Interaktion |
|---------|-------------|-------------|
| **Work-Partikel** | Solide Blöcke, Helligkeit = Projekt-Brightness | Klick → Detail Overlay |
| **Breaks** | Subtile, schmale Blöcke | Readonly (v1) |
| **Freie Zeit** | Transparent/leer | Keine |

### Projekt-Darstellung

- **Label oberhalb** des Partikel-Blocks
- **Helligkeit** des Blocks entspricht Projekt-Brightness
- **Klick auf Projekt-Label** → Projekt-Dropdown für schnelles Ändern

## Akzeptanzkriterien

### Overlay & Navigation
- [ ] **Given** Timer-Screen, **When** Klick auf Session Counter, **Then** Timeline Overlay öffnet
- [ ] **Given** Timer-Screen, **When** `G T` gedrückt, **Then** Timeline Overlay öffnet
- [ ] **Given** Command Palette, **When** "Timeline" suchen, **Then** Command verfügbar
- [ ] **Given** Timeline offen, **When** `Escape` gedrückt, **Then** Overlay schließt
- [ ] **Given** Timeline offen, **When** `←` gedrückt, **Then** vorheriger Tag
- [ ] **Given** Timeline offen, **When** `→` gedrückt, **Then** nächster Tag (max: heute)
- [ ] **Given** vergangener Tag, **When** "Today" Button, **Then** zurück zu heute

### Zeitstrahl-Darstellung
- [ ] **Given** Sessions existieren, **When** Timeline öffnet, **Then** horizontaler Zeitstrahl 6am–12am
- [ ] **Given** Work-Partikel, **When** angezeigt, **Then** proportionale Breite zur Dauer
- [ ] **Given** Work-Partikel, **When** angezeigt, **Then** Helligkeit = Projekt-Brightness
- [ ] **Given** Break-Session, **When** angezeigt, **Then** subtiler, schmaler Block
- [ ] **Given** Keine Session, **When** Zeitbereich, **Then** transparent (freie Zeit)
- [ ] **Given** Projekt zugewiesen, **When** Partikel angezeigt, **Then** Label oberhalb

### Interaktionen
- [ ] **Given** Partikel, **When** Hover, **Then** Block expandiert sanft
- [ ] **Given** Partikel, **When** Hover, **Then** zeigt: Projekt, Task, Dauer, Uhrzeit
- [ ] **Given** Partikel, **When** Klick, **Then** Particle Detail Overlay öffnet
- [ ] **Given** Projekt-Label, **When** Klick, **Then** Projekt-Dropdown inline
- [ ] **Given** Projekt geändert, **When** Auswahl, **Then** Partikel aktualisiert

### Statistiken (Footer)
- [ ] **Given** Sessions existieren, **When** Timeline öffnet, **Then** zeigt Partikel-Anzahl
- [ ] **Given** Sessions existieren, **When** Timeline öffnet, **Then** zeigt Gesamt-Focus-Zeit
- [ ] **Given** Sessions existieren, **When** Timeline öffnet, **Then** zeigt Zeitspanne (erster – letzter)

### Animation
- [ ] **Given** Timeline öffnet, **When** Animation, **Then** Zeitstrahl zeichnet sich von links nach rechts
- [ ] **Given** Partikel, **When** Hover, **Then** sanftes Scale (1.02) mit Spring
- [ ] **Given** Tageswechsel, **When** Navigation, **Then** Slide-Animation

## Technische Details

### Datenstruktur

```typescript
interface TimelineDay {
  date: string; // ISO date
  particles: TimelineParticle[];
  breaks: TimelineBreak[];
  stats: {
    totalFocusSeconds: number;
    particleCount: number;
    firstStart: string | null; // ISO timestamp
    lastEnd: string | null;
  };
}

interface TimelineParticle {
  id: string;
  startTime: string; // ISO timestamp
  endTime: string;
  durationSeconds: number;
  projectId: string | null;
  projectName: string | null;
  projectBrightness: number; // 0-100
  task: string | null;
  mode: 'work';
}

interface TimelineBreak {
  id: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  mode: 'shortBreak' | 'longBreak';
}
```

### Komponenten-Struktur

```
TimelineOverlay/
├── TimelineOverlay.tsx      # Haupt-Overlay Container
├── TimelineHeader.tsx       # Titel + Navigation (← Today →)
├── TimelineTrack.tsx        # Der horizontale Zeitstrahl
├── TimelineParticle.tsx     # Einzelner Work-Block
├── TimelineBreak.tsx        # Einzelner Break-Block
├── TimelineStats.tsx        # Footer mit Statistiken
└── useTimelineData.ts       # Hook für Daten-Aggregation
```

### Berechnung der Positionen

```typescript
const TIMELINE_START_HOUR = 6;  // 6am
const TIMELINE_END_HOUR = 24;   // midnight
const TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR; // 18h

const getPositionPercent = (timestamp: Date): number => {
  const hours = timestamp.getHours() + timestamp.getMinutes() / 60;
  const adjustedHours = hours - TIMELINE_START_HOUR;
  return Math.max(0, Math.min(100, (adjustedHours / TOTAL_HOURS) * 100));
};

const getWidthPercent = (durationSeconds: number): number => {
  const durationHours = durationSeconds / 3600;
  return (durationHours / TOTAL_HOURS) * 100;
};
```

### Command Registration

```typescript
{
  id: 'open-timeline',
  label: 'Open Timeline',
  shortcut: 'G T',
  category: 'navigation',
  action: () => window.dispatchEvent(new CustomEvent('particle:open-timeline')),
  icon: <BarChart3 className="w-4 h-4" />,
  keywords: ['timeline', 'day', 'history', 'sessions', 'view'],
}
```

## UI States

### Leerer Tag
```
┌─────────────────────────────────────────────────────────────────┐
│   Timeline                                        ← Today →     │
│                                                                 │
│   ══════════════════════════════════════════════════════════   │
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│   ══════════════════════════════════════════════════════════   │
│   6am      9am        12pm           3pm         6pm            │
│                                                                 │
│   ─────────────────────────────────────────────────────────────│
│                                                                 │
│               No particles yet. Start focusing!                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Hover-State (expandierter Partikel)

```
                    ┌──────────────────────┐
                    │  Projekt A           │
                    │  "API Integration"   │
                    │  25m · 09:15–09:40   │
                    └──────────────────────┘
   ══════════════════▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓══════════════════════
```

## Animation Details

| Element | Animation | Timing |
|---------|-----------|--------|
| Overlay öffnen | Fade in + Scale 0.98→1 | SPRING.gentle |
| Zeitstrahl | Clip-path von links nach rechts | 400ms ease-out |
| Partikel erscheinen | Fade in, gestaffelt | 50ms delay pro Block |
| Hover | Scale 1→1.02, Expand nach oben | SPRING.gentle |
| Tageswechsel | Slide left/right | SPRING.snappy |

## Testing

### Manuell zu testen
- [ ] Öffnen via Session Counter Klick
- [ ] Öffnen via G T
- [ ] Öffnen via Command Palette
- [ ] Navigation zwischen Tagen
- [ ] Hover-Effekte auf Partikeln
- [ ] Projekt ändern via Label-Klick
- [ ] Partikel-Detail öffnen via Klick
- [ ] Statistiken korrekt berechnet
- [ ] Leerer Tag korrekt angezeigt
- [ ] Animationen flüssig

## Definition of Done

- [ ] TimelineOverlay Komponente erstellt
- [ ] Zugang über alle drei Wege (Counter, G T, Command Palette)
- [ ] Horizontaler Zeitstrahl mit korrekten Proportionen
- [ ] Work-Partikel mit Projekt-Helligkeit
- [ ] Breaks subtil dargestellt
- [ ] Hover expandiert Partikel mit Details
- [ ] Klick öffnet Particle Detail Overlay
- [ ] Projekt-Label klickbar für schnelles Ändern
- [ ] Tages-Navigation funktioniert
- [ ] Footer-Statistiken korrekt
- [ ] Animationen implementiert
- [ ] Keyboard-Shortcuts funktionieren
- [ ] Command Palette Eintrag vorhanden

## Abhängigkeiten

- Particle Detail Overlay (existiert ✓)
- Session History Storage (existiert ✓)
- Project System (existiert ✓)
- Command Palette (existiert ✓)

## Notizen

- v1: Breaks sind readonly, kein Editing
- Später: KI-Empfehlungen basierend auf Mustern
- Später: Break-Overflow im Timer
- POMO-087 (Session History Liste) könnte später als Filter-View in Timeline integriert werden
