---
type: story
status: done
priority: p1
effort: 1
feature: year-view
created: 2026-01-20
updated: 2026-01-26
done_date: 2026-01-26
tags: [year-view, settings, weekstart, i18n, p1]
---

# POMO-117: Wochenstart-Einstellung

## User Story

> Als **Particle-Nutzer**
> möchte ich **einstellen können, ob meine Woche am Montag oder Sonntag beginnt**,
> damit **das Grid meiner kulturellen Gewohnheit entspricht**.

## Kontext

Link zum Feature: [[features/year-view]]

In Europa beginnt die Woche am Montag, in den USA am Sonntag. Diese Einstellung betrifft nicht nur die Year View, sondern alle Kalender-bezogenen Ansichten.

## Akzeptanzkriterien

### Einstellung
- [x] **Given** die Settings-Seite, **When** ich sie öffne, **Then** sehe ich eine Option "Wochenstart"
- [x] **Given** die Option, **When** ich sie sehe, **Then** kann ich zwischen "Montag" und "Sonntag" wählen
- [x] **Given** ein neuer User, **When** die App startet, **Then** ist "Montag" der Default

### Year View Integration
- [x] **Given** Wochenstart = Montag, **When** ich die Year View sehe, **Then** ist "Mo" die erste Reihe
- [x] **Given** Wochenstart = Sonntag, **When** ich die Year View sehe, **Then** ist "So" die erste Reihe
- [x] **Given** ich ändere die Einstellung, **When** ich zur Year View gehe, **Then** ist das Grid entsprechend aktualisiert

### Persistenz
- [x] **Given** ich setze Wochenstart = Sonntag, **When** ich die App neu lade, **Then** bleibt die Einstellung erhalten

## Implementierung

**Komponenten:**
- `src/hooks/useWeekStart.ts` - Hook für Week Start Preference
- `src/components/settings/WeekStartSetting.tsx` - Settings UI
- `src/lib/year-view/grid.ts` - Grid-Berechnung mit weekStartsOnMonday Parameter
- `src/components/year-view/YearGrid.tsx` - Year View Integration

**Features:**
- Toggle zwischen Montag und Sonntag
- Default: Montag (European convention)
- Persistenz via localStorage (`particle-week-start`)
- Year View passt sich automatisch an

## Testing

### Manuell zu testen
- [x] Setting ist in Settings-Page sichtbar
- [x] Default ist Montag
- [x] Wechsel auf Sonntag funktioniert
- [x] Year View passt sich an
- [x] Einstellung wird persistent gespeichert
- [x] Nach Reload bleibt Einstellung

## Definition of Done

- [x] Setting in Settings-Page
- [x] Default = Montag
- [x] Persistenz (localStorage)
- [x] Year View nutzt Setting
- [x] Grid-Berechnung korrekt
- [x] Weekday-Labels passen sich an
