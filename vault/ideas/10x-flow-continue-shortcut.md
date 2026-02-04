---
type: idea
status: validated
source: 10x-analysis
effort_guess: s
priority: p1
created: 2026-02-03
updated: 2026-02-03
tags: [10x, quick-win, keyboard, flow]
---

# Flow Continue Shortcut — Space zum Weitermachen

## Kernidee

> Wenn Timer endet während Overflow: `Space` = "Weitermachen" direkt, ohne Modal oder Celebration-Unterbrechung.

## Problem

- Timer endet, Celebration-Animation startet
- Power-User im Flow werden unterbrochen
- Muss durch Modal klicken um weiterzumachen

## Lösung

- **Im Overflow:** `Space` = Sofort weiter (neue Session)
- **Skip Celebration:** Für Power-User die im Flow sind
- **Alternative:** `Enter` für "Done" (wie jetzt)
- **Visual:** Kleiner Hint "Space = Weiter"

## Validierung

### Markt/Bedarf
- [x] Power-User wollen keine Unterbrechung
- [x] Flow-State soll nicht gebrochen werden
- [x] Keyboard-first Philosophie

### Machbarkeit
- [x] Shortcut-Handler anpassen
- [x] Skip-Logic für Celebration
- [x] 30 Minuten Implementierung

### Business Value
- [x] Power-User-Feature
- [x] "Particle respektiert meinen Flow"
- [x] UX-Polish

## Notizen

- Nur im Overflow-Modus verfügbar
- Celebration wird übersprungen, Session wird gespeichert
- Neue Session startet sofort
- Feedback: Kurzer Toast "Weiter im Flow..."

## Entscheidung

**Status:** `validated`

**Begründung:** Respektiert Flow-State. Minimaler Aufwand, großer UX-Gewinn für Power-User.

**Nächster Schritt:** Direkt implementieren (30 Minuten)
