# AI Coach - Next Features

Gesammelt nach Implementierung von POMO-322 (Chat Interface).

---

## 1. Insight Generation

**Beschreibung:** InsightCard mit echten AI-generierten Insights statt Mock-Daten. Coach analysiert beim Öffnen automatisch den Tag/die Woche.

**Aufwand:** Mittel

**Warum:** Damit fühlt sich der Coach "lebendig" an, sobald man ihn öffnet. Ohne automatische Insights muss der User immer aktiv fragen.

---

## 2. Session Celebration

**Beschreibung:** Nach jedem Particle ein kurzer Coach-Kommentar ("Nice 45-min session on API Refactor"). Subtle, nicht aufdringlich.

**Aufwand:** Klein

**Warum:** Emotionale Verbindung zum Coach aufbauen, ohne dass User aktiv den Coach öffnen muss.

---

## 3. Chat Persistence

**Beschreibung:** Chat-History in IndexedDB speichern, damit Gespräche nicht bei Refresh verloren gehen.

**Aufwand:** Klein

**Warum:** Bessere UX, User kann frühere Gespräche nachlesen.

---

## 4. Proactive Patterns

**Beschreibung:** Coach erkennt Muster und zeigt von sich aus Insights ("Du bist heute 2h früher dran als sonst").

**Aufwand:** Groß

**Warum:** Der Coach wird zum echten Begleiter, nicht nur zum Tool das man fragt.

---

## Priorisierung

1. **Insight Generation** (höchste Priorität)
2. Session Celebration
3. Chat Persistence
4. Proactive Patterns
