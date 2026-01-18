---
type: story
status: done
priority: p1
effort: 5
feature: analytics
created: 2026-01-18
updated: 2026-01-18
done_date: 2026-01-18
tags: [analytics, insights, premium]
---

# POMO-030: Focus Heatmap

## User Story

> Als **Pomo-Nutzer**
> möchte ich **sehen, zu welchen Uhrzeiten ich am produktivsten bin**,
> damit **ich meine Deep Work Sessions besser planen kann**.

## Kontext

Eine Heatmap zeigt Produktivitätsmuster über Zeit (Stunden) und Wochentage. Dies hilft Nutzern, ihre "Peak Focus Times" zu identifizieren und Sessions bewusster zu planen.

## Akzeptanzkriterien

- [ ] **Given** Sessions mit verschiedenen Zeiten, **When** Heatmap angezeigt, **Then** Grid zeigt Intensität pro Stunde/Tag
- [ ] **Given** Heatmap angezeigt, **When** User schaut, **Then** Rows = Wochentage (Mo-So), Columns = Stunden (6-22)
- [ ] **Given** keine Sessions in einem Slot, **When** Heatmap rendert, **Then** Zelle ist leer/transparent
- [ ] **Given** viele Sessions in einem Slot, **When** Heatmap rendert, **Then** Zelle ist intensiv gefärbt
- [ ] **Given** Sessions analysiert, **When** Heatmap angezeigt, **Then** "Peak focus time" Text wird angezeigt
- [ ] **Given** reduced motion preference, **When** Heatmap erscheint, **Then** keine Fade-in Animation

## Technische Details

### Betroffene Dateien
```
src/
├── components/insights/
│   ├── FocusHeatmap.tsx      # NEW - Heatmap Grid Component
│   └── HeatmapCell.tsx       # NEW - Einzelne Zelle
├── lib/
│   └── session-analytics.ts  # Erweitern mit Heatmap-Logik
└── app/page.tsx              # Integration
```

### Implementierungshinweise
- Grid: 7 Rows (Mo-So) × 17 Columns (6:00-22:00)
- Aggregiere alle Sessions der letzten 30 Tage
- Berechne Intensität: `minutesInSlot / maxMinutesAcrossAllSlots`
- 5 Intensitätsstufen (0%, 25%, 50%, 75%, 100%)
- Farbe: Accent Color mit Opacity-Varianten

### Neue Typen
```typescript
interface HeatmapData {
  grid: HeatmapCell[][]; // [day][hour]
  peakSlot: { day: number; hour: number } | null;
  peakLabel: string; // "Wednesdays at 10am"
}

interface HeatmapCell {
  day: number;        // 0-6 (Mon-Sun)
  hour: number;       // 6-22
  totalMinutes: number;
  intensity: number;  // 0-1
  sessionsCount: number;
}
```

### Algorithmus
```typescript
function buildHeatmap(sessions: CompletedSession[]): HeatmapData {
  // 1. Initialize 7x17 grid with zeros
  // 2. For each session, add duration to correct slot
  // 3. Find max across all slots
  // 4. Calculate intensity for each slot
  // 5. Find peak slot
  // 6. Generate human-readable peak label
}
```

## UI/UX

```
┌─────────────────────────────────────────────┐
│ Your Focus Pattern                          │
├─────────────────────────────────────────────┤
│                                             │
│      6  7  8  9 10 11 12 13 14 15 16 ...   │
│ Mon  ░░ ░░ ▓▓ ██ ██ ▓▓ ░░ ░░ ▓▓ ▓▓ ░░     │
│ Tue  ░░ ░░ ▓▓ ██ ██ ██ ▓▓ ░░ ░░ ░░ ░░     │
│ Wed  ░░ ░░ ██ ██ ██ ██ ▓▓ ░░ ▓▓ ▓▓ ░░     │
│ Thu  ░░ ░░ ▓▓ ██ ██ ▓▓ ░░ ░░ ░░ ░░ ░░     │
│ Fri  ░░ ░░ ▓▓ ██ ▓▓ ░░ ░░ ░░ ░░ ░░ ░░     │
│ Sat  ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░     │
│ Sun  ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░ ░░     │
│                                             │
│ ⭐ Peak focus: Weekday mornings (9-11am)    │
│                                             │
└─────────────────────────────────────────────┘
```

**Legende:**
- ░░ = 0% (keine Sessions)
- ▒▒ = 25% (wenig)
- ▓▓ = 50-75% (mittel)
- ██ = 100% (Peak)

**Verhalten:**
- Hover auf Zelle zeigt Tooltip: "Wed 10am: 4.5h (12 sessions)"
- Touch: Long press für Tooltip
- Responsive: Auf Mobile scrollbar horizontal
- Farbe folgt Theme (Accent color)

## Testing

### Manuell zu testen
- [ ] Heatmap mit 0 Sessions (Empty State)
- [ ] Heatmap mit Sessions nur morgens
- [ ] Heatmap mit Sessions über den Tag verteilt
- [ ] Hover/Touch Tooltips funktionieren
- [ ] Dark/Light Mode
- [ ] Mobile: Horizontal scroll funktioniert
- [ ] Screen Reader: Grid ist navigierbar

### Automatisierte Tests
- [ ] Unit Test: `buildHeatmap()` mit definierten Testdaten
- [ ] Unit Test: Intensity calculation (0 = 0%, max = 1)
- [ ] Unit Test: Peak slot detection
- [ ] Unit Test: Peak label generation ("Weekday mornings")

## Definition of Done

- [ ] Code implementiert
- [ ] Tests geschrieben & grün
- [ ] Code reviewed (selbst oder AI)
- [ ] Lokal getestet (alle Szenarien)
- [ ] Tooltips funktionieren (Desktop & Mobile)
- [ ] Accessibility: aria-label für jede Zelle
- [ ] Reduced motion respektiert
- [ ] Responsive auf Mobile

## Notizen

- Stunden außerhalb 6-22 werden ignoriert (Nachtarbeit = Edge Case)
- Später: Custom range selection (letzte 7/30/90 Tage)
- Später: Vergleich mit vorherigem Zeitraum

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
