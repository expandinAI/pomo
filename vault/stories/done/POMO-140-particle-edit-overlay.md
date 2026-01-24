# POMO-140: Particle Edit Overlay

**Status:** Done
**Completed:** 2026-01-24
**Commits:** `690bca7`, `8ee221c`

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
- [x] Clicking a filled particle opens the Particle Detail Overlay
- [x] Tapping a filled particle (touch) opens the Particle Detail Overlay
- [x] Keyboard: Navigate to particle + Enter opens overlay
- [x] Empty particles still open Daily Goal Overlay (unchanged)
- [x] Overlay animates in with existing modal pattern

### Displayed Information
- [x] Completion time: "14:32" (24h format)
- [x] Duration: "25 min" (formatted)
- [x] Task description (if set)
- [x] Project assignment (if set)
- [x] Visual particle indicator (breathing animated dot)
- [x] Particle index context ("3rd particle")
- [x] Overflow info when applicable (planned + extra)

### Editing Capabilities
- [x] **Task**: Inline text input to add/edit task description
- [x] **Project**: Project selector dropdown (same as timer input)
- [x] **Duration**: Ability to adjust duration (±1 min, ±5 min)
- [x] **Quick-edit**: Click duration number to type directly
- [x] Changes save automatically on close
- [x] Delete option (with confirmation) to remove particle

### Closing the Overlay
- [x] Click outside to close (saves changes)
- [x] Press Escape to close (saves changes)
- [x] Press Enter to close (saves changes) - Primary action
- [x] Explicit close button (×)
- [x] Smooth exit animation

### Feedback & State
- [x] Particle list updates immediately after edit
- [x] Staggered entrance animations for premium feel
- [x] Monochrome design (no red for delete)

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
