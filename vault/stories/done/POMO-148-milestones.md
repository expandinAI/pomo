---
type: story
status: done
priority: p2
effort: 5
feature: "[[features/reflection]]"
created: 2026-01-25
updated: 2026-01-27
done_date: 2026-01-27
tags: [milestones, reflection, meaning, visual, p2]
---

# POMO-148: Milestones – Quiet Markers on Your Journey

## Philosophy

> **Particle is not a game. Particle is a mirror.**

Other apps reward you with badges. Particle doesn't.

Other apps say "Achievement Unlocked! 🎉". Particle doesn't.

**Milestones in Particle are not trophies. They are markers on a long path.** You pass them, pause for a moment, and continue. They don't say "Well done!" – they say "You are here. Look how far you've come."

---

## User Story

> As a **person who wants to reflect**
> I want to **experience and preserve meaningful moments of my focus journey**
> so that **I can be proud of my path – and see how I grow**.

---

## Two Elements

### 1. The Moment – When a Milestone is Reached
A real **moment of pause**. Not a quick toast, but an experience.

### 2. The Journey – Looking Back at All Milestones
A **visual tapestry** where you see your journey. Pride. Reflection. Growth.

---

## The Milestones

| Milestone | Condition | Reflection |
|-----------|-----------|------------|
| **First Particle** | 1 session | *"The beginning of everything."* |
| **Ten Particles** | 10 sessions | *"A handful of focus. The start of a pattern."* |
| **Hundred Particles** | 100 sessions | *"A hundred moments of decision."* |
| **Thousand Particles** | 1000 sessions | *"A universe takes shape."* |
| **Ten Hours** | 10h focus time | *"Ten hours. A workday. Or: the beginning of a book."* |
| **Hundred Hours** | 100h focus time | *"A hundred hours. That's not a number. That's dedication."* |
| **One Week** | 7 days with ≥1 particle | *"Seven days. A habit is forming."* |
| **One Month** | 30 days with ≥1 particle | *"Thirty days. Focus becomes you."* |
| **Deep Work** | First 90-min session | *"Ninety minutes. An ultradian cycle. Deep work."* |
| **First Project** | First project created | *"Focus gets a name."* |

---

## Part 1: The Moment

### The Experience

When a milestone is reached, something special happens. Not a small toast in the corner – a **real moment**.

**The sequence:**

1. **Screen dims softly** (Backdrop blur + opacity)
2. **Particles converge** from the edges to the center
3. **The name appears** – slowly, fade-in
4. **The reflection appears** – below, in italic
5. **The sound plays** – a deep, warm tone
6. **User confirms** – Enter or click to continue
7. **Particles disperse** gently, overlay disappears

**Why active confirmation?**
The user should **pause**. Not "oh, a badge" and move on. But: "Wow. A hundred particles. That's me."

### Visual Design

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                         ·  ·                                    │
│                       ·      ·                                  │
│                      ·        ·                                 │
│                       ·  ●  ·                                   │
│                        · · ·                                    │
│                                                                 │
│                                                                 │
│                    Hundred Particles                            │
│                                                                 │
│             A hundred moments of decision.                      │
│                                                                 │
│                                                                 │
│                        ─────────                                │
│                                                                 │
│                    January 26, 2026                             │
│                                                                 │
│                                                                 │
│                                                                 │
│                      [ Continue ]                               │
│                          ↵                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Particle animation**: 8-12 small white dots converging to the center
- **Central point**: A slightly larger particle in the middle (the "heart")
- **Name**: Large font, medium weight, white
- **Reflection**: Smaller font, italic, `text-secondary`
- **Date**: Even smaller, `text-tertiary`
- **Button**: Subtle, or just keyboard hint "↵ Continue"

### Animation Specification

```typescript
// Timing
const MILESTONE_MOMENT = {
  backdropFadeIn: 400,      // ms
  particleConverge: 800,    // ms - particles fly to center
  textFadeIn: 600,          // ms - name appears
  reflectionDelay: 300,     // ms - after name
  reflectionFadeIn: 500,    // ms
  soundDelay: 200,          // ms - after particle convergence
  // User interacts...
  particleDiverge: 600,     // ms - particles disperse
  backdropFadeOut: 400,     // ms
};

// Particle animation
const particleAnimation = {
  initial: {
    // Random position outside viewport
    x: randomEdgePosition(),
    y: randomEdgePosition(),
    opacity: 0,
    scale: 0.5,
  },
  converge: {
    x: centerX,
    y: centerY - 60, // Above the text
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 15,
    },
  },
  diverge: {
    x: randomEdgePosition(),
    y: randomEdgePosition(),
    opacity: 0,
    scale: 0.3,
    transition: { duration: 0.6 },
  },
};
```

### The Sound

**Concept: "The Gong of Reflection"**

Not the usual achievement ding. A deeper, warmer tone that lingers. Like a singing bowl in a quiet room.

```typescript
function playMilestoneSound(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;

  // Fundamental: Deep, warm (A3 = 220 Hz)
  const fundamental = 220;

  // Harmonics for singing bowl character
  const harmonics = [
    { freq: fundamental, gain: 0.15, decay: 2.5 },      // Fundamental
    { freq: fundamental * 2, gain: 0.08, decay: 2.0 },  // Octave
    { freq: fundamental * 3, gain: 0.04, decay: 1.5 },  // Fifth
    { freq: fundamental * 4.2, gain: 0.02, decay: 1.2 }, // Inharmonic (bowl character)
  ];

  harmonics.forEach(({ freq, gain, decay }) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Slight frequency movement (vibrato) for living sound
    osc.frequency.setValueAtTime(freq * 1.002, now + 0.5);
    osc.frequency.setValueAtTime(freq * 0.998, now + 1.0);
    osc.frequency.setValueAtTime(freq, now + 1.5);

    // Soft attack, long decay
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + decay);

    osc.connect(gainNode);
    gainNode.connect(dest);

    osc.start(now);
    osc.stop(now + decay + 0.1);
  });
}
```

**Properties:**
- Duration: ~2.5 seconds (long decay)
- Pitch: Deep and warm (A3, 220 Hz)
- Character: Singing bowl
- Clearly different from the session-complete sound (which is higher, shorter)

---

## Part 2: The Journey (Review View)

### The Concept

A visual representation of your milestone journey. Not a list. A **path**.

**Metaphor:** A vertical trail with markers. Like a hiking path where you look back and see where you've been.

### Visual Design

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        Your Journey                             │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│                            │                                    │
│                            │                                    │
│                            ●───  Hundred Particles              │
│                            │     A hundred moments of           │
│                            │     decision.                      │
│                            │     January 26, 2026               │
│                            │     ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄             │
│                            │     142 particles at this          │
│                            │     point                          │
│                            │                                    │
│                            │                                    │
│                            │                                    │
│                            ●───  Deep Work                      │
│                            │     Ninety minutes.                │
│                            │     An ultradian cycle.            │
│                            │     January 22, 2026               │
│                            │                                    │
│                            │                                    │
│                            │                                    │
│                            ●───  Ten Particles                  │
│                            │     A handful of focus.            │
│                            │     January 18, 2026               │
│                            │                                    │
│                            │                                    │
│                            │                                    │
│                            ●───  First Particle                 │
│                            │     The beginning of everything.   │
│                            │     January 15, 2026               │
│                            │                                    │
│                            ○                                    │
│                          Start                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Elements

**The line:**
- Vertical line, `border-l` or SVG
- Color: `border-tertiary` (subtle)
- Bottom to top (oldest at bottom, newest at top)

**The milestone points:**
- Small white circles (`●`) on the line
- On hover/focus: Subtle glow
- Keyboard-navigable (↑/↓)

**The details (right of the point):**
- Name: Medium weight
- Reflection: Italic, secondary
- Date: Small, tertiary
- Context: "X particles at this point" (optional, very subtle)

**The beginning:**
- Empty circle (`○`) at the bottom
- Label "Start" below

### Interaction

**Click/Enter to Relive:**
- Clicking on a reached milestone **replays the Moment**
- The same full-screen overlay appears
- The same particle animation plays
- The same gong sound resonates
- You can **relive any milestone**, anytime

**Why Relive?**
This is not a debug feature – it's a meaningful interaction. Sometimes you want to experience that moment again. The first particle. The hundredth hour. Milestones are not one-time badges; they are memories you can return to.

**Keyboard:**
- `↑` / `↓` – Navigate between milestones
- `Enter` – **Relive** the focused milestone (triggers Moment)
- `Escape` – Close view

**Animation on scroll:**
- Milestones fade in as they enter the viewport
- Subtle parallax movement (points move slightly differently than text)

### Access to the Journey View

**Option A: In Settings**
Settings → "Your Journey" or "Milestones"

**Option B: In Statistics**
Statistics page has a "Journey" tab or link

**Option C: Keyboard Shortcut**
`G M` (Go to Milestones) or `G J` (Go to Journey)

**Recommendation:** Option C + Option B. Keyboard-first, but also accessible via Statistics.

---

## Acceptance Criteria

### The Moment
- [ ] **Given** milestone reached, **When** session ends, **Then** moment overlay appears
- [ ] **Given** overlay, **When** displayed, **Then** particles converge to center
- [ ] **Given** overlay, **When** particles converged, **Then** name + reflection fade in
- [ ] **Given** overlay, **When** displayed, **Then** sound plays
- [ ] **Given** overlay, **When** user presses Enter, **Then** overlay disappears
- [ ] **Given** overlay, **When** user clicks "Continue", **Then** overlay disappears
- [ ] **Given** multiple milestones at once, **When** reached, **Then** show sequentially

### The Journey
- [ ] **Given** journey view, **When** opened, **Then** vertical timeline visible
- [ ] **Given** timeline, **When** milestones reached, **Then** shown as points
- [ ] **Given** timeline, **When** design, **Then** monochrome, no badges
- [ ] **Given** milestone, **When** displayed, **Then** name, reflection, date visible
- [ ] **Given** ↑/↓, **When** pressed, **Then** navigation between milestones
- [ ] **Given** scroll, **When** timeline long, **Then** subtle fade-in animation

### Relive (in Journey View)
- [ ] **Given** reached milestone, **When** clicked, **Then** Moment overlay appears
- [ ] **Given** reached milestone, **When** Enter pressed, **Then** Moment overlay appears
- [ ] **Given** relived moment, **When** displayed, **Then** same animation + sound as original
- [ ] **Given** unreached milestone, **When** displayed, **Then** not clickable (greyed out or hidden)

### Sound
- [ ] **Given** milestone moment, **When** particles converge, **Then** gong sound plays
- [ ] **Given** sound, **When** played, **Then** deep, warm, ~2.5s decay
- [ ] **Given** user has sound muted, **When** milestone, **Then** no sound

### Persistence
- [ ] **Given** milestone reached, **When** saved, **Then** in localStorage
- [ ] **Given** app reload, **When** started, **Then** milestones preserved

---

## Technical Details

### Component Structure

```
src/components/milestones/
├── MilestoneProvider.tsx      # Context for milestone state
├── MilestoneMoment.tsx        # The overlay when reaching/reliving
├── MilestoneParticles.tsx     # Particle animation
├── MilestoneJourney.tsx       # The review view (with relive)
├── MilestonePoint.tsx         # Single point on timeline (clickable)
└── useMilestones.ts           # Hook for logic

src/lib/milestones/
├── milestones.ts              # Milestone definitions
├── milestone-checker.ts       # Check logic
├── milestone-storage.ts       # localStorage
└── milestone-sound.ts         # The gong sound
```

### Data Model

```typescript
interface Milestone {
  id: string;
  name: string;
  condition: MilestoneCondition;
  reflection: string;
}

interface ReachedMilestone {
  id: string;
  reachedAt: Date;
  particleCount: number;  // Particles at this point
  focusHours: number;     // Hours at this point
}

interface MilestoneState {
  reached: ReachedMilestone[];
  pendingMoment: Milestone | null;  // Waiting to be shown
}
```

### Integration with Timer

```typescript
// In Timer.tsx after session complete
const { checkAndRecord, pendingMoment, clearPendingMoment } = useMilestones();

useEffect(() => {
  if (sessionJustCompleted) {
    // Update stats...

    // Check milestone
    const newMilestone = checkAndRecord(currentStats);

    if (newMilestone) {
      // Delay celebration, show milestone first
      setShowMilestoneMoment(true);
    } else {
      // Normal celebration
      showCelebration();
    }
  }
}, [sessionJustCompleted]);
```

---

## What We're NOT Building

| Feature | Why not |
|---------|---------|
| Badge icons | Gamification |
| Progress to next milestone | Creates pressure |
| Locked/upcoming milestones visible | Manipulative |
| Sharing buttons | Ego instead of focus |
| Notifications outside the app | Disruptive |
| Comparison with "average" | Stress |

---

## Definition of Done

- [ ] Milestone definitions (10 milestones)
- [ ] MilestoneMoment overlay with particle animation
- [ ] Milestone sound (gong/bowl)
- [ ] MilestoneJourney view (timeline)
- [ ] Relive feature (click/Enter on milestone to replay Moment)
- [ ] Keyboard navigation (↑/↓, Enter, Escape)
- [ ] Access via `G M` shortcut
- [ ] localStorage persistence
- [ ] Integration with Timer (after session complete)
- [ ] Reflection texts finalized (English)
- [ ] **Checkpoint:** "Does this feel like a moment, not a badge?"

---

## The Essence

**The Moment** is not "Achievement Unlocked". It's a pause. A breath. A "Look where you are."

**The Journey** is not a trophy wall. It's a hiking trail where you look back. Proud, not boastful.

**The Sound** is not a ding-ding. It's a gong that lingers. Deep. Warm. Meaningful.

---

*"The work of a lifetime consists of many particles. Milestones are the moments when you pause and recognize that."*
