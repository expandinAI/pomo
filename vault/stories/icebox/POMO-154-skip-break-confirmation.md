---
type: story
status: backlog
priority: p2
effort: 1
feature: "[[features/timer]]"
created: 2026-01-25
updated: 2026-01-25
done_date: null
tags: [timer, break, ux, befocused-learning, p2]
---

# POMO-154: Skip-Break-Bestätigung

## User Story

> Als **Nutzer in der Pause**
> möchte ich **eine Bestätigung bevor ich die Pause überspringe**,
> damit **ich nicht versehentlich meine Erholungszeit verpasse**.

## Kontext

Link zum Feature: [[features/timer]]

**Be Focused Learning:** Häufige User-Beschwerde: "Pressing skip on rest timer by accident is frustrating. No confirmation prompt."

**Problem:** Ein versehentlicher Klick/Tastendruck beendet die Pause sofort. Pausen sind aber wichtig für Produktivität (Ultradian Rhythm, Pomodoro-Wissenschaft).

**Particle-Philosophie:**
- **Respect the Break** – Pausen sind Teil der Methode, nicht optional
- **Prevent Accidents** – UX sollte vor Fehlern schützen
- **Not Patronizing** – Erfahrene User können Confirmation ausschalten

## Design-Prinzipien

1. **Confirmation bei Skip** – Dialog bevor Pause übersprungen wird
2. **Keyboard-Friendly** – Enter für Skip, Escape für Cancel
3. **Opt-Out möglich** – "Nicht mehr fragen" in Settings
4. **Kurze Copy** – Keine langen Texte, schnelle Entscheidung

## Akzeptanzkriterien

### Skip-Confirmation Dialog

- [ ] **Given** Break aktiv, **When** Skip-Versuch (Klick/Keyboard), **Then** Confirmation-Dialog erscheint
- [ ] **Given** Dialog, **When** "Überspringen" gewählt, **Then** Break wird beendet, Focus startet
- [ ] **Given** Dialog, **When** "Weiter pausieren" gewählt, **Then** Dialog schließt, Break läuft weiter
- [ ] **Given** Dialog, **When** Escape gedrückt, **Then** Dialog schließt, Break läuft weiter

### Keyboard-Shortcuts

- [ ] **Given** Dialog offen, **When** Enter, **Then** Skip bestätigt
- [ ] **Given** Dialog offen, **When** Escape, **Then** Dialog abgebrochen
- [ ] **Given** Dialog offen, **When** `S` (erneut), **Then** Skip bestätigt

### Opt-Out (Settings)

- [ ] **Given** Settings > Timer, **When** "Pause-Skip bestätigen", **Then** Toggle verfügbar
- [ ] **Given** Toggle OFF, **When** Skip-Versuch, **Then** Skip sofort (kein Dialog)
- [ ] **Given** Default, **When** neue Installation, **Then** Toggle ist ON

### Edge Cases

- [ ] **Given** Dialog offen, **When** Break endet natürlich, **Then** Dialog schließt automatisch
- [ ] **Given** Focus aktiv (nicht Break), **When** Skip, **Then** Kein Confirmation (nur bei Breaks)

## Technische Details

### Dialog-Komponente

```typescript
interface SkipBreakDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  remainingTime: number;  // Sekunden
}

const SkipBreakDialog: React.FC<SkipBreakDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  remainingTime,
}) => {
  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 's') {
        onConfirm();
      } else if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <Dialog>
      <DialogContent>
        <h3>Pause überspringen?</h3>
        <p>
          Noch {formatTime(remainingTime)} Pause übrig.
          Pausen helfen deiner Konzentration.
        </p>
        <DialogActions>
          <Button onClick={onCancel} variant="secondary">
            Weiter pausieren
          </Button>
          <Button onClick={onConfirm} variant="primary">
            Überspringen [Enter]
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};
```

### Settings-Integration

```typescript
// Settings Store
interface TimerSettings {
  confirmSkipBreak: boolean;  // Default: true
  // ... andere Settings
}

// Bei Skip-Versuch
const handleSkipBreak = () => {
  if (settings.confirmSkipBreak) {
    setShowSkipDialog(true);
  } else {
    skipBreak();  // Direkt überspringen
  }
};
```

### UI Mockup

**Confirmation Dialog:**
```
┌─────────────────────────────────────────┐
│                                         │
│       Pause überspringen?               │
│                                         │
│    Noch 3:24 Pause übrig.               │
│    Pausen helfen deiner Konzentration.  │
│                                         │
│   ┌──────────────┐  ┌────────────────┐  │
│   │ Weiter [Esc] │  │ Skip [Enter]   │  │
│   └──────────────┘  └────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Settings Toggle:**
```
Timer-Einstellungen
─────────────────────────────────────────

☑ Pause-Skip bestätigen
  Zeigt einen Dialog bevor die Pause übersprungen wird

  [Warum Pausen wichtig sind →]
```

## Copy-Varianten

### Dialog-Text (kurz, motivierend)

**Option A (Gewählt):**
> "Noch 3:24 Pause übrig. Pausen helfen deiner Konzentration."

**Option B (Wissenschaftlich):**
> "Noch 3:24 Pause übrig. Studien zeigen: Regelmäßige Pausen steigern die Produktivität."

**Option C (Direkt):**
> "Wirklich überspringen? Du hast noch 3:24 Pause."

## Nicht im Scope (v1)

- Automatisches "Nicht mehr fragen heute"
- Statistik: Wie oft wurde Skip genutzt
- Verschiedene Messages je nach Skip-Häufigkeit
- Audio-Warnung

## Testing

### Manuell zu testen

- [ ] Skip in Break zeigt Dialog
- [ ] Skip in Focus zeigt KEINEN Dialog
- [ ] Enter bestätigt Skip
- [ ] Escape bricht ab
- [ ] Settings Toggle funktioniert
- [ ] Toggle OFF = kein Dialog

## Definition of Done

- [ ] Confirmation Dialog implementiert
- [ ] Keyboard-Shortcuts (Enter, Escape)
- [ ] Settings-Toggle für Opt-Out
- [ ] Default: ON (Confirmation aktiv)
- [ ] Nur bei Breaks, nicht bei Focus
- [ ] Code Review abgeschlossen
- [ ] **Prüffrage:** Fühlt es sich hilfreich an, nicht bevormundend?
