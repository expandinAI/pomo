# CLAUDE.md

This file provides guidance to Claude Code when working with the Pomo codebase.

## Projekt-Management (vault/)

Dieses Projekt nutzt `vault/` für lokales Projekt-Management (ersetzt Linear):

```
vault/
├── ideas/            # Rohe Ideen
├── features/         # PRDs/Feature-Specs
├── stories/          # User Stories (backlog/, active/, done/)
├── decisions/        # Architecture Decision Records
├── ROADMAP.md        # Übersicht
└── CHANGELOG.md      # Historie
```

**Skill:** Nutze den `product-owner` Skill (`.claude/skills/product-owner/SKILL.md`) für:
- "Neue Idee: [Beschreibung]" → Erstellt `vault/ideas/...`
- "Was steht an?" → Zeigt Backlog
- "Erstell Stories für Feature X" → Generiert User Stories
- "Story X ist fertig" → Verschiebt nach done/, updated CHANGELOG

---

## Project Overview

**Pomo** is an Apple Design Award-worthy Pomodoro timer web app. The goal is to create a "sanctuary of calm" for focused work—beautiful, minimal, and premium-feeling.

**Key philosophy:** Subtract, don't add. Every feature must earn its place.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── timer/        # Timer-specific components
│   └── ui/           # Reusable UI components
├── lib/              # Utilities and helpers
└── styles/           # Global styles and tokens
```

## Design Principles

1. **The 70% Rule** - Timer owns 70% of the viewport. It's the hero.
2. **Progressive Disclosure** - Controls invisible until needed
3. **Premium Feel** - Generous spacing, spring animations, warm colors
4. **Calm Over Anxiety** - No streaks, no guilt, no gamification

## Code Guidelines

### TypeScript
- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Use explicit return types on functions
- No `any` types

### Components
- One component per file
- Co-locate styles and tests
- Use named exports
- Props interfaces named `ComponentNameProps`

```typescript
// Good
interface TimerDisplayProps {
  timeRemaining: number;
  isRunning: boolean;
}

export function TimerDisplay({ timeRemaining, isRunning }: TimerDisplayProps) {
  // ...
}
```

### Styling
- Use Tailwind utilities
- Design tokens in `tailwind.config.js` and `src/styles/design-tokens.ts`
- No inline styles
- Dark mode via `dark:` prefix

### Animation
- All animations via Framer Motion
- Respect `prefers-reduced-motion`
- Spring physics for organic feel
- Timing: 150ms (fast), 300ms (normal), 500ms (slow)

```typescript
// Good - respects reduced motion
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={{ scale: 1.02 }}
  transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400 }}
/>
```

### State Management
- React useState/useReducer for component state
- No external state libraries needed
- Timer logic in Web Worker for background accuracy

### Performance
- Target <100KB total bundle
- Lazy load non-critical components
- Optimize images (next/image)
- Use dynamic imports for heavy animations

## Common Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript check
pnpm test         # Run tests
```

## Key Files

- `src/app/page.tsx` - Main timer page
- `src/components/timer/Timer.tsx` - Core timer component
- `src/lib/timer-worker.ts` - Web Worker for timer
- `tailwind.config.js` - Design tokens

## Timer Business Logic

### COMPLETE vs. SKIP Actions

Der Timer unterscheidet zwischen **natürlicher Completion** und **manuellem Skip** (S-Taste):

| Aspekt | COMPLETE | SKIP |
|--------|----------|------|
| Session Counter | +1 bei Work | Keine Änderung |
| Celebration | Ja bei Work | Nein |
| Gespeicherte Zeit | Volle Session-Dauer | Tatsächlich elapsed |
| Mindest-Schwelle | Keine | >60 Sekunden |
| Visual Feedback | "Well done!" Animation | "Skipped to [Mode]" Text |

**Wichtig:** Diese Unterscheidung ist bewusst so designed:
- Skip zählt nicht als vollständige Session (kein Counter-Increment)
- Skip speichert nur die tatsächlich gearbeitete Zeit
- Sessions < 60s werden bei Skip nicht gespeichert (nicht sinnvoll)
- Keine Celebration bei Skip (User hat nicht "fertig" gemacht)

**Code-Location:** `src/components/timer/Timer.tsx`
- `COMPLETE` Action: Zeile ~76-100
- `SKIP` Action: Zeile ~102-126
- `handleSkip` Callback: Zeile ~455-488

## Anti-Patterns to Avoid

- **No gamification** - No points, badges, streaks
- **No social features** - Focus is personal
- **No feature creep** - If it doesn't serve the timer, skip it
- **No guilt mechanics** - Missing a session is fine
- **No aggressive upsells** - Premium feels generous

## Testing

- Unit tests: Vitest + Testing Library
- E2E tests: Playwright
- Test timer accuracy in background tabs
- Test all keyboard shortcuts
- Accessibility testing with axe-core

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast WCAG AA+
- [ ] Screen reader announcements for state changes
- [ ] Reduced motion support
- [ ] Touch targets 44x44px minimum

## Before Committing

1. Run `pnpm lint && pnpm typecheck`
2. Test in both light and dark mode
3. Test keyboard navigation
4. Check performance (Lighthouse 95+)
5. Test on mobile viewport
