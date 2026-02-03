---
type: story
status: done
priority: p1
effort: 8
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-02-02
done_date: 2026-02-02
tags: [ai, coach, backend, insights]
---

# POMO-323: Insight Engine Backend

## User Story

> As the **system**,
> I want to **automatically generate insights from user data**,
> so that **the Coach can proactively share valuable observations**.

## Context

Link: [[features/ai-coach]]

The heart of the Coach. Analyzes session data, detects patterns, generates insights. This is what makes the Coach feel alive and intelligent.

## Acceptance Criteria

- [ ] Insight generation after every 3rd-5th session
- [ ] Weekly summary (Sunday/Monday)
- [ ] Anomaly detection (significant deviations)
- [ ] Pattern recognition (work habits)
- [ ] Insights stored in database
- [ ] Max 3 proactive insights per day
- [ ] Cooldown of 2h between insights
- [ ] Insights count toward quota limit

## Technical Details

### Files
```
src/
├── lib/
│   └── coach/
│       ├── insight-engine.ts     # NEW: Main logic
│       ├── patterns.ts           # NEW: Pattern detection
│       ├── anomalies.ts          # NEW: Anomaly detection
│       └── prompts.ts            # NEW: Insight prompts
├── app/api/
│   └── coach/
│       └── generate/route.ts     # NEW: Trigger endpoint
└── app/api/cron/
    └── weekly-insights/route.ts  # NEW: Weekly job
```

### Database
```sql
CREATE TABLE coach_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'session' | 'pattern' | 'anomaly' | 'weekly'
  trigger TEXT,       -- What triggered the insight
  short_text TEXT,    -- Toast text (max 100 chars)
  full_text TEXT,     -- Detailed explanation
  data JSONB,         -- Relevant numbers/context
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_user ON coach_insights(user_id, created_at DESC);
CREATE INDEX idx_insights_unread ON coach_insights(user_id)
  WHERE read_at IS NULL;
```

### Insight Types

| Type | Trigger | Example |
|------|---------|---------|
| `session` | After session | "That was your 5th particle today!" |
| `pattern` | Pattern detected | "You're most productive 9-12am" |
| `anomaly` | Significant deviation | "50% less focus than usual today" |
| `weekly` | Weekly cron | "Your week: 23 hours of focus" |

### Pattern Detection (Algorithms)

1. **Most Productive Time of Day**
   - Group sessions by hour
   - Find peak times

2. **Most Productive Days of Week**
   - Aggregate by weekday
   - Compare with average

3. **Break Patterns**
   - Calculate time between sessions
   - Compare with recommended 5-15min

4. **Session Length**
   - Average vs preset duration
   - Overflow frequency

### Anomaly Detection

```typescript
function detectAnomaly(todayStats: Stats, historicalStats: Stats): Anomaly | null {
  const deviation = (todayStats.totalFocus - historicalStats.average) / historicalStats.stdDev;

  if (Math.abs(deviation) > 1.5) {
    return {
      type: deviation > 0 ? 'high' : 'low',
      percentage: Math.round(Math.abs(deviation - 1) * 100),
      message: deviation > 0
        ? `${percentage}% more than usual`
        : `${percentage}% less than usual`
    };
  }
  return null;
}
```

### Prompt for Insight Generation

```
Generate a short, encouraging insight based on:

DATA:
{pattern_data}

TRIGGER:
{trigger_reason}

RULES:
- Max 2 sentences for short_text (toast)
- Be warm and encouraging
- No guilt, no comparisons to others
- Mention specific numbers when helpful
- English, casual tone

Respond in JSON format:
{
  "short_text": "...",
  "full_text": "..."
}
```

## Testing

- [ ] After 5 sessions: insight generated
- [ ] Weekly insight appears
- [ ] Anomaly detected correctly
- [ ] Max 3 insights per day enforced
- [ ] Insights stored in database

## Definition of Done

- [ ] Pattern detection implemented
- [ ] Anomaly detection implemented
- [ ] Insight generation with LLM
- [ ] Database schema created
- [ ] Post-session trigger
- [ ] Weekly cron job
- [ ] Frequency limiting
