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

> Als **Particle-Nutzer**
> möchte ich **verstehen, warum Pausen Teil des Systems sind**,
> damit **ich mich nicht schuldig fühle, wenn ich pausiere – sondern verstehe, dass es Teil meiner besten Arbeit ist**.

## Kontext

Viele Nutzer:
- Skippen Pausen, weil sie sich "im Flow" fühlen
- Fühlen sich schuldig, wenn sie pausieren
- Verstehen nicht, warum die App Pausen "erzwingt"

Diese Section legitimiert Erholung wissenschaftlich und emotional.

---

## Content-Struktur

### Intro
Ein kurzer, poetischer Einstieg (2-3 Sätze).

### Kernabschnitte
3-4 Abschnitte mit je:
- Titel
- 2-3 Absätze im Particle Voice
- Optional: Quelle/Studie

### Closing
Ein ermutigendes Fazit.

---

## Content Draft

### Intro

> *Dein Gehirn arbeitet in zwei Modi. Einer davon ist Ruhe.*

---

### Section 1: "Die zwei Modi"

**Focused Mode. Diffuse Mode.**

Wenn du arbeitest, ist dein Gehirn im "Focused Mode" – konzentriert auf eine Aufgabe, wie ein Scheinwerfer.

Aber Lernen, Problemlösen, Kreativität – das passiert im "Diffuse Mode". Wenn du nicht hinschaust. Wenn du spazieren gehst. Wenn du duschst.

**Die besten Ideen kommen nicht am Schreibtisch.**

Sie kommen, wenn du aufhörst zu suchen.

---

### Section 2: "Warum 'durcharbeiten' nicht funktioniert"

**Kognitive Ermüdung ist real.**

Nach etwa 90 Minuten intensiver Arbeit sinkt deine Konzentrationsfähigkeit messbar. Dein Gehirn braucht Zeit, um Neurotransmitter wieder aufzubauen.

Wer keine Pausen macht, arbeitet nicht mehr – er sitzt nur noch da.

**Eine 5-Minuten-Pause ist keine verlorene Zeit.**

Sie ist der Moment, in dem dein Gehirn aufräumt.

---

### Section 3: "Die DeskTime-Studie"

**52 Minuten Arbeit. 17 Minuten Pause.**

2014 analysierte DeskTime die Arbeitsgewohnheiten ihrer produktivsten Nutzer. Das Ergebnis überraschte:

Die Top 10% arbeiteten nicht am längsten. Sie arbeiteten in klaren Blöcken – mit echten Pausen dazwischen.

Nicht am Handy scrollen. Nicht E-Mails checken. **Echte Pausen.**

Aufstehen. Sich bewegen. Den Blick schweifen lassen.

---

### Section 4: "Was ist eine gute Pause?"

**Aktiv schlägt passiv.**

| Gut | Weniger gut |
|-----|-------------|
| Aufstehen, Stretchen | Am Schreibtisch sitzen bleiben |
| Kurz rausgehen | Social Media checken |
| Wasser holen | Auf einen anderen Bildschirm starren |
| Aus dem Fenster schauen | E-Mails beantworten |

Die beste Pause ist eine, nach der du dich erfrischt fühlst – nicht erschöpft.

---

### Closing

> *Particle zählt nicht nur deine Arbeit. Particle gibt dir Raum für das, was dazwischen passiert.*
>
> *Denn dort entsteht deine beste Arbeit.*

---

## Technische Umsetzung

### Datei-Struktur

```typescript
// src/lib/content/breaks-content.ts

export const BREAKS_INTRO = "Dein Gehirn arbeitet in zwei Modi. Einer davon ist Ruhe.";

export interface BreaksSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export const BREAKS_SECTIONS: BreaksSection[] = [
  {
    id: 'two-modes',
    title: 'Die zwei Modi',
    paragraphs: [
      'Focused Mode. Diffuse Mode.',
      'Wenn du arbeitest, ist dein Gehirn im "Focused Mode" – konzentriert auf eine Aufgabe, wie ein Scheinwerfer.',
      // ...
    ],
  },
  // ...
];

export const BREAKS_CLOSING = "Particle zählt nicht nur deine Arbeit...";
```

### Komponente

```typescript
// src/components/learn/BreaksContent.tsx

export function BreaksContent({ onBack }: { onBack: () => void }) {
  // Keyboard handler für Back-Navigation (← / Backspace)
  // Analog zu RhythmContent.tsx

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
      <p className="italic text-center">{BREAKS_CLOSING}</p>
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

## Design-Richtlinien

### Typography

| Element | Style |
|---------|-------|
| Intro | `text-lg italic text-secondary` |
| Section Title | `text-base font-semibold text-primary` |
| Paragraph | `text-sm text-secondary leading-relaxed` |
| Emphasis | `font-medium` (kein Bold) |
| Closing | `text-sm italic text-tertiary text-center` |

### Spacing

- Zwischen Sections: `space-y-8`
- Zwischen Paragraphs: `space-y-3`
- Intro → First Section: `mb-8`

### Keine interaktiven Elemente

Anders als "The Three Rhythms" hat diese Section keine Buttons. Es ist reiner Lese-Content.

---

## Content-Prinzipien

1. **Kein Zeigefinger** – Nicht "Du solltest pausieren", sondern "Das passiert in deinem Gehirn"
2. **Wissenschaft als Story** – DeskTime, Kleitman – Namen und Zahlen geben Glaubwürdigkeit
3. **Kurze Absätze** – Max 2-3 Sätze
4. **Particle Voice** – Ruhig, weise, poetisch
5. **Kein Jargon** – "Diffuse Mode" wird erklärt, nicht vorausgesetzt

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

- [ ] `breaks-content.ts` mit allen Texten
- [ ] `BreaksContent.tsx` implementiert
- [ ] In LearnPanel integriert
- [ ] Keyboard-Navigation funktioniert
- [ ] Content reviewed (Particle Voice)
- [ ] Mobile getestet (scrollbar)
- [ ] TypeScript check passes
- [ ] Build succeeds

---

## Quellen für Content

- Barbara Oakley: "A Mind for Numbers" (Focused/Diffuse Mode)
- DeskTime Studie (2014): 52/17 Rhythmus
- Cal Newport: "Deep Work"
- Nathaniel Kleitman: Ultradian Rhythms

---

## Notizen

- **Kein CTA** – Diese Section verkauft nichts, sie erklärt
- **Länge:** ~400-500 Wörter (2-3 Minuten Lesezeit)
- **Tone:** Wie ein weiser Freund, der etwas erklärt – nicht wie ein Lehrer

---

*"Die beste Arbeit entsteht nicht trotz der Pausen. Sie entsteht wegen ihnen."*
