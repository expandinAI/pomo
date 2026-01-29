---
type: story
status: icebox
priority: p2
effort: 2
feature: sounds
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [sounds, ambient, ux]
---

# POMO-137: Phase-based Ambient Sounds

## User Story

> Als **Nutzer, der Ambient Sounds liebt**
> möchte ich **unterschiedliche Sounds für Work vs. Break**,
> damit ich **akustisch spüre, in welcher Phase ich bin**.

## Kontext

Work = Fokus-Sound (z.B. Brown Noise, Lo-Fi). Break = Entspannungs-Sound (z.B. Waves, Birds). Der Wechsel des Sounds signalisiert den Phasenwechsel subtil, ohne invasive Notifications.

**Particle-Philosophie:** Der Sound-Wechsel ist ein sanfter Nudge, kein Alarm. Crossfade zwischen den Phasen, nie abrupt.

## Akzeptanzkriterien

- [ ] **Given** Phase-Sounds aktiviert, **When** Work → Break, **Then** Sound crossfadet zu Break-Sound
- [ ] **Given** Phase-Sounds aktiviert, **When** Break → Work, **Then** Sound crossfadet zu Work-Sound
- [ ] **Given** Work-Sound = "Brown Noise", Break-Sound = "Off", **When** Break startet, **Then** Stille (fade out)
- [ ] **Given** beide Sounds = "Rain", **When** Phasenwechsel, **Then** kein Wechsel (gleicher Sound)
- [ ] **Given** Ambient global off, **When** jede Phase, **Then** keine Sounds (Override)
- [ ] **Given** Settings offen, **When** ich Work/Break Sound ändere, **Then** sofortige Preview

## Technische Details

### Betroffene Dateien
```
src/
├── components/settings/
│   └── AmbientSettings.tsx   # Erweitern mit Phase-Selection
├── contexts/
│   └── TimerSettingsContext.tsx # workAmbient, breakAmbient State
├── hooks/
│   └── useAmbientSound.ts    # Phase-aware Sound-Wechsel
└── lib/
    └── ambientGenerators.ts  # Crossfade-Logik (bereits vorhanden)
```

### Implementierungshinweise

1. **State-Erweiterung:**
```typescript
// TimerSettingsContext
interface AmbientSettings {
  workSound: AmbientType | 'off';
  breakSound: AmbientType | 'off';
  volume: number;
  enabled: boolean;
}
```

2. **Crossfade:** Bereits implementiert für Loop-Seamless. Erweitern für Sound-Wechsel:
   - Fade-out aktuellen Sound (500ms)
   - Fade-in neuen Sound (500ms)
   - Overlap für smoothen Übergang

3. **Phase-Detection:** `useAmbientSound` bekommt `mode: 'work' | 'break'` prop

### useAmbientSound Erweiterung
```typescript
function useAmbientSound(
  mode: SessionType,
  isRunning: boolean
) {
  const { workSound, breakSound, volume, enabled } = useAmbientSettings();

  const currentSound = mode === 'work' ? workSound : breakSound;

  useEffect(() => {
    if (!enabled || currentSound === 'off') {
      fadeOutAndStop();
      return;
    }

    if (isRunning) {
      crossfadeTo(currentSound);
    } else {
      fadeOutAndStop();
    }
  }, [currentSound, isRunning, enabled]);
}
```

## UI/UX

### Settings UI (Erweitert)
```
┌─────────────────────────────────────┐
│ Ambient Sounds                      │
│                                     │
│ Volume  ━━━━━━━●━━━━  70%           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Work Session                    │ │
│ │ [Brown Noise ▾]                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Break                           │ │
│ │ [Ocean Waves ▾]                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [A] to cycle sounds                 │
└─────────────────────────────────────┘
```

### Sound Options
```
Work Sounds:          Break Sounds:
○ Off                 ○ Off
● Brown Noise         ○ Brown Noise
○ White Noise         ○ White Noise
○ Rain                ● Ocean Waves
○ Forest              ○ Forest
○ Café                ○ Café
                      ○ Birds (NEU?)
```

### Keyboard Shortcut
- **A** (aktuell): Cycles durch alle Sounds für aktuelle Phase
- **Shift+A** (neu): Cycle nur für die andere Phase (Preview)

## Testing

### Manuell zu testen
- [ ] Work = Brown Noise, Break = Ocean → Sound wechselt bei Phasenübergang
- [ ] Work = Rain, Break = Rain → Kein Wechsel (gleich)
- [ ] Work = Rain, Break = Off → Fade-out bei Break-Start
- [ ] Ambient global disabled → Keine Sounds egal welche Phase
- [ ] A-Taste während Work → Cycled Work-Sounds
- [ ] A-Taste während Break → Cycled Break-Sounds
- [ ] Crossfade smooth (kein Klick/Pop)

## Definition of Done

- [ ] State-Erweiterung (workSound, breakSound)
- [ ] Settings UI mit zwei Dropdowns
- [ ] Crossfade bei Phasenwechsel
- [ ] A-Taste phase-aware
- [ ] localStorage Persistenz
- [ ] Beide Themes getestet

## Notizen

**Migration:** Bisherige `ambientType` Setting → `workSound`. `breakSound` default = `workSound` (für Backward Compatibility).

**Sound-Empfehlungen:**
- **Work:** Brown Noise, Rain, Café (aktivierend)
- **Break:** Ocean, Forest, Birds (entspannend)

**Future Enhancement:**
- Custom Sound-Upload
- Spotify/Apple Music Integration
- AI-selected Sounds basierend auf Tageszeit

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
