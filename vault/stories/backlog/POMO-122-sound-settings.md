---
type: story
status: backlog
priority: p0
effort: 2
feature: sound-design-2
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [sound, settings, ui, controls, p0]
---

# POMO-122: Sound Settings UI – Dein Klangraum

## User Story

> Als **Particle-Nutzer**
> möchte ich **meine Sound-Erfahrung individuell anpassen können**,
> damit **die Klänge zu meinem persönlichen Arbeitsflow passen**.

## Kontext

Link zum Feature: [[features/sound-design-2]]

Abhängigkeiten:
- [[stories/backlog/POMO-120-sound-engine]]
- [[stories/backlog/POMO-121-transition-chimes]]

Nicht jeder mag die gleichen Sounds. Manche wollen nur den End-Chime, andere wollen Ambient. Die Settings-UI gibt jedem die Kontrolle über seine Sound-Erfahrung. Wie bei allem in Particle: Wenige, aber durchdachte Optionen.

## Akzeptanzkriterien

### Master Controls
- [ ] **Given** die Settings-Page, **When** ich zu "Sound" scrolle, **Then** sehe ich einen Sound-Bereich
- [ ] **Given** der Sound-Bereich, **When** ich ihn sehe, **Then** gibt es einen Master On/Off Toggle
- [ ] **Given** Master Off, **When** aktiv, **Then** sind alle Sounds deaktiviert

### Volume Control
- [ ] **Given** Master On, **When** ich den Master-Slider sehe, **Then** kann ich die Gesamtlautstärke einstellen
- [ ] **Given** der Slider, **When** ich ihn bewege, **Then** ändert sich die Lautstärke in Echtzeit
- [ ] **Given** Slider auf 0, **When** ich ihn sehe, **Then** zeigt er ein Mute-Icon

### Chime Settings
- [ ] **Given** der Sound-Bereich, **When** ich ihn sehe, **Then** gibt es "Transition Chimes" mit eigenem Toggle
- [ ] **Given** Chimes On, **When** ich den Chime-Slider sehe, **Then** kann ich die Chime-Lautstärke einstellen
- [ ] **Given** ich bewege den Slider, **When** ich loslasse, **Then** spielt ein Preview-Chime

### Ambient Settings (vorbereitet)
- [ ] **Given** der Sound-Bereich, **When** Ambient implementiert ist, **Then** gibt es einen Ambient-Bereich
- [ ] **Given** vorerst, **When** ich die Settings sehe, **Then** ist Ambient als "Coming Soon" markiert

### Quick Toggle
- [ ] **Given** die Timer-View, **When** ich `M` drücke, **Then** wird Sound gemutet/unmutet
- [ ] **Given** ich mute per Shortcut, **When** ich die Settings öffne, **Then** reflektiert sie den Mute-State

### Persistenz
- [ ] **Given** ich ändere Sound-Settings, **When** ich die App neu lade, **Then** sind meine Settings erhalten

## Technische Details

### Sound Settings State

```typescript
// src/lib/sound/sound-settings.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SoundSettings {
  // Master
  masterEnabled: boolean;
  masterVolume: number;        // 0-1
  masterMuted: boolean;

  // Chimes
  chimesEnabled: boolean;
  chimeVolume: number;         // 0-1

  // Ambient (vorbereitet für POMO-123)
  ambientEnabled: boolean;
  ambientVolume: number;       // 0-1
  ambientSound: string | null; // ID des aktuellen Ambient-Sounds
}

interface SoundSettingsStore extends SoundSettings {
  setMasterEnabled: (enabled: boolean) => void;
  setMasterVolume: (volume: number) => void;
  toggleMute: () => void;
  setChimesEnabled: (enabled: boolean) => void;
  setChimeVolume: (volume: number) => void;
  setAmbientEnabled: (enabled: boolean) => void;
  setAmbientVolume: (volume: number) => void;
  setAmbientSound: (soundId: string | null) => void;
}

export const useSoundSettings = create<SoundSettingsStore>()(
  persist(
    (set, get) => ({
      // Defaults
      masterEnabled: true,
      masterVolume: 0.7,
      masterMuted: false,
      chimesEnabled: true,
      chimeVolume: 0.7,
      ambientEnabled: false,
      ambientVolume: 0.5,
      ambientSound: null,

      // Actions
      setMasterEnabled: (enabled) => set({ masterEnabled: enabled }),
      setMasterVolume: (volume) => set({ masterVolume: volume }),
      toggleMute: () => set((state) => ({ masterMuted: !state.masterMuted })),
      setChimesEnabled: (enabled) => set({ chimesEnabled: enabled }),
      setChimeVolume: (volume) => set({ chimeVolume: volume }),
      setAmbientEnabled: (enabled) => set({ ambientEnabled: enabled }),
      setAmbientVolume: (volume) => set({ ambientVolume: volume }),
      setAmbientSound: (soundId) => set({ ambientSound: soundId }),
    }),
    {
      name: 'particle-sound-settings',
    }
  )
);
```

### Sound Settings UI Component

```typescript
// src/components/settings/SoundSettings.tsx

import { useSoundSettings } from '@/lib/sound/sound-settings';
import { getChimeService } from '@/lib/sound/chime-service';
import { useCallback, useRef } from 'react';

export function SoundSettings() {
  const {
    masterEnabled,
    masterVolume,
    masterMuted,
    chimesEnabled,
    chimeVolume,
    setMasterEnabled,
    setMasterVolume,
    toggleMute,
    setChimesEnabled,
    setChimeVolume,
  } = useSoundSettings();

  const previewTimeoutRef = useRef<NodeJS.Timeout>();

  // Preview Chime beim Slider-Release
  const handleChimeVolumeChange = useCallback((volume: number) => {
    setChimeVolume(volume);

    // Debounce preview
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    previewTimeoutRef.current = setTimeout(() => {
      getChimeService().play('session-end');
    }, 300);
  }, [setChimeVolume]);

  return (
    <div className="settings-section">
      <h2 className="settings-section-title">Sound</h2>

      {/* Master Toggle */}
      <div className="setting-row">
        <div className="setting-label">
          <span className="setting-title">Sound aktiviert</span>
          <span className="setting-description">
            Alle Sounds ein- oder ausschalten
          </span>
        </div>
        <Toggle
          checked={masterEnabled}
          onChange={setMasterEnabled}
        />
      </div>

      {masterEnabled && (
        <>
          {/* Master Volume */}
          <div className="setting-row">
            <div className="setting-label">
              <span className="setting-title">Lautstärke</span>
            </div>
            <div className="setting-control volume-control">
              <button
                className="mute-button"
                onClick={toggleMute}
                aria-label={masterMuted ? 'Unmute' : 'Mute'}
              >
                {masterMuted ? <VolumeX /> : <Volume2 />}
              </button>
              <Slider
                value={masterMuted ? 0 : masterVolume}
                onChange={setMasterVolume}
                min={0}
                max={1}
                step={0.05}
                disabled={masterMuted}
              />
            </div>
          </div>

          <div className="setting-divider" />

          {/* Chimes */}
          <div className="setting-row">
            <div className="setting-label">
              <span className="setting-title">Transition Chimes</span>
              <span className="setting-description">
                Klänge bei Session-Start, -Ende und Pausen
              </span>
            </div>
            <Toggle
              checked={chimesEnabled}
              onChange={setChimesEnabled}
            />
          </div>

          {chimesEnabled && (
            <div className="setting-row nested">
              <div className="setting-label">
                <span className="setting-title">Chime-Lautstärke</span>
              </div>
              <Slider
                value={chimeVolume}
                onChange={handleChimeVolumeChange}
                min={0}
                max={1}
                step={0.05}
              />
            </div>
          )}

          <div className="setting-divider" />

          {/* Ambient (Coming Soon) */}
          <div className="setting-row disabled">
            <div className="setting-label">
              <span className="setting-title">
                Ambient Sounds
                <span className="coming-soon-badge">Coming Soon</span>
              </span>
              <span className="setting-description">
                Hintergrundklänge für tieferen Fokus
              </span>
            </div>
            <Toggle
              checked={false}
              disabled
            />
          </div>
        </>
      )}
    </div>
  );
}
```

### Volume Slider Component

```typescript
// src/components/ui/Slider.tsx

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  disabled = false,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('slider', disabled && 'disabled')}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="slider-input"
        style={{
          '--slider-progress': `${percentage}%`,
        } as React.CSSProperties}
      />
    </div>
  );
}
```

### Slider Styling

```css
/* src/components/ui/slider.css */

.slider {
  width: 120px;
  height: 24px;
  display: flex;
  align-items: center;
}

.slider-input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.8) var(--slider-progress),
    rgba(255, 255, 255, 0.2) var(--slider-progress),
    rgba(255, 255, 255, 0.2) 100%
  );
  cursor: pointer;
  transition: background 0.1s;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  transition: transform 0.1s;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider-input::-webkit-slider-thumb:active {
  transform: scale(0.95);
}

.slider.disabled .slider-input {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider.disabled .slider-input::-webkit-slider-thumb {
  background: rgba(255, 255, 255, 0.5);
}
```

### Keyboard Shortcut

```typescript
// src/hooks/use-keyboard-shortcuts.ts (erweitert)

import { useSoundSettings } from '@/lib/sound/sound-settings';

// In der Shortcuts-Definition
{
  key: 'm',
  description: 'Mute/Unmute Sounds',
  action: () => {
    useSoundSettings.getState().toggleMute();
  },
}
```

### Betroffene Dateien

```
src/
├── lib/
│   └── sound/
│       └── sound-settings.ts    # Zustand Store
├── components/
│   ├── settings/
│   │   └── SoundSettings.tsx    # Settings UI
│   └── ui/
│       └── Slider.tsx           # Volume Slider
│       └── slider.css
└── hooks/
    └── use-keyboard-shortcuts.ts  # M für Mute
```

## UI/UX

### Sound Settings Bereich

```
┌───────────────────────────────────────────────────────────────────┐
│  Sound                                                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Sound aktiviert                                      [●      ]   │
│  Alle Sounds ein- oder ausschalten                    ↑ On        │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  Lautstärke                              🔊 ────●───────────      │
│                                               ↑ 70%               │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  Transition Chimes                                    [●      ]   │
│  Klänge bei Session-Start, -Ende und Pausen                      │
│                                                                   │
│    Chime-Lautstärke                      ────●───────────        │
│                                               ↑ 70%               │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  Ambient Sounds                        [Coming Soon] [      ○]   │
│  Hintergrundklänge für tieferen Fokus               ↑ Disabled   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### States

**Sound Off:**
```
│  Sound aktiviert                                      [      ○]   │
│  Alle Sounds ein- oder ausschalten                               │
│                                                                   │
│  (Keine weiteren Optionen sichtbar)                              │
```

**Sound Muted:**
```
│  Lautstärke                              🔇 ────○───────────      │
│                                          ↑ Muted (grayed out)    │
```

### Keyboard Hint

Im Timer-View, diskret angezeigt:
```
                Press M to mute
                     ↑
              (nur bei Hover oder initial)
```

## Testing

### Manuell zu testen
- [ ] Master Toggle schaltet alle Sounds
- [ ] Master Volume ändert Lautstärke
- [ ] Mute-Button funktioniert
- [ ] Chimes Toggle funktioniert
- [ ] Chime Volume mit Preview
- [ ] `M` Shortcut mutet/unmutet
- [ ] Settings werden nach Reload geladen
- [ ] Slider fühlt sich smooth an

### Automatisierte Tests

```typescript
describe('SoundSettings', () => {
  beforeEach(() => {
    useSoundSettings.setState({
      masterEnabled: true,
      masterVolume: 0.7,
      masterMuted: false,
      chimesEnabled: true,
      chimeVolume: 0.7,
    });
  });

  it('toggles master sound', async () => {
    render(<SoundSettings />);

    const toggle = screen.getByRole('switch', { name: /Sound aktiviert/i });
    fireEvent.click(toggle);

    expect(useSoundSettings.getState().masterEnabled).toBe(false);
  });

  it('hides controls when master is off', () => {
    useSoundSettings.setState({ masterEnabled: false });
    render(<SoundSettings />);

    expect(screen.queryByText(/Lautstärke/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Transition Chimes/)).not.toBeInTheDocument();
  });

  it('plays preview chime after volume change', async () => {
    const mockPlay = jest.fn();
    jest.spyOn(getChimeService(), 'play').mockImplementation(mockPlay);

    render(<SoundSettings />);

    const slider = screen.getByRole('slider', { name: /Chime-Lautstärke/i });
    fireEvent.change(slider, { target: { value: '0.5' } });

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalledWith('session-end');
    }, { timeout: 500 });
  });

  it('persists settings to localStorage', () => {
    render(<SoundSettings />);

    const toggle = screen.getByRole('switch', { name: /Transition Chimes/i });
    fireEvent.click(toggle);

    const stored = localStorage.getItem('particle-sound-settings');
    expect(JSON.parse(stored!).state.chimesEnabled).toBe(false);
  });
});

describe('Mute Shortcut', () => {
  it('toggles mute with M key', () => {
    render(<TimerView />);

    fireEvent.keyDown(document, { key: 'm' });

    expect(useSoundSettings.getState().masterMuted).toBe(true);
  });
});
```

## Definition of Done

- [ ] Sound Settings Store (Zustand + persist)
- [ ] Settings UI Component
- [ ] Master Toggle
- [ ] Master Volume Slider mit Mute
- [ ] Chimes Toggle + Volume
- [ ] Ambient "Coming Soon" Placeholder
- [ ] `M` Keyboard Shortcut für Mute
- [ ] Slider mit visuellem Feedback
- [ ] Preview-Sound bei Chime-Volume-Change
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**UX-Prinzipien:**
- Wenige Optionen, aber die richtigen
- Sofortiges Feedback (Preview-Sound)
- Visuelle Konsistenz mit Rest der App
- Keyboard-Shortcut für häufigste Aktion (Mute)

**Spätere Erweiterungen:**
- Per-Chime Volume Control
- Sound-Auswahl (verschiedene Chime-Sets)
- Scheduled Mute (nachts automatisch)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
