---
type: story
status: done
priority: p2
effort: 2
feature: "[[features/learn-section]]"
created: 2026-01-28
updated: 2026-01-28
done_date: 2026-01-28
tags: [content, learn, philosophy, brand]
---

# POMO-182: "The Particle Philosophy" Content

## User Story

> As a **Particle user**
> I want to **understand why this app is different from all the others**,
> so that **I build an emotional connection and realize there's a deeper philosophy behind it**.

## Context

Users initially see "just" a timer app. But Particle is more:
- A philosophy of focus
- An anti-gamification statement
- A minimalist design manifesto

This section explains the "why" behind Particle—and creates the emotional differentiation that turns users into fans.

---

## Content Structure

### Intro
A single white dot on a black canvas.

### Core Sections
4 sections conveying the core philosophy.

### Closing
An invitation to be part of it.

---

## Content Draft

### Intro

> *A single white dot on a black canvas.*
>
> *Still. Unassuming. And yet: the foundation of everything you create.*

---

### Section 1: "What Is a Particle?"

**A life's work is made of many particles.**

Every great novel was written word by word.
Every masterpiece was painted brushstroke by brushstroke.
Every career was built—focus session by focus session.

**Particle by particle.**

Other apps count tomatoes. Or trees. Or points in a game.

We count something different: The bundled energy of your attention. Made visible. One dot at a time.

At the end of a year, you don't see statistics. You see yourself—in what you've created.

---

### Section 2: "Pride, Not Guilt"

**No red badges. No lost streaks.**

Most productivity apps work with guilt:
- "You broke your streak!"
- "You're below your goal today!"
- "Your tree died!"

Particle works with pride.

You don't collect points to please an app. You collect particles because they show who you are.

**There's no punishment for rest. There's only beauty for focus.**

When you look at your particles, you don't see what you missed. You see what you built.

---

### Section 3: "Less, But Better"

**Black. White. Dots. Done.**

In a world of colorful apps, notifications, and dopamine hits, we chose a different path: Reduction.

Dieter Rams said it best: *"Less, but better."*

We asked ourselves: What can we remove?

Colors? Gone.
Badges? Gone.
Gamification? Gone.
Notifications that interrupt you? Gone.

What remains is the essential: A timer. A particle. Your work.

**Every pixel must earn its place.**

---

### Section 4: "A Mirror, Not a Game"

**Particle isn't a game. Particle is a mirror.**

Forest lets you grow trees. Nice. But it's not *your* life. It's a simulation.

Habitica turns productivity into a role-playing game. Fun. But your work isn't a game.

Particle simply shows you what you do. Dot by dot. Day by day.

When you look at your collected particles, you see yourself. Your work. Your journey.

**Not what the app wants from you. But what you've created.**

---

### Closing

> *Particle is more than an app.*
>
> *It's an invitation to think differently about focus.*
>
> *Not as a duty. Not as a game. But as something that becomes visible.*
>
> *Particle by particle.*

---

## Technical Implementation

### File Structure

```typescript
// src/lib/content/philosophy-content.ts

export const PHILOSOPHY_INTRO = [
  "A single white dot on a black canvas.",
  "Still. Unassuming. And yet: the foundation of everything you create.",
];

export interface PhilosophySection {
  id: string;
  title: string;
  paragraphs: string[];
  emphasis?: string; // Highlighted sentence
}

export const PHILOSOPHY_SECTIONS: PhilosophySection[] = [
  {
    id: 'what-is-particle',
    title: 'What Is a Particle?',
    emphasis: "A life's work is made of many particles.",
    paragraphs: [
      'Every great novel was written word by word.',
      'Every masterpiece was painted brushstroke by brushstroke.',
      'Every career was built—focus session by focus session.',
      'Particle by particle.',
      'Other apps count tomatoes. Or trees. Or points in a game.',
      'We count something different: The bundled energy of your attention. Made visible. One dot at a time.',
      "At the end of a year, you don't see statistics. You see yourself—in what you've created.",
    ],
  },
  {
    id: 'pride-not-guilt',
    title: 'Pride, Not Guilt',
    emphasis: 'No red badges. No lost streaks.',
    paragraphs: [
      'Most productivity apps work with guilt:',
      '"You broke your streak!" "You\'re below your goal today!" "Your tree died!"',
      'Particle works with pride.',
      "You don't collect points to please an app. You collect particles because they show who you are.",
      "There's no punishment for rest. There's only beauty for focus.",
      "When you look at your particles, you don't see what you missed. You see what you built.",
    ],
  },
  {
    id: 'less-but-better',
    title: 'Less, But Better',
    emphasis: 'Black. White. Dots. Done.',
    paragraphs: [
      'In a world of colorful apps, notifications, and dopamine hits, we chose a different path: Reduction.',
      'Dieter Rams said it best: "Less, but better."',
      'We asked ourselves: What can we remove?',
      'Colors? Gone. Badges? Gone. Gamification? Gone. Notifications that interrupt you? Gone.',
      'What remains is the essential: A timer. A particle. Your work.',
      'Every pixel must earn its place.',
    ],
  },
  {
    id: 'mirror-not-game',
    title: 'A Mirror, Not a Game',
    emphasis: "Particle isn't a game. Particle is a mirror.",
    paragraphs: [
      "Forest lets you grow trees. Nice. But it's not your life. It's a simulation.",
      "Habitica turns productivity into a role-playing game. Fun. But your work isn't a game.",
      'Particle simply shows you what you do. Dot by dot. Day by day.',
      'When you look at your collected particles, you see yourself. Your work. Your journey.',
      "Not what the app wants from you. But what you've created.",
    ],
  },
];

export const PHILOSOPHY_CLOSING = [
  "Particle is more than an app.",
  "It's an invitation to think differently about focus.",
  "Not as a duty. Not as a game. But as something that becomes visible.",
  "Particle by particle.",
];
```

### Component

```typescript
// src/components/learn/PhilosophyContent.tsx

export function PhilosophyContent({ onBack }: { onBack: () => void }) {
  // Keyboard handler

  return (
    <motion.div variants={staggerContainer}>
      {/* Intro – larger, centered, poetic */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        {PHILOSOPHY_INTRO.map((line, i) => (
          <p key={i} className="text-lg italic text-secondary">{line}</p>
        ))}
      </motion.div>

      {/* Sections */}
      {PHILOSOPHY_SECTIONS.map(section => (
        <motion.div key={section.id} variants={itemVariants} className="mb-8">
          <h3 className="text-base font-semibold mb-3">{section.title}</h3>

          {section.emphasis && (
            <p className="text-base font-medium text-primary mb-4">
              {section.emphasis}
            </p>
          )}

          {section.paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-secondary mb-2">{p}</p>
          ))}
        </motion.div>
      ))}

      {/* Closing – centered, poetic */}
      <motion.div variants={itemVariants} className="text-center pt-4 border-t border-tertiary/10">
        {PHILOSOPHY_CLOSING.map((line, i) => (
          <p key={i} className={cn(
            i === 0 ? "text-base font-medium" : "text-sm text-secondary",
            "italic"
          )}>{line}</p>
        ))}
      </motion.div>
    </motion.div>
  );
}
```

---

## Menu Integration

### New Menu Item

The Learn Menu needs to be extended with this entry:

```typescript
// LearnMenu.tsx – extend MENU_ITEMS

{
  id: 'philosophy',
  icon: Sparkles, // or Lightbulb
  title: 'The Particle Philosophy',
  description: 'Why we built this differently.',
},
```

### Extend LearnView Type

```typescript
// LearnMenu.tsx
export type LearnView = 'menu' | 'rhythms' | 'breaks' | 'science' | 'philosophy';
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/content/philosophy-content.ts` | Create – Content constants |
| `src/components/learn/PhilosophyContent.tsx` | Create – Display component |
| `src/components/learn/LearnMenu.tsx` | Modify – Add menu item, extend type |
| `src/components/learn/LearnPanel.tsx` | Modify – Add VIEW_TITLES, FOOTER_HINTS, render |

---

## Design Guidelines

### Special Treatment

This is the most emotional section. Design should support that:

| Element | Treatment |
|---------|-----------|
| Intro | Larger, centered, more whitespace |
| Emphasis sentences | `font-medium`, full width |
| Closing | Visually separated (border top) |
| Quotes | Italic, slightly indented |

### Particle Animation (optional)

At the end of the section, a single pulsing dot could appear:

```typescript
<motion.div
  className="w-3 h-3 rounded-full bg-primary mx-auto mt-8"
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
/>
```

---

## Content Principles

1. **Manifesto tone** – This is our conviction, not a how-to
2. **Use contrasts** – "Other apps... We..."
3. **Repetition as style** – "Particle by particle"
4. **No self-congratulation** – Facts, not "we're the best"
5. **Invitation, not sales pitch** – The user should identify, not be convinced

---

## Verification

1. Open Learn Panel (`L`)
2. Navigate to "The Particle Philosophy"
3. Intro is centered and prominent
4. Sections have clear hierarchy
5. Closing is visually distinct
6. Optional: Particle animation works
7. Back navigation works
8. Mobile: Content is readable, scrollable

---

## Definition of Done

- [ ] `philosophy-content.ts` with all texts
- [ ] `PhilosophyContent.tsx` implemented
- [ ] LearnMenu extended (new entry)
- [ ] LearnView type extended
- [ ] LearnPanel: VIEW_TITLES, FOOTER_HINTS, render
- [ ] Keyboard navigation works
- [ ] Content reviewed (Particle Voice)
- [ ] Mobile tested
- [ ] TypeScript check passes
- [ ] Build succeeds

---

## Why P2 Instead of P1?

This section is important for **differentiation and customer loyalty**, but:
- Users don't actively search for it (unlike "Which rhythm fits me?")
- It doesn't solve an immediate problem
- It's a "delight" feature, not a "must-have"

**Still valuable:** This section turns users into fans. It explains why Particle is different—and gives users something to share.

---

## Notes

- **Length:** ~500-600 words (3 minute read)
- **Tone:** Manifesto, not tutorial
- **Inspiration:** Apple "Think Different," Basecamp "Getting Real"
- **Goal:** "Ah, that's why this is different"

---

*"Particle – Where focus becomes visible."*
