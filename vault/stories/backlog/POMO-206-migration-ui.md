---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [ui, migration, onboarding]
---

# Migration Progress UI

## User Story

> Als **bestehender Nutzer mit vielen Daten**
> möchte ich **den Migrations-Fortschritt sehen**,
> damit **ich weiß, dass meine Daten sicher übertragen werden**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

Bei Nutzern mit >50 Einträgen kann die Migration einige Sekunden dauern. Ein Progress-Indicator verhindert Verwirrung.

## Akzeptanzkriterien

- [ ] **Given** <50 Einträge, **When** Migration läuft, **Then** kein UI (zu schnell)
- [ ] **Given** >50 Einträge, **When** Migration läuft, **Then** zeige Progress Modal
- [ ] **Given** Migration abgeschlossen, **When** UI gezeigt wurde, **Then** zeige Erfolgs-Summary

## Technische Details

### Betroffene Dateien
```
src/components/
├── migration/
│   ├── MigrationModal.tsx    # NEU
│   └── MigrationProgress.tsx # NEU
src/app/
└── layout.tsx                # ÄNDERN: Migration Provider
```

### UI Design

```
┌─────────────────────────────────────────┐
│                                         │
│     Deine Daten werden optimiert        │
│                                         │
│     ████████████░░░░░░ 75%              │
│                                         │
│     127 von 170 Einträgen               │
│                                         │
└─────────────────────────────────────────┘
```

Nach Abschluss:

```
┌─────────────────────────────────────────┐
│                                         │
│     ✓ Migration abgeschlossen           │
│                                         │
│     127 Partikel                        │
│     12 Projekte                         │
│     34 Tasks                            │
│                                         │
│     Deine Daten sind jetzt              │
│     bereit für Sync.                    │
│                                         │
│           [Weiter]                      │
│                                         │
└─────────────────────────────────────────┘
```

### Implementierungshinweise

```typescript
// src/components/migration/MigrationModal.tsx

interface MigrationProgress {
  phase: 'sessions' | 'projects' | 'tasks' | 'settings' | 'done';
  current: number;
  total: number;
}

export function MigrationModal() {
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);

  useEffect(() => {
    runMigration(setProgress).then(setResult);
  }, []);

  if (!progress && !result) return null;

  if (result) {
    return <MigrationComplete result={result} />;
  }

  return <MigrationInProgress progress={progress} />;
}
```

## Testing

### Manuell zu testen
- [ ] Mit <50 Einträgen: Kein Modal
- [ ] Mit >50 Einträgen: Modal erscheint
- [ ] Progress-Balken bewegt sich
- [ ] Erfolgs-Screen zeigt korrekte Zahlen

## Definition of Done

- [ ] Code implementiert
- [ ] Modal styled im Particle Design
- [ ] Animation smooth (keine Sprünge)
- [ ] Accessible (Screen Reader freundlich)
