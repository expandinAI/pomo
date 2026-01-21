---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/system-integrations]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [integrations, macos, focus, p0]
---

# POMO-078: macOS Do Not Disturb Integration

## User Story

> Als **Mac-User**
> möchte ich **dass automatisch der Fokus-Modus aktiviert wird wenn ich eine Session starte**,
> damit **ich nicht durch Notifications abgelenkt werde**.

## Kontext

Link zum Feature: [[features/system-integrations]]

Automatische DND-Aktivierung bei Session-Start, Deaktivierung bei Ende/Pause.

## Akzeptanzkriterien

- [ ] **Given** Session startet, **When** macOS, **Then** DND aktiviert
- [ ] **Given** Session endet/pausiert, **When** macOS, **Then** DND deaktiviert
- [ ] **Given** Setting, **When** "Auto DND" off, **Then** keine Automatik
- [ ] **Given** nicht macOS, **When** Feature, **Then** graceful degradation
- [ ] **Given** erstmalig, **When** genutzt, **Then** User erteilt Berechtigung
- [ ] **Given** DND aktiv, **When** UI, **Then** Icon zeigt Status

## Technische Details

### Approach: Shortcuts App Integration
```typescript
const isMacOS = () =>
  typeof navigator !== 'undefined' &&
  navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const enableDND = async () => {
  if (!isMacOS()) return;

  try {
    // Ruft macOS Shortcut auf
    window.location.href = 'shortcuts://run-shortcut?name=Enable%20Focus';
  } catch (error) {
    console.warn('DND activation failed:', error);
  }
};

const disableDND = async () => {
  if (!isMacOS()) return;

  try {
    window.location.href = 'shortcuts://run-shortcut?name=Disable%20Focus';
  } catch (error) {
    console.warn('DND deactivation failed:', error);
  }
};
```

### Setup Anleitung für User
```
1. Open Shortcuts app on macOS
2. Create shortcut "Enable Focus" → Set Focus Mode
3. Create shortcut "Disable Focus" → Turn Off Focus
4. Allow URL scheme access when prompted
```

### Fallback
```tsx
const DNDFallback = () => (
  <div className="p-4 bg-surface rounded">
    <p>Please enable Focus Mode manually</p>
    <Button onClick={() => window.open('x-apple.systempreferences:com.apple.preference.notifications')}>
      Open System Preferences
    </Button>
  </div>
);
```

## UI/UX

### DND Status Indicator
```
┌─────────────────────────────────────────────────┐
│  🌙 Focus Mode Active                           │
└─────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] DND aktiviert bei Session-Start (macOS)
- [ ] DND deaktiviert bei Ende
- [ ] Setting funktioniert
- [ ] Graceful auf Windows/Linux
- [ ] Status-Icon sichtbar

## Definition of Done

- [ ] macOS Detection
- [ ] Shortcuts Integration
- [ ] Settings Option
- [ ] Status UI
- [ ] Fallback für andere OS
