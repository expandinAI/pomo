---
type: story
status: backlog
priority: p1
effort: 2
feature: timer-enhancements
created: 2026-01-23
updated: 2026-01-23
done_date: null
tags: [timer, ux, quick-win]
---

# POMO-133: End Time Preview

## User Story

> Als **fokussierter Nutzer**
> möchte ich **sehen, wann meine Session endet** ("Fertig um 14:30"),
> damit ich **meinen Tag besser planen kann, ohne rechnen zu müssen**.

## Kontext

Ein Blick genügt: "Fertig um 14:30" sagt mehr als "noch 23:45". Der Nutzer weiß sofort, ob er noch einen Call vor dem Meeting schafft. Llama Life macht das gut - wir machen es besser: subtiler, nur wenn relevant.

**Particle-Philosophie:** Nicht immer sichtbar. Erscheint nur während aktiver Session, verschwindet bei Pause. Keine visuelle Konkurrenz zum Timer.

## Akzeptanzkriterien

- [ ] **Given** Timer läuft, **When** ich auf den Timer schaue, **Then** sehe ich unter der Zeit "bis 14:30" in dezenter Schrift
- [ ] **Given** Timer ist pausiert, **When** ich pausiere, **Then** verschwindet die Endzeit (da sie sich bei Resume ändert)
- [ ] **Given** Timer im Overflow, **When** Zeit > 0 überschritten, **Then** zeigt "seit 14:30" statt "bis"
- [ ] **Given** Endzeit wäre morgen, **When** Session > 24h (Edge Case), **Then** zeigt "bis morgen 02:30"
- [ ] **Given** Nutzer bevorzugt 12h Format, **When** System 12h verwendet, **Then** zeigt "bis 2:30 PM"

## Technische Details

### Betroffene Dateien
```
src/
├── components/timer/
│   ├── TimerDisplay.tsx      # Endzeit-Anzeige hinzufügen
│   └── Timer.tsx             # Endzeit berechnen & weitergeben
└── lib/
    └── utils.ts              # formatEndTime() Funktion
```

### Implementierungshinweise

1. **Berechnung:** `new Date(Date.now() + timeRemaining * 1000)`
2. **Format:** `Intl.DateTimeFormat` mit System-Locale
3. **Position:** Unterhalb Timer-Digits, `text-tertiary`, `text-sm`
4. **Animation:** Fade-in bei Session-Start, fade-out bei Pause
5. **Overflow-Anpassung:** "seit" statt "bis" + Startzeit der Session merken

### Neue Funktion
```typescript
function formatEndTime(secondsRemaining: number): string {
  const endDate = new Date(Date.now() + secondsRemaining * 1000);
  const now = new Date();
  const isToday = endDate.toDateString() === now.toDateString();

  const timeStr = endDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return isToday ? `bis ${timeStr}` : `bis morgen ${timeStr}`;
}
```

## UI/UX

```
        ┌─────────────────┐
        │     23:45       │  ← Timer (Hero)
        │    bis 14:30    │  ← Endzeit (subtle, tertiary)
        └─────────────────┘
```

**Verhalten:**
- Nur sichtbar wenn `isRunning === true`
- Opacity 0.6, font-size kleiner als Timer
- Keine Animation beim Countdown (statisch bis Minute wechselt)
- Im Overflow: "seit 14:07" zeigt wann Session regulär endete

## Testing

### Manuell zu testen
- [ ] Startet Session um 14:00, Timer 25min → zeigt "bis 14:25"
- [ ] Pausiere → Endzeit verschwindet
- [ ] Resume → Endzeit neu berechnet
- [ ] Overflow → "seit [Startzeit]"
- [ ] Mitternachts-Test → "bis morgen 00:15"

## Definition of Done

- [ ] Code implementiert
- [ ] Beide Themes getestet (Dark/Light)
- [ ] Responsive auf Mobile
- [ ] Reduced Motion respektiert (kein Fade wenn disabled)
- [ ] Lokal getestet

## Notizen

**Design-Entscheidung:** Wir zeigen nur die Uhrzeit, kein "Fertig um" davor - das ist Clutter. "bis 14:30" ist selbsterklärend und reduzierter.

---

## Arbeitsverlauf

### Gestartet:
### Erledigt:
