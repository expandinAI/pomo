---
type: story
status: backlog
priority: p1
effort: 3
feature: motivation
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [goals, motivation, gamification-light]
---

# POMO-134: Daily Goals

## User Story

> Als **ambitionierter Nutzer**
> möchte ich **ein tägliches Partikel-Ziel setzen** ("4 Partikel heute"),
> damit ich **einen klaren Tagesrhythmus habe und Fortschritt spüre**.

## Kontext

"Wie viel will ich heute schaffen?" ist eine der ersten Fragen am Morgen. Ein Daily Goal gibt Struktur ohne Druck. **Wichtig:** Particle nutzt Motivation durch Stolz, nicht durch Guilt. Kein roter Badge wenn Ziel nicht erreicht.

**Particle-Philosophie:** Das Ziel ist ein Kompass, keine Peitsche. Elegant visualisiert, nie aufdringlich.

---

## Design-Entscheidungen

### 1. Visualisierung: Transformiert, nicht ergänzt
Der SessionCounter **transformiert** sich je nach Kontext - keine zusätzliche UI-Komponente.

| Modus | Visualisierung |
|-------|----------------|
| Kein Ziel | ●✓ ●✓ ●✓ (wachsende Sammlung) |
| Ziel gesetzt | ●✓ ●✓ ○ ○ (Fortschritt zum Ziel) |

### 2. Outline-Style: Subtiler Ring
Verbleibende Goal-Dots nutzen den aktuellen Style: `border-tertiary/50`
- Präsent genug für Fortschritts-Gefühl
- Subtle genug für "Kompass, nicht Peitsche"

### 3. Maximum: 6 Dots
- Mehr ist visuell zu viel
- 6 Partikel = 2.5h Deep Work = realistisches Tagesziel
- Verhindert Überarbeitung-Gamification

### 4. Reset-Zeitpunkt: Mitternacht (00:00)
- Einfach und vorhersehbar
- Keine Konfiguration nötig (vorerst)

### 5. Übertroffene Ziele: Neutral
- Ziel erreicht → Celebration
- Über Ziel → Weitere Dots, **keine Extra-Celebration**
- Kein "+1 BONUS!" - wir motivieren nicht zur Überarbeitung

### 6. Ziel setzen: Overlay + Shortcuts
**Primär:** Tap/Click auf Counter → Öffnet visuelles Overlay
**Shortcuts:**
- `O` (wie ○ Partikel) → Öffnet Overlay direkt
- Command Palette (`⌘K`) → "Set daily goal"

---

## Akzeptanzkriterien

- [ ] **Given** kein Ziel gesetzt, **When** ich die App öffne, **Then** sehe ich nur erreichte Partikel (aktuelles Verhalten)
- [ ] **Given** Ziel = 4, **When** ich 2 Partikel habe, **Then** sehe ich ●✓ ●✓ ○ ○
- [ ] **Given** Ziel erreicht, **When** 4. Partikel abgeschlossen, **Then** Celebration + "Daily Goal reached"
- [ ] **Given** Ziel übertroffen, **When** 5. Partikel bei Ziel 4, **Then** zeigt ●✓ ●✓ ●✓ ●✓ ●✓ neutral (keine Extra-Celebration)
- [ ] **Given** Mitternacht, **When** Tag wechselt, **Then** Zähler reset auf 0, Ziel bleibt
- [ ] **Given** Counter sichtbar, **When** ich darauf klicke/tappe, **Then** öffnet sich das Goal-Overlay
- [ ] **Given** App fokussiert, **When** ich `O` drücke, **Then** öffnet sich das Goal-Overlay

---

## UI/UX

### Session Counter Transformation

```
Ohne Goal:     ●✓ ●✓ ●✓           (nur erreichte, unbegrenzt wachsend)

Mit Goal (4):  ●✓ ●✓ ○  ○         (2 erreicht, 2 verbleibend)

Goal erreicht: ●✓ ●✓ ●✓ ●✓        (alle filled, Celebration trigger)

Übertroffen:   ●✓ ●✓ ●✓ ●✓ ●✓     (5 bei Ziel 4, neutral weiter)
```

### Goal-Overlay (Tap auf Counter oder `O`)

```
┌─────────────────────────────────┐
│                                 │
│         Daily Goal              │
│                                 │
│     ●  ●  ●  ○  ○  ○           │
│                                 │
│    [-]    4 / day    [+]        │
│                                 │
│        [ No Goal ]              │
│                                 │
│   Resets daily at midnight      │
│                                 │
└─────────────────────────────────┘
```

**Verhalten:**
- Dots im Overlay zeigen Live-Preview
- Stepper mit - / + Buttons (Touch-friendly)
- Range: 1-6 (hartes Maximum)
- "No Goal" Button um Feature zu deaktivieren
- Keyboard: ↑↓ zum Adjusten, Esc zum Schließen

---

## Technische Details

### Betroffene Dateien
```
src/
├── components/timer/
│   ├── SessionCounter.tsx      # Transformation: Goal-aware rendering
│   └── DailyGoalOverlay.tsx    # NEU: Visuelles Overlay zum Ziel setzen
├── contexts/
│   └── TimerSettingsContext.tsx # dailyGoal: number | null
├── lib/
│   └── session-storage.ts      # getTodaySessions() für Tages-Count
└── hooks/
    └── useKeyboardShortcuts.ts # 'O' Shortcut hinzufügen
```

### State-Management

```typescript
// TimerSettingsContext
interface TimerSettings {
  // ... existing
  dailyGoal: number | null;  // null = Feature deaktiviert
}

// Default
dailyGoal: null
```

### Session Counter Logik

```typescript
// SessionCounter.tsx
const todayCount = getTodaySessions().length;
const { dailyGoal } = useTimerSettingsContext();

// Ohne Goal: Zeige nur erreichte (wie bisher)
// Mit Goal: Zeige todayCount filled + (dailyGoal - todayCount) outline
const totalDots = dailyGoal ?? todayCount;
const filledDots = todayCount;
const outlineDots = dailyGoal ? Math.max(0, dailyGoal - todayCount) : 0;
```

---

## Testing

### Manuell zu testen
- [ ] Kein Ziel → nur erreichte Partikel sichtbar (aktuelles Verhalten)
- [ ] Ziel 4, 2 erreicht → 2 filled, 2 outline dots
- [ ] Ziel erreicht → Celebration + StatusMessage
- [ ] Über Ziel → Zeigt alle filled, keine Extra-Celebration
- [ ] Mitternacht-Reset → Counter 0, Ziel bleibt bei 4
- [ ] Tap auf Counter → Overlay öffnet
- [ ] `O` Taste → Overlay öffnet
- [ ] Command Palette → "Set daily goal" funktioniert
- [ ] Overlay: +/- ändert Ziel, Live-Preview der Dots
- [ ] "No Goal" → Zurück zum Standardverhalten

---

## Definition of Done

- [ ] SessionCounter transformiert bei gesetztem Ziel
- [ ] DailyGoalOverlay implementiert
- [ ] Tap auf Counter öffnet Overlay
- [ ] `O` Shortcut funktioniert
- [ ] Command Palette Integration
- [ ] Celebration bei Zielerreichung
- [ ] localStorage Persistenz
- [ ] Mitternacht-Reset funktioniert
- [ ] Beide Themes getestet
- [ ] Touch-friendly (Mobile)

---

## Anti-Patterns vermeiden

- **KEIN** "Streak verloren" wenn Ziel nicht erreicht
- **KEIN** roter Indicator für "Ziel verfehlt"
- **KEINE** Extra-Celebration für Übererfüllung
- **KEIN** Druck, über das Ziel hinauszugehen
- Der Tag endet einfach, morgen ist ein neuer Tag

---

## Arbeitsverlauf

### Design-Entscheidungen: 2026-01-23
- Visualisierung: Transformiert (eine Komponente, zwei Modi)
- Outline-Style: Subtiler Ring (`border-tertiary/50`)
- Maximum: 6 Dots
- Reset: Mitternacht
- Übertroffene Ziele: Neutral (keine Extra-Celebration)
- Ziel setzen: Tap auf Counter → Overlay + `O` Shortcut + Command Palette

### Gestartet:
### Erledigt:
