/**
 * Year View Module
 *
 * Data aggregation for the 365-day year view visualization.
 *
 * @example
 * ```typescript
 * import { getYearViewData } from '@/lib/year-view';
 *
 * const data = await getYearViewData(2026);
 * console.log(data.summary.totalParticles);
 * console.log(data.days.filter(d => d.isPeakDay));
 * ```
 */

// Types
export type {
  YearViewDay,
  YearViewSummary,
  YearViewData,
  DayAggregation,
} from './types';

// Grid types
export type {
  GridCell,
  MonthLabel,
  YearGridData,
} from './grid';

// Main API
export { getYearViewData, hasDataForYear } from './data';

// Grid API
export { generateYearGrid, getDayOfWeekIndex, getWeekOfYear } from './grid';

// Brightness API
export { calculateBrightness } from './brightness';

// Utilities (exported for testing and advanced use cases)
export {
  isLeapYear,
  getDaysInYear,
  formatDateKey,
  filterWorkSessionsForYear,
  groupSessionsByDay,
  findTopTask,
  generateAllDaysOfYear,
  findPeakDay,
  calculateYearStreak,
  calculateSummary,
} from './aggregation';
