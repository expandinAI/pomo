---
type: idea
status: validated
source: 10x-analysis
effort_guess: xl
priority: p1
created: 2026-02-03
updated: 2026-02-03
tags: [10x, visualization, emotional, differentiator]
---

# Particle Legacy — Dein Lebenswerk als Galaxie

## Kernidee

> Alle Partikel aller Zeiten als interaktive 3D-Galaxie. Zoom rein = einzelne Sessions. Zoom raus = Jahre deiner Arbeit als Universum.

## Problem

- Die Vision spricht von "Die Arbeit eines Lebens besteht aus vielen Partikeln" — aber man sieht nur ein Jahr
- Year View ist 2D und funktional, aber nicht emotional
- Keine App zeigt das Lebenswerk so, dass man stolz drauf sein kann

## Lösung

- 3D-Sternenhimmel mit WebGL/Three.js
- Partikel gruppieren sich zu Konstellationen (nach Projekten)
- Zeitnavigation: Zoom = Zeit (raus = Jahre, rein = Tage)
- "Reise durch dein Lebenswerk" — Pan & Zoom
- Export als hochauflösendes Bild/Poster

## Validierung

### Markt/Bedarf
- [x] Emotional differenzierend — keine andere App macht das
- [x] "GitHub Contribution Graph" ist viral — das hier ist 100x besser
- [x] Forest hat Bäume, wir haben GALAXIEN

### Machbarkeit
- [ ] Three.js/WebGL für 3D-Rendering
- [ ] Performance bei 10.000+ Partikeln prüfen (LOD, Instancing)
- [ ] Datenmodell existiert (alle Sessions)
- [ ] Abhängigkeit: Performante Session-Queries

### Business Value
- [x] EXTREM differenzierend — Alleinstellungsmerkmal
- [x] Shareability = organisches Wachstum
- [x] Premium-Feature (Flow-only)
- [x] "Poster deines Lebenswerks" = physisches Produkt

## Notizen

- Inspiration: GitHub Skyline, Spotify Wrapped, Apple Music Replay
- Konstellationen könnten Projekt-Namen tragen
- Besondere Partikel (Flow-States, Meilensteine) leuchten heller
- Sound-Design: Ambient Space-Sounds beim Navigieren

## Entscheidung

**Status:** `validated`

**Begründung:** Das IST die Vision. "Die Arbeit eines Lebens besteht aus vielen Partikeln" wird erst hier wirklich sichtbar. Höchster Differenzierungswert aller Features.

**Nächster Schritt:** Technical Spike für Three.js Performance
