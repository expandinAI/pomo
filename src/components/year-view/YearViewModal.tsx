'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useWeekStart } from '@/hooks/useWeekStart';
import { prefersReducedMotion } from '@/lib/utils';
import { getYearViewData } from '@/lib/year-view';
import { generateMockYearData } from '@/lib/year-view/mock-data';
import type { YearViewData } from '@/lib/year-view';
import type { GridCell } from '@/lib/year-view/grid';
import { YearGrid, YearTooltip, YearSummary, YearSelector } from './index';
import { ProjectFilterDropdown } from '@/components/insights/ProjectFilterDropdown';
import { useProjects } from '@/hooks/useProjects';

// Available years for navigation
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2023;

/**
 * Year View Modal
 *
 * Accessible via G Y keyboard shortcut.
 * Shows the 365-day year grid with all particles.
 * Includes a toggle to switch between real data and demo data.
 */
export function YearViewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(CURRENT_YEAR);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [hoveredCell, setHoveredCell] = useState<GridCell | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [gridAnimationComplete, setGridAnimationComplete] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const [realData, setRealData] = useState<YearViewData | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { weekStartsOnMonday } = useWeekStart();
  const { activeProjects } = useProjects();
  const reducedMotion = prefersReducedMotion();

  // Focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(modalRef, isOpen, { initialFocusRef: closeButtonRef });

  // Load real data when modal opens, year changes, or project filter changes
  useEffect(() => {
    if (isOpen && !useMockData) {
      getYearViewData(currentYear, selectedProjectId).then(setRealData);
    }
  }, [isOpen, currentYear, useMockData, selectedProjectId]);

  // Get data based on toggle
  const data: YearViewData = useMemo(() => {
    if (useMockData) {
      return generateMockYearData(currentYear);
    }
    return realData ?? {
      year: currentYear,
      days: [],
      summary: {
        totalParticles: 0,
        totalDuration: 0,
        longestStreak: 0,
        activeDays: 0,
        averagePerActiveDay: 0,
      },
      personalMax: 0,
      peakDate: new Date(),
    };
  }, [useMockData, currentYear, realData]);

  // Find the day data for the hovered cell
  const hoveredDayData = useMemo(() => {
    if (!hoveredCell) return null;
    return data.days.find(d =>
      d.date.getFullYear() === hoveredCell.date.getFullYear() &&
      d.date.getMonth() === hoveredCell.date.getMonth() &&
      d.date.getDate() === hoveredCell.date.getDate()
    ) ?? null;
  }, [hoveredCell, data.days]);

  // Handle cell hover with rect for tooltip positioning
  const handleCellHover = useCallback((cell: GridCell | null, rect: DOMRect | null) => {
    setHoveredCell(cell);
    setHoveredRect(rect);
  }, []);

  // Handle year change with direction for animation
  const handleYearChange = useCallback((newYear: number) => {
    setDirection(newYear > currentYear ? 'left' : 'right');
    setHoveredCell(null);
    setGridAnimationComplete(false);
    setCurrentYear(newYear);
  }, [currentYear]);

  // Handle grid animation completion
  const handleGridAnimationComplete = useCallback(() => {
    setGridAnimationComplete(true);
  }, []);

  // Close modal
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setHoveredCell(null);
    setSelectedProjectId(null); // Reset filter on close
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Listen for external open event (G Y navigation)
  useEffect(() => {
    function handleOpenYear() {
      setIsOpen(true);
      // Reset to current year when opening
      setCurrentYear(CURRENT_YEAR);
      setGridAnimationComplete(false);
    }

    window.addEventListener('particle:open-year', handleOpenYear);
    return () => window.removeEventListener('particle:open-year', handleOpenYear);
  }, []);

  // Animation variants for slide effect
  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({
      x: dir === 'left' ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'left' | 'right') => ({
      x: dir === 'left' ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Backdrop + Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' as const }}
            exit={{ opacity: 0, pointerEvents: 'none' as const }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
            onClick={handleClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { scale: 0.95, y: 20 }}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.gentle }}
              className="w-[95vw] max-w-4xl max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="year-view-modal-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden flex flex-col max-h-full"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-tertiary/10 light:border-tertiary-dark/10 flex-shrink-0">
                  <h2
                    id="year-view-modal-title"
                    className="text-base font-semibold text-primary light:text-primary-dark"
                  >
                    Year View
                  </h2>
                  <div className="flex items-center gap-3">
                    {/* Project Filter - only show if projects exist */}
                    {activeProjects.length > 0 && (
                      <ProjectFilterDropdown
                        value={selectedProjectId}
                        onChange={setSelectedProjectId}
                        projects={activeProjects}
                      />
                    )}
                    {/* Data Toggle */}
                    <button
                      onClick={() => setUseMockData(!useMockData)}
                      className="text-xs text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark px-2 py-1 rounded transition-colors"
                      aria-label={useMockData ? 'Switch to real data' : 'Switch to demo data'}
                    >
                      {useMockData ? 'Demo' : 'Real'}
                    </button>
                    <button
                      ref={closeButtonRef}
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label="Close year view"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Year Selector */}
                  <div className="text-center mb-6">
                    <YearSelector
                      currentYear={currentYear}
                      minYear={MIN_YEAR}
                      maxYear={CURRENT_YEAR}
                      onYearChange={handleYearChange}
                    />
                    <p className="text-tertiary light:text-tertiary-dark text-xs mt-2">
                      Use ← → or H / L to navigate years
                    </p>
                  </div>

                  {/* Animated Year Content */}
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentYear}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      {/* Year Grid */}
                      <div className="bg-surface/50 light:bg-surface-dark/50 rounded-xl p-6 mb-4">
                        <YearGrid
                          data={data}
                          weekStartsOnMonday={weekStartsOnMonday}
                          onCellHover={handleCellHover}
                          onCellClick={(cell) => console.log('Clicked:', cell)}
                          onAnimationComplete={handleGridAnimationComplete}
                        />
                      </div>

                      {/* Year Summary Stats - fades in after grid animation */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={gridAnimationComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <YearSummary summary={data.summary} />
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Tooltip (outside AnimatePresence to avoid flickering) */}
          <YearTooltip
            cell={hoveredCell}
            dayData={hoveredDayData}
            anchorRect={hoveredRect}
          />
        </>
      )}
    </AnimatePresence>
  );
}
