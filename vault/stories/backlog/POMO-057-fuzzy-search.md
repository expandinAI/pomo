---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/command-palette]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [command-palette, search, p0]
---

# POMO-057: Command Suche mit Fuzzy Matching

## User Story

> Als **User**
> möchte ich **in der Command Palette nach Befehlen suchen können**,
> damit **ich schnell die richtige Aktion finde auch wenn ich den genauen Namen nicht kenne**.

## Kontext

Link zum Feature: [[features/command-palette]]

Fuzzy Search ermöglicht das Finden von Commands auch bei Tippfehlern oder Teilbegriffen.

## Akzeptanzkriterien

- [ ] **Given** User tippt "stt", **When** Suche ausgeführt, **Then** "Start Timer" gefunden
- [ ] **Given** Ergebnisse, **When** angezeigt, **Then** nach Relevanz sortiert
- [ ] **Given** Matching-Buchstaben, **When** angezeigt, **Then** hervorgehoben
- [ ] **Given** Commands, **When** gruppiert, **Then** Kategorien sichtbar
- [ ] **Given** Command, **When** Shortcut vorhanden, **Then** neben Label angezeigt
- [ ] **Given** Ergebnisse, **When** mehr als 10, **Then** scrollbar
- [ ] **Given** leere Suche, **When** angezeigt, **Then** alle Commands nach Kategorie

## Technische Details

### Dependency
```bash
pnpm add fuse.js
```

### Fuse.js Setup
```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(commands, {
  keys: ['label', 'keywords'],
  threshold: 0.4,
  includeMatches: true,
});

const results = query ? fuse.search(query) : commands;
```

### Command Interface
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

## UI/UX

```
┌─────────────────────────────────────────────────────┐
│  ⌘ sta|                                             │
├─────────────────────────────────────────────────────┤
│  Timer                                              │
│  │ ▶️  [Sta]rt Session                        ⏎   │
│  │ ⏸️  Pause Session                      Space │
└─────────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] "stt" findet "Start Timer"
- [ ] "paus" findet "Pause Session"
- [ ] Kategorien werden angezeigt
- [ ] Shortcuts neben Labels
- [ ] Matching hervorgehoben

## Definition of Done

- [ ] fuse.js integriert
- [ ] Fuzzy Search funktioniert
- [ ] Match Highlighting
- [ ] Kategorien gruppiert
- [ ] Max 10 sichtbar, Rest scrollbar
