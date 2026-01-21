# POMO-130: Theme System Refactor

> Grundlegende Überarbeitung des Tailwind-basierten Theme-Systems für konsistenten Dark/Light Mode

## User Story

**Als** Benutzer, der zwischen Dark und Light Mode wechseln möchte,
**möchte ich** dass alle UI-Elemente korrekt ihre Farben anpassen,
**damit** die App in beiden Modi gleich gut lesbar und nutzbar ist.

## Kontext

### Das Problem

Das aktuelle Theme-System hat einen fundamentalen Fehler:

**In `tailwind.config.js`:**
```js
secondary: { DEFAULT: '#808080', light: '#525252' }
//          ↑ generiert `text-secondary`   ↑ generiert `text-secondary-light`
```

**Aber Komponenten verwenden:**
```tsx
className="text-secondary light:text-secondary-dark"
//                                            ^^^^^ existiert NICHT!
```

Die Klassen mit `-dark` Suffix existieren nicht in der Tailwind-Config:
- `secondary-dark` ❌
- `tertiary-dark` ❌
- `primary-dark` ❌
- `surface-dark` ❌
- `background-dark` ❌
- `border-dark` ❌

### Versuchter Fix (gescheitert)

Ein einfacher Search & Replace von `-dark` zu `-light` hat nicht funktioniert:
- Der Theme-Toggle wurde zwar besser
- Aber Input-Felder und Mode-Buttons wurden zu hell im Dark Mode
- Das Grundproblem: Die Naming-Konvention ist inkonsistent

### Betroffene Dateien

244 Vorkommen in 37 Dateien, u.a.:
- `VisualEffectsSettings.tsx` (28 Vorkommen)
- `SessionHistory.tsx` (24 Vorkommen)
- `FocusHeatmap.tsx` (13 Vorkommen)
- `WeeklyReport.tsx` (13 Vorkommen)
- `ShortcutsHelp.tsx` (13 Vorkommen)
- ... und 32 weitere Dateien

## Acceptance Criteria

- [ ] **Klare Naming-Konvention**: Entscheidung für eine konsistente Strategie
- [ ] **Tailwind-Config erweitert**: Alle benötigten Farbvarianten vorhanden
- [ ] **Dark Mode korrekt**: Alle Elemente haben passende Farben
- [ ] **Light Mode korrekt**: Alle Elemente haben passende Kontraste
- [ ] **Kein Element verschwindet**: Text immer lesbar auf Hintergrund
- [ ] **Input-Felder**: Gut sichtbar in beiden Modi
- [ ] **Mode-Buttons**: Korrekte Farben in beiden Modi
- [ ] **Timer-Seite**: Vollständig funktional in beiden Modi
- [ ] **Statistics-Seite**: Vollständig funktional in beiden Modi
- [ ] **Year-View**: Vollständig funktional in beiden Modi

## Technische Details

### Option 1: Fehlende `-dark` Varianten hinzufügen

```js
// tailwind.config.js
secondary: {
  DEFAULT: '#808080',  // → text-secondary (Dark Mode)
  light: '#525252',    // → text-secondary-light (Light Mode auf weißem BG)
  dark: '#A0A0A0',     // → text-secondary-dark (Hellere Variante für...)
}
```

**Vorteil:** Keine Änderung an Komponenten nötig
**Nachteil:** Semantik unklar - wann nutzt man welche Variante?

### Option 2: Einheitliche Semantik mit CSS Variables

```css
:root {
  --color-text-secondary: #808080;
}
.light {
  --color-text-secondary: #525252;
}
```

```js
// tailwind.config.js
secondary: 'var(--color-text-secondary)'
```

**Vorteil:** Klar und wartbar
**Nachteil:** Größerer Refactor

### Option 3: Dark-first mit `dark:` Prefix

Tailwind's nativer Ansatz:
```tsx
className="text-secondary-light dark:text-secondary"
```

**Vorteil:** Standard Tailwind-Pattern
**Nachteil:** Alle 244 Stellen ändern

## Empfehlung

**Option 2 (CSS Variables)** ist langfristig am saubersten:
- Eine Quelle der Wahrheit
- Automatisches Theme-Switching
- Keine doppelten Klassen nötig
- Bessere Wartbarkeit

## Dateien zu ändern

1. `tailwind.config.js` - Farbdefinitionen umstellen
2. `src/app/globals.css` - CSS Variables für beide Themes
3. `src/styles/design-tokens.ts` - Token-Definitionen aktualisieren
4. 37 Komponentendateien - Klassen vereinfachen

## Testing

- [ ] Timer-Seite: Dark Mode
- [ ] Timer-Seite: Light Mode
- [ ] Statistics-Seite: Dark Mode
- [ ] Statistics-Seite: Light Mode
- [ ] Year-View: Dark Mode
- [ ] Year-View: Light Mode
- [ ] Settings-Modal: Dark Mode
- [ ] Settings-Modal: Light Mode
- [ ] Command-Palette: Dark Mode
- [ ] Command-Palette: Light Mode
- [ ] Alle Input-Felder lesbar
- [ ] Alle Buttons sichtbar
- [ ] Kein Element verschwindet beim Toggle

## Estimation

- **Größe:** L (8-12 Stunden)
- **Risiko:** Mittel (betrifft viele Dateien, aber rein visuell)

## Dependencies

- Keine externen Dependencies

## Nicht in Scope

- Neue Farbpalette erstellen (separate Story)
- Light Mode entfernen (separate Entscheidung)
- Animationen beim Theme-Wechsel

## Referenzen

- Tailwind Dark Mode: https://tailwindcss.com/docs/dark-mode
- CSS Custom Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
