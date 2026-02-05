---
type: story
status: backlog
priority: p2
effort: 3
feature: intelligent-particles
created: 2026-02-05
updated: 2026-02-05
done_date: null
tags: [ai, coach, ux, personalization, subtle, 10x]
---

# POMO-384: Silent Intelligence — "The App Thinks With You"

## User Story

> As a **Particle user going about my day**,
> I want **the app to subtly adapt based on my patterns**,
> so that **I feel understood without being told**.

## Context

The best AI is invisible. It doesn't announce itself — it just makes everything feel *right*. This story adds intelligence to existing UI elements without creating new features.

No modals. No buttons. No "AI-powered" badges. Just an app that quietly learns and adapts.

### The 10x Philosophy

> "The best AI is the one you don't notice. It manifests not as a feature, but as a feeling: this app understands me."

## Acceptance Criteria

### A) Smart Preset Highlighting

- [ ] **Given** user's pattern shows preference for 52-min sessions in the morning, **When** opening app at 9am, **Then** "Deep Work" preset has subtle highlight
- [ ] **Given** user typically does short sessions after lunch, **When** opening app at 1pm, **Then** "Pomodoro" preset highlighted
- [ ] **Given** no clear pattern, **When** viewing presets, **Then** no highlighting (default behavior)

### B) Task Prediction / Suggestions

- [ ] **Given** user opens app Monday 9am, **When** they did "Brand Redesign" last 3 Mondays at 9am, **Then** task input shows suggestion: "Brand Redesign?"
- [ ] **Given** user has a recurring task pattern, **When** pattern matches current context, **Then** suggestion appears as placeholder
- [ ] **Given** no matching pattern, **When** viewing task input, **Then** standard placeholder ("What are you working on?")

### C) Intelligent Empty States

- [ ] **Given** Timeline is empty for today, **When** user has patterns, **Then** show contextual message instead of generic "A blank canvas"
- [ ] **Given** it's user's typically strong day, **When** showing empty state, **Then** mention it: "Tuesday — your most productive day. 4.2 avg."
- [ ] **Given** user is in a slump (3+ days no particles), **When** showing empty state, **Then** gentle: "Welcome back. Start small."

### D) Smart Default Duration

- [ ] **Given** user selects project "Deep Work Project", **When** pattern shows avg 45min for this project, **Then** default to Custom preset with 45min
- [ ] **Given** task contains "meeting notes" or similar, **When** pattern shows short sessions, **Then** suggest shorter duration

## Technical Details

### Affected Files

```
src/
├── components/
│   ├── timer/
│   │   ├── PresetSelector.tsx        # Add smart highlighting
│   │   ├── QuickTaskInput.tsx        # Add task prediction
│   │   └── Timer.tsx                 # Smart default duration
│   └── timeline/
│       └── TimelineStats.tsx         # Intelligent empty state
├── lib/
│   └── coach/
│       └── silent-intelligence.ts    # NEW: Pattern-based suggestions
└── hooks/
    ├── useSmartPreset.ts             # NEW: Preset recommendation
    ├── useTaskPrediction.ts          # NEW: Task suggestions
    └── useSmartEmptyState.ts         # NEW: Contextual empty states
```

### A) Smart Preset Highlighting

```typescript
// src/hooks/useSmartPreset.ts
interface PresetRecommendation {
  presetId: string | null;
  confidence: 'high' | 'medium' | 'low';
  reason?: string;
}

function useSmartPreset(): PresetRecommendation {
  const { sessions } = useSessionStore();
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();

  // Analyze sessions at similar times
  const relevantSessions = sessions.filter(s =>
    Math.abs(new Date(s.completedAt).getHours() - currentHour) <= 1
  );

  // Find dominant preset/duration pattern
  const avgDuration = calculateAverage(relevantSessions.map(s => s.duration));

  if (avgDuration > 45 * 60) return { presetId: 'deep-work', confidence: 'medium' };
  if (avgDuration > 30 * 60) return { presetId: 'pomodoro', confidence: 'low' };
  // etc.

  return { presetId: null, confidence: 'low' };
}
```

```tsx
// In PresetSelector.tsx
const { presetId: recommendedPreset, confidence } = useSmartPreset();

// Add subtle ring to recommended preset
<button
  className={cn(
    "...",
    recommendedPreset === preset.id && confidence !== 'low' &&
      "ring-1 ring-tertiary/30"
  )}
>
```

### B) Task Prediction

```typescript
// src/hooks/useTaskPrediction.ts
function useTaskPrediction(): string | null {
  const { sessions } = useSessionStore();
  const { activeProjects } = useProjects();

  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();

  // Find sessions at same day/hour
  const similarContextSessions = sessions.filter(s => {
    const d = new Date(s.completedAt);
    return d.getDay() === currentDay &&
           Math.abs(d.getHours() - currentHour) <= 1;
  });

  // Count task/project occurrences
  const taskCounts = countBy(similarContextSessions, s => s.task || s.projectId);
  const mostFrequent = findMostFrequent(taskCounts);

  // Only suggest if appears 3+ times at this context
  if (mostFrequent.count >= 3) {
    return mostFrequent.name;
  }

  return null;
}
```

```tsx
// In QuickTaskInput.tsx
const predictedTask = useTaskPrediction();

<input
  placeholder={predictedTask
    ? `${predictedTask}?`
    : "What are you working on?"
  }
  // On focus, if user starts typing, clear prediction
/>
```

### C) Intelligent Empty States

```typescript
// src/hooks/useSmartEmptyState.ts
function useSmartEmptyState(): string {
  const { sessions } = useSessionStore();
  const patterns = usePatterns();

  const today = new Date();
  const dayOfWeek = today.getDay();
  const lastSessionDate = getLastSessionDate(sessions);
  const daysSinceLastSession = diffDays(today, lastSessionDate);

  // Returning after break
  if (daysSinceLastSession >= 3) {
    return "Welcome back. Start small.";
  }

  // Strong day pattern
  const avgForToday = patterns.dayOfWeek?.[dayOfWeek];
  if (avgForToday && avgForToday > patterns.overallDayAvg * 1.2) {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    return `${dayName} — your most productive day. ${avgForToday.toFixed(1)} avg.`;
  }

  // Peak hour
  const currentHour = today.getHours();
  if (patterns.peakHours?.includes(currentHour)) {
    return "Your peak focus window. Make it count.";
  }

  // Default
  return "A blank canvas";
}
```

### D) Smart Default Duration

```typescript
// src/lib/coach/silent-intelligence.ts
function suggestDuration(
  projectId: string | undefined,
  task: string | undefined,
  sessions: CompletedSession[]
): number | null {
  // Filter to matching project/task
  const relevant = sessions.filter(s =>
    s.projectId === projectId ||
    (task && s.task?.toLowerCase().includes(task.toLowerCase()))
  );

  if (relevant.length < 5) return null; // Not enough data

  const avgDuration = average(relevant.map(s => s.duration));

  // Round to nearest 5 minutes
  return Math.round(avgDuration / 300) * 300;
}
```

## UI/UX

### Preset Highlighting

```
┌─────────────────────────────────────────┐
│                                         │
│  [Pomodoro]  [Deep Work]  [90-Min]      │
│       └─ subtle ring ─┘                 │
│                                         │
│  Recommended for morning focus          │  ← Optional tooltip on hover
│                                         │
└─────────────────────────────────────────┘
```

**Styling:**
- Ring: `ring-1 ring-tertiary/30` (very subtle)
- No label by default — just the visual hint
- Tooltip on hover explains recommendation (optional)

### Task Prediction

```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐│
│  │ Brand Redesign?                    │││  ← Placeholder as suggestion
│  └─────────────────────────────────────┘│
│                                         │
│  Press Enter to start                   │
└─────────────────────────────────────────┘
```

**Behavior:**
- Suggestion appears as placeholder
- User can ignore and type their own
- If user presses Enter without typing, use suggestion
- Question mark signals it's a suggestion, not assumption

### Intelligent Empty State

```
Timeline (empty):
┌─────────────────────────────────────────┐
│                                         │
│              ·                          │  ← Breathing dot
│                                         │
│  Tuesday — your most productive day.    │
│           4.2 avg.                      │
│                                         │
└─────────────────────────────────────────┘
```

## Testing

### Manual Testing

- [ ] Morning (9am), deep work pattern → "Deep Work" preset highlighted
- [ ] Afternoon (2pm), short session pattern → "Pomodoro" highlighted
- [ ] Monday 9am + recurring task → task suggestion in placeholder
- [ ] No pattern → no suggestion, no highlighting
- [ ] Timeline empty on strong day → contextual message
- [ ] Timeline empty after 3-day break → "Welcome back" message
- [ ] Select project with duration pattern → suggested duration

### Automated Tests

- [ ] Unit test `useSmartPreset` with various session histories
- [ ] Unit test `useTaskPrediction` with recurring patterns
- [ ] Unit test `useSmartEmptyState` with different scenarios
- [ ] Test edge cases (no data, insufficient data)

## Definition of Done

- [ ] Smart preset highlighting based on time patterns
- [ ] Task prediction in input placeholder
- [ ] Intelligent empty states in Timeline
- [ ] All features gracefully degrade with insufficient data
- [ ] No visible "AI" branding — just subtle adaptations
- [ ] Typecheck + Lint pass
- [ ] No API calls — purely local pattern matching

## Notes

**The key principle: Subtlety**

These features should never feel "in your face." If a user doesn't notice them consciously but just feels like the app "gets them," we've succeeded.

**Feature flags (future):**
Could add setting to disable smart suggestions for users who prefer vanilla experience.

**No API calls:**
This is entirely client-side pattern matching. No impact on quota, works offline, instant.

**Why "Silent"?**
The app doesn't say "Based on AI, we recommend..." — it just quietly adapts. The intelligence is in the background, not the foreground.
