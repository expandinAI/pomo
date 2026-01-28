---
type: story
status: backlog
priority: p2
effort: 2
feature: "[[features/learn-section]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [content, learn, philosophy, brand]
---

# POMO-182: "The Particle Philosophy" Content

## User Story

> Als **Particle-Nutzer**
> möchte ich **verstehen, warum diese App anders ist als alle anderen**,
> damit **ich eine emotionale Verbindung aufbaue und verstehe, dass hier eine tiefere Philosophie dahintersteckt**.

## Kontext

Nutzer sehen zunächst "nur" eine Timer-App. Aber Particle ist mehr:
- Eine Philosophie des Fokus
- Ein Anti-Gamification-Statement
- Ein minimalistisches Design-Manifest

Diese Section erklärt das "Warum" hinter Particle – und schafft die emotionale Differenzierung, die aus Nutzern Fans macht.

---

## Content-Struktur

### Intro
Ein einzelner weißer Punkt auf schwarzem Grund.

### Kernabschnitte
4 Abschnitte, die die Kernphilosophie vermitteln.

### Closing
Die Einladung, Teil davon zu sein.

---

## Content Draft

### Intro

> *Ein einzelner weißer Punkt auf schwarzem Grund.*
>
> *Still. Unscheinbar. Und doch: Das Fundament von allem, was du erschaffst.*

---

### Section 1: "Was ist ein Partikel?"

**Die Arbeit eines Lebens besteht aus vielen Partikeln.**

Jeder große Roman wurde Wort für Wort geschrieben.
Jedes Meisterwerk entstand Pinselstrich für Pinselstrich.
Jede Karriere wurde gebaut – Fokus-Session für Fokus-Session.

**Partikel für Partikel.**

Andere Apps zählen Tomaten. Oder Bäume. Oder Punkte in einem Spiel.

Wir zählen etwas anderes: Die gebündelte Energie deiner Aufmerksamkeit. Sichtbar gemacht. Ein Punkt nach dem anderen.

Am Ende eines Jahres siehst du nicht Statistiken. Du siehst dich selbst – in dem, was du erschaffen hast.

---

### Section 2: "Stolz statt Schuld"

**Keine roten Badges. Keine verlorenen Streaks.**

Die meisten Produktivitäts-Apps arbeiten mit Schuld:
- "Du hast deine Serie verloren!"
- "Du bist heute unter deinem Ziel!"
- "Dein Baum ist gestorben!"

Particle arbeitet mit Stolz.

Du sammelst keine Punkte, um eine App zufrieden zu stellen. Du sammelst Partikel, weil sie zeigen, wer du bist.

**Es gibt keine Bestrafung für Pausen. Es gibt nur Schönheit für Fokus.**

Wenn du auf deine Partikel schaust, siehst du nicht, was du verpasst hast. Du siehst, was du erschaffen hast.

---

### Section 3: "Weniger, aber besser"

**Schwarz. Weiß. Punkte. Fertig.**

In einer Welt voller bunter Apps, Notifications und Dopamin-Hits wählen wir einen anderen Weg: Reduktion.

Dieter Rams sagte es am besten: *"Weniger, aber besser."*

Wir haben uns gefragt: Was können wir weglassen?

Farben? Weg.
Badges? Weg.
Gamification? Weg.
Notifications, die dich unterbrechen? Weg.

Was bleibt, ist das Wesentliche: Ein Timer. Ein Partikel. Deine Arbeit.

**Jedes Pixel muss seinen Platz verdienen.**

---

### Section 4: "Ein Spiegel, kein Spiel"

**Particle ist kein Spiel. Particle ist ein Spiegel.**

Forest lässt dich Bäume züchten. Nett. Aber es ist nicht *dein* Leben. Es ist eine Simulation.

Habitica macht Produktivität zum Rollenspiel. Spaßig. Aber deine Arbeit ist kein Game.

Particle zeigt dir einfach, was du tust. Punkt für Punkt. Tag für Tag.

Wenn du auf deine gesammelten Partikel schaust, siehst du dich selbst. Deine Arbeit. Deine Reise.

**Nicht was die App von dir will. Sondern was du erschaffen hast.**

---

### Closing

> *Particle ist mehr als eine App.*
>
> *Es ist eine Einladung, anders über Fokus nachzudenken.*
>
> *Nicht als Pflicht. Nicht als Spiel. Sondern als etwas, das sichtbar wird.*
>
> *Partikel für Partikel.*

---

## Technische Umsetzung

### Datei-Struktur

```typescript
// src/lib/content/philosophy-content.ts

export const PHILOSOPHY_INTRO = [
  "Ein einzelner weißer Punkt auf schwarzem Grund.",
  "Still. Unscheinbar. Und doch: Das Fundament von allem, was du erschaffst.",
];

export interface PhilosophySection {
  id: string;
  title: string;
  paragraphs: string[];
  emphasis?: string; // Hervorgehobener Satz
}

export const PHILOSOPHY_SECTIONS: PhilosophySection[] = [
  {
    id: 'what-is-particle',
    title: 'Was ist ein Partikel?',
    paragraphs: [...],
    emphasis: 'Die Arbeit eines Lebens besteht aus vielen Partikeln.',
  },
  // ...
];

export const PHILOSOPHY_CLOSING = [
  "Particle ist mehr als eine App.",
  "Es ist eine Einladung, anders über Fokus nachzudenken.",
  // ...
];
```

### Komponente

```typescript
// src/components/learn/PhilosophyContent.tsx

export function PhilosophyContent({ onBack }: { onBack: () => void }) {
  // Keyboard handler

  return (
    <motion.div variants={staggerContainer}>
      {/* Intro – größer, zentriert, poetisch */}
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

      {/* Closing – zentriert, poetisch */}
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

## Menu-Integration

### Neuer Menüpunkt

Das Learn Menu muss um diesen Eintrag erweitert werden:

```typescript
// LearnMenu.tsx – MENU_ITEMS erweitern

{
  id: 'philosophy',
  icon: Sparkles, // oder Lightbulb
  title: 'The Particle Philosophy',
  description: 'Why we built this differently.',
},
```

### LearnView Type erweitern

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

## Design-Richtlinien

### Besondere Behandlung

Diese Section ist die emotionalste. Design soll das unterstützen:

| Element | Behandlung |
|---------|------------|
| Intro | Größer, zentriert, mehr Whitespace |
| Emphasis-Sätze | `font-medium`, volle Breite |
| Closing | Visuell abgesetzt (Border oben) |
| Zitate | Kursiv, leicht eingerückt |

### Particle-Animation (optional)

Am Ende der Section könnte ein einzelner pulsierender Punkt erscheinen:

```typescript
<motion.div
  className="w-3 h-3 rounded-full bg-primary mx-auto mt-8"
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
/>
```

---

## Content-Prinzipien

1. **Manifest-Ton** – Das ist unsere Überzeugung, keine Anleitung
2. **Kontraste nutzen** – "Andere Apps... Wir..."
3. **Wiederholung als Stilmittel** – "Partikel für Partikel"
4. **Keine Selbstbeweihräucherung** – Fakten statt "wir sind die besten"
5. **Einladung, kein Verkauf** – Der Nutzer soll sich identifizieren, nicht überzeugt werden

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

- [ ] `philosophy-content.ts` mit allen Texten
- [ ] `PhilosophyContent.tsx` implementiert
- [ ] LearnMenu erweitert (neuer Eintrag)
- [ ] LearnView type erweitert
- [ ] LearnPanel: VIEW_TITLES, FOOTER_HINTS, render
- [ ] Keyboard-Navigation funktioniert
- [ ] Content reviewed (Particle Voice)
- [ ] Mobile getestet
- [ ] TypeScript check passes
- [ ] Build succeeds

---

## Warum P2 statt P1?

Diese Section ist wichtig für **Differenzierung und Kundenbindung**, aber:
- Nutzer suchen sie nicht aktiv (anders als "Welcher Rhythmus passt zu mir?")
- Sie löst kein unmittelbares Problem
- Sie ist ein "Delight"-Feature, kein "Must-Have"

**Trotzdem wertvoll:** Diese Section macht aus Nutzern Fans. Sie erklärt, warum Particle anders ist – und gibt Nutzern etwas, das sie teilen können.

---

## Notizen

- **Länge:** ~500-600 Wörter (3 Minuten Lesezeit)
- **Tone:** Manifest, nicht Tutorial
- **Inspiration:** Apple "Think Different", Basecamp "Getting Real"
- **Ziel:** "Aha, deshalb ist das hier anders"

---

*"Particle – Where focus becomes visible."*
