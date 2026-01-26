---
type: feature
status: ready
priority: p0
effort: m
business_value: high
origin: "[[ideas/ui-transformation]]"
stories:
  - "[[POMO-072-g-prefix-navigation 1]]"
  - "[[stories/backlog/POMO-073-shortcut-hints]]"
  - "[[stories/backlog/POMO-074-help-modal]]"
  - "[[stories/backlog/POMO-075-timer-shortcuts]]"
  - "[[stories/backlog/POMO-076-focus-trap]]"
  - "[[stories/backlog/POMO-077-vim-navigation]]"
created: 2026-01-19
updated: 2026-01-19
tags:
  - ui-transformation
  - keyboard
  - accessibility
  - p0
  - mvp
---

# Keyboard-First UX

## Zusammenfassung

> Umfassende Erweiterung des Keyboard-Systems mit G-Prefix Navigation (wie Linear), Shortcut Hints im UI, erweitertem Help Modal und konsistenter Keyboard-Navigation durch die gesamte App.

## Kontext & Problem

### Ausgangssituation
Aktuelle Shortcuts sind nicht systematisch; Power-User wollen mehr Maus-Freiheit.

### Betroffene Nutzer
Entwickler und Power-User die Vim, Linear, Raycast gewohnt sind.

### Auswirkung
Ohne umfassendes Keyboard-System fühlt sich Particle für Power-User ineffizient an.

## Ziele

### Muss erreicht werden
- [ ] G-Prefix Navigation (G+T, G+S, G+H, G+,)
- [ ] Shortcut Hints neben Buttons
- [ ] Erweitertes Help Modal
- [ ] Focus Trap für Modals

### Sollte erreicht werden
- [ ] Erweiterte Timer-Shortcuts (↑/↓ für Zeit)

### Nicht im Scope
- Vim J/K Navigation (später als Option)
- Custom Shortcut Mapping

## Lösung

### G-Prefix Navigation

```
G + T → Timer
G + S → Statistics
G + H → History
G + , → Settings
```

**Visual Indicator bei G-Press:**
```
┌─────────────────────┐
│ G...                │  ← Erscheint unten rechts
└─────────────────────┘
```

### Vollständige Shortcut-Map

**Timer:**
| Shortcut | Aktion |
|----------|--------|
| Space | Start/Pause |
| R | Reset |
| S | Skip to Break |
| 1-4 | Preset wählen |
| ↑/↓ | ±1 Minute (pausiert) |
| Shift+↑/↓ | ±5 Minuten (pausiert) |

**Navigation:**
| Shortcut | Aktion |
|----------|--------|
| G T | Go to Timer |
| G S | Go to Statistics |
| G H | Go to History |
| G , | Go to Settings |

**General:**
| Shortcut | Aktion |
|----------|--------|
| Cmd+K | Command Palette |
| ? | Shortcuts Help |
| Escape | Close Modal |
| T | Focus Task Input |
| M | Mute/Unmute |

### Technische Überlegungen

**Neue Hook:** `src/hooks/useGPrefixNavigation.ts`

```typescript
const useGPrefixNavigation = () => {
  const [isGPressed, setIsGPressed] = useState(false);
  // 1 Sekunde Timeout für zweiten Tastendruck
  // Escape bricht ab
};
```

**Shortcut Hints: "Learn by Doing" Strategie**

Siehe: `CLAUDE.md` → "Keyboard Hints Strategie"

**Prinzip:** Nicht bei jedem Button einen Hint – das würde die UI zum Tastaturkurs machen.

| Stufe | Methode | Wann |
|-------|---------|------|
| 1. Inline | `<KeyboardHint>` | Nur primäre Aktionen (Space, Enter) |
| 2. Tooltip | `title` Attribut | Sekundäre Aktionen (G T, G S) |
| 3. Help Modal | `?` Taste | Vollständige Liste |

**"One Hint per Context" Regel:** Pro Kontext maximal ein Inline-Hint.

```tsx
// Richtig: Primäre Aktion
<Button>
  Start Focus
  <KeyboardHint shortcut="Space" />
</Button>

// Falsch: Zu viele Hints
<PresetButton>Classic <KeyboardHint shortcut="1" /></PresetButton>  // ✗
<PresetButton>Deep <KeyboardHint shortcut="2" /></PresetButton>     // ✗
```

## Akzeptanzkriterien

- [x] G-Prefix funktioniert mit 1s Timeout
- [x] Visual Feedback bei G-Press
- [x] Shortcut Hints neben allen Buttons
- [x] Help Modal zeigt alle Shortcuts kategorisiert
- [x] Focus bleibt in offenen Modals (Focus Trap)
- [x] 90% aller Aktionen ohne Maus ausführbar

## Metriken & Erfolgsmessung

- **Primäre Metrik:** Keyboard-only Usage > 40%
- **Sekundäre Metrik:** Help Modal Views > 20%
- **Messzeitraum:** 2 Wochen nach Launch

## Stories

1. [[stories/backlog/POMO-076-focus-trap]] - Focus Trap (2 SP) - P0, zuerst!
2. [[POMO-072-g-prefix-navigation 1]] - G-Prefix Navigation (3 SP) - P0
3. [[stories/backlog/POMO-075-timer-shortcuts]] - Erweiterte Timer-Shortcuts (2 SP) - P0
4. [[stories/backlog/POMO-073-shortcut-hints]] - Shortcut Hints (2 SP) - P0
5. [[stories/backlog/POMO-074-help-modal]] - Help Modal (3 SP) - P0
6. [[stories/backlog/POMO-077-vim-navigation]] - Vim Navigation (2 SP) - P1

**P0 Gesamt: 12 Story Points**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-19 | Migriert aus backlog/epics | Claude |
