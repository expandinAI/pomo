---
type: story
status: done
priority: p0
effort: 2
feature: sound-design-2
created: 2026-01-20
updated: 2026-01-26
done_date: 2026-01-26
tags: [sound, settings, ui, controls, p0]
---

# POMO-122: Sound Settings UI – Dein Klangraum

## User Story

> Als **Particle-Nutzer**
> möchte ich **meine Sound-Erfahrung individuell anpassen können**,
> damit **die Klänge zu meinem persönlichen Arbeitsflow passen**.

## Kontext

Link zum Feature: [[features/sound-design-2]]

Die Settings-UI gibt jedem die Kontrolle über seine Sound-Erfahrung. Wenige, aber durchdachte Optionen.

## Akzeptanzkriterien

### Volume Control
- [x] **Given** Sound-Settings, **When** ich den Slider sehe, **Then** kann ich die Lautstärke einstellen
- [x] **Given** der Slider, **When** ich ihn bewege, **Then** ändert sich die Lautstärke in Echtzeit
- [x] **Given** Mute-Button, **When** ich klicke, **Then** werden alle Sounds stumm geschaltet

### Sound Selection
- [x] **Given** Sound-Settings, **When** ich sie sehe, **Then** kann ich aus mehreren Sounds wählen
- [x] **Given** ich wähle einen Sound, **When** ich klicke, **Then** spielt ein Preview

### Session Complete Toggle
- [x] **Given** Sound-Settings, **When** ich sie sehe, **Then** gibt es einen Toggle für Session-Complete-Sound
- [x] **Given** Toggle aktiviert, **When** Session endet, **Then** spielt der Completion-Sound

### Persistenz
- [x] **Given** ich ändere Sound-Settings, **When** ich die App neu lade, **Then** sind meine Settings erhalten

## Implementierung

**Komponenten:**
- `src/components/settings/SoundSettings.tsx` - Settings UI
- `src/hooks/useSoundSettings.ts` - Sound Settings State
- `src/hooks/useSound.ts` - Sound Engine mit Web Audio API

**Features:**
- Volume Slider mit Prozent-Anzeige
- Mute/Unmute Toggle
- 6 verschiedene Completion Sounds (default, soft, bell, woodblock, bowl, minimal)
- Session Complete Sound Toggle
- Preview bei Sound-Auswahl
- Persistenz via localStorage

**Verfügbare Sounds:**
- Default (warm two-tone chime C5→E5)
- Soft (gentle gong with overtones)
- Bell (clear bell with harmonics)
- Woodblock (short percussive click)
- Bowl (singing bowl with slow decay)
- Minimal (short simple beep)

## Testing

### Manuell zu testen
- [x] Volume Slider ändert Lautstärke
- [x] Mute-Button funktioniert
- [x] Sound-Auswahl mit Preview
- [x] Session Complete Toggle
- [x] Settings werden nach Reload geladen
- [x] Slider fühlt sich smooth an

## Definition of Done

- [x] Settings UI Component
- [x] Volume Slider mit Mute
- [x] Sound Selection Grid
- [x] Session Complete Toggle
- [x] Preview bei Sound-Auswahl
- [x] Persistenz (localStorage)
