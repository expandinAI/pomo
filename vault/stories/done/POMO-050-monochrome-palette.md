---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/design-system-update]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [design-system, colors, p0]
---

# POMO-050: Monochrome Farbpalette

## User Story

> Als **User**
> möchte ich **ein professionelles, monochromes Design sehen**,
> damit **ich nicht von meiner Arbeit abgelenkt werde und das Tool zu meinem professionellen Workflow passt**.

## Kontext

Link zum Feature: [[features/design-system-update]]

Transformation von warmer, freundlicher Ästhetik zu professionellem, Linear-inspiriertem Look. Ein einziger Akzent-Blau (#4F6EF7) für primäre Aktionen.

## Akzeptanzkriterien

- [ ] **Given** Dark Mode aktiv, **When** App geladen, **Then** Hintergrund ist `#0D0D0D`
- [ ] **Given** Light Mode aktiv, **When** App geladen, **Then** Hintergrund ist `#FAFAFA`
- [ ] **Given** Button primär, **When** gerendert, **Then** nutzt Akzent-Blau `#4F6EF7`
- [ ] **Given** alte Themes, **When** Design Update, **Then** Sunrise/Ocean/Forest/Midnight entfernt
- [ ] **Given** Text, **When** Kontrast geprüft, **Then** WCAG AA (4.5:1) erfüllt

## Technische Details

### Betroffene Dateien
```
src/
├── app/globals.css
├── styles/design-tokens.ts
├── styles/themes.ts (entfernen/vereinfachen)
└── tailwind.config.js
```

### Neue Farbwerte (Dark Mode)
```css
--color-background: #0D0D0D;
--color-background-elevated: #111111;
--color-surface: #161616;
--color-surface-hover: #1A1A1A;
--color-border: #2A2A2A;
--color-text-primary: #F5F5F5;
--color-text-secondary: #A0A0A0;
--color-text-muted: #666666;
--color-accent: #4F6EF7;
--color-accent-hover: #6B82F9;
```

### Neue Farbwerte (Light Mode)
```css
--color-background: #FAFAFA;
--color-background-elevated: #FFFFFF;
--color-surface: #F5F5F5;
--color-border: #E5E5E5;
--color-text-primary: #171717;
--color-text-secondary: #525252;
```

## Testing

### Manuell zu testen
- [ ] Dark Mode Hintergrund korrekt
- [ ] Light Mode Hintergrund korrekt
- [ ] Akzent-Blau auf allen Buttons
- [ ] Keine bunten Themes mehr verfügbar
- [ ] Kontrast mit Accessibility Tools prüfen

## Definition of Done

- [ ] Code implementiert
- [ ] CSS-Variablen aktualisiert
- [ ] Tailwind Config angepasst
- [ ] WCAG AA Kontraste verifiziert
- [ ] Dark/Light Mode getestet
