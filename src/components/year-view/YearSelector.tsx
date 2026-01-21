'use client';

import { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearSelectorProps {
  /** Currently displayed year */
  currentYear: number;
  /** Minimum year that can be selected */
  minYear: number;
  /** Maximum year that can be selected (defaults to current year) */
  maxYear?: number;
  /** Callback when year changes */
  onYearChange: (year: number) => void;
}

/**
 * Year Selector with Navigation
 *
 * Allows navigation between years with:
 * - Previous/Next buttons
 * - Keyboard shortcuts: ← / H (prev), → / L (next)
 *
 * Buttons are disabled at boundaries (minYear, maxYear).
 */
export function YearSelector({
  currentYear,
  minYear,
  maxYear = new Date().getFullYear(),
  onYearChange,
}: YearSelectorProps) {
  const canGoPrev = currentYear > minYear;
  const canGoNext = currentYear < maxYear;

  const handlePrev = useCallback(() => {
    if (canGoPrev) {
      onYearChange(currentYear - 1);
    }
  }, [canGoPrev, currentYear, onYearChange]);

  const handleNext = useCallback(() => {
    if (canGoNext) {
      onYearChange(currentYear + 1);
    }
  }, [canGoNext, currentYear, onYearChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Previous Year Button */}
      <button
        onClick={handlePrev}
        disabled={!canGoPrev}
        aria-label="Vorheriges Jahr"
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-border light:border-border-light bg-transparent text-secondary light:text-secondary-light transition-all duration-100 hover:bg-surface light:hover:bg-surface-light hover:border-tertiary light:hover:border-tertiary-light hover:text-primary light:hover:text-primary-light disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border disabled:hover:text-secondary"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Year Title */}
      <h1 className="text-4xl sm:text-5xl font-bold font-mono text-primary light:text-primary-light tracking-tight min-w-[120px] text-center">
        {currentYear}
      </h1>

      {/* Next Year Button */}
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        aria-label="Nächstes Jahr"
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-border light:border-border-light bg-transparent text-secondary light:text-secondary-light transition-all duration-100 hover:bg-surface light:hover:bg-surface-light hover:border-tertiary light:hover:border-tertiary-light hover:text-primary light:hover:text-primary-light disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-border disabled:hover:text-secondary"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
