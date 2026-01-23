# Particle – Aktualisierte Roadmap

**Stand:** Januar 2026
**Status:** Nach Session-Analyse

---

## Was wir bereits haben ✅

| Feature | Status |
|---------|--------|
| **Keyboard-First** | ✅ Fertig |
| **Command Palette (Cmd+K)** | ✅ Fertig |
| **Deep Work Presets (52/17, 90/20)** | ✅ Fertig |
| **Web-First MVP** | ✅ Fertig |
| **Projects** (statt Categories) | ✅ Fertig |

---

## Was noch fehlt (Session-Learnings)

### 🎯 JETZT: Web-App

| Feature | Priorität | Status |
|---------|-----------|--------|
| **Overflow Mode** | 🔴 P0 | → User Story unten |

### 🧊 ICEBOX: Native App (Später)

| Feature | Plattform | Notiz |
|---------|-----------|-------|
| Calendar Sync | macOS/iOS | Google Calendar Integration |
| Slack Integration | macOS/iOS | Status + DND |
| Linear Integration | macOS/iOS | Bidirektionale Sync |
| Website Blocking | Browser Extension | Chrome/Firefox |
| App Blocking | macOS | Tauri Desktop |
| System DND | macOS/iOS | Native APIs |
| Menu Bar Timer | macOS | Tauri Desktop |

---

## Offene Design-Frage: Container-Naming

**Problem:** Wohin gehen die Partikel?

| Option | Pro | Contra |
|--------|-----|--------|
| **Projects** | Geläufig, verständlich | Generic |
| **Categories** | Session nutzt es | Zu abstrakt |
| **Containers** | Passt zu "Particle" | Ungewöhnlich |
| **Orbits** | Partikel → Orbit (Physik-Metapher) | Vielleicht zu spacig? |
| **Fields** | Partikel in Feldern (Physik) | Interessant |
| **Streams** | Partikel-Strom | Modern |

**Empfehlung:** "Projects" erstmal beibehalten, später User-Feedback holen.

---

## User Story: Overflow Mode

### US-FLOW-01: Overflow Mode

**Epic:** Timer Core Enhancement

> **Als** Deep-Work-Nutzer
> **möchte ich** nach Timer-Ende im "Overflow" weiterarbeiten können,
> **damit** mein Flow-State nicht unterbrochen wird, wenn ich noch konzentriert bin.

---

#### Kontext

Session hat gezeigt: Harte Timer-Stops sind frustrierend. Wenn jemand im Flow ist, will er nicht bei 00:00 rausgerissen werden. Der Timer sollte **einladen** zur Pause, nicht **zwingen**.

---

#### Akzeptanzkriterien

**Timer-Verhalten:**
- [x] Nach 00:00 läuft der Timer weiter und zeigt positive Overflow-Zeit
- [x] Anzeige wechselt von `00:05` → `00:00` → `+00:01` → `+00:02` ...
- [x] Timer-Farbe/Style ändert sich subtil im Overflow (z.B. Accent-Farbe pulsiert sanft)
- [x] Sound/Notification bei 00:00 (optional, je nach User-Setting)

**User Control:**
- [x] `Space` pausiert auch im Overflow
- [x] `B` startet sofort Break (überspringt Overflow)
- [x] `Enter` beendet Session und loggt Gesamtzeit (inkl. Overflow)
- [x] Overflow-Zeit wird separat getrackt für Analytics

**Visueller Feedback:**
- [x] Subtile Animation zeigt "Du bist im Overflow"
- [x] Kein aggressives Blinken oder Störung
- [x] Text-Hint: "Im Flow? Arbeite weiter." (dezent)

**Edge Cases:**
- [ ] Overflow funktioniert für alle Presets (25/5, 52/17, 90/20)
- [ ] Bei Custom-Presets auch verfügbar
- [ ] Overflow-Zeit wird in Session-History gespeichert

---

#### Keyboard Shortcuts

| Taste | Aktion im Overflow |
|-------|-------------------|
| `Space` | Pause/Resume Overflow |
| `B` | Sofort Break starten |
| `Enter` | Session beenden, Zeit loggen |
| `Escape` | Session abbrechen (mit Undo) |

---

#### UI/UX Spezifikation

**Normale Session:**
```
┌─────────────────────────────┐
│                             │
│          12:34              │  ← Weiß (#F5F5F5)
│                             │
│      Working on Task        │
│                             │
└─────────────────────────────┘
```

**Overflow Mode:**
```
┌─────────────────────────────┐
│                             │
│         +02:15              │  ← Accent (#4F6EF7), sanft pulsierend
│                             │
│   Im Flow? Arbeite weiter.  │  ← Dezenter Hint
│      [B] Break  [↵] Done    │  ← Shortcut-Hints
│                             │
└─────────────────────────────┘
```

**Animation:**
- Übergang 00:00 → +00:01: Sanfter Fade (200ms)
- Pulsieren: `opacity: 0.8 → 1.0`, 2s Zyklus, ease-in-out
- Kein hartes Blinken

---

#### Datenmodell

```typescript
interface Session {
  id: string;
  task: string;
  project?: string;
  preset: 'pomodoro' | 'desktime' | 'ultradian' | 'custom';
  plannedDuration: number;      // in Sekunden
  actualDuration: number;       // Geplant + Overflow
  overflowDuration: number;     // Nur Overflow-Zeit
  startedAt: Date;
  endedAt: Date;
  status: 'completed' | 'abandoned';
}
```

---

#### Analytics-Integration

**Neue Metriken:**
- `averageOverflowTime`: Durchschnittliche Overflow-Zeit
- `overflowRate`: % der Sessions mit Overflow
- `flowSessions`: Sessions mit >5min Overflow (= echte Flow-States)

**Insight für User:**
> "Du warst diese Woche 3x im Flow-State (>5min Overflow). Deine produktivste Zeit war Dienstag 10-12 Uhr."

---

#### Nicht im Scope (v1)

- [ ] Automatischer Break nach X Minuten Overflow
- [ ] Overflow-Warnung nach langer Zeit
- [ ] Unterschiedliche Overflow-Modi pro Preset

---

#### Story Points

**Schätzung:** 5 Points

| Komponente | Aufwand |
|------------|---------|
| Timer-Logik anpassen | 2 |
| UI/Animation | 2 |
| Datenmodell + Storage | 1 |

---

#### Definition of Done

- [x] Timer zeigt Overflow-Zeit korrekt an
- [x] Keyboard-Shortcuts funktionieren im Overflow
- [x] Visuelle Unterscheidung zu Normal-Modus
- [x] Session-Daten inkl. Overflow gespeichert
- [x] Keine Console-Errors
- [x] Responsive auf allen Viewports
- [x] Code Review abgeschlossen

---

*Diese User Story basiert auf Session's Overflow-Feature, angepasst an Particles Keyboard-First-Philosophie.*
