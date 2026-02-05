---
type: story
status: done
priority: p1
effort: 5
feature: particle-legacy
created: 2026-02-05
updated: 2026-02-05
done_date: 2026-02-05
tags: [legacy, year-view, export, sharing, growth]
---

# POMO-372: Year View Image Export

## User Story

> As a **Particle user proud of my year**,
> I want **to export my Year View as a beautiful image**,
> so that **I can share it on social media or save it as a personal keepsake**.

## Context

Die Year View (`G Y`) ist das visuell beeindruckendste Feature von Particle. Aber sie ist nicht teilbar. Bestehende Export-Infrastruktur:

- `src/lib/share/generate-image.ts` — Canvas-basierte Bildgenerierung (Basis vorhanden)
- `src/components/insights/ExportButton.tsx` — CSV-Export (anderer Use Case)
- Year View Grid wird aktuell mit CSS/Framer Motion gerendert (nicht Canvas)

### Warum wichtig

Jeder geteilte Year View Post = kostenlose Werbung. GitHub Contribution Graphs werden tausendfach geteilt. Particle's Year View ist schoener und persoenlicher.

## Acceptance Criteria

### Share-Button

- [ ] "Share" Button in der Year View (neben Year Selector oder im Footer)
- [ ] Button-Style: Subtil, `text-tertiary hover:text-secondary`, kein dominanter CTA
- [ ] Icon: Upload/Share Icon (Lucide `Share2` oder `Download`)

### Bild-Generierung

- [ ] Canvas 2D rendert das Year Grid als Bild
- [ ] Schwarzer Hintergrund (#000000)
- [ ] Grid-Punkte mit korrekter Brightness (identisch zur UI)
- [ ] Monats-Labels ueber dem Grid
- [ ] Summary Stats unter dem Grid (Particles, Focus Time, Streak, Active Days)
- [ ] Highlights (aus POMO-371) falls vorhanden

### Branding

- [ ] Oben: Jahr (`"2026"`) in grosser Schrift
- [ ] Unten: `"particle"` Schriftzug + `"Where focus becomes visible."` Tagline
- [ ] Dezent, nicht aufdringlich — das Grid ist der Star

### Formate

- [ ] **1:1** (1080x1080) — Instagram, LinkedIn, Twitter
- [ ] **16:9** (1920x1080) — Desktop Wallpaper (optional, spaeter)
- [ ] Download als PNG

### Ablauf

```
User klickt "Share" in Year View
  -> Canvas rendert Bild (im Hintergrund)
  -> Preview Modal zeigt Vorschau
  -> "Download" Button speichert als PNG
  -> (Optional: Web Share API falls verfuegbar)
```

## Technical Details

### Neue Dateien

```
src/lib/year-view/export-image.ts    # Canvas-Rendering-Logik
src/components/year-view/YearExportButton.tsx   # UI Button
src/components/year-view/YearExportPreview.tsx   # Preview Modal
```

### Canvas-Rendering

```typescript
interface YearExportOptions {
  yearData: YearViewData;
  format: '1:1' | '16:9';
  highlights?: YearHighlightsData;
}

async function renderYearImage(options: YearExportOptions): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // 1:1 = 1080x1080
  canvas.width = 1080;
  canvas.height = 1080;

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Year Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px system-ui';
  ctx.fillText(String(options.yearData.year), padding, titleY);

  // Grid: 53 columns × 7 rows
  // Cell size calculated to fit within canvas
  for (const day of options.yearData.days) {
    const brightness = calculateBrightness(day.particleCount, options.yearData.personalMax);
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.fillRect(x, y, cellSize, cellSize);
  }

  // Summary Stats
  // ...

  // Branding
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '14px system-ui';
  ctx.fillText('particle · Where focus becomes visible.', x, bottomY);

  return new Promise(resolve => canvas.toBlob(resolve!, 'image/png'));
}
```

### Download-Trigger

```typescript
function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // "particle-2026.png"
  a.click();
  URL.revokeObjectURL(url);
}
```

### Web Share API (Optional)

```typescript
if (navigator.canShare?.({ files: [file] })) {
  await navigator.share({ files: [file], title: 'My Year in Particles' });
}
```

## Edge Cases

- Leeres Jahr (0 Partikel): Share-Button deaktiviert oder ausgeblendet
- Sehr wenig Daten (< 1 Woche): Bild sieht "leer" aus — ist okay, zeigt den Anfang
- Browser ohne Canvas-Support: Graceful Fallback (Button ausblenden)
- Grosse Dateien: PNG optimieren, max ~500KB fuer Social Media

## Dependencies

- POMO-371 (Year View Highlights) — Optional, aber Highlights im Export waeren schoener

## Testing

- [ ] Export generiert korrektes PNG
- [ ] Grid-Brightness identisch zur UI-Darstellung
- [ ] Branding dezent und lesbar
- [ ] Download funktioniert in Chrome, Safari, Firefox
- [ ] 1:1 Format passt fuer Instagram/Twitter
- [ ] Leeres Jahr: Button disabled/hidden
- [ ] Performance: Rendering < 500ms

## Definition of Done

- [ ] Share/Download Button in Year View
- [ ] Canvas-Rendering mit Grid + Stats + Branding
- [ ] PNG-Download funktioniert
- [ ] Typecheck + Lint bestanden
