---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/keyboard-ux]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [keyboard, vim, p1]
---

# POMO-077: Vim-Style Navigation

## User Story

> Als **Vim User**
> möchte ich **Listen mit J/K navigieren können**,
> damit **ich meine gewohnten Bewegungsmuster nutzen kann**.

## Kontext

Link zum Feature: [[features/keyboard-ux]]

**Priorität: P1** - Optional, für Vim-affine Power-User.

## Akzeptanzkriterien

- [ ] **Given** Liste sichtbar, **When** J gedrückt, **Then** nach unten navigieren
- [ ] **Given** Liste sichtbar, **When** K gedrückt, **Then** nach oben navigieren
- [ ] **Given** Item ausgewählt, **When** Enter gedrückt, **Then** auswählen
- [ ] **Given** Input fokussiert, **When** J/K, **Then** normales Tippen
- [ ] **Given** Setting, **When** "Vim Navigation" off, **Then** deaktiviert

## Technische Details

### Settings Option
```typescript
interface Settings {
  enableVimNavigation: boolean; // default: false
}
```

### Hook
```typescript
const useVimNavigation = (
  items: any[],
  selectedIndex: number,
  setSelectedIndex: (i: number) => void,
  enabled: boolean
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      if (e.key === 'j') {
        e.preventDefault();
        setSelectedIndex(Math.min(selectedIndex + 1, items.length - 1));
      } else if (e.key === 'k') {
        e.preventDefault();
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items.length, enabled]);
};
```

### Anwendung
- Command Palette Ergebnisse
- Session History Liste
- Settings Listen

## Testing

### Manuell zu testen
- [ ] J navigiert nach unten
- [ ] K navigiert nach oben
- [ ] Setting zum Deaktivieren
- [ ] Funktioniert nicht in Inputs

## Definition of Done

- [ ] Settings Option
- [ ] Hook implementiert
- [ ] In Listen integriert
