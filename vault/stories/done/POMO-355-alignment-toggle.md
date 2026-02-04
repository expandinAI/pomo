---
type: story
status: done
priority: p1
effort: 3
feature: daily-intentions
created: 2026-02-04
updated: 2026-02-04
done_date: 2026-02-04
tags: [intentions, particle-detail, alignment, ui]
---

# POMO-355: Alignment Toggle in ParticleDetail

## User Story

> As a **Particle user who just completed a session**,
> I want **to mark whether this particle was aligned with my intention**,
> so that **I can track how intentional my day was**.

## Context

Link: [[features/daily-intentions]]

**Phase 2: Visual Language** — The moment of reflection when a particle ends.

### The Question

When a particle ends and the user has a daily intention, we show:

```
┌─────────────────────────────────────────┐
│  What did you work on?                  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Answer emails                     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Today's intention: "Ship login feature"│
│                                         │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ ● Aligned   │  │ ● Reactive  │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
└─────────────────────────────────────────┘
```

## Acceptance Criteria

### UI Components

- [ ] Show intention reminder text when intention exists
- [ ] Two-button toggle: "Aligned" (white dot) / "Reactive" (gray dot)
- [ ] Selected state clearly visible
- [ ] Default: No selection (user must choose)

### Conditional Display

- [ ] Only show alignment toggle when today has an intention
- [ ] Hide toggle when no intention set
- [ ] Hide toggle when viewing old particles (from days without intention)

### Persistence

- [ ] Save `intentionAlignment` to session in IndexedDB
- [ ] Update existing session record (not create new)
- [ ] Sync to Supabase when available

### Keyboard Support

- [ ] `A` = Select Aligned
- [ ] `R` = Select Reactive
- [ ] `Enter` = Save and close (if alignment selected)
- [ ] Visual feedback on selection

## Technical Details

### Files to Modify

```
src/components/timer/ParticleDetailOverlay.tsx  # Main implementation
src/hooks/useIntention.ts                       # Get today's intention
src/lib/intentions/storage.ts                   # Save alignment
```

### Component Structure

```typescript
// In ParticleDetailOverlay.tsx

interface AlignmentToggleProps {
  intentionText: string;
  value: IntentionAlignment | null;
  onChange: (alignment: IntentionAlignment) => void;
}

function AlignmentToggle({ intentionText, value, onChange }: AlignmentToggleProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-tertiary">
        Today's intention: "{intentionText}"
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => onChange('aligned')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            value === 'aligned' ? "bg-white/10 ring-1 ring-white" : "bg-tertiary/10"
          )}
        >
          <span className="w-2 h-2 rounded-full bg-white" />
          Aligned
        </button>
        <button
          onClick={() => onChange('reactive')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            value === 'reactive' ? "bg-tertiary/20 ring-1 ring-tertiary" : "bg-tertiary/10"
          )}
        >
          <span className="w-2 h-2 rounded-full bg-tertiary" />
          Reactive
        </button>
      </div>
    </div>
  );
}
```

### Integration in ParticleDetailOverlay

```typescript
// In ParticleDetailOverlay.tsx

const { todayIntention } = useIntention();
const [alignment, setAlignment] = useState<IntentionAlignment | null>(
  session?.intentionAlignment ?? null
);

// Show toggle only if today has intention AND session is from today
const showAlignmentToggle = todayIntention && isToday(session.startTime);

// On save:
await updateSession({
  ...session,
  intentionAlignment: alignment ?? 'none',
});
```

## Testing

- [ ] Toggle appears when intention exists
- [ ] Toggle hidden when no intention
- [ ] Aligned button shows white dot preview
- [ ] Reactive button shows gray dot preview
- [ ] Selection persists after save
- [ ] Keyboard shortcuts work (A/R)
- [ ] Default state: neither selected
- [ ] Editing old particle preserves existing alignment

## Definition of Done

- [ ] AlignmentToggle component created
- [ ] Integrated in ParticleDetailOverlay
- [ ] Keyboard support (A/R keys)
- [ ] Persistence working
- [ ] Visual design matches mockup
- [ ] Only shows when intention exists

## Dependencies

- POMO-350 (Intention data model) ✓ Complete
- POMO-354 (Particle colors) — For visual consistency

## Design Notes

**Why two buttons instead of toggle?**
- Clearer visual representation
- Each button shows the dot color
- Easier to understand the choice
- No ambiguous "unset" state needed

**Auto-detection (V2 / Future):**
- If task mentions project linked to intention → suggest aligned
- If task contains intention keywords → suggest aligned
- Otherwise → user decides
