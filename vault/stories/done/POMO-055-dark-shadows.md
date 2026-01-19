---
type: story
status: backlog
priority: p0
effort: 1
feature: "[[features/design-system-update]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [design-system, shadows, p0]
---

# POMO-055: Optimierte Shadows für Dark Mode

## User Story

> Als **User**
> möchte ich **subtilere, für Dark Mode optimierte Shadows**,
> damit **Elemente sich natürlich vom Hintergrund abheben**.

## Kontext

Link zum Feature: [[features/design-system-update]]

Dark Mode erfordert andere Shadow-Behandlung als Light Mode. Elevation durch Background-Color statt starker Shadows.

## Akzeptanzkriterien

- [ ] **Given** Dark Mode, **When** Shadow angewendet, **Then** subtil und dunkel
- [ ] **Given** Akzent-Element, **When** Glow gewünscht, **Then** sanfter Blau-Glow verfügbar
- [ ] **Given** Elevated Surface, **When** angezeigt, **Then** nutzt `background-elevated` statt Shadow
- [ ] **Given** Light Mode, **When** Shadow angewendet, **Then** klassische Shadows

## Technische Details

### Betroffene Dateien
```
src/
├── tailwind.config.js
└── globals.css
```

### Neue Shadow Werte
```js
boxShadow: {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.4)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
  glow: '0 0 20px rgba(79, 110, 247, 0.3)',
  'glow-sm': '0 0 10px rgba(79, 110, 247, 0.2)',
}
```

### Verwendung
```tsx
// Statt Shadow für Elevation:
<div className="bg-background-elevated">

// Für Glow-Effekt auf Akzent:
<button className="shadow-glow hover:shadow-glow-sm">
```

## Testing

### Manuell zu testen
- [ ] Dark Mode Shadows subtil
- [ ] Light Mode Shadows klassisch
- [ ] Glow-Effekt sichtbar aber dezent
- [ ] Elevation durch Background funktioniert

## Definition of Done

- [ ] Tailwind Shadow Config aktualisiert
- [ ] Glow-Varianten verfügbar
- [ ] Elevated Background statt Shadow
