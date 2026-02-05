/**
 * Year View Image Export
 *
 * Renders a 1080×dynamic PNG image of the year grid using Canvas 2D.
 * Height adapts to content. Always renders in dark mode (black bg, white dots).
 */

import type { YearViewData } from './types';
import type { YearGridData } from './grid';
import type { YearHighlight } from '@/components/year-view/YearHighlights';

export interface YearExportInput {
  yearData: YearViewData;
  gridData: YearGridData;
  weekStartsOnMonday: boolean;
  highlights?: YearHighlight[];
}

// Canvas width (height is dynamic)
const WIDTH = 1080;
const PADDING = 60;
const USABLE = WIDTH - PADDING * 2; // 960

// Grid cell dimensions
const CELL_DIAMETER = 14;
const CELL_GAP = 3;
const CELL_STEP = CELL_DIAMETER + CELL_GAP; // 17

// Colors (always dark mode)
const BG = '#000000';
const TEXT_PRIMARY = '#FAFAFA';
const TEXT_SECONDARY = '#808080';
const TEXT_MUTED = '#4A4A4A';
const SEPARATOR = '#1A1A1A';

// Weekday labels
const WEEKDAY_LABELS_MON = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const WEEKDAY_LABELS_SUN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format duration from seconds to human-readable string
 */
function formatYearDuration(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format number with locale (comma as thousand separator)
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Resolve font-family from CSS custom properties (Next.js generates hashed names)
 */
function resolveFonts(): { sans: string; mono: string } {
  if (typeof document === 'undefined') {
    return { sans: 'Inter', mono: 'JetBrains Mono' };
  }
  const style = getComputedStyle(document.documentElement);
  const sans = style.getPropertyValue('--font-inter').trim() || 'Inter';
  const mono = style.getPropertyValue('--font-mono').trim() || 'JetBrains Mono';
  return { sans, mono };
}

/**
 * Wait for fonts to be ready with a timeout fallback
 */
async function waitForFonts(timeoutMs: number = 3000): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, timeoutMs)),
    ]);
  } catch {
    // Fallback: proceed without waiting
  }
}

/**
 * Calculate the total canvas height based on content
 */
function calculateHeight(hasHighlights: boolean, highlightCount: number): number {
  let y = PADDING;           // 60  — top padding
  y += 64;                   // 124 — year title
  y += 30;                   // 154 — gap to month labels
  y += 15;                   // 169 — month labels height
  y += 8;                    // 177 — gap to grid
  y += 7 * CELL_STEP;       // 296 — grid (7 rows × 17px)
  y += 24;                   // 320 — gap to separator
  y += 1;                    // 321 — separator line
  y += 40;                   // 361 — gap to stats
  y += 28;                   // 389 — stat values
  y += 24;                   // 413 — stat labels
  if (hasHighlights) {
    y += 30;                 // gap to highlights
    y += highlightCount * 45; // each highlight
  }
  y += 36;                   // gap to branding
  y += 12;                   // branding text
  y += PADDING;              // bottom padding
  return y;
}

/**
 * Render the year export image as a Blob
 */
export async function renderYearExportImage(input: YearExportInput): Promise<Blob> {
  const { yearData, gridData, weekStartsOnMonday, highlights } = input;
  const { summary, year } = yearData;

  await waitForFonts();
  const fonts = resolveFonts();

  const hasHighlights = !!highlights && highlights.length > 0;
  const HEIGHT = calculateHeight(hasHighlights, highlights?.length ?? 0);

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // --- Year title ---
  let cursorY = PADDING + 32; // center of 64px text
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `bold 64px ${fonts.mono}, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(year), WIDTH / 2, cursorY);
  cursorY += 32 + 30; // bottom half of title + gap

  // --- Month labels ---
  const weekdayLabelWidth = 28;
  const gridPixelWidth = gridData.totalWeeks * CELL_STEP - CELL_GAP;
  const totalRowWidth = weekdayLabelWidth + gridPixelWidth;
  const gridStartX = PADDING + (USABLE - totalRowWidth) / 2 + weekdayLabelWidth;

  const monthLabelsY = cursorY + 7;
  ctx.font = `11px ${fonts.sans}, sans-serif`;
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  for (const label of gridData.monthLabels) {
    const x = gridStartX + label.weekIndex * CELL_STEP;
    ctx.fillText(label.name, x, monthLabelsY);
  }
  cursorY = monthLabelsY + 15 + 8; // label height + gap

  // --- Weekday labels ---
  const gridStartY = cursorY;
  const weekdayLabels = weekStartsOnMonday ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN;
  ctx.font = `10px ${fonts.sans}, sans-serif`;
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const weekdayLabelX = gridStartX - 8;
  for (let row = 0; row < 7; row++) {
    const y = gridStartY + row * CELL_STEP + CELL_DIAMETER / 2;
    ctx.fillText(weekdayLabels[row], weekdayLabelX, y);
  }

  // --- Grid dots ---
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (let weekIndex = 0; weekIndex < gridData.totalWeeks; weekIndex++) {
      const cell = gridData.grid[dayIndex][weekIndex];
      if (!cell) continue;

      const cx = gridStartX + weekIndex * CELL_STEP + CELL_DIAMETER / 2;
      const cy = gridStartY + dayIndex * CELL_STEP + CELL_DIAMETER / 2;

      let brightness = cell.brightness;
      if (cell.isFuture) brightness *= 0.3;

      // Peak day glow
      if (cell.isPeakDay && brightness > 0.08) {
        ctx.save();
        ctx.shadowColor = `rgba(255, 255, 255, ${brightness * 0.6})`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, CELL_DIAMETER / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, CELL_DIAMETER / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.fill();
      }
    }
  }

  cursorY = gridStartY + 7 * CELL_STEP + 24;

  // --- Separator line ---
  ctx.strokeStyle = SEPARATOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, cursorY);
  ctx.lineTo(WIDTH - PADDING, cursorY);
  ctx.stroke();
  cursorY += 1 + 40; // line + gap

  // --- Summary stats ---
  const statsY = cursorY;

  const avgFormatted = summary.activeDays > 0
    ? summary.averagePerActiveDay.toFixed(1)
    : '0';

  const stats = [
    { value: formatNumber(summary.totalParticles), label: 'PARTICLES' },
    { value: avgFormatted, label: 'PER DAY' },
    { value: formatYearDuration(summary.totalDuration), label: 'FOCUS' },
    { value: `${summary.longestStreak}`, label: 'STREAK' },
    { value: formatNumber(summary.activeDays), label: 'DAYS' },
  ];

  const statSpacing = USABLE / stats.length;
  ctx.textAlign = 'center';

  for (let i = 0; i < stats.length; i++) {
    const x = PADDING + statSpacing * i + statSpacing / 2;

    // Value
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.font = `bold 28px ${fonts.mono}, monospace`;
    ctx.textBaseline = 'middle';
    ctx.fillText(stats[i].value, x, statsY);

    // Label
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.font = `10px ${fonts.sans}, sans-serif`;
    ctx.fillText(stats[i].label, x, statsY + 24);
  }

  cursorY = statsY + 24 + 14; // label baseline + label height

  // --- Highlights ---
  if (hasHighlights && highlights) {
    cursorY += 30;
    ctx.textAlign = 'center';

    for (const highlight of highlights) {
      // Label
      ctx.fillStyle = TEXT_SECONDARY;
      ctx.font = `13px ${fonts.sans}, sans-serif`;
      ctx.fillText(highlight.label, WIDTH / 2, cursorY);

      // Value (truncate long project names)
      let value = highlight.value;
      if (value.length > 40) {
        value = value.slice(0, 37) + '...';
      }
      ctx.fillStyle = TEXT_PRIMARY;
      ctx.font = `14px ${fonts.sans}, sans-serif`;
      ctx.fillText(value, WIDTH / 2, cursorY + 20);

      cursorY += 45;
    }
  }

  // --- Branding ---
  cursorY += 36;
  ctx.fillStyle = TEXT_MUTED;
  ctx.font = `12px ${fonts.sans}, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('particle \u00B7 Where focus becomes visible.', WIDTH / 2, cursorY);

  // Convert to blob
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      },
      'image/png',
    );
  });
}
