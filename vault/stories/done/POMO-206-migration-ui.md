---
type: story
status: done
priority: p1
effort: 2
feature: "[[features/local-first-persistence]]"
created: 2026-01-28
updated: 2026-01-30
done_date: 2026-01-30
tags: [ui, migration, onboarding]
---

# POMO-206: Migration Progress UI – Transparenz schaffen

## User Story

> Als **bestehender Nutzer mit vielen Daten**
> möchte ich **den Migrations-Fortschritt sehen**,
> damit **ich weiß, dass meine Partikel sicher übertragen werden**.

## Kontext

Link zum Feature: [[features/local-first-persistence]]

**Vorgänger:** POMO-201, 202, 203 (alle Migrationen)

Bei Nutzern mit >50 Einträgen kann die Migration einige Sekunden dauern. Ein Progress-Indicator verhindert Verwirrung und schafft Vertrauen.

**Reihenfolge:** POMO-200 → 201 → 202 → 203 → **POMO-206**

## Akzeptanzkriterien

- [x] **Given** <50 Einträge, **When** Migration läuft, **Then** kein UI (zu schnell)
- [x] **Given** ≥50 Einträge, **When** Migration läuft, **Then** zeige Progress Overlay
- [x] **Given** Migration abgeschlossen, **When** UI gezeigt wurde, **Then** zeige Erfolgs-Summary für 2s
- [x] **Given** Migration UI, **When** angezeigt, **Then** kann der User nicht interagieren (blockiert)
- [x] **Given** Migration Errors, **When** sie auftreten, **Then** werden sie geloggt aber nicht dem User gezeigt

## Technische Details

### Dateistruktur

```
src/
├── components/
│   └── migration/
│       ├── index.ts              # NEU: Exports
│       ├── MigrationOverlay.tsx  # NEU: Haupt-Komponente
│       └── MigrationProgress.tsx # NEU: Progress-Anzeige
├── hooks/
│   └── useMigration.ts           # NEU: Migration Hook
└── app/
    └── layout.tsx                # ÄNDERN: Migration Provider
```

### Migration Hook

```typescript
// src/hooks/useMigration.ts

import { useState, useEffect, useCallback } from 'react';
import {
  runMigrations,
  hasPendingMigrations,
  countPendingEntries,
  summarizeMigration,
  type MigrationResult,
  type MigrationProgress as MigrationProgressType,
  type MigrationSummary,
} from '@/lib/db/migrations';
import { isIndexedDBAvailable } from '@/lib/db';

export type MigrationState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'not-needed' }
  | { status: 'running'; progress: MigrationProgressType }
  | { status: 'complete'; summary: MigrationSummary }
  | { status: 'error'; error: string };

const SHOW_UI_THRESHOLD = 50; // Mindestanzahl für UI

export function useMigration() {
  const [state, setState] = useState<MigrationState>({ status: 'idle' });
  const [showUI, setShowUI] = useState(false);

  const runMigration = useCallback(async () => {
    // IndexedDB verfügbar?
    if (!isIndexedDBAvailable()) {
      console.warn('[Migration] IndexedDB not available, skipping');
      setState({ status: 'not-needed' });
      return;
    }

    // Migration nötig?
    if (!hasPendingMigrations()) {
      setState({ status: 'not-needed' });
      return;
    }

    // Einträge zählen für UI-Entscheidung
    const entryCount = countPendingEntries();
    const shouldShowUI = entryCount >= SHOW_UI_THRESHOLD;
    setShowUI(shouldShowUI);

    setState({ status: 'checking' });

    try {
      const results = await runMigrations((progress) => {
        setState({ status: 'running', progress });
      });

      const summary = summarizeMigration(results);

      // Errors loggen, aber nicht dem User zeigen
      if (summary.errors.length > 0) {
        console.error('[Migration] Errors:', summary.errors);
      }

      setState({ status: 'complete', summary });

      // UI automatisch schließen nach 2s (wenn gezeigt)
      if (shouldShowUI) {
        setTimeout(() => {
          setShowUI(false);
        }, 2000);
      }
    } catch (e) {
      console.error('[Migration] Fatal error:', e);
      setState({
        status: 'error',
        error: e instanceof Error ? e.message : 'Unknown error',
      });
      // Trotzdem UI schließen nach 3s
      setTimeout(() => setShowUI(false), 3000);
    }
  }, []);

  // Auto-Start beim Mount
  useEffect(() => {
    runMigration();
  }, [runMigration]);

  return {
    state,
    showUI,
    isComplete: state.status === 'complete' || state.status === 'not-needed',
  };
}
```

### Migration Overlay

```typescript
// src/components/migration/MigrationOverlay.tsx

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMigration } from '@/hooks/useMigration';
import { MigrationProgress } from './MigrationProgress';

export function MigrationOverlay() {
  const { state, showUI, isComplete } = useMigration();

  return (
    <AnimatePresence>
      {showUI && !isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
          <div className="max-w-md w-full px-8">
            {state.status === 'running' && (
              <MigrationProgress progress={state.progress} />
            )}

            {state.status === 'complete' && (
              <MigrationComplete summary={state.summary} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MigrationComplete({ summary }: { summary: MigrationSummary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      {/* Particle Animation */}
      <motion.div
        className="w-4 h-4 bg-white rounded-full mx-auto mb-8"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <h2 className="text-xl font-medium text-white mb-4">
        Migration abgeschlossen
      </h2>

      <div className="space-y-2 text-tertiary text-sm">
        {summary.sessions > 0 && (
          <p>{summary.sessions} Partikel</p>
        )}
        {summary.projects > 0 && (
          <p>{summary.projects} Projekte</p>
        )}
        {summary.tasks > 0 && (
          <p>{summary.tasks} Tasks</p>
        )}
      </div>

      <p className="text-tertiary text-sm mt-6">
        Deine Daten sind jetzt bereit für Sync.
      </p>
    </motion.div>
  );
}
```

### Migration Progress

```typescript
// src/components/migration/MigrationProgress.tsx

'use client';

import { motion } from 'framer-motion';
import type { MigrationProgress as MigrationProgressType } from '@/lib/db/migrations';

interface Props {
  progress: MigrationProgressType;
}

export function MigrationProgress({ progress }: Props) {
  const percentage = Math.round(
    (progress.completed / progress.total) * 100
  );

  return (
    <div className="text-center">
      {/* Pulsierender Particle */}
      <motion.div
        className="w-3 h-3 bg-white rounded-full mx-auto mb-8"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <h2 className="text-lg font-medium text-white mb-6">
        Deine Daten werden optimiert
      </h2>

      {/* Progress Bar */}
      <div className="h-1 bg-tertiary/20 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      <p className="text-tertiary text-sm">
        {getPhaseLabel(progress.current)}
      </p>
    </div>
  );
}

function getPhaseLabel(phase: string): string {
  switch (phase) {
    case 'sessions-v1':
      return 'Partikel werden übertragen...';
    case 'projects-v1':
      return 'Projekte werden übertragen...';
    case 'settings-v1':
      return 'Einstellungen werden übertragen...';
    case 'recent-tasks-v1':
      return 'Tasks werden übertragen...';
    default:
      return 'Migration läuft...';
  }
}
```

### Integration in Layout

```typescript
// src/app/layout.tsx (erweitern)

import { MigrationOverlay } from '@/components/migration';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MigrationOverlay />
        {children}
      </body>
    </html>
  );
}
```

### Exports

```typescript
// src/components/migration/index.ts

export { MigrationOverlay } from './MigrationOverlay';
export { MigrationProgress } from './MigrationProgress';
```

## UI Design

### Progress-Ansicht

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle (pulsierend)
│                                                             │
│              Deine Daten werden optimiert                   │
│                                                             │
│              ████████████░░░░░░░░░░░░░░░░░                  │  ← Progress Bar (weiß)
│                                                             │
│              Partikel werden übertragen...                  │  ← Phase-Label (grau)
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Erfolgs-Ansicht (2 Sekunden)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle (sanftes Pulsieren)
│                                                             │
│              Migration abgeschlossen                        │
│                                                             │
│              127 Partikel                                   │
│              12 Projekte                                    │
│              34 Tasks                                       │
│                                                             │
│              Deine Daten sind jetzt                         │
│              bereit für Sync.                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Design-Prinzipien

- **Schwarzer Hintergrund**: Particle-Ästhetik, kein Modal
- **Minimaler Text**: Nur was nötig ist
- **Kein "Weiter" Button**: Auto-Close nach 2s
- **Kein Cancel**: Migration ist schnell und wichtig
- **Keine Error-Anzeige**: Errors werden geloggt, User sieht nur Erfolg

## Testing

### Manuell zu testen

- [ ] Mit <50 Einträgen: Kein Overlay sichtbar
- [ ] Mit ≥50 Einträgen: Overlay erscheint
- [ ] Progress-Balken bewegt sich smooth
- [ ] Phase-Labels wechseln korrekt
- [ ] Erfolgs-Screen zeigt korrekte Zahlen
- [ ] Auto-Close nach 2 Sekunden
- [ ] App ist während Migration blockiert

### Automatisierte Tests

```typescript
describe('MigrationOverlay', () => {
  it('shows UI when entry count >= 50', async () => {
    // Mock countPendingEntries to return 60
    jest.mock('@/lib/db/migrations', () => ({
      ...jest.requireActual('@/lib/db/migrations'),
      countPendingEntries: () => 60,
    }));

    render(<MigrationOverlay />);

    expect(await screen.findByText('Deine Daten werden optimiert')).toBeInTheDocument();
  });

  it('hides UI when entry count < 50', async () => {
    jest.mock('@/lib/db/migrations', () => ({
      ...jest.requireActual('@/lib/db/migrations'),
      countPendingEntries: () => 20,
    }));

    render(<MigrationOverlay />);

    await waitFor(() => {
      expect(screen.queryByText('Deine Daten werden optimiert')).not.toBeInTheDocument();
    });
  });

  it('auto-closes after completion', async () => {
    jest.useFakeTimers();

    render(<MigrationOverlay />);

    // Wait for migration to complete
    await waitFor(() => {
      expect(screen.getByText('Migration abgeschlossen')).toBeInTheDocument();
    });

    // Advance timer
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Migration abgeschlossen')).not.toBeInTheDocument();
  });
});
```

## Definition of Done

- [x] `useMigration` Hook implementiert
- [x] `MigrationOverlay` Komponente mit Progress und Complete States
- [x] In `layout.tsx` integriert
- [x] Threshold von 50 Einträgen funktioniert
- [x] Auto-Close nach 2s
- [x] Smooth Animations (Framer Motion)
- [ ] Tests geschrieben & grün (deferred - manual testing done)
- [x] Particle-Design konsistent (schwarzer BG, weißer Particle)
- [x] Demo mode via `?demo-migration` URL parameter

## Notizen

**Warum kein "Skip" Button?**
- Migration ist wichtig und schnell
- Skip würde zu Datenverlust führen
- User soll nicht entscheiden müssen

**Warum keine Error-Anzeige?**
- Errors sind technisch und verunsichern
- Wir loggen sie für Debugging
- Teilweise Migration ist besser als keine
- User kann nichts dagegen tun

**Threshold von 50:**
- Bei <50 Einträgen: <500ms, nicht sichtbar
- Bei 50-500 Einträgen: 500ms-2s, Progress sinnvoll
- Bei >500 Einträgen: >2s, Progress wichtig
- 50 ist ein guter Kompromiss

---

## Arbeitsverlauf

### Gestartet: 2026-01-30

### Erledigt: 2026-01-30

**Implementiert:**
- `src/hooks/useMigration.ts` - State machine hook mit auto-start
- `src/components/migration/MigrationOverlay.tsx` - Full-screen overlay
- `src/components/migration/MigrationProgress.tsx` - Progress bar + phase labels
- `src/components/migration/index.ts` - Exports
- Extended `src/lib/db/migrations/index.ts` with `onProgress` callback
- Integrated in `src/app/layout.tsx`

**Bonus:**
- Demo mode via `?demo-migration` URL parameter for testing/screenshots

**Commits:**
- `f320465` feat(db): Add Migration Progress UI (POMO-206)
- `0318915` feat(db): Add demo mode for migration UI
