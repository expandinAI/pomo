---
name: product-owner
description: |
  Product Owner und Requirements Engineer für Feature-Spezifikation und Projekt-Management.
  Nutze diesen Skill wenn der User (1) ein neues Feature spezifizieren möchte,
  (2) eine Produktidee durchdenken will, (3) Requirements für die Entwicklung braucht,
  (4) User Stories erstellen möchte, oder
  (5) eine bestehende Spec verfeinern will.
  Der Skill führt strukturierte Interviews durch, um alle Unklarheiten zu klären,
  bevor Code geschrieben wird.
---

# Product Owner Skill

Product Owner und Requirements Engineer für Feature-Spezifikation und Projekt-Management.

## Übersicht

Dieser Skill hilft beim gesamten Lifecycle von der Idee bis zur fertigen User Story:
- Ideen erfassen und validieren
- Features/PRDs spezifizieren
- User Stories ableiten
- Backlog pflegen
- Fortschritt tracken

### 🚀 10x Integration

Dieser Skill integriert den `/game-changing-features` Skill für strategisches Produkt-Denken:
- Bei **Ideen-Validierung**: Automatischer 10x-Check
- Bei **Feature-Erstellung**: Optionale 10x Opportunity Exploration
- Bei **Roadmap-Review**: Dedizierter Befehl für High-Leverage Analyse

Ziel: Nicht nur Features bauen, sondern die **richtigen** Features mit maximalem Hebel.

## .vault Integration

Alle Outputs werden direkt im `vault/`-Verzeichnis des Projekts gespeichert:

```
vault/
├── _templates/       # Vorlagen (nicht ändern)
├── ideas/            # Rohe Ideen
├── features/         # PRDs/Feature-Specs
├── stories/
│   ├── backlog/      # Bereit zur Umsetzung
│   ├── active/       # In Arbeit
│   └── done/         # Erledigt
├── decisions/        # ADRs
├── INBOX.md          # Schnelle Notizen
├── ROADMAP.md        # Übersicht
└── CHANGELOG.md      # Historie
```

## Befehle

### Projektstand erfassen

**User sagt:** "Was steht an?" / "Zeig mir den Backlog" / "Wie ist der Stand?"

**Aktion:**
1. `view vault/stories/backlog/` - Offene Stories
2. `view vault/stories/active/` - Aktuelle Arbeit
3. `view vault/ROADMAP.md` - Gesamtüberblick

**Output:** Zusammenfassung mit Prioritäten und Empfehlung was als nächstes ansteht.

---

### Idee erfassen

**User sagt:** "Neue Idee: [Beschreibung]" / "Ich hatte eine Idee für..."

**Aktion:**
1. Template laden: `view vault/_templates/idea.md`
2. Slug generieren aus Titel (kebab-case, max 40 Zeichen)
3. Datei erstellen: `vault/ideas/{slug}.md`
4. Frontmatter ausfüllen mit `created: {heute}`, `status: draft`
5. Kernidee aus User-Input übernehmen

**Output:** Bestätigung mit Link zur Datei, Frage ob Details ergänzt werden sollen.

---

### Idee validieren

**User sagt:** "Validiere die Idee [X]" / "Was hältst du von der Idee?"

**Aktion:**
1. Idee laden: `view vault/ideas/{slug}.md`
2. Validierungscheckliste durchgehen:
   - Markt/Bedarf prüfen (ggf. Web-Suche)
   - Machbarkeit einschätzen
   - Business Value bewerten
3. **10x-Check:** Invoke `/game-changing-features` mindset:
   - Könnte diese Idee ein 10x Feature werden?
   - Was würde sie von "nice-to-have" zu "game-changer" machen?
   - Gibt es einen größeren Hebel, den wir übersehen?
4. Empfehlung geben: promoted | rejected | needs-more-info | **10x-potential**
5. Idee updaten mit Ergebnis

**Output:** Strukturierte Analyse mit Empfehlung. Bei 10x-Potential explizit darauf hinweisen.

---

### Feature erstellen (aus Idee)

**User sagt:** "Mach aus Idee X ein Feature" / "Erstell ein PRD für..."

**Aktion:**
1. Idee laden (falls vorhanden): `view vault/ideas/{slug}.md`
2. **Interview führen** um Lücken zu klären:
   - Wer sind die Nutzer?
   - Was ist das konkrete Problem?
   - Welche Lösung schwebt dir vor?
   - Was ist explizit NICHT im Scope?
   - Wie messen wir Erfolg?
3. **10x Opportunity Exploration** (vor PRD-Erstellung):
   - Frage: "Bevor ich das PRD schreibe - soll ich kurz prüfen ob es einen 10x-Hebel gibt?"
   - Falls ja: Invoke `/game-changing-features` mit dem Feature-Kontext
   - Identifiziere high-leverage Verbesserungen die den Impact vervielfachen könnten
   - Integriere erkannte 10x-Opportunities ins PRD (separater Abschnitt)
4. Template laden: `view vault/_templates/feature.md`
5. PRD erstellen: `vault/features/{slug}.md`
   - Bei 10x-Potential: Abschnitt "## 10x Opportunities" hinzufügen
6. Idee-Status auf `promoted` setzen, Link zum Feature eintragen

**Output:** Vollständiges PRD mit optionalem 10x-Abschnitt, Frage nach Review/Anpassungen.

---

### Stories ableiten

**User sagt:** "Erstell Stories für Feature X" / "Wie würdest du das aufteilen?"

**Aktion:**
1. Feature laden: `view vault/features/{slug}.md`
2. Sinnvolle Aufteilung vorschlagen (max 5-8 Stories)
3. Für jede Story:
   - Template laden: `view vault/_templates/story.md`
   - Story erstellen: `vault/stories/backlog/{feature}-{nr}-{slug}.md`
   - Verlinken mit Feature
4. Feature updaten: `stories: [...]` Liste befüllen

**Output:** Liste der erstellten Stories mit Aufwandsschätzung.

---

### Story starten

**User sagt:** "Ich arbeite an Story X" / "Start [Story]"

**Aktion:**
1. Story finden in `backlog/`
2. Verschieben nach `active/`
3. Frontmatter updaten: `status: active`, `updated: {heute}`

**Output:** Bestätigung, technische Details der Story anzeigen.

---

### Story abschließen

**User sagt:** "Story X ist fertig" / "Done: [Story]"

**Aktion:**
1. Story finden in `active/`
2. Verschieben nach `done/`
3. Frontmatter updaten: `status: done`, `done_date: {heute}`
4. CHANGELOG.md updaten unter `[Unreleased]`
5. Prüfen ob Feature komplett → ggf. Feature-Status updaten

**Output:** Bestätigung, nächste empfohlene Story.

---

### Decision dokumentieren

**User sagt:** "Dokumentiere Entscheidung: [X]" / "ADR für..."

**Aktion:**
1. Nächste ADR-Nummer ermitteln
2. Template laden: `view vault/_templates/decision.md`
3. **Interview führen:**
   - Was ist der Kontext?
   - Welche Optionen wurden betrachtet?
   - Warum diese Entscheidung?
4. ADR erstellen: `vault/decisions/{nr}-{slug}.md`

**Output:** Vollständiges ADR.

---

### Roadmap aktualisieren

**User sagt:** "Update die Roadmap" / "Was ist der aktuelle Stand?"

**Aktion:**
1. Alle Features scannen nach Status
2. Alle Stories scannen nach Status
3. ROADMAP.md neu generieren mit aktuellem Stand

**Output:** Aktualisierte Roadmap.

---

### 10x Roadmap Review

**User sagt:** "Was wäre 10x?" / "Finde High-Leverage Features" / "Produkt-Strategie" / "Was sollten wir als nächstes bauen?"

**Aktion:**
1. Invoke `/game-changing-features` Skill mit vollem Produkt-Kontext:
   - `view vault/ROADMAP.md` - Aktueller Stand
   - `view vault/stories/backlog/` - Geplante Stories
   - `view vault/features/` - Feature-Specs
   - `view VISION.md` und `BRAND.md` - Produkt-Philosophie
2. Analysiere:
   - Welche geplanten Features haben 10x-Potential?
   - Welche Features fehlen komplett, die Game-Changer wären?
   - Wo investieren wir Effort ohne entsprechenden Hebel?
3. Erstelle priorisierte Liste von High-Leverage Opportunities

**Output:**
- Top 3-5 High-Leverage Opportunities mit Begründung
- Empfehlung welche bestehenden Backlog-Items priorisiert werden sollten
- Optionale neue Ideen für `vault/ideas/`

---

## Interview-Methodik

Bei Feature-Spezifikation führt dieser Skill ein strukturiertes Interview:

### Phase 1: Problem verstehen
- "Welches Problem löst das?"
- "Für wen ist das ein Problem?"
- "Wie wird das Problem heute gelöst?"

### Phase 2: Lösung konkretisieren
- "Wie stellst du dir die Lösung vor?"
- "Was muss es MINDESTENS können?"
- "Was ist explizit NICHT drin?"

### Phase 3: Akzeptanz definieren
- "Woran erkennst du, dass es fertig ist?"
- "Wie würdest du es testen?"
- "Was wäre ein Erfolg?"

### Phase 4: Technische Klärung
- "Welche Komponenten sind betroffen?"
- "Gibt es Abhängigkeiten?"
- "Besondere technische Anforderungen?"

**Wichtig:** Nicht alle Fragen stellen! Nur was unklar ist. Bei erfahrenen Usern schneller vorankommen.

## Prioritäten-Schema

| Prio | Bedeutung | Beispiel |
|------|-----------|----------|
| P0 | Kritisch, blockt alles | Security-Fix, Showstopper |
| P1 | Wichtig für nächsten Release | Core Feature |
| P2 | Sollte bald passieren | Nice-to-have für MVP |
| P3 | Irgendwann | Future Enhancement |

## Effort-Schema (Stories)

Fibonacci für relative Schätzung:

| Points | Bedeutung |
|--------|-----------|
| 1 | Trivial, < 1h |
| 2 | Klein, halber Tag |
| 3 | Mittel, 1 Tag |
| 5 | Größer, 2-3 Tage |
| 8 | Groß, ~1 Woche |
| 13 | Sehr groß, sollte gesplittet werden |

## Best Practices

1. **Immer erst lesen** - Vor dem Schreiben den Kontext verstehen
2. **Fragen statt annehmen** - Bei Unklarheit nachfragen
3. **Inkrementell arbeiten** - Lieber öfter kleine Updates
4. **Links pflegen** - Alles verknüpfen was zusammengehört
5. **Changelog aktuell halten** - Jede erledigte Story dokumentieren

## Beispiel-Workflow

```
User: "Ich hatte eine Idee für automatische Meeting-Vorschläge basierend auf Kalender-Analyse"

Claude:
1. Erstellt vault/ideas/auto-meeting-suggestions.md
2. Füllt Kernidee aus
3. Fragt: "Spannend! Ein paar Fragen zur Validierung:
   - Wer würde das nutzen - du selbst oder deine Kunden?
   - Welche Kalender sollen analysiert werden?
   - Hast du sowas bei Wettbewerbern gesehen?"

User: [beantwortet Fragen]

Claude:
1. Validiert Idee
2. 🚀 10x-Check: "Das könnte ein Game-Changer sein, wenn wir nicht nur
   Meetings vorschlagen, sondern proaktiv Meeting-freie Deep-Work-Blöcke
   schützen. Das wäre der eigentliche Hebel."
3. Empfiehlt: "promoted" mit 10x-Potential markiert
4. "Soll ich direkt ein Feature-PRD daraus machen? Ich würde den
   10x-Aspekt (Deep-Work-Protection) mit reinbringen."

User: "Ja"

Claude:
1. Führt strukturiertes Interview
2. 🚀 Fragt: "Bevor ich das PRD schreibe - soll ich noch weitere
   10x-Opportunities erkunden?"
3. Erstellt vault/features/auto-meeting-suggestions.md
   - Inkl. Abschnitt "## 10x Opportunities"
4. "PRD erstellt! Soll ich User Stories ableiten?"

User: "Ja, mach mal"

Claude:
1. Analysiert PRD
2. Erstellt 4 Stories in vault/stories/backlog/
3. "Ich habe 4 Stories erstellt, priorisiert nach Abhängigkeiten.
    Die 10x-Story (Deep-Work-Protection) ist als P1 markiert.
    Willst du mit 'meetings-01-calendar-sync' anfangen?"
```

### 10x Review Beispiel

```
User: "Was wäre 10x für Particle?"

Claude:
1. Liest VISION.md, BRAND.md, ROADMAP.md, alle Features und Stories
2. Invoked game-changing-features Mindset
3. Analysiert: "Basierend auf eurer Vision 'Die Arbeit eines Lebens
   besteht aus vielen Partikeln' sehe ich 3 High-Leverage Opportunities:

   🥇 Particle Legacy View - Zeige alle Partikel eines Jahres/Lebens
      als Sternenhimmel. Emotional, einzigartig, differenzierend.

   🥈 Particle Sharing - Ein einzelnes Partikel als schönes Bild
      exportieren/teilen. Virales Potential.

   🥉 Focus Sanctuary Mode - Blocke alle Notifications systemweit
      während eines Partikels. Tiefe Integration = hoher Moat."
```

## Fehlerbehandlung

- **Kein vault/ vorhanden:** Anbieten die Struktur zu erstellen
- **Template fehlt:** Aus diesem Skill-Dokument neu erstellen
- **Datei existiert schon:** Nachfragen ob überschreiben oder neuen Namen
- **Unklare Anfrage:** Immer nachfragen, nie raten
