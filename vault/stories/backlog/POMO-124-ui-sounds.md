---
type: story
status: backlog
priority: p2
effort: 2
feature: sound-design-2
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [sound, ui, interaction, feedback, p2]
---

# POMO-124: UI Interaction Sounds – Das taktile Feedback

## User Story

> Als **Particle-Nutzer**
> möchte ich **bei Interaktionen dezentes akustisches Feedback hören**,
> damit **sich die App "lebendig" anfühlt, ohne mich abzulenken**.

## Kontext

Link zum Feature: [[features/sound-design-2]]

Abhängigkeiten:
- [[stories/backlog/POMO-120-sound-engine]]
- [[stories/backlog/POMO-122-sound-settings]]

UI Sounds sind das akustische Äquivalent zu haptischem Feedback auf dem iPhone. Ein dezentes "Tick" bei einem Klick, ein sanftes "Whoosh" beim Öffnen eines Modals. Sie machen die App spürbar, ohne aufzufallen.

**Priorität P2:** Nice-to-have für das Premium-Gefühl.

## Akzeptanzkriterien

### Keyboard Sounds
- [ ] **Given** UI Sounds aktiviert, **When** ich Space drücke (Timer Start/Stop), **Then** höre ich einen Klick
- [ ] **Given** UI Sounds aktiviert, **When** ich durch die App navigiere (Shortcuts), **Then** höre ich dezente Klicks
- [ ] **Given** Typing in Inputs, **When** UI Sounds aktiviert, **Then** höre ich KEINE Typing-Sounds (zu nervig)

### Button Sounds
- [ ] **Given** ich klicke einen Primary Button, **When** UI Sounds aktiviert, **Then** höre ich einen Klick
- [ ] **Given** ich klicke Toggle, **When** UI Sounds aktiviert, **Then** höre ich On/Off Sound

### Modal Sounds
- [ ] **Given** ein Modal öffnet sich, **When** UI Sounds aktiviert, **Then** höre ich ein sanftes "Open"
- [ ] **Given** ein Modal schließt sich, **When** UI Sounds aktiviert, **Then** höre ich ein sanftes "Close"

### Einstellungen
- [ ] **Given** die Sound-Settings, **When** ich sie sehe, **Then** gibt es "UI Sounds" Toggle
- [ ] **Given** UI Sounds Off, **When** ich interagiere, **Then** höre ich keine UI Sounds
- [ ] **Given** Master Mute, **When** ich interagiere, **Then** höre ich keine UI Sounds

### Subtilität
- [ ] **Given** alle UI Sounds, **When** ich sie höre, **Then** sind sie subtiler als Chimes
- [ ] **Given** viele Klicks hintereinander, **When** ich schnell klicke, **Then** überlagern sie sich nicht störend

## Technische Details

### UI Sound Types

```typescript
// src/lib/sound/ui-sound-types.ts

export type UISoundType =
  | 'click'           // Button clicks, checkboxes
  | 'toggle-on'       // Toggle switches (on)
  | 'toggle-off'      // Toggle switches (off)
  | 'modal-open'      // Modal/Drawer open
  | 'modal-close'     // Modal/Drawer close
  | 'navigation'      // Page navigation
  | 'success'         // Success actions
  | 'error';          // Error feedback

export interface UISoundConfig {
  file: string;
  volume: number;
}

export const UI_SOUND_CONFIG: Record<UISoundType, UISoundConfig> = {
  'click': {
    file: '/sounds/ui/click.mp3',
    volume: 0.2,
  },
  'toggle-on': {
    file: '/sounds/ui/toggle-on.mp3',
    volume: 0.25,
  },
  'toggle-off': {
    file: '/sounds/ui/toggle-off.mp3',
    volume: 0.2,
  },
  'modal-open': {
    file: '/sounds/ui/modal-open.mp3',
    volume: 0.15,
  },
  'modal-close': {
    file: '/sounds/ui/modal-close.mp3',
    volume: 0.15,
  },
  'navigation': {
    file: '/sounds/ui/navigation.mp3',
    volume: 0.15,
  },
  'success': {
    file: '/sounds/ui/success.mp3',
    volume: 0.3,
  },
  'error': {
    file: '/sounds/ui/error.mp3',
    volume: 0.25,
  },
};
```

### UI Sound Service

```typescript
// src/lib/sound/ui-sound-service.ts

import { getSoundEngine } from './index';
import { UISoundType, UI_SOUND_CONFIG } from './ui-sound-types';
import { useSoundSettings } from './sound-settings';

class UISoundService {
  private engine = getSoundEngine();
  private lastPlayTime: Map<UISoundType, number> = new Map();
  private minInterval = 50; // ms between same sounds

  async play(type: UISoundType): Promise<void> {
    const settings = useSoundSettings.getState();

    if (!settings.uiSoundsEnabled) return;
    if (settings.masterMuted) return;

    // Debounce: Prevent rapid-fire of same sound
    const now = Date.now();
    const lastTime = this.lastPlayTime.get(type) || 0;
    if (now - lastTime < this.minInterval) return;
    this.lastPlayTime.set(type, now);

    const config = UI_SOUND_CONFIG[type];
    const volume = config.volume * settings.uiSoundVolume * settings.masterVolume;

    await this.engine.play(config.file, {
      volume,
    });
  }
}

// Singleton
let uiSoundService: UISoundService | null = null;

export function getUISoundService(): UISoundService {
  if (!uiSoundService) {
    uiSoundService = new UISoundService();
  }
  return uiSoundService;
}
```

### React Hook

```typescript
// src/lib/sound/use-ui-sound.ts

import { useCallback } from 'react';
import { getUISoundService } from './ui-sound-service';
import { UISoundType } from './ui-sound-types';

export function useUISound() {
  const service = getUISoundService();

  const playSound = useCallback((type: UISoundType) => {
    service.play(type);
  }, [service]);

  // Convenience methods
  const playClick = useCallback(() => playSound('click'), [playSound]);
  const playToggleOn = useCallback(() => playSound('toggle-on'), [playSound]);
  const playToggleOff = useCallback(() => playSound('toggle-off'), [playSound]);
  const playModalOpen = useCallback(() => playSound('modal-open'), [playSound]);
  const playModalClose = useCallback(() => playSound('modal-close'), [playSound]);

  return {
    playSound,
    playClick,
    playToggleOn,
    playToggleOff,
    playModalOpen,
    playModalClose,
  };
}
```

### Button Integration

```typescript
// src/components/ui/Button.tsx

import { useUISound } from '@/lib/sound/use-ui-sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  enableSound?: boolean;
}

export function Button({
  variant = 'primary',
  enableSound = true,
  onClick,
  ...props
}: ButtonProps) {
  const { playClick } = useUISound();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableSound) {
      playClick();
    }
    onClick?.(e);
  };

  return (
    <button
      className={cn('button', `button-${variant}`)}
      onClick={handleClick}
      {...props}
    />
  );
}
```

### Toggle Integration

```typescript
// src/components/ui/Toggle.tsx

import { useUISound } from '@/lib/sound/use-ui-sound';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  const { playToggleOn, playToggleOff } = useUISound();

  const handleChange = () => {
    if (disabled) return;

    const newValue = !checked;
    if (newValue) {
      playToggleOn();
    } else {
      playToggleOff();
    }
    onChange(newValue);
  };

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={handleChange}
      className={cn('toggle', checked && 'checked', disabled && 'disabled')}
    >
      <span className="toggle-thumb" />
    </button>
  );
}
```

### Modal Integration

```typescript
// src/components/ui/Modal.tsx

import { useUISound } from '@/lib/sound/use-ui-sound';
import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  const { playModalOpen, playModalClose } = useUISound();
  const prevOpen = useRef(open);

  useEffect(() => {
    if (open && !prevOpen.current) {
      playModalOpen();
    } else if (!open && prevOpen.current) {
      playModalClose();
    }
    prevOpen.current = open;
  }, [open, playModalOpen, playModalClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

### Sound Settings Erweiterung

```typescript
// src/lib/sound/sound-settings.ts (erweitert)

export interface SoundSettings {
  // ... existing ...

  // UI Sounds
  uiSoundsEnabled: boolean;
  uiSoundVolume: number;       // 0-1
}

// Default
uiSoundsEnabled: false,  // Opt-in, nicht Opt-out!
uiSoundVolume: 0.5,
```

### Betroffene Dateien

```
src/
├── lib/
│   └── sound/
│       ├── ui-sound-types.ts
│       ├── ui-sound-service.ts
│       ├── use-ui-sound.ts
│       └── sound-settings.ts    # Erweitert
├── components/
│   └── ui/
│       ├── Button.tsx           # Sound-Integration
│       ├── Toggle.tsx           # Sound-Integration
│       └── Modal.tsx            # Sound-Integration
└── public/
    └── sounds/
        └── ui/
            ├── click.mp3
            ├── toggle-on.mp3
            ├── toggle-off.mp3
            ├── modal-open.mp3
            ├── modal-close.mp3
            ├── navigation.mp3
            ├── success.mp3
            └── error.mp3
```

## Sound Design Spezifikation

### Click Sound
```
Charakter: Kurz, präzise, taktil
Ähnlich: Mechanische Tastatur, aber weicher
Dauer: 50-80ms
Frequenz: Mittig (nicht zu hoch, nicht zu tief)
```

### Toggle On
```
Charakter: Aufsteigend, bestätigend
Ähnlich: iOS Toggle, aber subtiler
Dauer: 100ms
Tonalität: Leichter Aufwärts-Pitch
```

### Toggle Off
```
Charakter: Absteigend, neutral
Ähnlich: Gedämpftes Klicken
Dauer: 80ms
Tonalität: Leichter Abwärts-Pitch
```

### Modal Open
```
Charakter: Weich, öffnend
Ähnlich: Sanfter "Whoosh"
Dauer: 150ms
Keine harten Transienten
```

### Modal Close
```
Charakter: Weich, schließend
Ähnlich: Umgekehrter "Whoosh"
Dauer: 120ms
Abklingend
```

## UI/UX

### Settings Bereich

```
┌───────────────────────────────────────────────────────────────────┐
│  UI Sounds                                            [      ○]   │
│  Dezentes Feedback bei Interaktionen                  ↑ Opt-in   │
│                                                                   │
│    UI-Lautstärke                         ────●───────────        │
│    (nur sichtbar wenn aktiviert)                                 │
└───────────────────────────────────────────────────────────────────┘
```

### Wichtig: Opt-In, nicht Opt-Out

UI Sounds sind standardmäßig **AUS**. Das ist wichtig weil:
- Viele User erwarten keine Sounds bei UI-Interaktionen
- Überraschende Sounds können stören
- Premium-Feeling entsteht durch Qualität, nicht Quantität

## Testing

### Manuell zu testen
- [ ] Click-Sound bei Buttons
- [ ] Toggle On/Off Sounds
- [ ] Modal Open/Close Sounds
- [ ] Keine Sounds bei schnellen Klicks (Debounce)
- [ ] Settings Toggle funktioniert
- [ ] Volume Slider funktioniert
- [ ] Sounds respektieren Master Mute

### Automatisierte Tests

```typescript
describe('UISoundService', () => {
  let service: UISoundService;
  let mockEngine: jest.Mocked<SoundEngine>;

  beforeEach(() => {
    mockEngine = createMockSoundEngine();
    service = new UISoundService(mockEngine);
    useSoundSettings.setState({ uiSoundsEnabled: true });
  });

  it('plays click sound', async () => {
    await service.play('click');

    expect(mockEngine.play).toHaveBeenCalledWith(
      '/sounds/ui/click.mp3',
      expect.any(Object)
    );
  });

  it('debounces rapid clicks', async () => {
    await service.play('click');
    await service.play('click');
    await service.play('click');

    expect(mockEngine.play).toHaveBeenCalledTimes(1);
  });

  it('respects uiSoundsEnabled setting', async () => {
    useSoundSettings.setState({ uiSoundsEnabled: false });

    await service.play('click');

    expect(mockEngine.play).not.toHaveBeenCalled();
  });
});

describe('Button with Sound', () => {
  it('plays click on interaction', async () => {
    const playClick = jest.fn();
    jest.spyOn(useUISound(), 'playClick').mockImplementation(playClick);

    render(<Button>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));

    expect(playClick).toHaveBeenCalled();
  });
});
```

## Definition of Done

- [ ] UISoundService implementiert
- [ ] 8 UI Sound Types definiert
- [ ] Button-Integration
- [ ] Toggle-Integration
- [ ] Modal-Integration
- [ ] Debouncing für Rapid-Fire
- [ ] Settings UI (Opt-in Toggle + Volume)
- [ ] Placeholder-Sounds vorhanden
- [ ] Tests geschrieben & grün
- [ ] Code reviewed

## Notizen

**Design-Philosophie:**
- Weniger ist mehr
- Sounds dürfen nie im Weg stehen
- Opt-in, nicht Opt-out
- Qualität über Quantität

**Was KEINE Sounds bekommt:**
- Typing in Inputs (nervig)
- Scroll-Events (zu häufig)
- Hover-States (zu subtil)
- Timer-Tick (zu repetitiv)

**Inspiration:**
- macOS Catalina (dezent aber präsent)
- Linear (kaum Sounds, aber wenn, dann perfekt)
- Framer (nur bei wichtigen Actions)

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
