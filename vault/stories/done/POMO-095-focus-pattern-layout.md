---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/statistics-dashboard]]"
created: 2026-01-20
updated: 2026-01-20
done_date: null
tags: [ui, layout, heatmap, spacing]
---

# POMO-095: Focus Pattern Modal Layout Fix

## User Story

> Als **User**
> möchte ich **ein visuell ausbalanciertes "Your Focus Pattern" Modal**,
> damit **die Heatmap-Grafik zentriert ist und die Abstände harmonisch wirken**.

## Kontext

Das aktuelle "Your Focus Pattern" Modal (FocusHeatmap) hat Layout-Probleme:
- Die Heatmap-Grafik erscheint linksbündig
- Zu viel Whitespace auf der rechten Seite
- Unausgewogene Spacings innerhalb des Modals

## Akzeptanzkriterien

- [ ] **Given** Modal offen, **When** Heatmap angezeigt, **Then** Grid ist horizontal zentriert
- [ ] **Given** Modal, **When** betrachtet, **Then** symmetrische Abstände links/rechts
- [ ] **Given** verschiedene Bildschirmgrößen, **When** Modal offen, **Then** Layout bleibt ausbalanciert
- [ ] **Given** Peak Info + Legend, **When** angezeigt, **Then** ebenfalls zentriert

## Technische Details

### Betroffene Dateien
- `src/components/insights/FocusHeatmap.tsx` - Modal Container
- `src/components/insights/HeatmapGrid.tsx` - Grid-Komponente

### Aktuelles Problem
```tsx
// HeatmapGrid.tsx - Line 64-69
<div className="overflow-x-auto">
  <div className="inline-block min-w-max">
    {/* Grid ist linksbündig */}
  </div>
</div>
```

### Mögliche Lösung
```tsx
// Option 1: Grid zentrieren
<div className="overflow-x-auto flex justify-center">
  <div className="inline-block min-w-max">
    {/* Grid zentriert */}
  </div>
</div>

// Option 2: Modal-Breite anpassen
// max-w-md → dynamisch basierend auf Grid-Breite
```

### Zu prüfende Spacings
- Modal padding: `p-4` konsistent?
- Grid margin-bottom: `mb-4` passend?
- Peak Info: `mb-4` zu viel/wenig?
- Legend: Zentriert?
- Footer: Padding harmonisch?

## UI Mockup

```
┌─────────────────────────────────────┐
│  Your Focus Pattern           [X]   │
├─────────────────────────────────────┤
│                                     │
│       Mo ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪         │
│       Tu ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪         │
│       We ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪         │
│       Th ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪         │
│       Fr ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪         │
│       Sa ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪         │
│       Su ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪         │
│          6  8 10 12 14 16 18 20 22  │
│                                     │
│    ⭐ Peak focus: Mondays at 9am    │
│                                     │
│       Less ▪▪▪▪▪ More               │
│                                     │
│    Based on your last 30 days...    │
└─────────────────────────────────────┘
```

## Testing

### Manuell zu testen
- [ ] Grid horizontal zentriert
- [ ] Symmetrische Margins
- [ ] Peak Info zentriert
- [ ] Legend zentriert
- [ ] Responsive auf verschiedenen Breiten
- [ ] Kein horizontaler Overflow sichtbar

## Definition of Done

- [ ] HeatmapGrid zentriert im Modal
- [ ] Konsistente Spacings
- [ ] Visuell ausbalanciertes Layout
- [ ] Keine Layout-Shifts beim Laden
