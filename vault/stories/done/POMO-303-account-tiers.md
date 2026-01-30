---
type: story
status: done
priority: p0
effort: 3
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-30
done_date: 2026-01-30
tags: [feature, tiers, monetization]
---

# POMO-303: Tier System & Feature Flags

## User Story

> Als **Produkt**
> möchte ich **Features basierend auf Account-Tier freischalten**,
> damit **wir Particle und Flow Nutzer unterschiedlich behandeln können**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-302 (Auth UI)

### Tier-Architektur

| Modus | Account | Sync | Features | Kosten |
|-------|---------|------|----------|--------|
| **Lokal** | Kein | - | Alle Basis-Features | Kostenlos |
| **Particle** | Ja | Sync | Basis + Sync | Kostenlos |
| **Particle Flow** | Ja | Sync | Alles | 9€/Monat |

**Reihenfolge:** POMO-302 → **POMO-303** → POMO-304 → ...

## Akzeptanzkriterien

- [x] **Given** kein Account (Lokal), **When** App geladen, **Then** sind alle Basis-Features verfügbar
- [x] **Given** Particle Account, **When** Premium-Feature genutzt, **Then** wird Upgrade-Prompt gezeigt
- [x] **Given** Flow Account, **When** App geladen, **Then** sind alle Features verfügbar
- [ ] **Given** Trial aktiv, **When** Trial abläuft, **Then** wechselt Tier automatisch zu Particle (free) → POMO-304

## Implementierung

### Neue Dateien

```
src/lib/tiers/
├── index.ts        # Public exports
├── config.ts       # Tier Definitions (AuthMode, Features, Limits)
├── hooks.ts        # useAuthMode, useFeature, useTierLimit, etc.
└── FeatureGate.tsx # FeatureGate + UpgradePrompt Components
```

### Hooks

| Hook | Rückgabe | Verwendung |
|------|----------|------------|
| `useAuthMode()` | `'local' \| 'free' \| 'flow'` | Aktueller Modus |
| `useFeature(feature)` | `boolean` | Feature verfügbar? |
| `useTierLimit(limit)` | `number \| 'unlimited'` | Limit-Wert |
| `useTierConfig()` | `TierConfig` | Vollständige Config |
| `useIsPremium()` | `boolean` | Flow-User? |
| `useHasAccount()` | `boolean` | Hat Account? |

### FeatureGate

```tsx
<FeatureGate feature="yearView">
  <YearViewContent />
</FeatureGate>

<FeatureGate feature="advancedStats" fallback={<BasicStats />}>
  <AdvancedStats />
</FeatureGate>
```

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `YearViewModal.tsx` | Gate um Content, UpgradePrompt für Lokal/Free |
| `DashboardHeatmap.tsx` | Kompakter Upgrade-Prompt für Heatmap |
| `FocusHeatmap.tsx` | UpgradePrompt im Modal |

### Feature-Matrix

| Feature | Lokal | Free | Flow |
|---------|-------|------|------|
| sync | - | ✓ | ✓ |
| yearView | - | - | ✓ |
| advancedStats | - | - | ✓ |
| unlimitedProjects | - | - | ✓ |
| allAmbientSounds | - | - | ✓ |
| allThemes | - | - | ✓ |

## Definition of Done

- [x] `src/lib/tiers/` Modul erstellt
- [x] `useAuthMode()` funktioniert
- [x] `useFeature()` funktioniert
- [x] `useTierLimit()` funktioniert
- [x] `FeatureGate` Komponente implementiert
- [x] Year View mit Gate versehen
- [x] Advanced Stats mit Gate versehen
- [x] TypeCheck & Lint & Build erfolgreich

## Notizen

**Noch nicht implementiert (POMO-304):**
- `particle:open-upgrade` Event-Handler (Trial Modal)
- `particle:open-auth` Event-Handler (Auth Modal Trigger)

Die Buttons in UpgradePrompt dispatchen Events, aber die Handler kommen in POMO-304.

---

## Arbeitsverlauf

### Erledigt: 2026-01-30

- Tier-System in `src/lib/tiers/` implementiert
- Hooks: `useAuthMode`, `useFeature`, `useTierLimit`, `useTierConfig`, `useIsPremium`, `useHasAccount`
- `FeatureGate` Komponente mit `UpgradePrompt` Fallback
- Year View Modal: Gate + adaptiver CTA
- Dashboard Heatmap: Kompakter Upgrade-Prompt
- Focus Heatmap Modal: Gate + UpgradePrompt
- TypeCheck, Lint, Build: Alle erfolgreich
