---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/design-system-update]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [design-system, ui, p0]
---

# POMO-051: Schärfere Border Radii

## User Story

> Als **User**
> möchte ich **schärfere, professionellere Ecken sehen**,
> damit **das Tool zu einem Linear/Raycast-Ökosystem passt**.

## Kontext

Link zum Feature: [[features/design-system-update]]

Reduzierung der Border Radii für ein professionelleres Erscheinungsbild. Linear und Raycast nutzen subtilere Rundungen.

## Akzeptanzkriterien

- [ ] **Given** Button, **When** gerendert, **Then** Radius ist `4px`
- [ ] **Given** Card/Dropdown, **When** gerendert, **Then** Radius ist `6px`
- [ ] **Given** Modal, **When** gerendert, **Then** Radius ist `8px`
- [ ] **Given** Pill/Badge, **When** gerendert, **Then** Radius bleibt `9999px`
- [ ] **Given** alle Komponenten, **When** visuell geprüft, **Then** konsistent

## Technische Details

### Betroffene Dateien
```
src/
├── tailwind.config.js
└── components/**/*.tsx
```

### Neue Border Radius Werte
```js
borderRadius: {
  none: '0px',
  sm: '4px',      // Buttons
  DEFAULT: '6px', // Cards, Dropdowns
  md: '6px',
  lg: '8px',      // Modals
  xl: '12px',     // Große Container (selten)
  full: '9999px', // Pills
}
```

### Zu aktualisierende Komponenten
- Button.tsx: `rounded-md` → `rounded-sm`
- Card.tsx: `rounded-xl` → `rounded`
- Modal.tsx: `rounded-2xl` → `rounded-lg`
- Dropdown.tsx: `rounded-xl` → `rounded`

## Testing

### Manuell zu testen
- [ ] Buttons haben 4px Radius
- [ ] Cards haben 6px Radius
- [ ] Modals haben 8px Radius
- [ ] Pills bleiben rund
- [ ] Keine visuellen Inkonsistenzen

## Definition of Done

- [ ] Tailwind Config aktualisiert
- [ ] Alle Komponenten angepasst
- [ ] Visuell konsistent
