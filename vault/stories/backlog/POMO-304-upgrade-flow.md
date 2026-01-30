---
type: story
status: backlog
priority: p0
effort: 5
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-29
done_date: null
tags: [feature, upgrade, sync, onboarding]
---

# POMO-304: Lokal → Particle Upgrade Flow

## User Story

> Als **Lokal-Nutzer mit lokalen Daten**
> möchte ich **beim Erstellen eines Accounts meine Daten hochladen**,
> damit **ich meine bisherige Arbeit nicht verliere und auf allen Geräten Zugriff habe**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-303 (Tier System)

Der kritischste Flow: Ein Nutzer hat vielleicht Monate lang im Lokal-Modus gearbeitet. Beim Upgrade zu Particle müssen alle lokalen Daten zuverlässig in die Cloud übertragen werden.

**Wichtig:** Dies ist der "erste Sync" – danach übernimmt der reguläre Sync-Service (POMO-305).

**Reihenfolge:** POMO-303 → **POMO-304** → POMO-305 → ...

## Akzeptanzkriterien

- [ ] **Given** lokale Daten in IndexedDB, **When** Account erstellt wird, **Then** zeigt Modal die Daten-Summary
- [ ] **Given** Nutzer bestätigt Upload, **When** Sync startet, **Then** werden alle Daten hochgeladen
- [ ] **Given** Upload läuft, **When** Fehler auftritt, **Then** kann Nutzer retry
- [ ] **Given** Upload abgeschlossen, **When** User auf anderem Gerät einloggt, **Then** sind Daten da
- [ ] **Given** keine lokalen Daten, **When** Account erstellt wird, **Then** überspringe Upload-Modal

## Technische Details

### Dateistruktur

```
src/
├── components/
│   └── upgrade/
│       ├── index.ts                # NEU: Exports
│       ├── UpgradeModal.tsx        # NEU: Haupt-Modal
│       ├── DataSummary.tsx         # NEU: Daten-Zusammenfassung
│       └── UploadProgress.tsx      # NEU: Progress-Anzeige
├── lib/
│   └── sync/
│       └── initial-upload.ts       # NEU: Upload-Logik
```

### Initial Upload Service

```typescript
// src/lib/sync/initial-upload.ts

import type { SupabaseClient } from '@supabase/supabase-js';
import { getDB, type DBSession, type DBProject } from '@/lib/db';

export interface UploadProgress {
  phase: 'projects' | 'sessions' | 'settings';
  current: number;
  total: number;
  detail: string;
}

export interface UploadResult {
  sessions: number;
  projects: number;
  settings: boolean;
  errors: string[];
}

export interface LocalDataSummary {
  sessions: number;
  projects: number;
  hasSettings: boolean;
  isEmpty: boolean;
}

/**
 * Zählt die lokalen Daten für die Summary-Anzeige.
 */
export async function getLocalDataSummary(): Promise<LocalDataSummary> {
  const db = getDB();

  const [sessions, projects, settings] = await Promise.all([
    db.sessions.count(),
    db.projects.count(),
    db.settings.count(),
  ]);

  return {
    sessions,
    projects,
    hasSettings: settings > 0,
    isEmpty: sessions === 0 && projects === 0,
  };
}

/**
 * Führt den initialen Upload aller lokalen Daten durch.
 * Wird einmalig nach Account-Erstellung ausgeführt.
 */
export async function performInitialUpload(
  supabase: SupabaseClient,
  userId: string,
  onProgress: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const db = getDB();
  const result: UploadResult = {
    sessions: 0,
    projects: 0,
    settings: false,
    errors: [],
  };

  // 1. Lokale Daten laden
  const [localProjects, localSessions] = await Promise.all([
    db.projects.toArray(),
    db.sessions.toArray(),
  ]);

  const total = localProjects.length + localSessions.length + 1; // +1 für Settings
  let current = 0;

  // 2. Projects zuerst (Sessions referenzieren sie)
  const projectIdMap = new Map<string, string>(); // client_id -> server_id

  for (const project of localProjects) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .upsert(
          {
            user_id: userId,
            client_id: project.id,
            name: project.name,
            brightness: project.brightness,
            archived: project.archived,
            created_at: project.createdAt,
            updated_at: project.updatedAt,
          },
          { onConflict: 'user_id,client_id' }
        )
        .select('id')
        .single();

      if (error) throw error;

      projectIdMap.set(project.id, data.id);

      // Lokal als synced markieren
      await db.projects.update(project.id, {
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        serverId: data.id,
      });

      result.projects++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      result.errors.push(`Projekt "${project.name}": ${msg}`);
    }

    current++;
    onProgress({
      phase: 'projects',
      current,
      total,
      detail: `${result.projects} / ${localProjects.length} Projekte`,
    });
  }

  // 3. Sessions hochladen
  for (const session of localSessions) {
    try {
      // Server-Project-ID ermitteln (falls vorhanden)
      const serverProjectId = session.projectId
        ? projectIdMap.get(session.projectId) || null
        : null;

      const { data, error } = await supabase
        .from('sessions')
        .upsert(
          {
            user_id: userId,
            client_id: session.id,
            type: session.type,
            duration: session.duration,
            completed_at: session.completedAt,
            task: session.task || null,
            project_id: serverProjectId,
            preset_id: session.presetId || null,
            estimated_pomodoros: session.estimatedPomodoros || null,
            overflow_duration: session.overflowDuration || null,
            estimated_duration: session.estimatedDuration || null,
          },
          { onConflict: 'user_id,client_id' }
        )
        .select('id')
        .single();

      if (error) throw error;

      // Lokal als synced markieren
      await db.sessions.update(session.id, {
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        serverId: data.id,
      });

      result.sessions++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      result.errors.push(`Session ${session.id.slice(0, 8)}...: ${msg}`);
    }

    current++;
    onProgress({
      phase: 'sessions',
      current,
      total,
      detail: `${result.sessions} / ${localSessions.length} Partikel`,
    });
  }

  // 4. Settings hochladen (Workflow-Settings nur)
  try {
    const timerSettings = await db.settings.get('timer');
    const workflowSettings = await db.settings.get('workflow');

    if (timerSettings || workflowSettings) {
      const { error } = await supabase.from('user_settings').upsert(
        {
          user_id: userId,
          work_duration: timerSettings?.value?.workDuration ?? 1500,
          short_break_duration: timerSettings?.value?.shortBreakDuration ?? 300,
          long_break_duration: timerSettings?.value?.longBreakDuration ?? 900,
          sessions_until_long_break:
            timerSettings?.value?.sessionsUntilLongBreak ?? 4,
          overflow_enabled: workflowSettings?.value?.overflowEnabled ?? false,
          daily_goal: workflowSettings?.value?.dailyGoal ?? 4,
          auto_start_enabled: workflowSettings?.value?.autoStartEnabled ?? false,
          auto_start_delay: workflowSettings?.value?.autoStartDelay ?? 5,
          auto_start_mode: workflowSettings?.value?.autoStartMode ?? 'breaks',
          custom_preset: timerSettings?.value?.customPreset ?? null,
        },
        { onConflict: 'user_id' }
      );

      if (error) throw error;
      result.settings = true;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    result.errors.push(`Settings: ${msg}`);
  }

  current++;
  onProgress({
    phase: 'settings',
    current,
    total,
    detail: 'Einstellungen',
  });

  return result;
}
```

### Upgrade Modal

```typescript
// src/components/upgrade/UpgradeModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cloud, Check } from 'lucide-react';
import { DataSummary } from './DataSummary';
import { UploadProgress } from './UploadProgress';
import {
  getLocalDataSummary,
  performInitialUpload,
  type LocalDataSummary,
  type UploadProgress as UploadProgressType,
  type UploadResult,
} from '@/lib/sync/initial-upload';
import { useSupabase } from '@/lib/supabase/client';
import { useAuth } from '@clerk/nextjs';

interface UpgradeModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

type Phase = 'summary' | 'uploading' | 'success' | 'error';

export function UpgradeModal({ isOpen, onComplete }: UpgradeModalProps) {
  const supabase = useSupabase();
  const { userId } = useAuth();

  const [phase, setPhase] = useState<Phase>('summary');
  const [summary, setSummary] = useState<LocalDataSummary | null>(null);
  const [progress, setProgress] = useState<UploadProgressType | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  // Lade Summary beim Öffnen
  useEffect(() => {
    if (isOpen) {
      getLocalDataSummary().then(setSummary);
      setPhase('summary');
    }
  }, [isOpen]);

  // Skip wenn keine Daten
  useEffect(() => {
    if (summary?.isEmpty) {
      onComplete();
    }
  }, [summary, onComplete]);

  async function handleStartUpload() {
    if (!supabase || !userId) return;

    setPhase('uploading');

    try {
      const uploadResult = await performInitialUpload(
        supabase,
        userId,
        setProgress
      );

      setResult(uploadResult);

      if (uploadResult.errors.length === 0) {
        setPhase('success');
        // Auto-close nach 2s
        setTimeout(onComplete, 2000);
      } else {
        setPhase('error');
      }
    } catch (e) {
      setResult({
        sessions: 0,
        projects: 0,
        settings: false,
        errors: [e instanceof Error ? e.message : 'Unbekannter Fehler'],
      });
      setPhase('error');
    }
  }

  function handleRetry() {
    setPhase('summary');
    setProgress(null);
    setResult(null);
  }

  if (!isOpen || !summary || summary.isEmpty) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-surface border border-tertiary/20 rounded-2xl overflow-hidden"
        >
          {phase === 'summary' && (
            <SummaryPhase
              summary={summary}
              onStart={handleStartUpload}
              onSkip={onComplete}
            />
          )}

          {phase === 'uploading' && progress && (
            <UploadingPhase progress={progress} />
          )}

          {phase === 'success' && result && <SuccessPhase result={result} />}

          {phase === 'error' && result && (
            <ErrorPhase result={result} onRetry={handleRetry} onSkip={onComplete} />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SummaryPhase({
  summary,
  onStart,
  onSkip,
}: {
  summary: LocalDataSummary;
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="p-6">
      {/* Particle */}
      <div className="flex justify-center mb-8">
        <motion.div
          className="w-3 h-3 bg-white rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      <h2 className="text-xl font-medium text-white text-center mb-2">
        Willkommen bei Particle!
      </h2>
      <p className="text-tertiary text-center mb-6">
        Du hast lokale Daten, die wir synchronisieren können:
      </p>

      <DataSummary summary={summary} />

      <div className="mt-8 space-y-3">
        <button
          onClick={onStart}
          className="w-full py-3 bg-white text-black rounded-xl font-medium
                     hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          <Cloud className="w-4 h-4" />
          Jetzt synchronisieren
        </button>

        <button
          onClick={onSkip}
          className="w-full py-2 text-tertiary hover:text-secondary transition-colors text-sm"
        >
          Später
        </button>
      </div>
    </div>
  );
}

function UploadingPhase({ progress }: { progress: UploadProgressType }) {
  const percentage = Math.round((progress.current / progress.total) * 100);

  return (
    <div className="p-6">
      {/* Animierter Particle */}
      <div className="flex justify-center mb-8">
        <motion.div
          className="w-3 h-3 bg-white rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>

      <h2 className="text-lg font-medium text-white text-center mb-6">
        Daten werden synchronisiert
      </h2>

      <UploadProgress progress={progress} />

      <p className="text-tertiary text-sm text-center mt-4">{progress.detail}</p>
    </div>
  );
}

function SuccessPhase({ result }: { result: UploadResult }) {
  return (
    <div className="p-6">
      {/* Success Particle */}
      <div className="flex justify-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"
        >
          <Check className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      <h2 className="text-xl font-medium text-white text-center mb-4">
        Synchronisation abgeschlossen
      </h2>

      <div className="space-y-2 text-center text-tertiary text-sm">
        {result.sessions > 0 && <p>{result.sessions} Partikel synchronisiert</p>}
        {result.projects > 0 && <p>{result.projects} Projekte synchronisiert</p>}
        {result.settings && <p>Einstellungen synchronisiert</p>}
      </div>

      <p className="text-tertiary text-sm text-center mt-6">
        Deine Daten sind jetzt sicher in der Cloud.
      </p>
    </div>
  );
}

function ErrorPhase({
  result,
  onRetry,
  onSkip,
}: {
  result: UploadResult;
  onRetry: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-medium text-white text-center mb-4">
        Einige Daten konnten nicht synchronisiert werden
      </h2>

      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
        <p className="text-red-400 text-sm">
          {result.errors.length} Fehler aufgetreten
        </p>
      </div>

      {/* Was erfolgreich war */}
      {(result.sessions > 0 || result.projects > 0) && (
        <div className="text-tertiary text-sm mb-6">
          <p>Erfolgreich synchronisiert:</p>
          {result.sessions > 0 && <p>• {result.sessions} Partikel</p>}
          {result.projects > 0 && <p>• {result.projects} Projekte</p>}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full py-3 bg-white text-black rounded-xl font-medium
                     hover:bg-zinc-200 transition-colors"
        >
          Erneut versuchen
        </button>

        <button
          onClick={onSkip}
          className="w-full py-2 text-tertiary hover:text-secondary transition-colors text-sm"
        >
          Mit teilweiser Synchronisation fortfahren
        </button>
      </div>
    </div>
  );
}
```

### Data Summary Component

```typescript
// src/components/upgrade/DataSummary.tsx

'use client';

import type { LocalDataSummary } from '@/lib/sync/initial-upload';

interface DataSummaryProps {
  summary: LocalDataSummary;
}

export function DataSummary({ summary }: DataSummaryProps) {
  return (
    <div className="bg-tertiary/10 rounded-xl p-4 space-y-2">
      {summary.sessions > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Partikel</span>
          <span className="text-white font-medium">{summary.sessions}</span>
        </div>
      )}

      {summary.projects > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Projekte</span>
          <span className="text-white font-medium">{summary.projects}</span>
        </div>
      )}

      {summary.hasSettings && (
        <div className="flex justify-between text-sm">
          <span className="text-secondary">Einstellungen</span>
          <span className="text-white font-medium">✓</span>
        </div>
      )}
    </div>
  );
}
```

### Upload Progress Component

```typescript
// src/components/upgrade/UploadProgress.tsx

'use client';

import { motion } from 'framer-motion';
import type { UploadProgress as UploadProgressType } from '@/lib/sync/initial-upload';

interface UploadProgressProps {
  progress: UploadProgressType;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  const percentage = Math.round((progress.current / progress.total) * 100);

  return (
    <div>
      {/* Progress Bar */}
      <div className="h-1 bg-tertiary/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Percentage */}
      <div className="flex justify-end mt-2">
        <span className="text-tertiary text-xs">{percentage}%</span>
      </div>
    </div>
  );
}
```

### Exports

```typescript
// src/components/upgrade/index.ts

export { UpgradeModal } from './UpgradeModal';
export { DataSummary } from './DataSummary';
export { UploadProgress } from './UploadProgress';
```

### Integration nach Sign-Up

```typescript
// In page.tsx oder einem Auth-Callback:

const { user } = useUser();
const [showUpgradeModal, setShowUpgradeModal] = useState(false);

// Nach erfolgreichem Sign-Up prüfen
useEffect(() => {
  if (user && isNewUser(user)) {
    // Prüfen ob lokale Daten existieren
    getLocalDataSummary().then((summary) => {
      if (!summary.isEmpty) {
        setShowUpgradeModal(true);
      }
    });
  }
}, [user]);

<UpgradeModal
  isOpen={showUpgradeModal}
  onComplete={() => setShowUpgradeModal(false)}
/>
```

## UI Design

### Daten-Summary

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle (pulsierend)
│                                                             │
│              Willkommen bei Particle!                       │
│                                                             │
│          Du hast lokale Daten, die wir                      │
│          synchronisieren können:                            │
│                                                             │
│          ┌───────────────────────────────────┐              │
│          │  Partikel             127         │              │
│          │  Projekte              12         │              │
│          │  Einstellungen          ✓         │              │
│          └───────────────────────────────────┘              │
│                                                             │
│          ┌───────────────────────────────────┐              │
│          │     ☁  Jetzt synchronisieren      │              │  ← Primary CTA
│          └───────────────────────────────────┘              │
│                                                             │
│                      [Später]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Upload Progress

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ·                                  │  ← Particle (schnell pulsierend)
│                                                             │
│              Daten werden synchronisiert                    │
│                                                             │
│          ████████████████░░░░░░░░░░░░░░░░░       65%       │
│                                                             │
│              82 / 127 Partikel                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Erfolg

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         ✓                                   │  ← Checkmark Icon
│                                                             │
│              Synchronisation abgeschlossen                  │
│                                                             │
│              127 Partikel synchronisiert                    │
│              12 Projekte synchronisiert                     │
│              Einstellungen synchronisiert                   │
│                                                             │
│              Deine Daten sind jetzt                         │
│              sicher in der Cloud.                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Testing

### Manuell zu testen

- [ ] Mit lokalen Daten: Modal erscheint nach erstem Login
- [ ] Ohne lokale Daten: Modal wird übersprungen
- [ ] Progress zeigt korrekte Zahlen
- [ ] Nach Upload: Daten in Supabase Dashboard sichtbar
- [ ] Auf anderem Gerät einloggen → Daten sind da
- [ ] Bei Netzwerk-Fehler: Retry funktioniert
- [ ] "Später" Button schließt Modal

### Automatisierte Tests

```typescript
describe('Initial Upload', () => {
  it('returns correct summary', async () => {
    // Seed IndexedDB with test data
    await db.sessions.bulkAdd(mockSessions);
    await db.projects.bulkAdd(mockProjects);

    const summary = await getLocalDataSummary();

    expect(summary.sessions).toBe(mockSessions.length);
    expect(summary.projects).toBe(mockProjects.length);
    expect(summary.isEmpty).toBe(false);
  });

  it('uploads all data correctly', async () => {
    const progress: UploadProgressType[] = [];

    const result = await performInitialUpload(
      mockSupabase,
      'user-123',
      (p) => progress.push(p)
    );

    expect(result.sessions).toBe(mockSessions.length);
    expect(result.projects).toBe(mockProjects.length);
    expect(result.errors).toHaveLength(0);
  });

  it('marks data as synced after upload', async () => {
    await performInitialUpload(mockSupabase, 'user-123', () => {});

    const sessions = await db.sessions.toArray();
    expect(sessions.every((s) => s.syncStatus === 'synced')).toBe(true);
  });
});
```

## Definition of Done

- [ ] `getLocalDataSummary()` implementiert
- [ ] `performInitialUpload()` robust mit Error Handling
- [ ] UpgradeModal mit allen Phasen (Summary, Uploading, Success, Error)
- [ ] Progress-Anzeige accurate
- [ ] Retry-Mechanismus funktioniert
- [ ] "Später" Option funktioniert
- [ ] Skip wenn keine lokalen Daten
- [ ] Daten auf anderem Gerät verifiziert
- [ ] Tests geschrieben & grün

## Notizen

**Reihenfolge beim Upload:**
1. Projects zuerst (Sessions referenzieren sie via project_id)
2. Sessions mit gemappten Project-IDs
3. Settings zuletzt

**Error Handling:**
- Einzelne Fehler stoppen nicht den gesamten Upload
- Erfolgreich hochgeladene Daten bleiben erhalten
- User kann Retry für fehlgeschlagene Einträge

**"Später" Verhalten:**
- Lokale Daten bleiben in IndexedDB
- Sync-Service wird nicht gestartet (kein Account = kein Sync)
- Bei nächstem Login wird Modal erneut gezeigt

---

## Arbeitsverlauf

### Gestartet:
<!-- Claude: Notiere hier was du tust -->

### Erledigt:
<!-- Wird automatisch ausgefüllt wenn Story nach done/ verschoben wird -->
