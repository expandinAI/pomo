---
type: story
status: done
priority: p1
effort: 1
feature: "[[features/keyboard-ux]]"
created: 2026-01-19
updated: 2026-01-26
done_date: 2026-01-26
tags: [keyboard, hints, ui, p1]
---

# POMO-073: Shortcut Hints im UI (Refined)

## User Story

> Als **neuer User**
> möchte ich **den wichtigsten Shortcut direkt im UI sehen**,
> damit **ich ihn schnell lerne ohne ein Help-Modal öffnen zu müssen**.

## Kontext

Link zum Feature: [[features/keyboard-ux]]

**Strategie-Update (2026-01-26):** Nach Analyse haben wir die "Learn by Doing" Strategie definiert.
Siehe: `CLAUDE.md` → "Keyboard Hints Strategie"

**Kernprinzip:** "One Hint per Context" – nicht jeden Button mit Hints überladen.

## Status Quo

### ✅ Bereits implementiert
- `KeyboardHint` Komponente existiert (`src/components/ui/KeyboardHint.tsx`)
- `useKeyboardHintsSettings` Hook existiert (toggle on/off)
- Start/Pause Button zeigt bereits `Space` Hint
- ActionBar Icons haben Tooltips mit Shortcuts
- Platform-Formatierung (⌘ auf Mac, Ctrl auf Windows)

### ✅ Neu implementiert
- Overflow "Done" Button zeigt `↵` Tooltip (via `title` Attribut)

## Akzeptanzkriterien

### Overflow Done Button
- [ ] **Given** Overflow mode aktiv, **When** Done Button sichtbar, **Then** zeigt `↵` Hint
- [ ] **Given** Hint, **When** gerendert, **Then** dezent, gleicher Stil wie Space-Hint

### Bestehende Hints validieren
- [ ] **Given** Start Button, **When** Timer idle, **Then** zeigt `Space`
- [ ] **Given** Pause Button, **When** Timer running, **Then** zeigt `Space`
- [ ] **Given** Settings "Keyboard Hints" off, **When** UI, **Then** keine Hints sichtbar

## Technische Details

### Änderung in TimerControls.tsx

```tsx
// Overflow Done Button (Zeile ~68-99)
<motion.button
  onClick={onComplete}
  className="..."
  aria-label="Complete session"
>
  <Check className="w-5 h-5" strokeWidth={3} />
  {/* NEU: Keyboard Hint für Enter */}
  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2">
    <KeyboardHint shortcut="Enter" className="text-[10px]" />
  </span>
</motion.button>
```

**Alternative:** Tooltip statt inline (da Button kompakt ist)

```tsx
<motion.button
  title={`Complete session (${formatShortcut('Enter')})`}
  // ...
>
```

## Nicht im Scope

Gemäß "Learn by Doing" Strategie:
- ~~Preset Buttons (1-4)~~ → zu kompakt, Help Modal
- ~~ActionBar Icons (G T)~~ → Tooltips reichen
- ~~TaskInput (T)~~ → unnötig wenn fokussiert
- ~~Settings Toggles~~ → Power-User Features

## Testing

### Manuell zu testen
- [ ] Overflow Done Button zeigt Hint oder Tooltip
- [ ] Hint verschwindet wenn Setting deaktiviert
- [ ] Mac zeigt ↵, Windows zeigt Enter (oder beide ↵)

## Definition of Done

- [ ] Overflow Done Button hat Keyboard Hint
- [ ] Konsistent mit bestehendem Space-Hint Stil
- [ ] Setting zum Deaktivieren funktioniert
- [ ] Code Review abgeschlossen

## Changelog

| Datum | Änderung |
|-------|----------|
| 2026-01-19 | Story erstellt |
| 2026-01-26 | Scope reduziert auf "Learn by Doing" Strategie, Effort 2→1 |
