---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/keyboard-ux]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [keyboard, help, modal, p0]
---

# POMO-074: Erweitertes Shortcuts Help Modal

## User Story

> Als **User**
> möchte ich **alle Shortcuts in einem übersichtlichen Modal sehen**,
> damit **ich das volle Potenzial der App nutzen kann**.

## Kontext

Link zum Feature: [[features/keyboard-ux]]

Umfassendes Help Modal mit allen Shortcuts, kategorisiert und durchsuchbar.

## Akzeptanzkriterien

- [ ] **Given** ? gedrückt, **When** kein Input fokussiert, **Then** Help Modal öffnet
- [ ] **Given** Help Modal, **When** angezeigt, **Then** Shortcuts kategorisiert
- [ ] **Given** Help Modal, **When** Suchfeld, **Then** Shortcuts durchsuchbar
- [ ] **Given** Shortcut, **When** angezeigt, **Then** mit Beschreibung
- [ ] **Given** Mac/Windows, **When** angezeigt, **Then** entsprechende Format
- [ ] **Given** Escape/Klick außerhalb, **When** Help offen, **Then** schließt
- [ ] **Given** Footer, **When** angezeigt, **Then** "Keyboard Shortcuts" Link

## Technische Details

### UI Struktur
```
┌─────────────────────────────────────────────────────┐
│  Keyboard Shortcuts                           ✕    │
├─────────────────────────────────────────────────────┤
│  🔍 Search shortcuts...                             │
├─────────────────────────────────────────────────────┤
│  Timer                                              │
│  ────────────────────────────────────────────────   │
│  Space         Start/Pause timer                    │
│  R             Reset timer                          │
│  S             Skip to break                        │
│  1 2 3 4       Switch preset                        │
│  ↑ ↓           Adjust time (±1 min, paused)        │
│                                                     │
│  Navigation                                         │
│  ────────────────────────────────────────────────   │
│  G T           Go to Timer                          │
│  G S           Go to Statistics                     │
│  G H           Go to History                        │
│  G ,           Go to Settings                       │
│                                                     │
│  General                                            │
│  ────────────────────────────────────────────────   │
│  ⌘ K           Open command palette                 │
│  ?             Show this help                       │
│  Escape        Close modal                          │
└─────────────────────────────────────────────────────┘
```

### Shortcut Data Structure
```typescript
interface ShortcutCategory {
  name: string;
  shortcuts: {
    key: string;
    description: string;
  }[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'Timer',
    shortcuts: [
      { key: 'Space', description: 'Start/Pause timer' },
      { key: 'R', description: 'Reset timer' },
      // ...
    ],
  },
  // ...
];
```

## Testing

### Manuell zu testen
- [ ] ? öffnet Modal
- [ ] Kategorien sichtbar
- [ ] Suche funktioniert
- [ ] Mac/Windows Format
- [ ] Escape schließt

## Definition of Done

- [ ] Help Modal Komponente
- [ ] Shortcut-Daten strukturiert
- [ ] Suchfunktion
- [ ] Platform-spezifisches Format
