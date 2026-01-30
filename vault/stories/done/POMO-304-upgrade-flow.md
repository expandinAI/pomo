---
type: story
status: done
priority: p0
effort: 5
feature: "[[features/cloud-sync-accounts]]"
created: 2026-01-28
updated: 2026-01-30
done_date: 2026-01-30
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

- [x] **Given** lokale Daten in IndexedDB, **When** Account erstellt wird, **Then** zeigt Modal die Daten-Summary
- [x] **Given** Nutzer bestätigt Upload, **When** Sync startet, **Then** werden alle Daten hochgeladen
- [x] **Given** Upload läuft, **When** Fehler auftritt, **Then** kann Nutzer retry
- [x] **Given** Upload abgeschlossen, **When** User auf anderem Gerät einloggt, **Then** sind Daten da
- [x] **Given** keine lokalen Daten, **When** Account erstellt wird, **Then** überspringe Upload-Modal

## Implementierung

### Neue Dateien

```
src/
├── components/
│   └── upgrade/
│       ├── index.ts           # Exports
│       ├── UpgradeModal.tsx   # Haupt-Modal mit 4 Phasen
│       ├── DataSummary.tsx    # Daten-Zusammenfassung
│       └── UploadProgress.tsx # Progress-Anzeige
├── hooks/
│   └── useUpgradeFlow.ts      # Hook für Flow-Steuerung
├── lib/
│   └── sync/
│       ├── index.ts           # Exports
│       └── initial-upload.ts  # Upload-Logik
```

### Upload Service (`initial-upload.ts`)

| Funktion | Beschreibung |
|----------|--------------|
| `getLocalDataSummary()` | Zählt Sessions, Projects, Settings |
| `hasLocalData()` | Boolean Check |
| `performInitialUpload()` | Führt Upload durch mit Progress-Callback |

### Hook: `useUpgradeFlow`

```typescript
const {
  showUpgradeModal,    // Boolean ob Modal gezeigt werden soll
  upgradeUserId,       // Clerk User ID
  completeUpgrade,     // Nach erfolgreichem Sync
  skipUpgrade,         // Skip für später
  triggerUpgrade,      // Manuell auslösen
} = useUpgradeFlow();
```

### UpgradeModal Phasen

| Phase | UI |
|-------|-----|
| `loading` | Spinner während Summary geladen |
| `summary` | Daten-Übersicht + "Sync Now" Button |
| `uploading` | Progress-Bar mit Prozent |
| `success` | Checkmark + "Data synced!" |
| `error` | Fehlermeldung + Retry Button |

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `page.tsx` | Event-Handler für `particle:open-auth`, UpgradeModal Integration |

### Event-Handler

| Event | Aktion |
|-------|--------|
| `particle:open-auth` | Navigation zu `/sign-up` |

## Definition of Done

- [x] `getLocalDataSummary()` implementiert
- [x] `performInitialUpload()` mit Error-Handling
- [x] UpgradeModal mit allen 4 Phasen
- [x] Event-Handler für `particle:open-auth`
- [x] Modal erscheint nach Sign-Up (wenn lokale Daten)
- [x] Daten werden in Supabase hochgeladen
- [x] TypeCheck & Lint & Build erfolgreich

## Notizen

**Upload-Reihenfolge:**
1. Projects zuerst (Sessions referenzieren sie)
2. Sessions mit gemappten Server-Project-IDs (Batch-Upload)
3. Settings zuletzt

**Nach Upload:** Lokale Einträge werden als `syncStatus: 'synced'` markiert.

**RLS Type Issue:** Supabase RLS macht die Insert-Types zu `never`. Lösung: `as never` Cast (siehe `hooks.ts` Pattern).

---

## Arbeitsverlauf

### Erledigt: 2026-01-30

- Initial Upload Service in `src/lib/sync/` implementiert
- UpgradeModal mit 4 Phasen (loading, summary, uploading, success, error)
- DataSummary und UploadProgress Komponenten
- `useUpgradeFlow` Hook für Flow-Steuerung
- Event-Handler für `particle:open-auth` in page.tsx
- Integration in AnimatePresence
- TypeCheck, Lint, Build: Alle erfolgreich
