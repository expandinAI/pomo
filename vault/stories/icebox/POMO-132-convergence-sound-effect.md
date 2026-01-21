---
type: story
status: icebox
priority: p2
effort: 3
feature: ambient-effects
created: 2025-01-21
updated: 2025-01-21
done_date: null
tags: [sound, celebration, emotional-design]
depends_on: [POMO-131]
---

# POMO-132: Convergence Sound Effect

## User Story

> Als **Nutzer, dessen Partikel gerade konvergieren**,
> möchte ich **einen subtilen, befriedigenden Sound hören, wenn die Partikel im Container "einschlagen"**,
> damit **der magische Moment auch akustisch erlebbar wird**.

## Kontext

Abhängig von: [[POMO-131-particle-convergence-animation]]

Die Convergence-Animation braucht einen akustischen Payoff. Der Sound sollte:
- Subtil sein (nicht erschrecken)
- Premium klingen (nicht cheap/gamey)
- Zum Glow-Effekt synchron sein
- Optional: leises "Woosh" während des Flugs

## Akzeptanzkriterien

- [ ] **Given** Convergence-Animation endet, **When** Partikel den Container erreichen, **Then** spielt ein "Collect"-Sound
- [ ] **Given** Sound-Einstellungen auf Mute, **When** Convergence endet, **Then** kein Sound
- [ ] **Given** User hat eigene Sounds konfiguriert, **When** Convergence, **Then** nutze Custom-Sound falls vorhanden

## Sound-Konzept

**Impact-Sound:**
- Kurz (< 500ms)
- Weich, nicht harsh
- Tiefe Frequenzen (Gewicht/Substanz)
- Leichter Hall (Räumlichkeit)
- Inspiration: iOS "sent message" whoosh + subtle chime

**Optional - Woosh während Flug:**
- Sehr leise
- Pitch steigt leicht an (Beschleunigung)
- Endet mit Impact-Sound

## Notizen

- Muss mit bestehendem Sound-System (`useSound`) integriert werden
- Respektiert globale Mute-Einstellung
- Evtl. eigener Sound-Slot in Settings?
