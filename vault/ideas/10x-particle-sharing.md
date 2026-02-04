---
type: idea
status: validated
source: 10x-analysis
effort_guess: m
priority: p1
created: 2026-02-03
updated: 2026-02-03
tags: [10x, viral, growth, sharing]
---

# Particle Sharing — Einzelne Momente teilen

## Kernidee

> Ein einzelner Partikel wird zu einem schönen, teilbaren Bild. "Ich habe gerade 2 Stunden an meinem Roman gearbeitet."

## Problem

- Kein virales Element in Particle
- Menschen wollen Erfolge teilen
- Forest-User posten ihre Bäume — wir haben nichts Vergleichbares

## Lösung

- "Share" Button auf jedem Partikel (ParticleDetailOverlay)
- Generiert schönes Bild mit:
  - Partikel-Visualisierung (der weiße Punkt, groß)
  - Dauer + Task (optional)
  - Projekt (optional)
  - Datum/Zeit
  - Particle-Branding (dezent)
- Export als PNG für Instagram/Twitter
- Optional: Direktes Teilen zu Plattformen

## Validierung

### Markt/Bedarf
- [x] Forest-User teilen ihre Bäume ständig
- [x] "Accountability Posts" sind auf Twitter/LinkedIn beliebt
- [x] Jeder geteilte Post = kostenlose Werbung

### Machbarkeit
- [x] Canvas API für Bildgenerierung
- [x] Daten existieren (Session-Details)
- [x] Kein Backend nötig (Client-Side Export)
- [ ] Design: Schönes Template das "Particle" schreit

### Business Value
- [x] Organisches Wachstum ohne Marketing-Budget
- [x] Brand-Awareness: "Was ist dieses Particle?"
- [x] User-Generated Content
- [x] Niedriger Aufwand, hoher Hebel

## Notizen

- Templates:
  - Instagram Story (9:16)
  - Twitter/LinkedIn Post (1:1)
  - Desktop Wallpaper (16:9)
- Personalisierung: Light/Dark Mode Export
- Wasserzeichen: Subtiles Particle-Logo + URL
- "Mein Jahr in Partikeln" — Jahresrückblick als teilbare Grafik

## Entscheidung

**Status:** `validated`

**Begründung:** Bestes Aufwand-zu-Wirkung-Verhältnis aller 10x-Features. Medium Effort, aber potentiell virales Wachstum.

**Nächster Schritt:** Design-Templates erstellen, dann implementieren
