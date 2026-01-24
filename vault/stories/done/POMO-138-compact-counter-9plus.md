# POMO-138: Kompakte Partikel-Anzeige ab 9+

## User Story

**Als** Nutzer, der viele Partikel an einem Tag sammelt,
**möchte ich** eine kompakte Darstellung ab 9+ Partikeln sehen,
**damit** die Anzeige übersichtlich bleibt und nicht zu breit wird.

## Kontext

Die aktuelle SessionCounter-Komponente zeigt jeden Partikel als einzelnen Punkt. Ab 9 Partikeln wird die Anzeige zu breit. Wir brauchen eine kompakte Alternative, die trotzdem die Convergence-Animation unterstützt.

## Design

### Kompakte Ansicht (ab 9 Partikeln)

```
9 ●  ○     ← Zahl + gefülltes Symbol + leerer Slot
```

**Bestandteile:**
1. **Zahl** – Anzahl der bereits vollständig abgeschlossenen Partikel
2. **Gefülltes Symbol (●)** – Visueller Anker, zeigt "Partikel gesammelt"
3. **Leerer Slot (○)** – Ziel für die Convergence-Animation

### Flow

**Idle (nach 9+ Partikeln):**
```
9 ●  ○     ← Zahl zeigt 9, ein leerer Slot wartet
```

**Session läuft:**
```
9 ●  ○     ← Schwebende Partikel fliegen zum leeren Slot
```

**Session complete:**
```
9 ●  ●     ← Slot füllt sich (Celebration)
         ↓
10 ●  ○    ← Zahl erhöht sich sofort, neuer leerer Slot erscheint
```

### Animations-Sequenz bei Completion

1. Partikel konvergieren zum leeren Slot
2. Slot füllt sich mit Checkmark (wie bisher)
3. Kurze Pause (300ms) für Celebration
4. Gefüllter Slot "wandert" zur Zahl (slide + fade)
5. Zahl erhöht sich um 1 (count-up Animation)
6. Neuer leerer Slot erscheint (fade-in von rechts)

## Akzeptanzkriterien

- [ ] Unter 9 Partikeln: Verhalten bleibt unverändert (einzelne Punkte)
- [ ] Ab 9 Partikeln: Kompakte Ansicht mit Zahl + Symbol + Slot
- [ ] Convergence-Animation funktioniert weiterhin (Ziel: leerer Slot)
- [ ] Completion-Animation: Slot füllt sich → wandert zur Zahl → neuer Slot
- [ ] Zahl erhöht sich mit subtiler Animation
- [ ] Funktioniert mit Daily Goal (todayCount statt cycle count)

## Technische Details

**Datei:** `src/components/timer/SessionCounter.tsx`

**Schwellenwert:** `COMPACT_THRESHOLD = 9`

**Neue Props:** Keine (nutzt bestehende `count`, `todayCount`, `dailyGoal`)

**Animation-Timing:**
- Convergence: 3 Sekunden (bestehend)
- Celebration-Pause: 300ms
- Slot-to-Number: 400ms (slide + fade)
- Number-increment: 200ms (spring)
- New-slot-appear: 300ms (fade + slide from right)

## Offene Fragen

- [ ] Soll die Zahl bei sehr hohen Werten (50+, 100+) anders dargestellt werden?

## Story Points

**Aufwand:** M (Medium)
**Priorität:** Hoch (UX-Verbesserung)
