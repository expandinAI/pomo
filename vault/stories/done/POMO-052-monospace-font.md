---
type: story
status: backlog
priority: p0
effort: 2
feature: "[[features/design-system-update]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [design-system, typography, p0]
---

# POMO-052: Timer mit Monospace Font

## User Story

> Als **User**
> möchte ich **den Timer in einer Monospace-Schrift sehen**,
> damit **die Ziffern beim Countdown nicht springen und professioneller aussehen**.

## Kontext

Link zum Feature: [[features/design-system-update]]

JetBrains Mono für Timer Display mit `tabular-nums` für stabile Ziffernbreite.

## Akzeptanzkriterien

- [ ] **Given** Timer Display, **When** gerendert, **Then** nutzt JetBrains Mono
- [ ] **Given** Timer Ziffern, **When** Countdown läuft, **Then** bleiben positionsstabil
- [ ] **Given** Font nicht geladen, **When** App startet, **Then** Fallback Monospace angezeigt
- [ ] **Given** Font Weight, **When** Timer angezeigt, **Then** ist 500 (Medium)

## Technische Details

### Betroffene Dateien
```
src/
├── app/layout.tsx
├── components/timer/TimerDisplay.tsx
└── tailwind.config.js
```

### Font Setup in layout.tsx
```tsx
import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
});

// In <html>: className={jetbrainsMono.variable}
```

### Tailwind Config
```js
fontFamily: {
  mono: ['var(--font-mono)', 'SF Mono', 'Fira Code', 'Consolas', 'monospace'],
}
```

### TimerDisplay Styles
```tsx
<span className="font-mono font-medium tabular-nums">
  {formattedTime}
</span>
```

## Testing

### Manuell zu testen
- [ ] JetBrains Mono lädt korrekt
- [ ] Ziffern springen nicht beim Countdown
- [ ] Font Weight ist Medium (500)
- [ ] Fallback funktioniert bei Netzwerkproblemen

## Definition of Done

- [ ] Font in layout.tsx geladen
- [ ] TimerDisplay nutzt Monospace
- [ ] `tabular-nums` aktiviert
- [ ] Fallback-Chain konfiguriert
