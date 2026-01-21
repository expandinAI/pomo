---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/command-palette]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [command-palette, keyboard, ui, p0]
---

# POMO-056: Command Palette UI

## User Story

> Als **Power-User**
> möchte ich **mit Cmd+K eine Command Palette öffnen können**,
> damit **ich schnell jede Aktion ausführen kann ohne die Maus zu benutzen**.

## Kontext

Link zum Feature: [[features/command-palette]]

Das Herzstück der Linear/Raycast-artigen Bedienung. Öffnet ein zentriertes Modal mit Suchfeld.

## Akzeptanzkriterien

- [ ] **Given** User drückt, **When** Cmd+K (Mac) / Ctrl+K (Windows), **Then** Palette öffnet
- [ ] **Given** Palette offen, **When** geladen, **Then** Fokus ist im Suchfeld
- [ ] **Given** Palette offen, **When** Escape gedrückt, **Then** Palette schließt
- [ ] **Given** Palette offen, **When** Backdrop geklickt, **Then** Palette schließt
- [ ] **Given** Animation, **When** öffnet/schließt, **Then** Fade + Scale in <200ms
- [ ] **Given** Backdrop, **When** sichtbar, **Then** semi-transparent (rgba(0,0,0,0.5))
- [ ] **Given** Position, **When** angezeigt, **Then** vertikal zentriert, leicht nach oben
- [ ] **Given** Breite, **When** Desktop, **Then** 560px max, responsive auf Mobile

## Technische Details

### Neue Komponenten
```
src/components/command/
├── CommandPalette.tsx
├── CommandInput.tsx
└── CommandList.tsx
```

### State
```tsx
const [isOpen, setIsOpen] = useState(false);
const [query, setQuery] = useState('');
const [selectedIndex, setSelectedIndex] = useState(0);
```

### Keyboard Handler
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## UI/UX

```
┌─────────────────────────────────────────────────────┐
│  ⌘ Type a command or search...                      │
├─────────────────────────────────────────────────────┤
│  [Command List erscheint hier]                      │
└─────────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Cmd+K öffnet auf Mac
- [ ] Ctrl+K öffnet auf Windows
- [ ] Escape schließt
- [ ] Backdrop-Klick schließt
- [ ] Animation smooth
- [ ] Fokus im Suchfeld

## Definition of Done

- [ ] Komponente implementiert
- [ ] Keyboard Shortcut funktioniert
- [ ] Animation mit Framer Motion
- [ ] Focus Trap aktiv
- [ ] Responsive getestet
