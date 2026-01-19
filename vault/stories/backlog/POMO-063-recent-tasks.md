---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/quick-task-system]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [tasks, autocomplete, p0]
---

# POMO-063: Recent Tasks Autocomplete

## User Story

> Als **wiederkehrender User**
> möchte ich **meine letzten Tasks als Vorschläge sehen**,
> damit **ich wiederkehrende Aufgaben schnell auswählen kann**.

## Kontext

Link zum Feature: [[features/quick-task-system]]

Autocomplete für Task-Input basierend auf früheren Tasks.

## Akzeptanzkriterien

- [ ] **Given** Tasks existieren, **When** gespeichert, **Then** letzte 10 einzigartige
- [ ] **Given** User tippt, **When** Autocomplete erscheint, **Then** passende Tasks angezeigt
- [ ] **Given** kein Tippen, **When** Feld fokussiert, **Then** "Recent" Section klickbar
- [ ] **Given** Autocomplete, **When** Pfeiltasten, **Then** navigiert durch Vorschläge
- [ ] **Given** Vorschlag ausgewählt, **When** Enter, **Then** übernommen
- [ ] **Given** Autocomplete offen, **When** Escape, **Then** schließt
- [ ] **Given** Tasks, **When** Duplikate, **Then** entfernt (case-insensitive)

## Technische Details

### LocalStorage
```typescript
const STORAGE_KEY = 'pomo-recent-tasks';

const getRecentTasks = (): string[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const addRecentTask = (task: string) => {
  const recent = getRecentTasks();
  const normalized = task.toLowerCase();
  const filtered = recent.filter(t => t.toLowerCase() !== normalized);
  const updated = [task, ...filtered].slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
```

### State
```tsx
const [suggestions, setSuggestions] = useState<string[]>([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
```

## Testing

### Manuell zu testen
- [ ] Recent Tasks werden gespeichert
- [ ] Autocomplete erscheint beim Tippen
- [ ] Pfeiltasten navigieren
- [ ] Enter übernimmt
- [ ] Escape schließt

## Definition of Done

- [ ] LocalStorage für Tasks
- [ ] Autocomplete UI
- [ ] Keyboard Navigation
- [ ] Case-insensitive Deduplizierung
