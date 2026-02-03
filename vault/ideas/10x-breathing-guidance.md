---
type: idea
status: validated
source: 10x-analysis
effort_guess: s
priority: p1
created: 2026-02-03
updated: 2026-02-03
tags: [10x, quick-win, wellbeing, break]
---

# Breathing Guidance — Atemübung in Pausen

## Kernidee

> Statt nur "Break" anzuzeigen: Einfache Atemübung (4-7-8 oder Box Breathing) als optionaler Modus während der Pause.

## Problem

- Pausen werden oft nicht gut genutzt
- User scrollen durch Social Media statt zu erholen
- Keine aktive Erholung

## Lösung

- **Break-Modus:** "Breathing" als Option neben normalem Break
- **Visualisierung:** Der Partikel atmet mit dir (pulsiert im Rhythmus)
- **Timing:** 4-7-8 oder Box Breathing (einstellbar)
- **Anleitung:** Sanfte Text-Hinweise ("Einatmen... Halten... Ausatmen...")

## Validierung

### Markt/Bedarf
- [x] Wissenschaftlich: Reduziert Cortisol, verbessert Fokus
- [x] Headspace/Calm beweisen den Markt
- [x] Passt zur "Calm over Anxiety" Philosophie

### Machbarkeit
- [x] Breathing-Animation existiert bereits!
- [x] Nur Text + Timing hinzufügen
- [x] Settings: An/Aus Toggle
- [x] Minimaler Aufwand

### Business Value
- [x] Differenzierung: Timer + Wellness
- [x] "Particle kümmert sich um mich"
- [x] Premium-Feature (oder Free?)
- [x] Wissenschaftlich fundiert = Marketing

## Notizen

- Breathing-Patterns:
  - 4-7-8 (Entspannung): 4s ein, 7s halten, 8s aus
  - Box Breathing (Fokus): 4s ein, 4s halten, 4s aus, 4s halten
- Animation: Der Partikel wird größer (einatmen) und kleiner (ausatmen)
- Sound: Optional sanfter Ambient-Sound
- Skip: "Space" um Breathing zu überspringen

## Entscheidung

**Status:** `validated`

**Begründung:** Animation existiert, nur Logic fehlt. Wissenschaftlich fundiert, passt zur Philosophie. Perfect Quick Win.

**Nächster Schritt:** Direkt implementieren (halber Tag)

---

## 10x-Erkenntnis (2026-02-03)

**Problem erkannt:** Die Breathing-Animation existiert bereits, aber niemand bemerkt sie! Der Timer pulsiert subtil – ohne Text weiß der User nicht, wann er ein- oder ausatmen soll.

**10x-Lösung:** Text-Guidance via **bestehende StatusMessage**. Kein neues UI nötig.

```
Einatmen · · · 4
Halten · · · 3
Ausatmen · · · 2
```

Von "Der Timer zittert irgendwie?" zu "Particle hat geführte Atemübungen!"

**Implementation:** Nur 3 Dateien:
- `useBreathingGuide.ts` (NEU) - Phase-Tracking
- `StatusMessage.tsx` - Neuer Prop
- `Timer.tsx` - Hook einbinden

Siehe POMO-337 für Details.
