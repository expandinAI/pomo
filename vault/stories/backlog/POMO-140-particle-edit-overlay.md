# POMO-140: Particle Edit Overlay

## Story

**As a** user who has completed particles today,
**I want to** click on a filled particle to view and edit its details,
**So that** I can correct mistakes, add context, and maintain an accurate record of my work.

## Context

Building on POMO-139 (Particle Hover Info), this feature transforms particles from passive displays into interactive portals. Clicking a filled particle opens an overlay where users can view the full session details and edit them if needed.

This creates a beautiful interaction model:
- **Empty particles** → Daily Goal Overlay (existing)
- **Filled particles** → Particle Detail Overlay (new)

The particles become a progressive disclosure mechanism: simple dots on the surface, rich functionality underneath.

## Acceptance Criteria

### Opening the Overlay
- [ ] Clicking a filled particle opens the Particle Detail Overlay
- [ ] Tapping a filled particle (touch) opens the Particle Detail Overlay
- [ ] Keyboard: Navigate to particle + Enter opens overlay
- [ ] Empty particles still open Daily Goal Overlay (unchanged)
- [ ] Overlay animates in with existing modal pattern

### Displayed Information
- [ ] Completion time: "14:32" (24h format)
- [ ] Duration: "25 min" (formatted)
- [ ] Task description (if set)
- [ ] Project assignment (if set)
- [ ] Visual particle indicator (filled dot)

### Editing Capabilities
- [ ] **Task**: Inline text input to add/edit task description
- [ ] **Project**: Project selector dropdown (same as timer input)
- [ ] **Duration**: Ability to adjust duration (±1 min, ±5 min)
- [ ] Changes save automatically on blur/close
- [ ] Delete option (with confirmation) to remove particle

### Closing the Overlay
- [ ] Click outside to close (saves changes)
- [ ] Press Escape to close (saves changes)
- [ ] Explicit close button (×)
- [ ] Smooth exit animation

### Feedback & State
- [ ] Unsaved changes indicator (subtle)
- [ ] Success feedback on save (brief)
- [ ] Particle list updates immediately after edit
- [ ] StatusMessage shows confirmation after close

## Technical Notes

### Data Structure
```typescript
interface CompletedSession {
  id: string;              // Unique identifier
  type: SessionType;       // 'work' | 'shortBreak' | 'longBreak'
  duration: number;        // seconds
  completedAt: string;     // ISO timestamp
  task?: string;           // optional task description
  projectId?: string;      // optional project reference
  presetId?: string;       // preset used
  overflowDuration?: number; // overflow time
}
```

### New Functions Needed
```typescript
// session-storage.ts
export function updateSession(
  id: string,
  updates: Partial<Pick<CompletedSession, 'task' | 'projectId' | 'duration'>>
): CompletedSession | null;

export function deleteSession(id: string): boolean;
```

### Component Structure
```
ParticleDetailOverlay/
├── ParticleDetailOverlay.tsx  # Main overlay component
├── ParticleInfo.tsx           # Read-only info display
├── TaskEditor.tsx             # Inline task editing
├── ProjectSelector.tsx        # Project dropdown (reuse existing)
└── DurationAdjuster.tsx       # ±1/±5 min controls
```

### State Flow
1. User clicks filled particle
2. `SessionCounter` calls `onParticleClick(sessionId)`
3. `Timer` sets `selectedParticleId` and opens overlay
4. Overlay fetches session data by ID
5. Edits update local state
6. On close, save changes to localStorage
7. Trigger `todaySessions` refresh

## Design

### Philosophy Alignment
- **Progressive Disclosure**: Surface = dots, depth = full editing
- **Keyboard-first**: Full keyboard navigation possible
- **No guilt**: Can correct mistakes, fix forgotten tasks
- **Minimal UI**: Overlay shows only essential fields
- **Consistent patterns**: Uses same modal style as DailyGoalOverlay

### Visual Mockup
```
┌─────────────────────────────────────┐
│                              ×      │
│            ●                        │
│                                     │
│  14:32 · 25 min                     │
│                                     │
│  Task                               │
│  ┌─────────────────────────────┐    │
│  │ Code review for PR #123     │    │
│  └─────────────────────────────┘    │
│                                     │
│  Project                            │
│  ┌─────────────────────────────┐    │
│  │ Particle              ▼     │    │
│  └─────────────────────────────┘    │
│                                     │
│  Duration                           │
│  ┌──┐  25 min  ┌──┐                 │
│  │ - │         │ + │                │
│  └──┘          └──┘                 │
│                                     │
│           [Delete Particle]         │
│                                     │
└─────────────────────────────────────┘
```

### Interaction Flow
```
● ● ● ○ ○ ○ ○ ○    (hover: "14:32 · 25 min")
    ↑ click

    ↓

┌─ Particle Detail ─┐
│ Edit task, project │
│ Adjust duration    │
│ Delete if needed   │
└────────────────────┘

    ↓ close

● ● ● ○ ○ ○ ○ ○    (updated)
StatusMessage: "Particle updated"
```

## Edge Cases

- **Session without task**: Show empty input with placeholder
- **Session without project**: Show "No project" option selected
- **Deleting last particle**: Counter updates, no empty state issue
- **Very long task**: Truncate in display, show full in edit
- **Concurrent edits**: localStorage is single-user, no conflicts

## Out of Scope

- Editing break sessions (only work particles)
- Bulk editing multiple particles
- Undo/redo functionality
- Session merging or splitting
- Time-of-day editing (only duration)

## Dependencies

- POMO-139: Particle Hover Info (completed)
- Existing: DailyGoalOverlay pattern
- Existing: Project selector component
- Existing: session-storage.ts

## Estimated Effort

Medium (4-6 hours)
- Overlay component: 2h
- Edit functionality: 2h
- Storage updates: 1h
- Polish & testing: 1h

## Future Possibilities

- Keyboard shortcut to open last particle (e.g., `G P`)
- Quick edit mode without full overlay
- Particle notes/comments
- Particle tagging
