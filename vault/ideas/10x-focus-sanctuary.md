---
type: idea
status: validated
source: 10x-analysis
effort_guess: xl
priority: p1
created: 2026-02-03
updated: 2026-02-03
tags: [10x, native, system-integration, moat]
---

# Focus Sanctuary — Systemweite Ablenkungsblockade

## Kernidee

> Während eines Partikels: Keine Notifications, keine Social Media, systemweit. Ein Klick = Fokus-Modus auf OS-Level.

## Problem

- Das eigentliche Problem ist nicht der Timer, sondern ABLENKUNG
- Particle zeigt nur Zeit, verhindert aber keine Unterbrechungen
- Andere Apps (Forest) leben nur in ihrer eigenen Sandbox

## Lösung

- Integration mit macOS Focus Mode API
- App-spezifische Blockade (Social Media, News, etc.)
- Website-Blocker für Browser
- "Sanctuary aktiviert" = alle Störungen weg
- Sanftes Ende: Notifications werden nach Partikel nachgeholt

## Validierung

### Markt/Bedarf
- [x] Screen Time ist ein Mega-Thema
- [x] Freedom, Cold Turkey existieren — aber keine Integration mit Focus-Timer
- [x] Apple hat Focus Mode eingeführt = Markt validiert

### Machbarkeit
- [ ] Benötigt Native Mac App (auf Roadmap: Phase 3)
- [ ] macOS Focus Mode API (seit Monterey)
- [ ] Screen Time API für App-Limits
- [ ] Browser-Extension für Website-Blocking

### Business Value
- [x] MOAT: Schwer zu kopieren (OS-Integration)
- [x] Echter Wert: "Particle macht mich produktiver" vs. "zeigt mir nur Zeit"
- [x] Premium-Killer-Feature
- [x] Retention: Gewohnheit + Abhängigkeit

## Notizen

- "Sanctuary" als Name passt zur Philosophie ("Raum für Fokus")
- Shortcut: `Cmd+Shift+F` = Focus Sanctuary Toggle
- Visualisierung: Der Partikel bekommt einen sanften Schutzschild
- Statistik: "Du hast diese Woche 47 Ablenkungen verhindert"

## Entscheidung

**Status:** `validated`

**Begründung:** Höchster funktionaler Mehrwert. Verwandelt Particle von "Timer mit schöner UI" zu "Tool das mich wirklich produktiver macht". Schwer zu kopieren = Moat.

**Nächster Schritt:** Nach Native Mac App (Phase 3) — aber jetzt schon planen
