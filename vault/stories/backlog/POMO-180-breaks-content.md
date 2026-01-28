---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/learn-section]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [content, learn, breaks, science]
---

# POMO-180: "Why Breaks Matter" Content

## User Story

> As a **Particle user**
> I want to **understand why breaks are part of the system**,
> so that **I don't feel guilty when I rest—but understand it's part of doing my best work**.

## Context

Many users:
- Skip breaks because they feel "in the zone"
- Feel guilty when they take breaks
- Don't understand why the app "forces" breaks

This section legitimizes rest—scientifically and emotionally.

---

## Content Structure

### Intro
A short, poetic opening (2-3 sentences).

### Core Sections
3-4 sections, each with:
- Title
- 2-3 paragraphs in Particle Voice
- Optional: Source/study reference

### Closing
An encouraging conclusion.

---

## Content Draft

### Intro

> *Your brain works in two modes. One of them is rest.*

---

### Section 1: "The Two Modes"

**Focused Mode. Diffuse Mode.**

When you work, your brain is in "Focused Mode"—locked onto a task like a spotlight.

But learning, problem-solving, creativity—that happens in "Diffuse Mode." When you're not looking. When you're walking. When you're in the shower.

**The best ideas don't come at the desk.**

They come when you stop searching.

---

### Section 2: "Why 'Pushing Through' Doesn't Work"

**Cognitive fatigue is real.**

After about 90 minutes of intense work, your ability to concentrate measurably declines. Your brain needs time to replenish neurotransmitters.

Those who don't take breaks aren't working anymore—they're just sitting there.

**A 5-minute break isn't lost time.**

It's when your brain tidies up.

---

### Section 3: "The DeskTime Study"

**52 minutes of work. 17 minutes of rest.**

In 2014, DeskTime analyzed the work habits of their most productive users. The result was surprising:

The top 10% didn't work the longest. They worked in clear blocks—with real breaks in between.

Not scrolling on their phones. Not checking emails. **Real breaks.**

Standing up. Moving around. Letting their gaze wander.

---

### Section 4: "What Makes a Good Break?"

**Active beats passive.**

| Good | Less Good |
|------|-----------|
| Stand up, stretch | Stay seated at your desk |
| Step outside briefly | Check social media |
| Get some water | Stare at another screen |
| Look out the window | Answer emails |

The best break is one that leaves you refreshed—not drained.

---

### Closing

> *Particle doesn't just count your work. Particle gives you space for what happens in between.*
>
> *Because that's where your best work is born.*

---

## Technical Implementation

### File Structure

```typescript
// src/lib/content/breaks-content.ts

export const BREAKS_INTRO = "Your brain works in two modes. One of them is rest.";

export interface BreaksSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export const BREAKS_SECTIONS: BreaksSection[] = [
  {
    id: 'two-modes',
    title: 'The Two Modes',
    paragraphs: [
      'Focused Mode. Diffuse Mode.',
      'When you work, your brain is in "Focused Mode"—locked onto a task like a spotlight.',
      'But learning, problem-solving, creativity—that happens in "Diffuse Mode." When you\'re not looking. When you\'re walking. When you\'re in the shower.',
      'The best ideas don\'t come at the desk.',
      'They come when you stop searching.',
    ],
  },
  {
    id: 'pushing-through',
    title: 'Why "Pushing Through" Doesn\'t Work',
    paragraphs: [
      'Cognitive fatigue is real.',
      'After about 90 minutes of intense work, your ability to concentrate measurably declines. Your brain needs time to replenish neurotransmitters.',
      'Those who don\'t take breaks aren\'t working anymore—they\'re just sitting there.',
      'A 5-minute break isn\'t lost time.',
      'It\'s when your brain tidies up.',
    ],
  },
  {
    id: 'desktime',
    title: 'The DeskTime Study',
    paragraphs: [
      '52 minutes of work. 17 minutes of rest.',
      'In 2014, DeskTime analyzed the work habits of their most productive users. The result was surprising:',
      'The top 10% didn\'t work the longest. They worked in clear blocks—with real breaks in between.',
      'Not scrolling on their phones. Not checking emails. Real breaks.',
      'Standing up. Moving around. Letting their gaze wander.',
    ],
  },
  {
    id: 'good-break',
    title: 'What Makes a Good Break?',
    paragraphs: [
      'Active beats passive.',
      'The best break is one that leaves you refreshed—not drained.',
    ],
  },
];

export const BREAKS_CLOSING = [
  "Particle doesn't just count your work. Particle gives you space for what happens in between.",
  "Because that's where your best work is born.",
];
```

### Component

```typescript
// src/components/learn/BreaksContent.tsx

export function BreaksContent({ onBack }: { onBack: () => void }) {
  // Keyboard handler for back navigation (← / Backspace)
  // Same pattern as RhythmContent.tsx

  return (
    <motion.div>
      {/* Intro */}
      <p className="text-lg italic text-secondary">{BREAKS_INTRO}</p>

      {/* Sections */}
      {BREAKS_SECTIONS.map(section => (
        <div key={section.id}>
          <h3>{section.title}</h3>
          {section.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ))}

      {/* Closing */}
      <div className="italic text-center">
        {BREAKS_CLOSING.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </motion.div>
  );
}
```

### Integration in LearnPanel

```typescript
// LearnPanel.tsx
{view === 'breaks' && (
  <BreaksContent onBack={() => setView('menu')} />
)}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/content/breaks-content.ts` | Create – Content constants |
| `src/components/learn/BreaksContent.tsx` | Create – Display component |
| `src/components/learn/LearnPanel.tsx` | Modify – Import & render BreaksContent |
| `src/components/learn/index.ts` | Modify – Export BreaksContent |

---

## Design Guidelines

### Typography

| Element | Style |
|---------|-------|
| Intro | `text-lg italic text-secondary` |
| Section Title | `text-base font-semibold text-primary` |
| Paragraph | `text-sm text-secondary leading-relaxed` |
| Emphasis | `font-medium` (not bold) |
| Closing | `text-sm italic text-tertiary text-center` |

### Spacing

- Between sections: `space-y-8`
- Between paragraphs: `space-y-3`
- Intro → First section: `mb-8`

### No Interactive Elements

Unlike "The Three Rhythms," this section has no buttons. It's pure reading content.

---

## Content Principles

1. **No finger-wagging** – Not "You should take breaks," but "This is what happens in your brain"
2. **Science as story** – DeskTime, Kleitman – names and numbers add credibility
3. **Short paragraphs** – Max 2-3 sentences
4. **Particle Voice** – Calm, wise, poetic
5. **No jargon** – "Diffuse Mode" is explained, not assumed

---

## Verification

1. Open Learn Panel (`L`)
2. Navigate to "Why Breaks Matter"
3. Content renders correctly
4. Back navigation works (`←` / `Backspace`)
5. Footer hint shows `← back · L close`
6. Scrolling works for longer content
7. Typography matches design system

---

## Definition of Done

- [ ] `breaks-content.ts` with all texts
- [ ] `BreaksContent.tsx` implemented
- [ ] Integrated in LearnPanel
- [ ] Keyboard navigation works
- [ ] Content reviewed (Particle Voice)
- [ ] Mobile tested (scrollable)
- [ ] TypeScript check passes
- [ ] Build succeeds

---

## Sources

- Barbara Oakley: "A Mind for Numbers" (Focused/Diffuse Mode)
- DeskTime Study (2014): 52/17 rhythm
- Cal Newport: "Deep Work"
- Nathaniel Kleitman: Ultradian Rhythms

---

## Notes

- **No CTA** – This section doesn't sell anything, it explains
- **Length:** ~400-500 words (2-3 minute read)
- **Tone:** Like a wise friend explaining—not like a teacher

---

*"The best work doesn't happen despite the breaks. It happens because of them."*
