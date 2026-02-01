/**
 * Type definitions for Insight Generation
 *
 * Separated from the generator to allow client-side imports without
 * bundling server-only dependencies (openrouter).
 */

/**
 * Types of insights that can be generated
 */
export type InsightType = 'daily' | 'weekly' | 'pattern' | 'session';

/**
 * Structure of a generated insight
 */
export interface GeneratedInsight {
  /** Type of insight */
  type: InsightType;
  /** Short title (3-5 words) */
  title: string;
  /** Main insight content (2-4 sentences) */
  content: string;
  /** Optional bullet point highlights */
  highlights?: string[];
}
