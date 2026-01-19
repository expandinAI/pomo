---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/command-palette]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [command-palette, history, p0]
---

# POMO-059: Recent Commands

## User Story

> Als **wiederkehrender User**
> möchte ich **meine letzten Befehle sehen**,
> damit **ich häufige Aktionen schneller ausführen kann**.

## Kontext

Link zum Feature: [[features/command-palette]]

Recent Commands erscheinen ganz oben in der Palette für schnellen Zugriff.

## Akzeptanzkriterien

- [ ] **Given** Commands ausgeführt, **When** Palette öffnet, **Then** letzte 5 einzigartige sichtbar
- [ ] **Given** Recent Section, **When** angezeigt, **Then** ist ganz oben (vor Kategorien)
- [ ] **Given** Command ausgeführt, **When** gespeichert, **Then** in LocalStorage
- [ ] **Given** Command mehrfach, **When** gespeichert, **Then** nur einmal (neuester gewinnt)
- [ ] **Given** Recent Command, **When** angezeigt, **Then** mit Clock-Icon markiert
- [ ] **Given** leere Suche, **When** angezeigt, **Then** Recent zuerst, dann alle anderen

## Technische Details

### LocalStorage
```typescript
const STORAGE_KEY = 'pomo-recent-commands';

type RecentCommands = string[]; // Array von Command IDs

const addToRecent = (commandId: string) => {
  const recent = getRecentCommands();
  const filtered = recent.filter(id => id !== commandId);
  const updated = [commandId, ...filtered].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

const getRecentCommands = (): string[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};
```

### Integration in Palette
```tsx
const recentIds = getRecentCommands();
const recentCommands = recentIds
  .map(id => commands.find(c => c.id === id))
  .filter(Boolean);

// Render: Recent Section zuerst wenn !query
```

## UI/UX

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
│  ...
└─────────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Recent Commands werden gespeichert
- [ ] Max 5 einzigartige
- [ ] Recent Section oben
- [ ] Clock-Icon sichtbar
- [ ] LocalStorage persistent

## Definition of Done

- [ ] LocalStorage Funktionen
- [ ] Recent Section in Palette
- [ ] Deduplizierung
- [ ] Max 5 Items
- [ ] Clock-Icon
