---
type: idea
status: validated
source: 10x-analysis
effort_guess: m
priority: p2
created: 2026-02-03
updated: 2026-02-03
tags: [10x, personalization, adaptive, ml-light]
---

# Smart Session Length — Der Timer passt sich dir an

## Kernidee

> Statt feste 25 Minuten lernt Particle deine optimale Session-Länge. "Für Deep Work brauchst du 45min. Für Admin reichen 15min."

## Problem

- 25 Minuten Pomodoro ist nicht für jeden optimal
- Manche brauchen 45min für Flow, andere 15min
- User müssen manuell Presets anpassen

## Lösung

- **Analyse:** Overflow-Daten zeigen echte Präferenzen
- **Vorschläge:** "Bei 'Design' arbeitest du meist 40min. Soll ich das Preset anpassen?"
- **Task-basiert:** Verschiedene Längen je nach Task-Typ
- **Coach-Integration:** "Ich habe bemerkt, dass du bei Deep Work länger brauchst..."

## Validierung

### Markt/Bedarf
- [x] "Pomodoro funktioniert nicht für mich" ist häufige Kritik
- [x] Personalisierung ist Premium-Erwartung
- [x] Daten existieren (Overflow = echte Präferenz)

### Machbarkeit
- [x] Overflow-Daten existieren
- [x] Einfache Statistik (Durchschnitt pro Task-Typ)
- [ ] UI für Vorschläge
- [ ] Opt-in: User muss zustimmen

### Business Value
- [x] "Particle kennt mich" Gefühl
- [x] Weniger Session-Abbrüche
- [x] Power-User-Feature (Premium)
- [x] Differenzierung von starren Timer-Apps

## Notizen

- Kein ML nötig, einfache Statistik reicht:
  - Median Overflow pro Task-Kategorie
  - Wenn Overflow > 10min in >50% der Sessions → Vorschlag
- UI: Toast oder Coach-Insight
- "Möchtest du für 'Deep Work' auf 45min wechseln?"
- History: "Deine Session-Länge hat sich entwickelt..."

## Entscheidung

**Status:** `validated`

**Begründung:** Gute Differenzierung, nutzt existierende Daten. Personalisierung als Premium-Feature.

**Nächster Schritt:** Nach Core-Features, dann als Coach-Insight einführen
