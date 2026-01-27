# Break Reminders – Konzeptanalyse

> **Die Prüffrage:** "Würde ein einzelner weißer Punkt auf schwarzem Grund stolz sein, Teil davon zu sein?"

---

## Das Problem verstehen

**Ausgangslage:** Centered und andere Apps haben "Wellbeing-Coaches", die User während der Arbeit an Pausen, Wasser, Augenruhe erinnern.

**Der Wunsch:** User sollen gesund bleiben – 20-20-20 Regel, Hydration, Bewegung.

**Die Frage:** Passt das zu Particle?

---

## Die philosophische Analyse

### Was Particle ist

> "Particle ist der Raum, in dem Menschen ihr Lebenswerk schaffen."

> "Wir glauben, dass Fokus heilig ist."

> "Ein Spiegel, kein Spiel."

### Was Break Reminders sind

Break Reminders sind **Unterbrechungen**. Sie sagen: "Du machst gerade etwas falsch. Stopp."

Egal wie subtil: Ein Reminder während einer Focus-Session ist eine **Intervention**.

---

## Die kritischen Fragen

### 1. Widerspricht es unserem Kernprinzip?

**Particle-Prinzip:** Fokus ist heilig. Keine Störungen.

**Break Reminder:** Stört den Fokus, um auf Gesundheit hinzuweisen.

**Konflikt:** ⚠️ **Ja, fundamental.**

---

### 2. Ist es "Stolz statt Schuld"?

**Ein Reminder sagt:** "Du hast vergessen, Pause zu machen."

Das ist **implizite Schuld**. Nicht so offensichtlich wie "Streak verloren", aber dieselbe Logik: *"Du machst etwas nicht richtig."*

**Konflikt:** ⚠️ **Ja.**

---

### 3. Vertrauen wir dem User?

**Particle-Philosophie:** Der User weiß, was er tut. Wir begleiten, wir bevormunden nicht.

**Break Reminder:** "Ich weiß besser als du, wann du Pause brauchst."

Das ist der **Centered-Fehler**: Der AI-Coach, den viele als nervig empfinden.

**Konflikt:** ⚠️ **Ja.**

---

### 4. Hat Pomodoro nicht schon Pausen?

Die Pomodoro-Technik **hat bereits Pausen eingebaut**:
- 25 min Focus → 5 min Break
- Nach 4 Cycles → Long Break

Der User hat das **System gewählt**. Das System kümmert sich um Pausen. Warum noch ein Layer?

**Redundanz:** ⚠️ **Ja.**

---

### 5. "Weniger, aber besser"

Dieter Rams würde fragen: *"Ist dieses Feature notwendig?"*

Break Reminders sind:
- Nicht Teil der Kernfunktion (Fokus visualisieren)
- Nicht reduziert (ein Feature mehr)
- Nicht essenziell (Pomodoro hat Pausen)

**Konflikt mit Reduktionsprinzip:** ⚠️ **Ja.**

---

## Das Urteil

### ❌ Break Reminders während Focus-Sessions: NEIN

**Begründung:**
1. Widerspricht "Fokus ist heilig"
2. Ist implizite Schuld, nicht Stolz
3. Bevormundet den User
4. Redundant zu Pomodoro-Pausen
5. Feature Creep

**Die Prüffrage:** Würde ein Partikel stolz sein, den User während Deep Work zu unterbrechen?

**Antwort:** Nein. Ein Partikel respektiert den Flow.

---

## Aber: Die Particle-Alternative

Wenn der Wunsch nach Wellbeing-Unterstützung besteht, gibt es **Particle-konforme** Wege:

### Alternative A: Post-Session Insights (Reflection, nicht Intervention)

**Konzept:** Nach einer Session (natürlicher Break-Punkt), biete **optionale** Wellbeing-Tipps an.

**Warum das funktioniert:**
- Keine Unterbrechung während Focus
- User ist ohnehin in der Pause
- Reflection statt Intervention

**Beispiel:**
```
Session beendet. Well done.

💡 Du hast 2h fokussiert. Idealer Zeitpunkt für:
   • 20 Sek in die Ferne schauen
   • Ein Glas Wasser
   • Kurz aufstehen

[Diese Tipps verbergen]
```

**Wichtig:**
- Opt-in (Default: aus)
- Nur nach Session, nie während
- Keine Notifications, nur on-screen
- Einmal pro Session, nicht alle 20 min
- Leicht zu deaktivieren

---

### Alternative B: Stats-based Reflection (Der Spiegel-Ansatz)

**Konzept:** In den Statistiken zeigen wir **Muster**, keine Mahnungen.

**Warum das funktioniert:**
- Particle ist ein Spiegel: Wir zeigen, was ist
- User interpretiert selbst
- Keine Echtzeit-Unterbrechung

**Beispiel in Stats:**
```
Diese Woche:
• Längste Focus-Streak: 3h 45min (Dienstag)
• Durchschnittliche Session: 42min

💡 Insight: Am Dienstag hast du 3h ohne Pause gearbeitet.
   Die 20-20-20 Regel empfiehlt alle 20min kurz die Augen zu entspannen.
```

**Wichtig:**
- Retrospektiv, nicht Echtzeit
- Information, nicht Mahnung
- User entscheidet, was er damit macht

---

### Alternative C: Enhanced Break Mode

**Konzept:** Während der **Break-Phase** (nicht Focus!) zeige Wellbeing-Tipps.

**Warum das funktioniert:**
- Break ist per Definition Nicht-Focus-Zeit
- User hat sich bereits entschieden, Pause zu machen
- Wir verbessern die Pause, stören nicht die Arbeit

**Beispiel im Break-Screen:**
```
Break: 4:32 remaining

Nutze die Pause:
→ Steh kurz auf
→ Schau aus dem Fenster
→ Atme tief durch
```

**Wichtig:**
- Nur im Break-Mode, nie im Focus-Mode
- Optional (Toggle in Settings)
- Dezent, kein Popup

---

## Empfehlung

### Primär-Empfehlung: Alternative B (Stats Insights)

**Warum:**
- Passt perfekt zur "Spiegel"-Philosophie
- Zero Interruption während Focus
- User reflektiert selbst
- Kein neues Feature, sondern Enhancement bestehender Stats
- Minimaler Aufwand

### Sekundär-Empfehlung: Alternative C (Enhanced Break Mode)

**Warum:**
- Verbessert existierenden Break-Screen
- Keine Störung des Focus
- Opt-in

### Nicht empfohlen: Original-Konzept (POMO-151)

Das Original-Konzept mit Echtzeit-Reminders während Focus passt nicht zu Particle.

---

## Wenn wir es doch bauen würden...

Falls wir trotz allem Break Reminders wollen, hier die **Particle-konforme Minimalversion**:

### Die "Silent Pulse" Variante

**Konzept:** Der Partikel selbst zeigt dezent an, dass Zeit vergangen ist – ohne Text, ohne Popup, ohne Ton.

**Umsetzung:**
- Nach 45min ununterbrochener Arbeit: Der Partikel pulsiert einmal sanft anders (langsamer, weicher)
- Kein Text. Kein Sound. Nur: Der Partikel.
- User interpretiert: "Ah, vielleicht sollte ich mal aufschauen."

**Warum das Particle ist:**
- Der Partikel kommuniziert, nicht die App
- Subtil, fast unsichtbar
- Keine Worte, keine Schuld
- User muss es bemerken wollen

**Aber:** Selbst das ist grenzwertig. Es ist immer noch eine Intervention.

---

## Fazit

### Die ehrliche Antwort

**Break Reminders passen nicht zu Particle.**

Sie widersprechen:
- "Fokus ist heilig"
- "Stolz statt Schuld"
- "Weniger, aber besser"
- "Vertraue dem User"

### Der Particle-Weg

Wenn Wellbeing unterstützt werden soll:
1. **Reflection, nicht Intervention** (Stats Insights)
2. **Break verbessern, nicht Focus stören** (Enhanced Break)
3. **Der User entscheidet, nicht die App**

### Die finale Prüffrage

> "Würde ein einzelner weißer Punkt auf schwarzem Grund den User während Deep Work unterbrechen, um ihm zu sagen, er soll Wasser trinken?"

**Antwort:** Nein. Der Punkt ist still. Der Punkt ist da. Der Punkt respektiert den Raum.

---

*"Focus is about saying no." – Steve Jobs*

*Manchmal ist das beste Feature, das wir nicht bauen.*

---

## Decision Summary

| Ansatz | Empfehlung | Begründung |
|--------|------------|------------|
| Echtzeit-Reminders während Focus | ❌ Nein | Widerspricht Kern-Philosophie |
| Post-Session Tipps (Optional) | ⚠️ Vielleicht | Akzeptabel, aber nicht nötig |
| Stats-based Insights | ✅ Ja | Passt zur Spiegel-Philosophie |
| Enhanced Break Mode | ✅ Ja | Verbessert Break, stört nicht Focus |
| "Silent Pulse" (Partikel-Variation) | ⚠️ Grenzwertig | Kreativ, aber immer noch Intervention |

---

*Erstellt: 2026-01-27*
*Status: Konzeptanalyse*
