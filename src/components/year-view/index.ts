/**
 * Year View Components
 *
 * Components for the 365-day year view visualization.
 *
 * @example
 * ```tsx
 * import { YearGrid, YearTooltip } from '@/components/year-view';
 * import { getYearViewData } from '@/lib/year-view';
 *
 * const data = await getYearViewData(2026);
 * <YearGrid data={data} onCellHover={setHoveredCell} />
 * <YearTooltip cell={hoveredCell} dayData={...} anchorRect={...} />
 * ```
 */

export { YearGrid } from './YearGrid';
export { YearGridCell } from './YearGridCell';
export { YearTooltip } from './YearTooltip';
export { YearSummary } from './YearSummary';
export { YearSelector } from './YearSelector';
export { ParticleDots } from './ParticleDots';
export { YearViewModal } from './YearViewModal';
export { YearHighlights } from './YearHighlights';
