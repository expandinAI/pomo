---
type: idea
status: validated
source: 10x-analysis
effort_guess: m
priority: p1
created: 2026-02-03
updated: 2026-02-03
tags: [10x, coach, flow, insight]
---

# Flow State Detection — Der Coach erkennt Flow

## Kernidee

> Wenn jemand lange über die Session-Zeit hinaus arbeitet (Overflow), erkennt die App das als Flow-State und feiert es besonders.

## Problem

- Flow-State ist das eigentliche Ziel, nicht "25 Minuten arbeiten"
- Aktuell: Overflow wird geloggt, aber nicht gewürdigt
- Coach spricht nicht über die wirklich bedeutsamen Momente

## Lösung

- **Flow-Erkennung:** Overflow > 10 Minuten = potentieller Flow
- **Flow-Badge:** Besondere Markierung auf Partikeln die Flow waren
- **Coach-Integration:**
  - "Du warst 47 Minuten im Flow. Das passiert dir im Schnitt 2x pro Woche."
  - "Dein längster Flow diese Woche: 1h 23min an 'Website Redesign'"
- **Flow-Statistik:** Separater Insight-Bereich für Flow-Momente
- **Celebration:** Besondere Animation wenn Flow endet

## Validierung

### Markt/Bedarf
- [x] "Flow State" ist ein bekanntes Konzept (Csikszentmihalyi)
- [x] Menschen wollen wissen wann sie "im Flow" waren
- [x] Keine andere Timer-App trackt/feiert Flow explizit

### Machbarkeit
- [x] Overflow-Tracking existiert bereits!
- [x] Daten sind da, nur UI/Coach fehlt
- [x] Coach-Prompt anpassen
- [x] Minimaler Backend-Aufwand

### Business Value
- [x] Differenzierung von starren Pomodoro-Apps
- [x] "Particle versteht mich" Gefühl
- [x] Flow-Insights als Premium-Feature
- [x] Wissenschaftlich fundiert = Marketing-Material

## Notizen

- Flow-Definition: Overflow > 10min ODER manuelle Markierung
- Flow-Partikel: Leicht größer/heller in Year View
- Coach-Phrasen:
  - "Das war echter Flow. 52 Minuten ohne Unterbrechung."
  - "Du erreichst Flow am häufigsten vormittags."
  - "Bei 'Deep Work' Tasks erreichst du 3x öfter Flow als bei 'Admin'."

## Entscheidung

**Status:** `validated`

**Begründung:** Daten existieren bereits (Overflow). Sehr geringer Aufwand für hohe emotionale Wirkung. Passt perfekt zur Coach-Philosophie.

**Nächster Schritt:** Coach-Prompt erweitern, Flow-Badge in UI
