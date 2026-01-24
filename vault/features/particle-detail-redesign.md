# Feature: Particle Detail Redesign

**Datum:** 2026-01-24
**Status:** Konzept
**Priorität:** Hoch

---

## Vision

> Die Particle Detail Ansicht ist der Moment der Reflexion. Hier betrachtet der Nutzer sein Werk, versteht es, und veredelt es mit Kontext.

Das Overlay muss drei Dinge vermitteln:
1. **Stolz** - "Das habe ich geschaffen"
2. **Klarheit** - Alle relevanten Infos auf einen Blick
3. **Kontrolle** - Einfaches Editieren ohne Friction

---

## Informations-Hierarchie

### Primär (Hero)
- **Dauer** - Die große Zahl, das Herzstück
- **Zeitspanne** - Start → Ende

### Sekundär
- **Overflow** - Wenn vorhanden, prominent
- **Task** - Was wurde getan
- **Projekt** - Zuordnung

### Tertiär (Header)
- **Particle-Nummer** - "3rd particle today"
- **Datum** - Falls nicht heute

---

## Visuelles Konzept

### Layout (Mobile-First)

```
┌─────────────────────────────────────────┐
│                                         │
│  ●  3rd particle                    ✕   │
│     Today                               │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│           14:10  →  14:35               │  ← Zeitspanne
│                                         │
│        ┌─────────────────────┐          │
│        │                     │          │
│   −5  −│        25           │+  +5     │  ← Dauer (Hero)
│        │        min          │          │
│        └─────────────────────┘          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ⚡ 5 min overflow                 │  │  ← Overflow Badge
│  │  20 min planned → 25 min actual   │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Task                                   │
│  ┌───────────────────────────────────┐  │
│  │ API Integration for Dashboard     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Project                                │
│  ┌───────────────────────────────────┐  │
│  │ Website Redesign              ▼   │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  🗑 Delete                       Done ↵ │
│                                         │
└─────────────────────────────────────────┘
```

---

## Komponenten im Detail

### 1. Header

```
●  3rd particle                        ✕
   Today
```

- **Breathing Dot** - Pulsierender weißer Punkt (bereits vorhanden)
- **Particle-Nummer** - Ordinal: "1st", "2nd", "3rd"...
- **Datum-Kontext**:
  - "Today" wenn heute
  - "Yesterday" wenn gestern
  - "Monday, Jan 20" wenn älter
- **Close-Button** - Rechts oben

### 2. Zeitspanne (NEU)

```
14:10  →  14:35
```

- **Format:** 24h, ohne Sekunden
- **Pfeil:** → (Unicode U+2192) oder einfaches "->"
- **Berechnung:** Start = completedAt - duration
- **Update:** Wenn Dauer geändert wird, aktualisiert sich die Startzeit live
- **Styling:** Monospace, medium weight, secondary color

### 3. Dauer (Hero Element)

```
     ┌─────────────────────┐
−5  −│        25           │+  +5
     │        min          │
     └─────────────────────┘
```

- **Große Zahl** - 48px, font-light, tabular-nums
- **"min" Label** - Unter der Zahl, klein
- **Buttons:**
  - −5 / −1 links
  - +1 / +5 rechts
  - Disabled wenn Limit erreicht (1 min / 180 min)
- **Tap auf Zahl** - Öffnet direktes Number-Input
- **Animation:** Sanfte Spring-Animation bei Änderung

### 4. Overflow Badge (NEU, prominent)

Nur sichtbar wenn `overflowDuration > 0`:

```
┌───────────────────────────────────┐
│  ⚡ 5 min overflow                 │
│  20 min planned → 25 min actual   │
└───────────────────────────────────┘
```

**Design:**
- **Hintergrund:** Subtle highlight (nicht rot/warning, eher neutral-betont)
- **Icon:** ⚡ oder kleines Overflow-Symbol
- **Erste Zeile:** Bold, die Overflow-Dauer
- **Zweite Zeile:** Kontext - was war geplant, was ist Realität
- **Farbe:** Accent-Color leicht gedimmt (nicht alarmierend)

**Philosophie:**
Overflow ist kein Fehler, sondern ein **Signal**:
- Der gewählte Preset passt vielleicht nicht zum Task
- Der Nutzer war im Flow (positiv)
- Für KI-Analyse später: Pattern-Erkennung

### 5. Task Input

```
Task
┌───────────────────────────────────┐
│ API Integration for Dashboard     │
└───────────────────────────────────┘
```

- **Label:** "Task" (klein, tertiary)
- **Input:** Rounded, subtle background
- **Placeholder:** "What did you work on?"
- **Auto-focus:** Nein (Dauer ist Hero)

### 6. Project Dropdown

```
Project
┌───────────────────────────────────┐
│ Website Redesign              ▼   │
└───────────────────────────────────┘
```

- Bestehendes ProjectDropdown-Component
- Zeigt "No project" wenn keins ausgewählt

### 7. Footer Actions

```
🗑 Delete                       Done ↵
```

- **Delete:** Links, subtle (Trash-Icon + Text)
- **Done:** Rechts, primary button mit Keyboard-Hint
- **Delete-Confirmation:** Inline-Swap (bereits implementiert)

---

## Interaktionen

### Öffnen
1. Backdrop faded in (150ms)
2. Modal scaled/faded in (spring animation)
3. Content staggered animation (wie jetzt)

### Dauer ändern
1. Tap +/- Button
2. Zahl animiert (spring)
3. Zeitspanne aktualisiert sich live
4. "Dirty" state wird gesetzt

### Dauer direkt editieren
1. Tap auf die große Zahl
2. Number-Input erscheint (inline)
3. Tastatur öffnet sich (mobile)
4. Enter/Blur committed
5. Escape cancelled

### Overflow-Anzeige
- Erscheint mit fade-in wenn vorhanden
- Nicht editierbar (historische Info)
- Zeigt Differenz zwischen Plan und Realität

### Speichern
- Auto-save bei Close (wenn dirty)
- "Done" Button schließt und speichert
- Escape schließt und speichert
- Backdrop-Click schließt und speichert

### Löschen
1. Tap "Delete"
2. Inline-Confirmation: "Cancel" / "Delete"
3. Enter bestätigt, Escape bricht ab

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close (save if dirty) |
| `Enter` | Close (save if dirty) |
| `↑` / `+` | +1 minute |
| `↓` / `-` | -1 minute |
| `Shift+↑` | +5 minutes |
| `Shift+↓` | -5 minutes |

---

## Animationen

### Dauer-Änderung
```typescript
// Spring animation für die Zahl
transition: { type: 'spring', stiffness: 500, damping: 30 }
```

### Zeitspanne-Update
```typescript
// Subtle fade für Start-Zeit
transition: { duration: 0.15 }
```

### Overflow-Badge
```typescript
// Slide-in von oben
initial: { opacity: 0, y: -8 }
animate: { opacity: 1, y: 0 }
```

---

## Responsive Verhalten

### Mobile (<640px)
- Volle Breite (90vw)
- Touch-optimierte Button-Größen (44px min)
- Größere Tap-Targets für +/- Buttons

### Desktop (>640px)
- Max-width: 400px
- Hover-States für Buttons
- Keyboard-Navigation optimiert

---

## Technische Umsetzung

### Betroffene Dateien

```
src/
└── components/
    └── timer/
        └── ParticleDetailOverlay.tsx  # Refactor
```

### Neue/Geänderte Elemente

1. **TimeSpan Component** (inline)
   - Berechnet Start aus completedAt - duration
   - Formatiert als "HH:MM → HH:MM"

2. **OverflowBadge Component** (inline)
   - Zeigt Overflow prominent
   - Nur wenn overflowDuration > 0

3. **Duration Controls** (refactor)
   - Keyboard-Support erweitern
   - Animation verbessern

### Daten-Flow

```typescript
// Start-Zeit berechnen
const startTime = new Date(
  new Date(session.completedAt).getTime() - duration * 1000
);

// Bei Dauer-Änderung
const handleDurationChange = (newDuration: number) => {
  setDuration(newDuration);
  // Start-Zeit wird automatisch neu berechnet
  // completedAt bleibt unverändert
};
```

---

## Edge Cases

1. **Dauer > Zeit seit Mitternacht**
   - Start-Zeit kann im Vortag liegen
   - Anzeige: "23:45 → 00:15" (korrekt)

2. **Particle von gestern**
   - Header zeigt "Yesterday" oder Datum
   - Zeitspanne zeigt nur Uhrzeiten (Datum im Header)

3. **Sehr lange Particles (>60 min)**
   - Zeitspanne bleibt lesbar
   - Dauer-Anzeige: "90 min" (nicht "1h 30m")

4. **Overflow = gesamte Dauer**
   - Möglich wenn Timer bei 0:00 gestartet wurde
   - Planned: 0 min, Overflow: 25 min
   - Badge zeigt: "25 min overflow (no planned time)"

---

## Nicht im Scope

- Startzeit direkt editieren (später)
- Endzeit direkt editieren (später)
- Mehrere Particles gleichzeitig editieren
- Undo/Redo

---

## Definition of Done

- [ ] Zeitspanne wird angezeigt (Start → Ende)
- [ ] Start-Zeit aktualisiert sich bei Dauer-Änderung
- [ ] Overflow-Badge prominent wenn vorhanden
- [ ] Keyboard-Shortcuts für +/- funktionieren
- [ ] Animation für Dauer-Änderung
- [ ] Responsive Design
- [ ] Accessibility (aria-labels, focus-management)
- [ ] TypeScript strict mode

---

## Mockup Reference

```
┌─────────────────────────────────────────┐
│                                         │
│  ●  3rd particle                    ✕   │
│     Today                               │
│                                         │
│─────────────────────────────────────────│
│                                         │
│           14:10  →  14:35               │
│                                         │
│                                         │
│   −5   −        25         +   +5       │
│                 min                     │
│                                         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  ⚡ +5 min overflow              │   │
│   │  20 min planned                 │   │
│   └─────────────────────────────────┘   │
│                                         │
│─────────────────────────────────────────│
│                                         │
│  Task                                   │
│  ┌─────────────────────────────────┐   │
│  │ API Integration                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Project                                │
│  ┌─────────────────────────────────┐   │
│  │ Website Redesign            ▼   │   │
│  └─────────────────────────────────┘   │
│                                         │
│─────────────────────────────────────────│
│                                         │
│  🗑 Delete                      Done ↵  │
│                                         │
└─────────────────────────────────────────┘
```

---

*"Das Partikel erzählt die Geschichte einer Fokus-Session. Die Details geben ihr Tiefe."*
