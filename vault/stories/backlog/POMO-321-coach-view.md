---
type: story
status: backlog
priority: p1
effort: 5
feature: "[[features/ai-coach]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [ai, coach, view, overlay]
---

# POMO-321: Coach View (G C)

## User Story

> As a **Flow user**,
> I want to **open the Coach view**,
> so that **I can read insights and chat with my Coach**.

## Context

Link: [[features/ai-coach]]

Central view for all Coach interactions. Shows current insight prominently and chat history below. The Coach feels like a wise companion, not a chatbot.

## Acceptance Criteria

- [ ] Opens on click of Coach particle
- [ ] Opens on G C shortcut
- [ ] Shows current/latest insight prominently
- [ ] Shows chat history below
- [ ] Chat input at bottom
- [ ] Quota display (247/300)
- [ ] Close with × or Escape
- [ ] Smooth slide-in animation

## Technical Details

### Files
```
src/
├── components/
│   └── coach/
│       ├── CoachView.tsx         # NEW: Main component
│       ├── InsightCard.tsx       # NEW: Insight display
│       ├── ChatHistory.tsx       # NEW: Message list
│       └── QuotaIndicator.tsx    # NEW: Limit display
├── hooks/
│   └── useCoach.ts               # NEW: Coach state
└── app/
    └── page.tsx                  # Include modal
```

### Implementation Notes
- Overlay pattern like other views (Timeline, Stats)
- Focus trap in modal
- Keyboard navigation
- Scroll for chat history

## UI/UX

```
┌─────────────────────────────────────────────────────────────────┐
│  Coach                                247/300            [×]    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✨ Today's Insight                                              │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  You focused 127% more than usual for a Friday.                  │
│                                                                   │
│  That's remarkable. You typically work about 3 hours on          │
│  Fridays, but today you've already logged 6.8 hours.            │
│                                                                   │
│  What I noticed:                                                 │
│  • You started earlier (8:14 vs 9:30)                           │
│  • Fewer project switches                                        │
│  • Longer sessions (45min average)                              │
│                                                                   │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  💬 Chat                                                         │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ You: Why was I so productive today?                       │  │
│  │                                                            │  │
│  │ Coach: I see a few factors that were different...         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Ask me anything...                                    ↵ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Layout Structure
- Header: Title + Quota + Close
- Main: Scrollable content
  - Insight Card (if available)
  - Chat History
- Footer: Chat input (fixed)

## Definition of Done

- [ ] View component implemented
- [ ] G C shortcut registered
- [ ] Insight card shows current insight
- [ ] Chat history scrollable
- [ ] Quota display correct
- [ ] Keyboard accessible
- [ ] Responsive (Mobile + Desktop)
