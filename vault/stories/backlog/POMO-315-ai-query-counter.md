---
type: story
status: backlog
priority: p1
effort: 3
feature: "[[features/payment-integration]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [payment, ai, limits]
---

# POMO-315: AI Query Counter & Limits

## User Story

> Als **Flow-User**
> möchte ich **sehen wie viele AI-Anfragen ich noch habe**,
> damit **ich mein Limit im Blick behalte**.

## Kontext

Link zum Feature: [[features/payment-integration]]

Flow-User bekommen 300 AI-Anfragen pro Monat. Counter muss getrackt und angezeigt werden.

## Akzeptanzkriterien

- [ ] Jede AI-Anfrage erhöht Counter
- [ ] Counter wird monatlich zurückgesetzt
- [ ] UI zeigt aktuellen Stand (z.B. "247/300")
- [ ] Bei 90% Limit: Warnung
- [ ] Bei 100% Limit: Freundliche Meldung, keine weiteren Anfragen
- [ ] Proaktive Coach-Insights zählen auch zum Limit

## Technische Details

### Datenbank-Änderungen
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  ai_queries_used INTEGER DEFAULT 0,
  ai_queries_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Monatlicher Reset via Cron oder bei erster Anfrage des Monats
```

### Betroffene Dateien
```
src/
├── lib/
│   └── ai-quota.ts               # NEU: Quota-Management
├── app/api/coach/
│   └── chat/route.ts             # Quota-Check vor Anfrage
└── components/
    └── coach/
        └── QuotaIndicator.tsx    # NEU: Anzeige
```

### Implementierungshinweise
- Check vor jeder AI-Anfrage: `canUseAI(userId)`
- Increment nach erfolgreicher Anfrage
- Reset-Logik: Wenn `ai_queries_reset_at` < Monatsanfang → Reset
- Edge-Case: Genau am 1. des Monats

### Quota-Logik
```typescript
async function checkAndIncrementQuota(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}> {
  // 1. Reset if new month
  // 2. Check if under limit
  // 3. Increment if allowed
  // 4. Return status
}
```

## UI/UX

Im Coach-View:
```
┌──────────────────────────────────────┐
│  Coach                    247/300    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░     │
│  Erneuert sich am 1. März            │
└──────────────────────────────────────┘
```

Bei Limit erreicht:
```
┌──────────────────────────────────────┐
│  Du hast dein Limit für diesen       │
│  Monat erreicht. Am 1. März          │
│  bekommst du wieder 300 Anfragen.    │
│                                       │
│  Tipp: Deine bisherigen Insights     │
│  kannst du weiterhin ansehen.        │
└──────────────────────────────────────┘
```

## Definition of Done

- [ ] Counter in DB implementiert
- [ ] Quota-Check bei AI-Anfragen
- [ ] UI-Anzeige im Coach
- [ ] Limit-Reached UI
- [ ] Monatlicher Reset funktioniert
