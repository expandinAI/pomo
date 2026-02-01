# Coach: Nächste Schritte

**Erstellt:** 2024-02-01
**Kontext:** Nach Fertigstellung von POMO-321 (Coach View UI)

---

## Ideen für Coach-Erweiterungen

### 1. Insight Generation (Backend)
- Pattern-Erkennung (beste Tageszeit, Streak-Tage, Projekt-Fokus)
- Anomalie-Erkennung ("127% mehr als üblich für einen Freitag")
- Weekly Summary (automatischer Sonntag-Insight)
- Speicherung in DB + API-Route
- useCoach Hook an echte Daten anbinden

### 2. Chat Integration
- Echte AI-Konversation via Anthropic API
- Context: User's Sessions, Projekte, Patterns
- Quota-Verbrauch pro Message
- Message-History persistieren

### 3. hasInsight Pulse
- CoachParticle pulsiert wenn neuer Insight wartet
- "Unread" State für Insights
- Subtle Animation wie MacBook Sleep-Indicator

### 4. Insight History
- Vergangene Insights durchblättern
- Archiv nach Datum/Typ filtern
- "Bookmarked" Insights

---

## Priorisierung

| Prio | Feature | Begründung |
|------|---------|------------|
| 1 | Insight Generation | Kern-Wert, zeigt Mehrwert ohne User-Interaktion |
| 2 | hasInsight Pulse | Macht Insights sichtbar, zieht User in den Coach |
| 3 | Chat Integration | Interaktiver Mehrwert, aber höherer Aufwand |
| 4 | Insight History | Nice-to-have, erst relevant bei vielen Insights |

---

## Abhängigkeiten

- Insight Generation braucht: Session-Daten aus DB, AI-Prompt-Design
- Chat braucht: Anthropic API Key, Quota-System (bereits vorhanden)
- hasInsight braucht: Insight-State im Backend, Polling/Realtime
