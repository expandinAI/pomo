---
type: story
status: done
priority: p0
effort: 3
feature: "[[features/command-palette]]"
created: 2026-01-19
updated: 2026-01-20
done_date: 2026-01-20
tags: [command-palette, keyboard, accessibility, p0]
---

# POMO-058: Keyboard Navigation in Command Palette

## User Story

> Als **User**
> möchte ich **die Command Palette komplett per Tastatur bedienen können**,
> damit **ich nie zur Maus greifen muss**.

## Kontext

Link zum Feature: [[features/command-palette]]

Vollständige Keyboard-Navigation durch die Ergebnisliste mit visueller Hervorhebung.

## Akzeptanzkriterien

- [ ] **Given** Ergebnisse sichtbar, **When** ↓ gedrückt, **Then** nächstes Item ausgewählt
- [ ] **Given** Ergebnisse sichtbar, **When** ↑ gedrückt, **Then** vorheriges Item ausgewählt
- [ ] **Given** Item ausgewählt, **When** Enter gedrückt, **Then** Befehl ausgeführt
- [ ] **Given** Palette offen, **When** Escape gedrückt, **Then** Palette schließt
- [ ] **Given** Tab gedrückt, **When** Kategorien vorhanden, **Then** zur nächsten Kategorie
- [ ] **Given** Item ausgewählt, **When** sichtbar, **Then** visuell hervorgehoben
- [ ] **Given** Auswahl ändert sich, **When** außerhalb sichtbar, **Then** auto-scroll
- [ ] **Given** Palette öffnet, **When** Ergebnisse da, **Then** erste Option ausgewählt

## Technische Details

### Event Handler
```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
      break;
    case 'Enter':
      e.preventDefault();
      if (results[selectedIndex]) {
        executeCommand(results[selectedIndex]);
      }
      break;
    case 'Escape':
      e.preventDefault();
      close();
      break;
    case 'Tab':
      e.preventDefault();
      // Jump to next category
      break;
  }
};
```

### Auto-Scroll
```tsx
useEffect(() => {
  const selectedEl = listRef.current?.children[selectedIndex];
  selectedEl?.scrollIntoView({ block: 'nearest' });
}, [selectedIndex]);
```

## Testing

### Manuell zu testen
- [ ] ↑/↓ navigiert
- [ ] Enter führt aus
- [ ] Escape schließt
- [ ] Visuelles Highlight
- [ ] Auto-scroll funktioniert
- [ ] Erste Option pre-selected

## Definition of Done

- [ ] Keyboard Handler implementiert
- [ ] selectedIndex State
- [ ] Visual Highlight
- [ ] Auto-scroll
- [ ] Tab für Kategorien
