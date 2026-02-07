---
type: story
status: done
priority: p1
effort: 3
feature: null
created: 2026-02-07
updated: 2026-02-07
done_date: 2026-02-07
tags: [coach, persistence, indexeddb]
---

# POMO-400: Chat Persistence

## User Story

> Als **Particle-User**
> möchte ich **dass meine Coach-Gespräche erhalten bleiben**,
> damit **ich nach Seitenwechsel oder Modal-Schließen nahtlos weiter chatten kann**.

## Kontext

Coach-Chat-Nachrichten waren rein in-memory (`useState`). Jedes Schließen des Modals oder Neuladen der Seite hat alle Nachrichten verloren. Das machte den Coach unbrauchbar für echte Gespräche.

## Akzeptanzkriterien

- [x] **Given** offenes Coach-Modal mit Nachrichten, **When** Modal schließen und wieder öffnen, **Then** alle Nachrichten sind noch da
- [x] **Given** offenes Coach-Modal mit Nachrichten, **When** Seite neu laden, **Then** letzte Konversation wird automatisch geladen
- [x] **Given** laufende Konversation, **When** "New Chat" klicken, **Then** Nachrichten werden geleert, neue Konversation startet
- [x] **Given** streaming Coach-Antwort, **When** Antwort abgeschlossen, **Then** nur die finale Nachricht wird gespeichert (kein Partial-Save)

## Technische Details

### Betroffene Dateien
```
src/
├── lib/db/
│   ├── types.ts           # DBChatMessage Interface
│   ├── database.ts        # Schema v6, chatMessages Table
│   └── chat-storage.ts    # CRUD Layer (NEU)
├── hooks/
│   └── useCoachChat.ts    # Persistence-Integration
└── components/coach/
    └── CoachView.tsx       # "New Chat" Button
```

### Implementierungshinweise
- Local-only: Kein Supabase-Sync (Privatsphäre)
- Single active conversation (kein Konversations-Listen-UI)
- Auto-resume: Letzte Konversation wird beim Öffnen geladen
- Coach-Nachrichten werden erst nach vollständigem Streaming gespeichert
- `clearHistory` ersetzt durch `startNewChat` (neue conversationId, alte Daten bleiben)

### Datenbank-Änderungen
```typescript
// Schema v6 — neue chatMessages Tabelle
interface DBChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'coach';
  content: string;
  createdAt: string; // ISO timestamp
}

// Indexes: id, conversationId, createdAt
```

## Definition of Done

- [x] Code implementiert
- [x] `pnpm typecheck` bestanden
- [x] `pnpm lint` bestanden (keine neuen Warnings)
- [x] `pnpm test` bestanden (8 pre-existing Failures, keine neuen)
- [x] Lokal getestet

## Arbeitsverlauf

### Gestartet: 2026-02-07

1. `DBChatMessage` Type in `types.ts`
2. Schema v6 mit `chatMessages` Table in `database.ts`
3. `chat-storage.ts` CRUD Layer erstellt
4. `useCoachChat.ts` komplett überarbeitet: Load on mount, save user/coach messages, `startNewChat`
5. "New Chat" Button in `CoachView.tsx` Header

### Erledigt: 2026-02-07
Commit: `2bd8b62` — `feat(coach): Persist chat messages in IndexedDB across sessions (POMO-400)`
