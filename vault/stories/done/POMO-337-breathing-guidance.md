---
type: story
status: done
priority: p1
effort: 2
feature: "[[ideas/10x-breathing-guidance]]"
created: 2026-02-03
updated: 2026-02-03
done_date: 2026-02-03
tags: [10x, quick-win, wellbeing, break, breathing]
---

# POMO-337: Breathing Text-Guidance in Pausen

## User Story

> Als **Wissensarbeiter in der Pause**
> möchte ich **geführte Atemanweisungen sehen**,
> damit **ich die Breathing-Animation aktiv nutzen kann statt sie zu übersehen**.

## Kontext

**Problem:**
Break Breathing existiert bereits (Setting + Animation), aber niemand bemerkt es. Der Timer pulsiert subtil – ohne Text weiß der User nicht, wann er ein- oder ausatmen soll.

**Lösung:**
Text-Guidance via **bestehende StatusMessage**. Kein neues UI, nur ein neuer Prop.

**10x-Faktor:**
Von "Der Timer zittert irgendwie?" zu "Oh, Particle hat geführte Atemübungen!". Macht ein verstecktes Feature zum Killer-Feature.

## Akzeptanzkriterien

### Text-Guidance

- [x] **Given** Break läuft + Breathing aktiviert, **When** Inhale-Phase, **Then** StatusMessage zeigt "Einatmen · · · 4"
- [x] **Given** Break läuft + Breathing aktiviert, **When** Hold-Phase, **Then** StatusMessage zeigt "Halten · · · 3"
- [x] **Given** Break läuft + Breathing aktiviert, **When** Exhale-Phase, **Then** StatusMessage zeigt "Ausatmen · · · 2"
- [x] Countdown zählt von 4 → 1 pro Phase (Box Breathing: 4s pro Phase)
- [x] Text-Übergang ist sanft (breathing opacity animation), kein hartes Springen

### Priorität

- [x] **Given** Break + Breathing aktiv, **Then** Breathing-Text hat höchste Priorität (vor Wellbeing Hints)
- [x] **Given** Break + Breathing NICHT aktiv, **Then** Wellbeing Hints erscheinen wie gewohnt
- [x] **Given** Break pausiert, **Then** Breathing-Text pausiert auch

### Bestehende Features

- [x] Animation bleibt unverändert (16s Box Breathing Cycle)
- [x] Settings Toggle bleibt unverändert
- [x] Breathing stoppt wenn Break endet

## Implementierung

### Dateien

| Datei | Änderung |
|-------|----------|
| `src/hooks/useBreathingGuide.ts` | **NEU:** Phase-Tracking Hook |
| `src/components/timer/Timer.tsx` | Hook einbinden, Prop weiterreichen |
| `src/components/timer/StatusMessage.tsx` | `breathingPhase` Prop + Priority + Breathing Opacity Animation |

### Besonderheiten

**Breathing Opacity Animation:**
- Text "atmet" mit dem User (Opacity pulsiert 0.5 → 1.0 → 0.5)
- Einatmen/Hold-in: Opacity → 1.0 (hell)
- Ausatmen/Hold-out: Opacity → 0.5 (gedimmt)
- Kein `repeat: Infinity` Loop – Opacity wird aus Phase abgeleitet
- Sauberer Exit beim Übergang zur Work-Session

## Definition of Done

- [x] `useBreathingGuide` Hook implementiert
- [x] StatusMessage zeigt Breathing-Phase
- [x] Animation und Text sind synchron
- [x] Priorität korrekt (über Wellbeing Hints)
- [x] TypeScript-Typen korrekt
- [x] Lint & Typecheck grün
- [x] Breathing Opacity Animation implementiert
- [x] Sauberer Exit bei Session-Wechsel

---

## Arbeitsverlauf

### Gestartet: 2026-02-03
### Erledigt: 2026-02-03
