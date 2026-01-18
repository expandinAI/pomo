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
3. Empfehlung geben: promoted | rejected | needs-more-info
4. Idee updaten mit Ergebnis

**Output:** Strukturierte Analyse mit Empfehlung.

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
3. Template laden: `view vault/_templates/feature.md`
4. PRD erstellen: `vault/features/{slug}.md`
5. Idee-Status auf `promoted` setzen, Link zum Feature eintragen

**Output:** Vollständiges PRD, Frage nach Review/Anpassungen.

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
1. Validiert Idee → empfiehlt "promoted"
2. "Soll ich direkt ein Feature-PRD daraus machen?"

User: "Ja"

Claude:
1. Führt strukturiertes Interview
2. Erstellt vault/features/auto-meeting-suggestions.md
3. "PRD erstellt! Soll ich User Stories ableiten?"

User: "Ja, mach mal"

Claude:
1. Analysiert PRD
2. Erstellt 4 Stories in vault/stories/backlog/
3. "Ich habe 4 Stories erstellt, priorisiert nach Abhängigkeiten.
    Willst du mit 'meetings-01-calendar-sync' anfangen?"
```

## Fehlerbehandlung

- **Kein vault/ vorhanden:** Anbieten die Struktur zu erstellen
- **Template fehlt:** Aus diesem Skill-Dokument neu erstellen
- **Datei existiert schon:** Nachfragen ob überschreiben oder neuen Namen
- **Unklare Anfrage:** Immer nachfragen, nie raten
