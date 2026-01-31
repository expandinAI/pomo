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

> As a **Flow user**,
> I want to **chat with my Coach**,
> so that **I can ask questions and get deeper insights about my work patterns**.

## Context

Link: [[features/ai-coach]]

Free-form chat interface for questions about work patterns, productivity, and data export requests. The Coach knows your data and speaks with warmth.

## Acceptance Criteria

- [ ] Text input for messages
- [ ] Enter sends message
- [ ] Shift+Enter for line break
- [ ] Messages appear in chat history
- [ ] Coach response is streamed (typewriter effect)
- [ ] Loading state during request
- [ ] Error handling for API failures
- [ ] Quota is checked on each message
- [ ] Chat history is persisted

## Technical Details

### Files
```
src/
├── components/
│   └── coach/
│       ├── ChatInput.tsx         # NEW: Input field
│       ├── ChatMessage.tsx       # NEW: Single message
│       └── ChatHistory.tsx       # Message list
├── app/api/coach/
│   └── chat/route.ts             # NEW: Chat endpoint
└── lib/
    └── coach/
        ├── prompt.ts             # Master prompt
        └── context.ts            # Session data as context
```

### API Endpoint
```typescript
// POST /api/coach/chat
interface ChatRequest {
  message: string;
  insightId?: string; // If follow-up to an insight
}

interface ChatResponse {
  reply: string;
  quotaRemaining: number;
}
```

### Implementation Notes
- Anthropic SDK for Claude requests
- Streaming for better UX (`stream: true`)
- Include session data as context
- Conversation history (last 10 messages) for context
- Client-side rate limiting (debounce)

### Master Prompt (Summary)
```
You are the Particle Coach – a warm, encouraging companion.

YOUR CHARACTER:
- Celebrate wins authentically
- Give gentle observations, never guilt
- Speak naturally, not corporate
- Be like a good friend who cares about their work

USER DATA:
{session_summary}
{patterns}
{current_insight}

CONVERSATION:
{chat_history}

Respond helpfully and encouragingly. Keep it brief (2-4 sentences)
unless the user asks for details.
```

## UI/UX

**Chat Input:**
```
┌─────────────────────────────────────────────────────────────┐
│ Ask me anything...                                       ↵ │
└─────────────────────────────────────────────────────────────┘
```

**Chat Messages:**
```
┌───────────────────────────────────────────────────────────┐
│                                                            │
│  You                                              2:23 PM │
│  How was my week compared to last week?                   │
│                                                            │
│  ✨ Coach                                         2:23 PM │
│  This week was strong! You focused for 23.5 hours –      │
│  that's 18% more than last week. Especially impressive:  │
│  Wednesday was your most productive day with 5.2 hours.  │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

**Loading State:**
```
│  ✨ Coach                                                 │
│  ●●● (typing animation)                                   │
```

## Testing

- [ ] Send message → response arrives
- [ ] Streaming works
- [ ] Quota is decremented
- [ ] At limit: friendly message
- [ ] Chat history persists after closing view
- [ ] Context-aware (Coach knows my data)

## Definition of Done

- [ ] Chat input implemented
- [ ] API endpoint works
- [ ] Streaming response
- [ ] Chat history persisted
- [ ] Quota integration
- [ ] Error handling
