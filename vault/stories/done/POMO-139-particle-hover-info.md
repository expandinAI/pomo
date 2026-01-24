# POMO-139: Particle Hover Info

## Story

**As a** user who has completed particles today,
**I want to** hover/tap on a particle to see its details,
**So that** I can reflect on what I accomplished with each focus session.

## Context

The particles displayed in the SessionCounter are currently just visual dots. This feature adds meaning to each particle by showing its story when the user interacts with it.

## Acceptance Criteria

### Standard View (< 9 particles)
- [ ] Hovering over a filled particle shows info in StatusMessage
- [ ] Tapping a filled particle (touch devices) shows info in StatusMessage
- [ ] Info format: `"14:32 · 25 min"` (time · duration)
- [ ] With task: `"14:32 · 25 min · Code Review"`
- [ ] With project: `"14:32 · 25 min · Particle"`
- [ ] With both: `"14:32 · 25 min · Code Review · Particle"`
- [ ] Hovering empty slots shows nothing
- [ ] Info disappears when mouse leaves (after brief delay)

### Compact View (9+ particles)
- [ ] Hovering/tapping the counter shows summary
- [ ] Summary format: `"12 particles · 5h 30min today"`
- [ ] No individual particle details (not applicable)

### Animation & Feel
- [ ] Info appears with same animation as other StatusMessages
- [ ] Smooth transition between different particle hovers
- [ ] No flickering when moving between adjacent particles

## Technical Notes

### Data Flow
1. `Timer.tsx` passes `todaySessions: CompletedSession[]` to `SessionCounter`
2. `SessionCounter` maps sessions to particle indices (newest = rightmost filled)
3. On hover/tap, `SessionCounter` calls `onParticleHover(session | null)`
4. `Timer.tsx` sets `statusMessage` based on hovered session

### Session Data Available
```typescript
interface CompletedSession {
  completedAt: string;   // ISO timestamp → format as "14:32"
  duration: number;      // seconds → format as "25 min"
  task?: string;         // optional task name
  projectId?: string;    // optional → resolve to project name
}
```

### Edge Cases
- Session without task/project: show only time + duration
- Very long task names: truncate with ellipsis (max ~30 chars)
- Rapid hover changes: debounce to prevent flickering

## Design

**Philosophy fit:**
- Progressive disclosure: info hidden until sought
- Uses existing StatusMessage slot (no new UI)
- Makes particles meaningful, not just decorative
- Encourages reflection on accomplishments

**Visual:**
```
Standard: ● ● ● ○ ○ ○ ○ ○
          ↑ hover
          StatusMessage: "14:32 · 25 min · Code Review"

Compact:  12 ● ○
          ↑ hover
          StatusMessage: "12 particles · 5h 30min today"
```

## Out of Scope
- Clicking particles to edit session data
- Keyboard navigation through particles
- Showing break sessions (only work particles)

## Dependencies
- `getTodaySessions()` from session-storage.ts
- Project name resolution if projectId present

## Estimated Effort
Small-Medium (2-3 hours)
