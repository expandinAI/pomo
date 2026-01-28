---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/learn-section]]"
created: 2026-01-28
updated: 2026-01-28
done_date: null
tags: [content, learn, science, research]
---

# POMO-181: "The Science" Content

## User Story

> Als **Particle-Nutzer**
> möchte ich **die wissenschaftlichen Grundlagen hinter fokussiertem Arbeiten verstehen**,
> damit **ich Vertrauen in die Methode habe und weiß, dass sie auf Forschung basiert – nicht auf Hype**.

## Kontext

Nutzer fragen sich:
- "Warum genau 25/52/90 Minuten?"
- "Ist das wissenschaftlich belegt oder nur ein Trend?"
- "Wer hat das erfunden?"

Diese Section gibt Antworten – ohne akademisch zu klingen.

---

## Content-Struktur

### Intro
Fokus ist keine Magie. Es ist Biologie.

### Kernabschnitte
4-5 Abschnitte zu verschiedenen Forschungsbereichen.

### Closing
Ermutigung, die eigene Erfahrung ernst zu nehmen.

---

## Content Draft

### Intro

> *Fokus ist keine Magie. Es ist Biologie.*
>
> *Hier ist, was die Wissenschaft über dein Gehirn weiß – und wie Particle darauf aufbaut.*

---

### Section 1: "Der Ursprung: Francesco Cirillo (1980er)"

**Eine Küchenuhr in Form einer Tomate.**

1987, Universität Rom. Francesco Cirillo, Student, kämpft mit seiner Konzentration. Er greift zu einer Küchenuhr – einer roten Tomate – und stellt sie auf 10 Minuten.

"Kannst du dich 10 Minuten konzentrieren?"

Er konnte. Also erhöhte er auf 25.

**Die Pomodoro-Technik war geboren.**

Heute, Jahrzehnte später, ist sie eine der am meisten praktizierten Fokus-Methoden der Welt.

*Particle's Classic-Rhythmus (25 Min) basiert auf Cirillos Entdeckung.*

---

### Section 2: "Ultradian Rhythms: Nathaniel Kleitman (1950er)"

**Dein Körper tickt in 90-Minuten-Zyklen.**

Nathaniel Kleitman, der "Vater der Schlafforschung", entdeckte in den 1950ern etwas Erstaunliches:

Nicht nur im Schlaf, auch im Wachzustand folgt dein Körper einem Rhythmus. Etwa alle 90 Minuten wechselt dein Gehirn zwischen Phasen höherer und niedrigerer Aktivität.

**Der BRAC-Zyklus** (Basic Rest-Activity Cycle) erklärt, warum sich 90 Minuten oft "natürlich" anfühlen – und warum danach eine Pause fällig ist.

*Particle's 90-Min-Rhythmus folgt diesem biologischen Takt.*

---

### Section 3: "Die DeskTime-Studie (2014)"

**Was machen die Produktivsten anders?**

Das Unternehmen DeskTime analysierte die Arbeitsgewohnheiten von Millionen Nutzern. Die Frage: Was unterscheidet die produktivsten 10%?

Die Antwort überraschte:

Sie arbeiteten nicht am längsten. Sie arbeiteten **52 Minuten am Stück** – gefolgt von **17 Minuten echter Pause**.

Kein Multitasking. Keine halben Pausen mit E-Mails. Volle Konzentration, dann vollständige Erholung.

*Particle's Deep Work-Rhythmus (52/17) basiert auf dieser Studie.*

---

### Section 4: "Flow State: Mihaly Csikszentmihalyi"

**Der Zustand, in dem Zeit verschwindet.**

Der Psychologe Mihaly Csikszentmihalyi (sprich: "Tschik-sent-mi-hai") prägte den Begriff "Flow" – jenen Zustand vollständiger Absorption, in dem Stunden wie Minuten vergehen.

Flow entsteht, wenn:
- Die Aufgabe herausfordernd genug ist (nicht langweilig)
- Aber machbar (nicht überwältigend)
- Du klares Feedback bekommst
- Du ungestört bist

**Particle schafft den Rahmen. Flow entsteht von selbst.**

---

### Section 5: "Attention Residue: Sophie Leroy (2009)"

**Warum Multitasking nicht funktioniert.**

Die Forscherin Sophie Leroy entdeckte das Phänomen der "Attention Residue":

Wenn du zwischen Aufgaben wechselst, bleibt ein Teil deiner Aufmerksamkeit bei der vorherigen Aufgabe hängen. Dein Gehirn braucht Zeit, um vollständig umzuschalten.

Deshalb fühlt sich ständiges Hin-und-Her so erschöpfend an – und deshalb funktionieren fokussierte Blöcke so gut.

**Ein Partikel. Eine Aufgabe. Volle Aufmerksamkeit.**

---

### Closing

> *Die Wissenschaft gibt uns Orientierung. Aber dein Körper kennt sich selbst am besten.*
>
> *Probiere die Rhythmen aus. Beobachte, was funktioniert. Vertraue deiner Erfahrung.*
>
> *Die Forschung zeigt den Weg. Du gehst ihn.*

---

## Technische Umsetzung

### Datei-Struktur

```typescript
// src/lib/content/science-content.ts

export const SCIENCE_INTRO = "Fokus ist keine Magie. Es ist Biologie.";
export const SCIENCE_SUBINTRO = "Hier ist, was die Wissenschaft über dein Gehirn weiß – und wie Particle darauf aufbaut.";

export interface ScienceSection {
  id: string;
  title: string;
  subtitle?: string; // z.B. "Francesco Cirillo (1980er)"
  paragraphs: string[];
  particleNote?: string; // "Particle's Classic-Rhythmus basiert auf..."
}

export const SCIENCE_SECTIONS: ScienceSection[] = [
  {
    id: 'cirillo',
    title: 'Der Ursprung',
    subtitle: 'Francesco Cirillo (1980er)',
    paragraphs: [...],
    particleNote: "Particle's Classic-Rhythmus (25 Min) basiert auf Cirillos Entdeckung.",
  },
  // ...
];

export const SCIENCE_CLOSING = [...];
```

### Komponente

```typescript
// src/components/learn/ScienceContent.tsx

export function ScienceContent({ onBack }: { onBack: () => void }) {
  // Keyboard handler für Back-Navigation

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
            <p className="text-sm text-tertiary italic mt-2">
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

## Design-Richtlinien

### Section-Karten

Jede Section kann optional als Karte gestaltet werden (wie bei Rhythms):

```typescript
<div className={cn(
  "p-4 rounded-xl",
  "bg-tertiary/5 border border-tertiary/10"
)}>
```

### Particle-Note Styling

Die Verbindung zu Particle (z.B. "Particle's 90-Min-Rhythmus...") wird hervorgehoben:

```typescript
<p className="text-sm text-accent/80 italic border-l-2 border-accent/30 pl-3">
  {section.particleNote}
</p>
```

### Namen hervorheben

Wissenschaftler-Namen dezent betonen:
```typescript
<span className="font-medium">Nathaniel Kleitman</span>
```

---

## Content-Prinzipien

1. **Menschen, nicht Studien** – "Francesco Cirillo, Student" statt "Cirillo (1987)"
2. **Geschichten erzählen** – Die Küchenuhr, der Schlafforscher
3. **Zahlen sparsam** – Nur wo sie Gewicht haben (52/17, 90 Min)
4. **Particle-Verbindung** – Jede Section endet mit Bezug zur App
5. **Aussprachehilfen** – Bei schwierigen Namen (Csikszentmihalyi)

---

## Verification

1. Open Learn Panel (`L`)
2. Navigate to "The Science"
3. All sections render with correct hierarchy
4. Particle-Notes are visually distinct
5. Back navigation works
6. Scrolling works (längerer Content)
7. Stagger-Animation beim Laden

---

## Definition of Done

- [ ] `science-content.ts` mit allen Texten
- [ ] `ScienceContent.tsx` implementiert
- [ ] In LearnPanel integriert
- [ ] Keyboard-Navigation funktioniert
- [ ] Particle-Notes visuell abgesetzt
- [ ] Content reviewed (Particle Voice)
- [ ] Mobile getestet
- [ ] TypeScript check passes
- [ ] Build succeeds

---

## Wissenschaftliche Quellen

| Konzept | Forscher | Jahr | Kernaussage |
|---------|----------|------|-------------|
| Pomodoro | Francesco Cirillo | 1987 | 25-Min-Blöcke mit Pausen |
| Ultradian Rhythms | Nathaniel Kleitman | 1950er | 90-Min-Zyklen im Wachzustand |
| 52/17 Rhythmus | DeskTime | 2014 | Top-Performer arbeiten in Blöcken |
| Flow State | Mihaly Csikszentmihalyi | 1990 | Vollständige Absorption |
| Attention Residue | Sophie Leroy | 2009 | Kosten des Task-Switching |

---

## Notizen

- **Länge:** ~600-700 Wörter (3-4 Minuten Lesezeit)
- **Tone:** Wissenschaftsjournalismus, nicht Paper
- **Ziel:** Vertrauen schaffen, nicht belehren
- **Easter Egg:** Die Aussprachehilfe für Csikszentmihalyi zeigt Persönlichkeit

---

*"Die Forschung zeigt den Weg. Du gehst ihn."*
