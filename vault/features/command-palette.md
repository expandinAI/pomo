---
type: feature
status: ready
priority: p0
effort: l
business_value: high
origin: "[[ideas/ui-transformation]]"
stories:
  - "[[stories/backlog/POMO-056-command-palette-ui]]"
  - "[[stories/backlog/POMO-057-fuzzy-search]]"
  - "[[stories/backlog/POMO-058-keyboard-navigation]]"
  - "[[stories/backlog/POMO-059-recent-commands]]"
  - "[[stories/backlog/POMO-060-command-registry]]"
created: 2026-01-19
updated: 2026-01-19
tags: [ui-transformation, keyboard, power-user, p0, mvp]
---

# Command Palette

## Zusammenfassung

> Implementation einer Cmd+K Command Palette als zentrales Interaktionselement für Keyboard-First UX. Ermöglicht schnellen Zugriff auf alle Aktionen ohne Maus – das Herzstück der Linear/Raycast-artigen Bedienung.

## Kontext & Problem

### Ausgangssituation
Aktionen erfordern Mausklicks oder man muss sich viele einzelne Shortcuts merken.

### Betroffene Nutzer
Power-User die Tools wie Linear, Raycast, VS Code nutzen.

### Auswirkung
Ohne Command Palette fühlt sich Particle für Keyboard-Power-User träge und unprofessionell an.

## Ziele

### Muss erreicht werden
- [ ] Cmd+K/Ctrl+K öffnet Command Palette
- [ ] Fuzzy Search für alle Befehle
- [ ] Vollständige Keyboard Navigation
- [ ] Recent Commands für schnellen Zugriff

### Sollte erreicht werden
- [ ] Command Registry für erweiterbare Commands

### Nicht im Scope
- Nested Sub-Commands
- Custom User Commands
- Command History (alle, nicht nur recent)

## Lösung

### User Flow

1. User drückt `Cmd+K` (Mac) oder `Ctrl+K` (Windows)
2. Palette erscheint zentriert mit Backdrop
3. Fokus ist sofort im Suchfeld
4. User tippt "sta" → Fuzzy Search zeigt "Start Session"
5. User drückt Enter → Aktion ausgeführt, Palette schließt

### UI/UX Konzept

```
┌─────────────────────────────────────────────────────┐
│  ⌘ Type a command or search...                      │
├─────────────────────────────────────────────────────┤
│  Recent                                             │
│  │ 🕐 Start 25min Session                      ⏎   │
│  │ 🕐 Open Statistics                      G S │   │
│                                                     │
│  Timer                                              │
│  │ ▶️  Start Session                        ⏎   │
│  │ ⏸️  Pause Session                      Space │
│  │ 🔄 Reset Timer                           R   │
│                                                     │
│  Navigation                                         │
│  │ 📊 Go to Statistics                     G S │
│  │ ⚙️  Go to Settings                      G , │
└─────────────────────────────────────────────────────┘
```

### Technische Überlegungen

**Neue Komponenten:**
- `src/components/command/CommandPalette.tsx`
- `src/lib/commandRegistry.ts`

**Dependencies:**
- Framer Motion für Animationen
- Focus Trap für Keyboard-Navigation
- fuse.js für Fuzzy Search

**Command Interface:**
```typescript
interface Command {
  id: string;
  label: string;
  shortcut?: string;
  category: 'timer' | 'navigation' | 'settings' | 'integration';
  action: () => void;
  icon?: React.ReactNode;
  keywords?: string[];
  disabled?: boolean | (() => boolean);
}
```

## Akzeptanzkriterien

- [ ] Cmd+K/Ctrl+K öffnet Palette
- [ ] Escape oder Backdrop-Klick schließt
- [ ] Fuzzy Search funktioniert ("stt" findet "Start Timer")
- [ ] ↑/↓ navigiert, Enter führt aus
- [ ] Letzte 5 Commands werden angezeigt
- [ ] 80% aller Aktionen über Palette erreichbar

## Metriken & Erfolgsmessung

- **Primäre Metrik:** Command Palette Usage > 50% der Power-User
- **Sekundäre Metrik:** Mausklicks reduziert um 30%
- **Messzeitraum:** 2 Wochen nach Launch

## Stories

1. [[stories/backlog/POMO-060-command-registry]] - Command Registry (3 SP) - zuerst!
2. [[stories/backlog/POMO-056-command-palette-ui]] - Command Palette UI (5 SP)
3. [[stories/backlog/POMO-058-keyboard-navigation]] - Keyboard Navigation (3 SP)
4. [[stories/backlog/POMO-057-fuzzy-search]] - Fuzzy Search (5 SP)
5. [[stories/backlog/POMO-059-recent-commands]] - Recent Commands (2 SP)

**Gesamt: 18 Story Points**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-19 | Migriert aus backlog/epics | Claude |
