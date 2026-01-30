---
type: story
status: done
priority: p0
effort: 8
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-30
done_date: 2026-01-30
tags: [infrastructure, sync, core, offline]
---

# POMO-305: Sync Service mit Offline Queue

## User Story

> Als **Nutzer mit Account**
> möchte ich **dass meine Daten automatisch synchronisiert werden**,
> damit **ich auf allen Geräten den aktuellen Stand habe ohne manuell syncen zu müssen**.

## Kontext

Link zum Feature: [[features/cloud-sync-accounts]]

**Vorgänger:** POMO-304 (Upgrade Flow)

Der Sync Service ist das Herzstück der Multi-Device-Experience. Er:
- Pusht lokale Änderungen sofort zu Supabase
- Pullt Server-Änderungen alle 30 Sekunden
- Queued Änderungen wenn offline
- Processed die Queue wenn wieder online

**Wichtig:** Der Sync Service startet nur für eingeloggte User (Particle/Flow).

## Akzeptanzkriterien

- [x] **Given** ein neuer Partikel, **When** er lokal gespeichert wird, **Then** wird er async zu Supabase gepusht
- [x] **Given** der Pull-Interval, **When** 30s vergangen sind, **Then** werden neue Server-Daten geholt
- [x] **Given** die App im Hintergrund, **When** sie in den Vordergrund kommt, **Then** wird sofort gesynct
- [x] **Given** Offline-Status, **When** Änderungen gemacht werden, **Then** werden sie gequeued
- [x] **Given** Online-Status wieder hergestellt, **When** Queue nicht leer, **Then** werden Einträge abgearbeitet

## Implementierte Dateien

```
src/lib/sync/
├── index.ts              # Public exports
├── types.ts              # Sync Types (SyncState, SyncConfig, etc.)
├── sync-service.ts       # Haupt-Service mit Push/Pull/Queue
├── sync-context.tsx      # React Context (SyncProvider)
├── sync-events.ts        # Event-basierte Kommunikation
├── offline-queue.ts      # Offline Queue Management
└── initial-upload.ts     # Aus POMO-304
```

## Definition of Done

- [x] SyncService implementiert mit SupabaseClientFactory für Token-Refresh
- [x] Push bei Änderungen funktioniert (Sessions & Projects)
- [x] Pull alle 30s funktioniert
- [x] Focus-Sync funktioniert (Pull bei Window-Focus)
- [x] Offline-Queue implementiert (Dexie syncQueue Table)
- [x] Queue Processing mit Exponential Backoff (1min → 16min)
- [x] React Context bereitgestellt (`SyncProvider`, `useSyncService`)
- [x] Database Schema v3 mit `serverId` Index
- [x] Event-basierte Kommunikation zwischen Contexts und SyncService
- [x] Multi-Device Sync getestet (Chrome ↔ Safari)

## Getestet

| Test | Status |
|------|--------|
| Partikel erstellen → anderer Browser | ✅ |
| Partikel editieren (Task, Dauer) → anderer Browser | ✅ |
| Partikel löschen → anderer Browser | ✅ |
| Projekt umbenennen → anderer Browser | ✅ |
| JWT Token Refresh (lange Sessions) | ✅ |

## Notizen

**Sync-Strategie:**
- Push: Sofort bei jeder lokalen Änderung
- Pull: Alle 30 Sekunden + bei Focus
- Queue: Bei Offline oder Fehler

**JWT Token Refresh:**
- SyncService erhält `SupabaseClientFactory` statt festen Client
- Bei jedem Request wird ein frischer Token geholt
- Verhindert 401 Errors bei langen Sessions

**Dexie Schema:**
- v2: syncQueue Table hinzugefügt
- v3: serverId Index für Sessions und Projects

---

## Arbeitsverlauf

### Erledigt: 2026-01-30
- Implementierung aller Sync-Komponenten
- Fix für JWT Token Expiration (SupabaseClientFactory Pattern)
- Fix für Dexie SchemaError (serverId Index in v3)
- Multi-Device Testing erfolgreich
