---
type: idea
status: validated
source: 10x-analysis
effort_guess: s
priority: p1
created: 2026-02-03
updated: 2026-02-03
tags: [10x, quick-win, freelancer, keyboard]
---

# Quick Export Shortcut — Cmd+E für sofortigen Export

## Kernidee

> `Cmd+E` → Exportiert aktuelle Woche als CSV. Keine Menüs, keine Clicks. Keyboard-first.

## Problem

- Export existiert, aber erfordert mehrere Schritte
- Freelancer brauchen wöchentlichen Export für Rechnungen
- Nicht keyboard-first

## Lösung

- **Shortcut:** `Cmd+E` (oder `G E` im Particle-Style)
- **Default:** Aktuelle Woche als CSV
- **Optional:** Mit Modifier: `Shift+Cmd+E` für Monat
- **Feedback:** Toast "Exportiert: KW 5, 12.5h"

## Validierung

### Markt/Bedarf
- [x] Freelancer = Kernzielgruppe (Roadmap: Invoicing)
- [x] Wöchentlicher Export ist Standard-Workflow
- [x] Keyboard-first ist Particle-Philosophie

### Machbarkeit
- [x] Export-Funktion existiert bereits
- [x] Nur Shortcut hinzufügen
- [x] 30 Minuten Implementierung

### Business Value
- [x] Freelancer-Killer-Feature
- [x] "Particle versteht meinen Workflow"
- [x] Differenzierung durch UX-Details
- [x] Quick Win

## Notizen

- Format: CSV (wie aktuell)
- Filename: `particle-export-2026-W05.csv`
- Spalten: Datum, Start, Ende, Dauer, Task, Projekt
- Später: PDF-Export für Rechnungen (Phase 4)

## Entscheidung

**Status:** `validated`

**Begründung:** Existierende Funktion + ein Shortcut = sofortiger Wert für Freelancer. Perfekter Quick Win.

**Nächster Schritt:** Direkt implementieren (30 Minuten)
