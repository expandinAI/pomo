---
type: story
status: done
priority: p1
effort: 5
feature: "[[features/cloud-sync-accounts]]"
created: 2026-02-06
updated: 2026-02-07
done_date: 2026-02-07
tags: [sync, intentions, supabase, infrastructure]
depends_on: [POMO-305]
blocks: []
---

# POMO-390: Intention Cloud Sync

## User Story

> Als **Particle-Nutzer mit Account**,
> möchte ich **dass meine Daily Intentions automatisch in die Cloud synchronisiert werden**,
> damit **ich auf allen Geräten meine Intentions sehe und der Coach geräteübergreifend davon lernt**.

## Kontext

Intentions sind aktuell die **einzige User-Daten-Entity die nicht gesynct wird**:

| Entity | Cloud-Sync |
|--------|-----------|
| Sessions (Particles) | ✅ via SyncService |
| Projects | ✅ via SyncService |
| Settings (Workflow) | ✅ via settings-sync |
| **Intentions** | ❌ Nur IndexedDB |

Die Infrastruktur ist teilweise vorbereitet:
- `DBIntention` erbt bereits von `SyncableEntity` (hat `syncStatus`, `localUpdatedAt`)
- `getPendingSyncIntentions()` existiert in `storage.ts` — wird aber nie aufgerufen
- Aber: Keine Supabase-Tabelle, kein Sync-Code, kein Initial-Upload

Durch POMO-362+364 (Coach Intention Intelligence) nutzt der Coach jetzt 2 Wochen Intention-History. Ohne Sync geht diese beim Gerätewechsel verloren.

## Akzeptanzkriterien

### A) Supabase Schema

- [ ] **Given** Supabase-Migration, **When** ausgeführt, **Then** existiert Tabelle `intentions` mit allen Feldern
- [ ] **Given** RLS-Policies, **When** User eingeloggt, **Then** kann nur eigene Intentions lesen/schreiben
- [ ] **Given** unique constraint auf `(user_id, date)`, **When** Duplikat-Insert, **Then** Upsert statt Fehler

### B) Push (Lokal → Cloud)

- [ ] **Given** eine neue Intention lokal erstellt, **When** User eingeloggt, **Then** wird sie async zu Supabase gepusht
- [ ] **Given** eine Intention lokal geändert (Status, Text, deferredFrom), **When** Sync aktiv, **Then** wird Update gepusht
- [ ] **Given** eine Intention lokal gelöscht (soft-delete), **When** Sync aktiv, **Then** wird Delete gepusht
- [ ] **Given** Offline-Status, **When** Intention geändert, **Then** wird Änderung in Offline-Queue gespeichert

### C) Pull (Cloud → Lokal)

- [ ] **Given** Pull-Interval (30s), **When** neue Intentions auf Server, **Then** werden sie lokal eingefügt
- [ ] **Given** Intention auf Server geändert, **When** Pull, **Then** wird lokale Version aktualisiert
- [ ] **Given** Intention auf Server gelöscht, **When** Pull, **Then** wird lokal soft-deleted

### D) Initial Upload

- [ ] **Given** bestehender User loggt sich erstmals ein, **When** lokale Intentions vorhanden, **Then** werden alle zu Supabase hochgeladen
- [ ] **Given** User mit Cloud-Daten auf neuem Gerät, **When** erster Sync, **Then** werden Cloud-Intentions lokal eingefügt

### E) Conflict Resolution

- [ ] **Given** gleiche Intention auf 2 Geräten geändert, **When** Sync, **Then** gewinnt die neuere Änderung (last-write-wins, analog zu Sessions/Projects)

## Technische Details

### Betroffene Dateien

```
supabase/
└── migrations/
    └── XXXXXX_add_intentions_table.sql   # NEU: Schema

src/lib/
├── supabase/
│   └── types.ts                          # Erweitern: intentions Table-Type
├── db/
│   └── types.ts                          # Erweitern: SyncEntityType um 'intentions'
├── sync/
│   ├── sync-service.ts                   # Erweitern: pushIntention, pushIntentionDelete, pull
│   ├── offline-queue.ts                  # Erweitern: Queue-Processing für intentions
│   └── initial-upload.ts                 # Erweitern: Intentions hochladen
└── intentions/
    └── storage.ts                        # getPendingSyncIntentions() aktivieren
```

### Datenbank-Schema

```sql
CREATE TABLE intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,                    -- "2026-02-06"
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active|completed|partial|deferred|skipped
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  deferred_from DATE,                    -- Datum der Original-Intention
  particle_goal SMALLINT,                -- 1-9, optional
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,                -- Soft-delete

  UNIQUE(user_id, date)                  -- Max 1 Intention pro Tag
);

-- RLS
ALTER TABLE intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own intentions"
  ON intentions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Index für Pull-Query (nach updated_at)
CREATE INDEX idx_intentions_user_updated
  ON intentions(user_id, updated_at);
```

### SyncService Erweiterung

Analog zum bestehenden Pattern für Sessions/Projects:

```typescript
// In sync-service.ts — gleiche Struktur wie pushSession/pushProject:

async pushIntention(intention: DBIntention): Promise<boolean> { ... }
async pushIntentionDelete(intentionId: string): Promise<boolean> { ... }
private async pushIntentionDirect(intention: DBIntention): Promise<boolean> { ... }
private async pushIntentionDeleteDirect(intentionId: string): Promise<boolean> { ... }
```

### SyncEntityType erweitern

```typescript
// In types.ts:
export type SyncEntityType = 'sessions' | 'projects' | 'intentions';
```

### Offline-Queue erweitern

```typescript
// In offline-queue.ts processQueue():
case 'intentions':
  if (entry.operation === 'delete') {
    success = await this.pushIntentionDeleteDirect(entry.entityId);
  } else {
    const intention = await getIntentionById(entry.entityId);
    if (intention) success = await this.pushIntentionDirect(intention);
  }
```

### Feld-Mapping (Lokal ↔ Supabase)

| IndexedDB (DBIntention) | Supabase (intentions) |
|---|---|
| `id` | `id` (UUID) |
| `date` | `date` (DATE) |
| `text` | `text` |
| `status` | `status` |
| `projectId` | `project_id` (FK → projects) |
| `deferredFrom` | `deferred_from` (DATE) |
| `particleGoal` | `particle_goal` |
| `completedAt` | `completed_at` |
| `localUpdatedAt` | `updated_at` |
| `deleted` | `deleted_at` (null vs timestamp) |

## Testing

### Manuell

- [ ] Intention setzen → erscheint in Supabase (Table Editor prüfen)
- [ ] Intention-Status ändern (complete/defer) → Update in Supabase
- [ ] Intention löschen → `deleted_at` gesetzt in Supabase
- [ ] Offline gehen → Intention setzen → Online gehen → Sync passiert
- [ ] Zweites Gerät öffnen → Intentions erscheinen nach Pull
- [ ] Neuer Account mit lokalen Intentions → Initial Upload funktioniert
- [ ] Coach öffnen auf Gerät B → sieht Weekly Intentions von Gerät A

### Automatisiert

- [ ] Unit Test: Push-Mapping (DBIntention → Supabase Row)
- [ ] Unit Test: Pull-Mapping (Supabase Row → DBIntention)
- [ ] Unit Test: Conflict Resolution (last-write-wins)
- [ ] Unit Test: Offline-Queue Processing für intentions

## Definition of Done

- [ ] Supabase-Migration erstellt und ausgeführt
- [ ] Supabase types.ts erweitert
- [ ] SyncEntityType erweitert
- [ ] Push/Pull/Delete in SyncService implementiert
- [ ] Offline-Queue verarbeitet Intentions
- [ ] Initial-Upload enthält Intentions
- [ ] RLS-Policies getestet
- [ ] Typecheck + Lint clean
- [ ] Tests grün
- [ ] Manuell auf 2 Geräten getestet

## Notizen

**Reihenfolge:** Kann unabhängig von anderen Stories implementiert werden. Folgt dem exakt gleichen Pattern wie Sessions/Projects im SyncService.

**Kosten:** Keine zusätzlichen API-Kosten. Intentions sind kleine Datensätze (~200 Bytes), max 1 pro Tag.

**Migration bestehender User:** Beim nächsten Login werden lokale Intentions automatisch via Initial-Upload hochgeladen. Kein manueller Schritt nötig.
