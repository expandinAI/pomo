---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/keyboard-ux]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [keyboard, navigation, p0]
---

# POMO-072: G-Prefix Navigation System

## User Story

> Als **Power-User**
> möchte ich **mit G+Buchstabe zu verschiedenen Views navigieren können**,
> damit **ich wie in Linear schnell durch die App navigieren kann**.

## Kontext

Link zum Feature: [[features/keyboard-ux]]

Linear-inspirierte Navigation mit G-Prefix für konsistentes Muscle Memory.

## Akzeptanzkriterien

- [ ] **Given** G gedrückt, **When** T folgt, **Then** Navigation zu Timer View
- [ ] **Given** G gedrückt, **When** S folgt, **Then** Navigation zu Statistics View
- [ ] **Given** G gedrückt, **When** H folgt, **Then** Navigation zu History View
- [ ] **Given** G gedrückt, **When** , folgt, **Then** Settings Modal öffnet
- [ ] **Given** G gedrückt, **When** angezeigt, **Then** Visual "G..." Indikator
- [ ] **Given** G gedrückt, **When** 1 Sekunde vergeht, **Then** Timeout, abgebrochen
- [ ] **Given** G gedrückt, **When** Escape, **Then** abgebrochen
- [ ] **Given** Input fokussiert, **When** G gedrückt, **Then** normales Tippen

## Technische Details

### Neue Hook
```
src/hooks/useGPrefixNavigation.ts
```

### Implementation
```typescript
const useGPrefixNavigation = () => {
  const [isGPressed, setIsGPressed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input
      if (isInputFocused()) return;

      if (e.key === 'g' && !isGPressed) {
        setIsGPressed(true);
        timeoutRef.current = setTimeout(() => {
          setIsGPressed(false);
        }, 1000);
        return;
      }

      if (isGPressed) {
        clearTimeout(timeoutRef.current);
        setIsGPressed(false);

        const routes: Record<string, string> = {
          't': '/',
          's': '/stats',
          'h': '/history',
          ',': '/settings',
        };

        if (routes[e.key]) {
          e.preventDefault();
          navigate(routes[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [isGPressed]);

  return { isGPressed };
};
```

### Visual Indicator
```
┌─────────────────────┐
│ G...                │  ← Erscheint unten rechts
└─────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] G+T navigiert zu Timer
- [ ] G+S navigiert zu Stats
- [ ] Visual Indicator erscheint
- [ ] 1s Timeout funktioniert
- [ ] Funktioniert nicht in Inputs

## Definition of Done

- [ ] Hook implementiert
- [ ] Navigation funktioniert
- [ ] Visual Indicator
- [ ] Timeout-Logik
