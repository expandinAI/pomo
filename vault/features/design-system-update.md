---
type: feature
status: ready
priority: p0
effort: m
business_value: high
origin: "[[ideas/ui-transformation]]"
stories:
  - "[[stories/backlog/POMO-050-monochrome-palette]]"
  - "[[stories/backlog/POMO-051-border-radii]]"
  - "[[stories/backlog/POMO-052-monospace-font]]"
  - "[[stories/backlog/POMO-053-faster-animations]]"
  - "[[stories/backlog/POMO-054-compact-layout]]"
  - "[[stories/backlog/POMO-055-dark-shadows]]"
created: 2026-01-19
updated: 2026-01-19
tags: [ui-transformation, design, p0, mvp]
---

# Design System Update

## Zusammenfassung

> Transformation des Pomo Design Systems von einer freundlichen, warmen Ästhetik zu einem professionellen, Linear-inspirierten Look mit monochromer Farbpalette, schärferen Ecken und optimierter Typografie.

## Kontext & Problem

### Ausgangssituation
Das aktuelle Design wirkt "freundlich", aber nicht professionell genug für Power-User, die Tools wie Linear, Raycast und Superhuman nutzen.

### Betroffene Nutzer
Entwickler, Designer, Knowledge Worker die Premium-Tools schätzen.

### Auswirkung
Ohne Update fühlt sich Pomo wie ein "Hobby-Tool" an, nicht wie ein professionelles Produktivitäts-Werkzeug.

## Ziele

### Muss erreicht werden
- [ ] Monochrome, professionelle Farbpalette
- [ ] Schärfere, Linear-inspirierte Border Radii
- [ ] JetBrains Mono für Timer Display
- [ ] Snappigere, schnellere Animationen

### Sollte erreicht werden
- [ ] Kompakteres Layout mit höherer Information Density
- [ ] Optimierte Shadows für Dark Mode

### Nicht im Scope
- Custom Theme Editor (widerspricht monochromer Philosophie)
- Zusätzliche Akzentfarben (ein Akzent reicht)

## Lösung

### Übersicht
Umstellung des gesamten Design Systems auf eine monochrome, professionelle Ästhetik mit einem einzigen Akzent-Blau (#4F6EF7).

### UI/UX Konzept

**Neue Farbwerte (Dark Mode):**
```css
--color-background: #0D0D0D;
--color-background-elevated: #111111;
--color-surface: #161616;
--color-border: #2A2A2A;
--color-text-primary: #F5F5F5;
--color-text-secondary: #A0A0A0;
--color-accent: #4F6EF7;
```

**Neue Border Radii:**
```
Buttons: 4px | Cards: 6px | Modals: 8px | Pills: 9999px
```

**Neue Animation Timings:**
```
Hover: 100ms | Micro: 150ms | Modal: 200ms | Panel: 250ms
```

### Technische Überlegungen

**Betroffene Dateien:**
- `tailwind.config.js`
- `src/app/globals.css`
- `src/styles/design-tokens.ts`
- `src/styles/themes.ts`
- `src/app/layout.tsx` (Font)
- Alle Komponenten in `src/components/`

## Akzeptanzkriterien

- [ ] Dark Mode Hintergrund ist `#0D0D0D`
- [ ] Light Mode Hintergrund ist `#FAFAFA`
- [ ] Nur ein Akzent-Blau für primäre Aktionen
- [ ] Timer nutzt JetBrains Mono mit tabular-nums
- [ ] Alle Animationen unter 250ms
- [ ] Kontraste erfüllen WCAG AA (4.5:1)

## Metriken & Erfolgsmessung

- **Primäre Metrik:** User Feedback "professionell" > 80%
- **Sekundäre Metrik:** Keine Accessibility-Regressionen
- **Messzeitraum:** 2 Wochen nach Launch

## Stories

1. [[stories/backlog/POMO-050-monochrome-palette]] - Monochrome Farbpalette (3 SP)
2. [[stories/backlog/POMO-051-border-radii]] - Schärfere Border Radii (2 SP)
3. [[stories/backlog/POMO-052-monospace-font]] - Timer mit Monospace Font (2 SP)
4. [[stories/backlog/POMO-053-faster-animations]] - Schnellere Animationen (3 SP)
5. [[stories/backlog/POMO-054-compact-layout]] - Kompakteres Layout (2 SP)
6. [[stories/backlog/POMO-055-dark-shadows]] - Optimierte Shadows (1 SP)

**Gesamt: 13 Story Points**

## Changelog

| Datum | Änderung | Autor |
|-------|----------|-------|
| 2026-01-19 | Migriert aus backlog/epics | Claude |
