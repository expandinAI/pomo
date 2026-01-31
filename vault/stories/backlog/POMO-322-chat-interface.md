---
type: story
status: backlog
priority: p1
effort: 5
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, chat, llm]
---

# POMO-322: Chat Interface

## User Story

> Als **Flow-User**
> möchte ich **mit meinem Coach chatten können**,
> damit **ich Fragen stellen und tiefere Insights bekommen kann**.

## Kontext

Link zum Feature: [[features/ai-coach]]

Freies Chat-Interface für Fragen über Arbeitsmuster, Produktivität, Export-Anfragen.

## Akzeptanzkriterien

- [ ] Texteingabe für Nachrichten
- [ ] Enter sendet Nachricht
- [ ] Shift+Enter für Zeilenumbruch
- [ ] Nachrichten erscheinen in Chat-History
- [ ] Coach-Antwort wird gestreamt (Typewriter-Effekt)
- [ ] Loading-State während Anfrage
- [ ] Fehlerbehandlung bei API-Fehlern
- [ ] Quota wird bei jeder Nachricht geprüft
- [ ] Chat-History wird persistiert

## Technische Details

### Betroffene Dateien
```
src/
├── components/
│   └── coach/
│       ├── ChatInput.tsx         # NEU: Eingabefeld
│       ├── ChatMessage.tsx       # NEU: Einzelne Nachricht
│       └── ChatHistory.tsx       # Liste der Nachrichten
├── app/api/coach/
│   └── chat/route.ts             # NEU: Chat-Endpoint
└── lib/
    └── coach/
        ├── prompt.ts             # Master-Prompt
        └── context.ts            # Session-Daten als Kontext
```

### API-Endpoint
```typescript
// POST /api/coach/chat
interface ChatRequest {
  message: string;
  insightId?: string; // Falls Follow-up zu einem Insight
}

interface ChatResponse {
  reply: string;
  quotaRemaining: number;
}
```

### Implementierungshinweise
- Anthropic SDK für Claude-Anfragen
- Streaming für bessere UX (`stream: true`)
- Session-Daten als Kontext mitgeben
- Conversation-History (letzte 10 Nachrichten) für Kontext
- Rate-Limiting am Client (debounce)

### Master-Prompt (Auszug)
```
Du bist der Particle Coach - ein warmer, ermutigender Begleiter.

DEIN CHARAKTER:
- Du feierst Erfolge authentisch
- Du gibst sanfte Hinweise, nie Schuld
- Du sprichst natürlich, nicht corporate
- Du bist wie ein guter Freund, der sich für deine Arbeit interessiert

NUTZER-DATEN:
{session_summary}
{patterns}
{current_insight}

KONVERSATION:
{chat_history}

USER: {message}

Antworte hilfreich und ermutigend. Halte dich kurz (2-4 Sätze),
außer der User fragt nach Details.
```

## UI/UX

**Chat-Input:**
```
┌─────────────────────────────────────────────────────────────┐
│ Frag mich etwas...                                       ↵ │
└─────────────────────────────────────────────────────────────┘
```

**Chat-Nachrichten:**
```
┌───────────────────────────────────────────────────────────┐
│                                                            │
│  Du                                              14:23    │
│  Wie war meine Woche im Vergleich zur letzten?           │
│                                                            │
│  ✨ Coach                                        14:23    │
│  Diese Woche war richtig stark! Du hast 23.5 Stunden     │
│  fokussiert gearbeitet - das sind 18% mehr als letzte    │
│  Woche. Besonders beeindruckend: Mittwoch war dein       │
│  produktivster Tag mit 5.2 Stunden.                      │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

**Loading-State:**
```
│  ✨ Coach                                                 │
│  ●●● (typing animation)                                   │
```

## Testing

### Manuell zu testen
- [ ] Nachricht senden → Antwort kommt
- [ ] Streaming funktioniert
- [ ] Quota wird decremented
- [ ] Bei Limit: Freundliche Meldung
- [ ] Chat-History bleibt nach View schließen
- [ ] Kontext-Awareness (Coach kennt meine Daten)

## Definition of Done

- [ ] Chat-Input implementiert
- [ ] API-Endpoint funktioniert
- [ ] Streaming-Response
- [ ] Chat-History persistiert
- [ ] Quota-Integration
- [ ] Error-Handling
