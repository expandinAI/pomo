---
type: story
status: done
priority: p1
effort: 3
feature: "[[features/gdpr-data-privacy]]"
created: 2026-01-31
updated: 2026-01-31
done_date: 2026-02-03
tags: [gdpr, privacy, export]
---

# POMO-327: Data Export API + UI

## User Story

> As a **user**,
> I want to **download all my data**,
> so that **I can exercise my GDPR right to data portability**.

## Context

Link: [[features/gdpr-data-privacy]]

GDPR Article 15 & 20: Right to access and data portability.

## Acceptance Criteria

- [ ] "Export data" button in Privacy Settings
- [ ] Click generates JSON file
- [ ] Export includes: user data, sessions, projects, settings, coach data
- [ ] Download starts automatically
- [ ] Loading state during generation
- [ ] Error handling for large datasets

## Technical Details

### API Endpoint

```typescript
// POST /api/privacy/export
// Auth: Required (Clerk)

interface ExportResponse {
  exportedAt: string;
  user: {
    email: string;
    createdAt: string;
    tier: string;
  };
  sessions: Session[];
  projects: Project[];
  settings: UserSettings;
  coachData: {
    insights: CoachInsight[];
    chatHistory: CoachMessage[];
  };
}
```

### Files

```
src/
├── app/api/privacy/
│   └── export/route.ts           # NEW
├── components/
│   └── settings/
│       └── PrivacySettings.tsx   # NEW or extend
```

### Implementation Notes

- Query all tables for user
- Build JSON response
- Content-Disposition header for download
- Consider timeout for large datasets (>10k sessions)
- Optional: For very large exports → email with download link

## UI/UX

```
┌─────────────────────────────────────────┐
│ Data Export                             │
│                                         │
│ Download a copy of all your data        │
│ (JSON format).                          │
│                                         │
│ Included:                               │
│ • 127 Particles                         │
│ • 12 Projects                           │
│ • Your settings                         │
│ • Coach history                         │
│                                         │
│ [Export Data]                           │
│                                         │
└─────────────────────────────────────────┘
```

**Loading State:**
```
[⏳ Preparing export...]
```

## Definition of Done

- [ ] API endpoint implemented
- [ ] UI button in Settings
- [ ] Download works
- [ ] All data included
- [ ] Large datasets tested
