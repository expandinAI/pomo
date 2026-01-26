---
type: story
status: done
priority: p0
effort: 3
feature: "[[features/keyboard-ux]]"
created: 2026-01-19
updated: 2026-01-26
done_date: 2026-01-26
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

- [x] **Given** ? gedrückt, **When** kein Input fokussiert, **Then** Help Modal öffnet
- [x] **Given** Help Modal, **When** angezeigt, **Then** Shortcuts kategorisiert
- [x] **Given** Help Modal, **When** Suchfeld, **Then** Shortcuts durchsuchbar
- [x] **Given** Shortcut, **When** angezeigt, **Then** mit Beschreibung
- [x] **Given** Mac/Windows, **When** angezeigt, **Then** entsprechende Format
- [x] **Given** Escape/Klick außerhalb, **When** Help offen, **Then** schließt
- [x] **Given** Footer, **When** angezeigt, **Then** "Keyboard Shortcuts" Link

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

### Implementierung

**Komponente:** `src/components/ui/ShortcutsHelp.tsx`

Features:
- Keyboard Icon Button im Footer
- Modal mit Backdrop
- Suchfeld mit Live-Filter via `searchShortcuts()`
- Kategorisierte Darstellung via `CATEGORY_ORDER`
- Platform-spezifisches Format via `formatShortcut()`
- Focus Trap für Accessibility
- Spring Animations

## Testing

### Manuell zu testen
- [x] ? öffnet Modal
- [x] Kategorien sichtbar
- [x] Suche funktioniert
- [x] Mac/Windows Format
- [x] Escape schließt

## Definition of Done

- [x] Help Modal Komponente
- [x] Shortcut-Daten strukturiert
- [x] Suchfunktion
- [x] Platform-spezifisches Format
