---
type: decision
status: accepted
date: 2026-01-28
superseded_by: null
tags: [architecture, database, migration, sync]
---

# ADR-002: Schema Evolution Strategy

## Status

**accepted**

## Kontext

Mit mehreren Clients (Web, Mac, iOS) und einer Cloud-Datenbank müssen wir Schema-Änderungen so handhaben, dass:

1. **Alte Daten nicht brechen** – Bestehende Partikel müssen weiter funktionieren
2. **Alte Clients koexistieren** – Nicht alle Nutzer updaten gleichzeitig
3. **Migrationen einfach sind** – Entwickler sollen schnell iterieren können
4. **Sync robust bleibt** – Unterschiedliche Schema-Versionen dürfen Sync nicht brechen

### Das Problem illustriert

```
Szenario: Neues "rating" Feld für Sessions

Tag 1: Web v2 deployed (kennt rating)
Tag 2: Nutzer A erstellt Session mit rating: 5 auf Web
Tag 3: Nutzer A öffnet Mac App v1 (kennt rating NICHT)
Tag 4: Mac App synct Session → Was passiert mit rating?
```

## Entscheidung

Wir werden eine **Additive-Only Schema Evolution** mit **Partial Updates** verwenden.

### Kernprinzipien

1. **Neue Felder sind IMMER optional** (`field?: Type`)
2. **Neue Felder haben IMMER sinnvolle Defaults** (NULL/undefined ist okay)
3. **Felder werden NIE entfernt** (nur deprecated markiert)
4. **Felder werden NIE umbenannt** (neues Feld + Migration)
5. **Sync verwendet Partial Updates** (nur bekannte Felder senden)

### Implementierung

#### TypeScript (Web)

```typescript
// RICHTIG: Neues Feld optional
interface Session {
  id: string;
  type: 'work' | 'short_break' | 'long_break';
  duration: number;
  completedAt: string;
  task?: string;
  projectId?: string;
  rating?: 1 | 2 | 3 | 4 | 5;  // NEU: Optional!
}

// FALSCH: Required neues Feld
interface Session {
  rating: 1 | 2 | 3 | 4 | 5;  // ❌ Alte Daten haben das nicht!
}
```

#### IndexedDB (Dexie.js)

```typescript
class ParticleDB extends Dexie {
  constructor() {
    super('ParticleDB');

    // Version 1: Original Schema
    this.version(1).stores({
      sessions: 'id, completedAt, projectId, syncStatus',
    });

    // Version 2: Rating hinzugefügt
    this.version(2).stores({
      sessions: 'id, completedAt, projectId, syncStatus, rating',
    }).upgrade(tx => {
      // Keine Daten-Migration nötig - rating ist optional
      console.log('Schema v2: rating field added');
    });

    // Version 3: Weiteres Feld
    this.version(3).stores({
      sessions: 'id, completedAt, projectId, syncStatus, rating, mood',
    });
  }
}
```

#### Supabase (PostgreSQL)

```sql
-- Migration 001: Add rating
ALTER TABLE sessions
ADD COLUMN rating INTEGER
CHECK (rating >= 1 AND rating <= 5);
-- NULL ist automatisch erlaubt, kein DEFAULT nötig

-- Migration 002: Add mood
ALTER TABLE sessions
ADD COLUMN mood TEXT
CHECK (mood IN ('focused', 'distracted', 'tired', 'energized'));
```

#### Swift (Native Apps)

```swift
// Session Model mit optionalen Feldern
struct Session: Codable {
    let id: String
    let type: SessionType
    let duration: Int
    let completedAt: Date
    let task: String?
    let projectId: String?
    let rating: Int?        // NEU: Optional

    // CodingKeys für Rückwärtskompatibilität
    enum CodingKeys: String, CodingKey {
        case id, type, duration, completedAt, task, projectId, rating
    }

    // Decoder ignoriert unbekannte Felder automatisch
}
```

### Sync: Partial Updates

Der kritische Teil ist, wie Sync mit unterschiedlichen Schema-Versionen umgeht:

```typescript
// SCHLECHT: Full Object Replace
async function pushSession(session: Session) {
  await supabase.from('sessions').upsert({
    ...session,  // ❌ Alte Clients senden kein rating → NULL überschreibt!
  });
}

// GUT: Partial Update mit bekannten Feldern
async function pushSession(session: Session) {
  const payload: Record<string, unknown> = {
    client_id: session.id,
    type: session.type,
    duration: session.duration,
    completed_at: session.completedAt,
    updated_at: new Date().toISOString(),
  };

  // Nur optionale Felder senden, wenn sie existieren
  if (session.task !== undefined) payload.task = session.task;
  if (session.projectId !== undefined) payload.project_id = session.projectId;
  if (session.rating !== undefined) payload.rating = session.rating;

  await supabase.from('sessions').upsert(payload, {
    onConflict: 'user_id,client_id',
  });
}

// ALTERNATIV: Server-side Merge via Edge Function
async function mergeSession(incoming: Partial<Session>, existing: Session): Session {
  return {
    ...existing,      // Behalte alle bestehenden Felder
    ...Object.fromEntries(
      Object.entries(incoming).filter(([_, v]) => v !== undefined)
    ),                // Überschreibe nur definierte Felder
  };
}
```

## Optionen

### Option A: Full Replace bei Sync

**Beschreibung:** Jeder Client sendet das komplette Objekt.

**Pro:**
- Einfach zu implementieren
- Konsistenter State

**Contra:**
- Alte Clients überschreiben neue Felder mit NULL
- Datenverlust möglich

### Option B: Versionierte Schemas mit Transformation

**Beschreibung:** Jeder Client sendet seine Schema-Version, Server transformiert.

**Pro:**
- Explizite Versionierung
- Server kann intelligent mergen

**Contra:**
- Komplexität auf Server
- Viele Transformationen bei vielen Versionen
- Wartungsaufwand

### Option C: Additive Schema + Partial Updates *(gewählt)*

**Beschreibung:** Neue Felder sind immer optional, Clients senden nur bekannte Felder.

**Pro:**
- Einfach zu implementieren
- Keine Server-Transformationen nötig
- Alte Clients können nicht neue Felder zerstören
- Natürlich rückwärts- UND vorwärtskompatibel

**Contra:**
- Felder können nie entfernt werden (nur deprecated)
- Schema wächst über Zeit

## Konsequenzen

### Positive
- Keine Breaking Changes möglich
- Alte und neue Clients koexistieren problemlos
- Einfache Migrationen (nur ADD COLUMN)
- Sync bleibt robust
- Nutzer verlieren nie Daten

### Negative
- Datenbank-Schema wird über Zeit größer
- "Deprecated" Felder bleiben ewig
- TypeScript-Interfaces haben viele optionale Felder

### Risiken
- Entwickler vergessen `?` bei neuen Feldern → Code Review Checkliste
- Sync-Code wird komplex → Abstraktion in Sync-Service

### Mitigationen
- **Checkliste für neue Felder** (siehe unten)
- **Lint-Regel** für optionale Felder in Sync-Models
- **Tests** die alte Daten mit neuem Code prüfen

## Checkliste: Neues Feld hinzufügen

```markdown
## Checkliste für neues Feld: `{{fieldName}}`

### TypeScript (Web)
- [ ] Interface mit `?` erweitert
- [ ] Default-Wert definiert (falls nötig)
- [ ] UI zeigt Fallback wenn undefined

### IndexedDB (Dexie)
- [ ] Neue Version in schema.ts
- [ ] Index hinzugefügt (falls Query nötig)
- [ ] Upgrade-Funktion (falls Daten-Migration nötig)

### Supabase
- [ ] Migration erstellt (ALTER TABLE ADD COLUMN)
- [ ] CHECK Constraint (falls Wertebereich begrenzt)
- [ ] RLS Policies geprüft

### Swift (Native)
- [ ] Model erweitert mit Optional
- [ ] CodingKeys aktualisiert

### Sync
- [ ] Push sendet Feld nur wenn defined
- [ ] Pull mapped NULL → undefined
- [ ] Tests mit alten Clients

### Dokumentation
- [ ] CHANGELOG.md aktualisiert
- [ ] API Docs aktualisiert (falls extern)
```

## Beispiele

### Beispiel 1: Rating hinzufügen (einfach)

```typescript
// 1. TypeScript
interface Session {
  // ...existing
  rating?: 1 | 2 | 3 | 4 | 5;
}

// 2. Dexie
this.version(2).stores({
  sessions: 'id, completedAt, projectId, syncStatus, rating',
});

// 3. Supabase
ALTER TABLE sessions ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);

// 4. UI
{session.rating && <RatingStars value={session.rating} />}

// 5. Fertig! Alte Sessions haben rating: undefined, funktionieren weiter.
```

### Beispiel 2: Feld umbenennen (komplex)

```typescript
// FALSCH
- task?: string;
+ taskName?: string;  // ❌ Breaking!

// RICHTIG
// 1. Neues Feld hinzufügen
task?: string;        // Behalten (deprecated)
taskName?: string;    // NEU

// 2. Dexie Migration
this.version(3).upgrade(async tx => {
  await tx.table('sessions').toCollection().modify(session => {
    if (session.task && !session.taskName) {
      session.taskName = session.task;
    }
  });
});

// 3. Supabase Migration
ALTER TABLE sessions ADD COLUMN task_name TEXT;
UPDATE sessions SET task_name = task WHERE task_name IS NULL;

// 4. Code verwendet taskName, liest task als Fallback
const displayTask = session.taskName ?? session.task;

// 5. Nach 6 Monaten: task-Feld nur noch lesen, nie schreiben
```

### Beispiel 3: Enum erweitern

```typescript
// Vorher
type SessionType = 'work' | 'short_break' | 'long_break';

// Nachher (erweiterbar)
type SessionType = 'work' | 'short_break' | 'long_break' | 'micro_break';

// Alte Clients ignorieren 'micro_break' Sessions beim Anzeigen
// Neue Clients können alle Types
// Keine Migration nötig!
```

## Notizen

### Referenzen
- [[ADR-001-multi-platform-architecture]] – Übergeordnete Architektur
- [[ADR-003-sync-strategy]] – Sync Details
- [[features/local-first-persistence]] – IndexedDB Implementation
- [[features/cloud-sync-accounts]] – Supabase Schema

### Weiterführende Ressourcen
- [Dexie.js Schema Versioning](https://dexie.org/docs/Tutorial/Design#database-versioning)
- [Supabase Migrations](https://supabase.com/docs/guides/database/migrations)
- [Expandable Contracts (API Design)](https://www.martinfowler.com/articles/consumerDrivenContracts.html)
