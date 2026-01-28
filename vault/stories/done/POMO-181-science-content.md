---
type: story
status: done
priority: p1
effort: 2
feature: "[[features/learn-section]]"
created: 2026-01-28
updated: 2026-01-28
done_date: 2026-01-28
tags: [content, learn, science, research]
---

# POMO-181: "The Science" Content

## User Story

> As a **Particle user**
> I want to **understand the scientific foundations behind focused work**,
> so that **I trust the method and know it's based on research—not hype**.

## Context

Users wonder:
- "Why exactly 25/52/90 minutes?"
- "Is this scientifically proven or just a trend?"
- "Who invented this?"

This section provides answers—without sounding academic.

---

## Content Structure

### Intro
Focus isn't magic. It's biology.

### Core Sections
4-5 sections covering different research areas.

### Closing
Encouragement to trust their own experience.

---

## Content Draft

### Intro

> *Focus isn't magic. It's biology.*
>
> *Here's what science knows about your brain—and how Particle builds on it.*

---

### Section 1: "The Origin: Francesco Cirillo (1980s)"

**A kitchen timer shaped like a tomato.**

1987, University of Rome. Francesco Cirillo, a student, struggles with focus. He reaches for a kitchen timer—a red tomato—and sets it for 10 minutes.

"Can you focus for just 10 minutes?"

He could. So he increased it to 25.

**The Pomodoro Technique was born.**

Today, decades later, it's one of the most practiced focus methods in the world.

*Particle's Classic rhythm (25 min) is based on Cirillo's discovery.*

---

### Section 2: "Ultradian Rhythms: Nathaniel Kleitman (1950s)"

**Your body runs on 90-minute cycles.**

Nathaniel Kleitman, the "father of sleep research," discovered something remarkable in the 1950s:

Not just during sleep—even while awake, your body follows a rhythm. About every 90 minutes, your brain shifts between phases of higher and lower activity.

**The BRAC cycle** (Basic Rest-Activity Cycle) explains why 90 minutes often feels "natural"—and why a break is due afterward.

*Particle's 90-Min rhythm follows this biological clock.*

---

### Section 3: "The DeskTime Study (2014)"

**What do the most productive people do differently?**

The company DeskTime analyzed the work habits of millions of users. The question: What sets the top 10% apart?

The answer surprised everyone:

They didn't work the longest. They worked **52 minutes at a stretch**—followed by **17 minutes of real rest**.

No multitasking. No half-breaks with emails. Full concentration, then complete recovery.

*Particle's Deep Work rhythm (52/17) is based on this study.*

---

### Section 4: "Flow State: Mihaly Csikszentmihalyi"

**The state where time disappears.**

Psychologist Mihaly Csikszentmihalyi (pronounced "cheek-sent-me-hi") coined the term "Flow"—that state of complete absorption where hours feel like minutes.

Flow happens when:
- The task is challenging enough (not boring)
- But achievable (not overwhelming)
- You get clear feedback
- You're undisturbed

**Particle creates the frame. Flow emerges on its own.**

---

### Section 5: "Attention Residue: Sophie Leroy (2009)"

**Why multitasking doesn't work.**

Researcher Sophie Leroy discovered the phenomenon of "Attention Residue":

When you switch between tasks, part of your attention stays stuck on the previous task. Your brain needs time to fully transition.

That's why constant switching feels so exhausting—and why focused blocks work so well.

**One particle. One task. Full attention.**

---

### Closing

> *Science gives us direction. But your body knows itself best.*
>
> *Try the rhythms. Observe what works. Trust your experience.*
>
> *Research shows the way. You walk it.*

---

## Technical Implementation

### File Structure

```typescript
// src/lib/content/science-content.ts

export const SCIENCE_INTRO = "Focus isn't magic. It's biology.";
export const SCIENCE_SUBINTRO = "Here's what science knows about your brain—and how Particle builds on it.";

export interface ScienceSection {
  id: string;
  title: string;
  subtitle?: string; // e.g., "Francesco Cirillo (1980s)"
  paragraphs: string[];
  particleNote?: string; // "Particle's Classic rhythm is based on..."
}

export const SCIENCE_SECTIONS: ScienceSection[] = [
  {
    id: 'cirillo',
    title: 'The Origin',
    subtitle: 'Francesco Cirillo (1980s)',
    paragraphs: [
      'A kitchen timer shaped like a tomato.',
      '1987, University of Rome. Francesco Cirillo, a student, struggles with focus. He reaches for a kitchen timer—a red tomato—and sets it for 10 minutes.',
      '"Can you focus for just 10 minutes?"',
      'He could. So he increased it to 25.',
      'The Pomodoro Technique was born.',
      'Today, decades later, it\'s one of the most practiced focus methods in the world.',
    ],
    particleNote: "Particle's Classic rhythm (25 min) is based on Cirillo's discovery.",
  },
  {
    id: 'kleitman',
    title: 'Ultradian Rhythms',
    subtitle: 'Nathaniel Kleitman (1950s)',
    paragraphs: [
      'Your body runs on 90-minute cycles.',
      'Nathaniel Kleitman, the "father of sleep research," discovered something remarkable in the 1950s:',
      'Not just during sleep—even while awake, your body follows a rhythm. About every 90 minutes, your brain shifts between phases of higher and lower activity.',
      'The BRAC cycle (Basic Rest-Activity Cycle) explains why 90 minutes often feels "natural"—and why a break is due afterward.',
    ],
    particleNote: "Particle's 90-Min rhythm follows this biological clock.",
  },
  {
    id: 'desktime',
    title: 'The DeskTime Study',
    subtitle: '2014',
    paragraphs: [
      'What do the most productive people do differently?',
      'The company DeskTime analyzed the work habits of millions of users. The question: What sets the top 10% apart?',
      'The answer surprised everyone:',
      'They didn\'t work the longest. They worked 52 minutes at a stretch—followed by 17 minutes of real rest.',
      'No multitasking. No half-breaks with emails. Full concentration, then complete recovery.',
    ],
    particleNote: "Particle's Deep Work rhythm (52/17) is based on this study.",
  },
  {
    id: 'flow',
    title: 'Flow State',
    subtitle: 'Mihaly Csikszentmihalyi',
    paragraphs: [
      'The state where time disappears.',
      'Psychologist Mihaly Csikszentmihalyi (pronounced "cheek-sent-me-hi") coined the term "Flow"—that state of complete absorption where hours feel like minutes.',
      'Flow happens when: The task is challenging enough (not boring), but achievable (not overwhelming), you get clear feedback, and you\'re undisturbed.',
      'Particle creates the frame. Flow emerges on its own.',
    ],
  },
  {
    id: 'attention-residue',
    title: 'Attention Residue',
    subtitle: 'Sophie Leroy (2009)',
    paragraphs: [
      'Why multitasking doesn\'t work.',
      'Researcher Sophie Leroy discovered the phenomenon of "Attention Residue":',
      'When you switch between tasks, part of your attention stays stuck on the previous task. Your brain needs time to fully transition.',
      'That\'s why constant switching feels so exhausting—and why focused blocks work so well.',
      'One particle. One task. Full attention.',
    ],
  },
];

export const SCIENCE_CLOSING = [
  "Science gives us direction. But your body knows itself best.",
  "Try the rhythms. Observe what works. Trust your experience.",
  "Research shows the way. You walk it.",
];
```

### Component

```typescript
// src/components/learn/ScienceContent.tsx

export function ScienceContent({ onBack }: { onBack: () => void }) {
  // Keyboard handler for back navigation

  return (
    <motion.div variants={staggerContainer}>
      {/* Intro */}
      <motion.div variants={itemVariants}>
        <p className="text-lg italic">{SCIENCE_INTRO}</p>
        <p className="text-sm text-tertiary">{SCIENCE_SUBINTRO}</p>
      </motion.div>

      {/* Sections */}
      {SCIENCE_SECTIONS.map(section => (
        <motion.div key={section.id} variants={itemVariants}>
          <div className="flex items-baseline gap-2">
            <h3>{section.title}</h3>
            {section.subtitle && (
              <span className="text-xs text-tertiary">{section.subtitle}</span>
            )}
          </div>
          {section.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {section.particleNote && (
            <p className="text-sm text-accent/80 italic border-l-2 border-accent/30 pl-3 mt-2">
              {section.particleNote}
            </p>
          )}
        </motion.div>
      ))}

      {/* Closing */}
      <motion.div variants={itemVariants} className="text-center italic">
        {SCIENCE_CLOSING.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </motion.div>
    </motion.div>
  );
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/content/science-content.ts` | Create – Content constants |
| `src/components/learn/ScienceContent.tsx` | Create – Display component |
| `src/components/learn/LearnPanel.tsx` | Modify – Import & render ScienceContent |
| `src/components/learn/index.ts` | Modify – Export ScienceContent |

---

## Design Guidelines

### Section Cards

Each section can optionally be styled as a card (like Rhythms):

```typescript
<div className={cn(
  "p-4 rounded-xl",
  "bg-tertiary/5 border border-tertiary/10"
)}>
```

### Particle-Note Styling

The connection to Particle (e.g., "Particle's 90-Min rhythm...") is highlighted:

```typescript
<p className="text-sm text-accent/80 italic border-l-2 border-accent/30 pl-3">
  {section.particleNote}
</p>
```

### Highlighting Names

Scientist names get subtle emphasis:
```typescript
<span className="font-medium">Nathaniel Kleitman</span>
```

---

## Content Principles

1. **People, not studies** – "Francesco Cirillo, a student" not "Cirillo (1987)"
2. **Tell stories** – The kitchen timer, the sleep researcher
3. **Numbers sparingly** – Only where they carry weight (52/17, 90 min)
4. **Particle connection** – Each section ends with a link to the app
5. **Pronunciation help** – For difficult names (Csikszentmihalyi)

---

## Verification

1. Open Learn Panel (`L`)
2. Navigate to "The Science"
3. All sections render with correct hierarchy
4. Particle-Notes are visually distinct
5. Back navigation works
6. Scrolling works (longer content)
7. Stagger animation on load

---

## Definition of Done

- [ ] `science-content.ts` with all texts
- [ ] `ScienceContent.tsx` implemented
- [ ] Integrated in LearnPanel
- [ ] Keyboard navigation works
- [ ] Particle-Notes visually distinct
- [ ] Content reviewed (Particle Voice)
- [ ] Mobile tested
- [ ] TypeScript check passes
- [ ] Build succeeds

---

## Scientific Sources

| Concept | Researcher | Year | Key Finding |
|---------|------------|------|-------------|
| Pomodoro | Francesco Cirillo | 1987 | 25-min blocks with breaks |
| Ultradian Rhythms | Nathaniel Kleitman | 1950s | 90-min cycles while awake |
| 52/17 Rhythm | DeskTime | 2014 | Top performers work in blocks |
| Flow State | Mihaly Csikszentmihalyi | 1990 | Complete absorption |
| Attention Residue | Sophie Leroy | 2009 | Cost of task-switching |

---

## Notes

- **Length:** ~600-700 words (3-4 minute read)
- **Tone:** Science journalism, not academic paper
- **Goal:** Build trust, not lecture
- **Easter egg:** The pronunciation guide for Csikszentmihalyi shows personality

---

*"Research shows the way. You walk it."*
