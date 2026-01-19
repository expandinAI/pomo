---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/design-system-update]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [design-system, layout, p0]
---

# POMO-054: Kompakteres Layout

## User Story

> Als **User**
> möchte ich **ein kompakteres, dichteres Layout**,
> damit **ich mehr Information auf einen Blick sehe**.

## Kontext

Link zum Feature: [[features/design-system-update]]

Reduktion von Padding und Spacing für höhere Information Density, ohne Mobile-UX zu beeinträchtigen.

## Akzeptanzkriterien

- [ ] **Given** Container Padding, **When** Desktop, **Then** ist 24px (statt 32px)
- [ ] **Given** vertikale Abstände, **When** zwischen Elementen, **Then** reduziert
- [ ] **Given** Timer Display, **When** angezeigt, **Then** behält prominente Größe
- [ ] **Given** Buttons, **When** gerendert, **Then** Höhe 32-36px
- [ ] **Given** Mobile Ansicht, **When** angezeigt, **Then** bleibt touchfreundlich (44x44px Targets)

## Technische Details

### Betroffene Dateien
```
src/
├── app/page.tsx
├── components/timer/Timer.tsx
└── components/ui/Button.tsx
```

### Spacing Änderungen
```
Container Padding: 32px → 24px
Gap zwischen Sections: 32px → 24px
Card Padding: 24px → 16px
Button Height: variabel → 32-36px
```

### Button Größen
```tsx
const buttonSizes = {
  sm: 'h-8 px-3 text-sm',   // 32px
  md: 'h-9 px-4 text-sm',   // 36px
  lg: 'h-10 px-6 text-base', // 40px (Touch)
};
```

## Testing

### Manuell zu testen
- [ ] Desktop: Kompakter, aber lesbar
- [ ] Mobile: Touch Targets mindestens 44x44px
- [ ] Timer bleibt prominent
- [ ] Keine überlappenden Elemente

## Definition of Done

- [ ] Spacing reduziert
- [ ] Button-Größen angepasst
- [ ] Mobile Touch Targets geprüft
- [ ] Timer Prominenz erhalten
