---
type: story
status: done
priority: p2
effort: 3
feature: ai-coach
created: 2025-02-01
updated: 2026-02-02
done_date: 2026-02-02
tags: [coach, status-message, notification]
---

# POMO-320: Coach Insight Preview in Status Message

## User Story

> Als **Flow-User**
> möchte ich **eine kurze Preview eines neuen AI Coach Insights in der Status Message sehen**,
> damit **ich weiß, dass etwas Interessantes auf mich wartet, ohne aus meinem Flow gerissen zu werden**.

## Kontext

Link zum Feature: [[features/ai-coach]]

Der Aurora-Effekt am CoachParticle zeigt bereits visuell, dass ein neuer Insight bereit ist. Die Status Message ergänzt das mit einer kurzen Text-Preview - subtil, informativ, nicht aufdringlich.

**Warum Status Message statt Toast?**
- Toasts unterbrechen den Flow (wurden bewusst entfernt)
- Status Message ist bereits etabliert für kontextuelle Infos
- Fügt sich nahtlos in die bestehende UI ein
- Respektiert die Particle-Philosophie: Einladung, keine Unterbrechung

## Akzeptanzkriterien

- [ ] **Given** ein neuer Insight wird generiert, **When** der Aurora-Effekt startet, **Then** zeigt die Status Message eine Preview
- [ ] **Given** die Status Message zeigt einen Insight, **When** 8 Sekunden vergangen sind, **Then** verschwindet die Nachricht sanft
- [ ] **Given** der User hat den Coach geöffnet, **When** er ihn schließt, **Then** ist die Insight-Preview nicht mehr sichtbar
- [ ] **Given** eine höher-priorisierte Nachricht (Countdown, Toast), **When** sie aktiv ist, **Then** hat sie Vorrang vor der Insight-Preview

## Technische Details

### Betroffene Dateien
```
src/
├── components/timer/
│   ├── StatusMessage.tsx      # Neue Prop: coachInsightPreview
│   └── Timer.tsx              # Event-Listener + State
├── hooks/
│   └── useCoach.ts            # Event mit Preview-Text dispatchen
└── app/
    └── page.tsx               # State-Management (optional)
```

### Implementierungshinweise

1. **Event erweitern** (`useCoach.ts`):
   ```typescript
   window.dispatchEvent(new CustomEvent('particle:insight-ready', {
     detail: {
       title: generated.title,
       preview: generated.content.substring(0, 60) + '...'  // Kurze Preview
     }
   }));
   ```

2. **StatusMessage erweitern**:
   - Neue Prop: `coachInsightPreview?: string | null`
   - In Prioritätsliste einfügen (nach sessionFeedback, vor modeIndicator)
   - Format: `✨ ${preview}`

3. **Timer.tsx**:
   - Event-Listener für `particle:insight-ready`
   - State: `coachInsightPreview`
   - Auto-clear nach 8 Sekunden
   - Clear wenn Coach geöffnet wird

### Priorität in StatusMessage

```typescript
// Aktuelle Reihenfolge:
// 1. Auto-Start Countdown
// 2. Explicit message (toast)
// 3. Session Feedback
// 4. Mode indicator hover
// 5. Preset hover
// 6. Session status
// 7. End time preview
// 8. Wellbeing hint

// NEU: Coach Insight nach Session Feedback einfügen
// 3.5 Coach Insight Preview (neu)
```

## UI/UX

**Format der Nachricht:**
```
✨ Your morning sessions show a pattern...
```

- Sparkle-Emoji (✨) als Erkennungszeichen für AI Coach
- Gekürzte Preview (max ~60 Zeichen)
- Ellipsis (...) wenn abgeschnitten
- Gleiche Styling wie andere Status Messages

**Timing:**
- Erscheint wenn Aurora-Effekt startet
- Bleibt 8 Sekunden sichtbar (parallel zum Aurora)
- Sanftes Fade-out

**Verhalten:**
- Wird von höher-priorisierten Nachrichten verdrängt
- Verschwindet wenn Coach geöffnet wird
- Erscheint nicht erneut nach Schließen des Coaches

## Testing

### Manuell zu testen
- [ ] Insight generieren → Preview erscheint mit ✨
- [ ] 8 Sekunden warten → Preview verschwindet
- [ ] Coach öffnen während Preview → Preview verschwindet
- [ ] Auto-Start Countdown während Preview → Countdown hat Vorrang
- [ ] Preview-Text ist nicht zu lang (max 60 Zeichen)

### Automatisierte Tests
- [ ] Unit Test: StatusMessage rendert coachInsightPreview korrekt
- [ ] Unit Test: Priorität wird korrekt eingehalten

## Definition of Done

- [ ] Code implementiert
- [ ] Tests geschrieben & grün
- [ ] Code reviewed (selbst oder AI)
- [ ] Lokal getestet
- [ ] Typecheck & Lint bestanden
- [ ] Aurora + Preview erscheinen synchron
- [ ] Preview verschwindet nach Timeout

## Notizen

**Design-Entscheidung:** Das Sparkle-Emoji (✨) macht die Nachricht sofort als AI Coach erkennbar, ohne zusätzlichen Text wie "AI Coach:" zu benötigen. Passt zur minimalistischen Ästhetik.

**Alternative erwogen:** "New insight: ..." wurde verworfen - zu viel Text, das Emoji ist aussagekräftiger.

---

## Arbeitsverlauf

### Erstellt: 2025-02-01
Story aus Idee abgeleitet nach Implementation des Aurora-Effekts.
