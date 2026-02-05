'use client';

import { cn } from '@/lib/utils';
import { getParticleClasses } from '@/lib/intentions/utils';
import type { IntentionAlignment, IntentionStatus } from '@/lib/db/types';
import type { DBIntention } from '@/lib/db/types';

interface DayIntentionData {
  date: string;
  dayLabel: string;
  isToday: boolean;
  intention: DBIntention | null;
  particles: Array<{ id: string; alignment?: IntentionAlignment }>;
  alignedCount: number;
  reactiveCount: number;
  alignmentPercentage: number | null;
}

interface WeekIntentionRowProps {
  day: DayIntentionData;
  isSelected: boolean;
  onSelect: () => void;
}

const MAX_DOTS = 8;

function getStatusIcon(status: IntentionStatus | undefined, isToday: boolean): string {
  if (!status) return '—';
  switch (status) {
    case 'completed':
      return '✓';
    case 'partial':
      return '◐';
    case 'deferred':
      return '→';
    case 'active':
      return isToday ? '·' : '—';
    case 'skipped':
      return '—';
    default:
      return '—';
  }
}

function getStatusColor(status: IntentionStatus | undefined, isToday: boolean): string {
  if (!status) return 'text-tertiary light:text-tertiary-dark';
  switch (status) {
    case 'completed':
      return 'text-primary light:text-primary-dark';
    case 'partial':
      return 'text-secondary light:text-secondary-dark';
    case 'deferred':
      return 'text-tertiary light:text-tertiary-dark';
    case 'active':
      return isToday
        ? 'text-primary light:text-primary-dark'
        : 'text-tertiary light:text-tertiary-dark';
    default:
      return 'text-tertiary light:text-tertiary-dark';
  }
}

export function WeekIntentionRow({ day, isSelected, onSelect }: WeekIntentionRowProps) {
  const { dayLabel, isToday, intention, particles, alignmentPercentage } = day;
  const particleCount = particles.length;
  const showCount = particleCount > MAX_DOTS;
  const dotsToShow = showCount ? MAX_DOTS : particleCount;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
        'text-left',
        isSelected
          ? 'bg-tertiary/10 light:bg-tertiary-dark/10'
          : 'hover:bg-tertiary/5 light:hover:bg-tertiary-dark/5',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
      )}
    >
      {/* Day label */}
      <span
        className={cn(
          'w-10 text-xs font-mono shrink-0',
          isToday
            ? 'text-primary light:text-primary-dark font-semibold'
            : 'text-tertiary light:text-tertiary-dark'
        )}
      >
        {dayLabel}
      </span>

      {/* Intention text */}
      <span
        className={cn(
          'flex-1 text-sm truncate min-w-0',
          intention
            ? 'text-secondary light:text-secondary-dark'
            : 'text-tertiary/50 light:text-tertiary-dark/50'
        )}
      >
        {intention ? intention.text : '—'}
      </span>

      {/* Particle dots */}
      <span className="w-24 flex items-center gap-0.5 shrink-0 justify-end">
        {particleCount === 0 ? (
          <span className="text-xs text-tertiary/30 light:text-tertiary-dark/30">—</span>
        ) : (
          <>
            {particles.slice(0, dotsToShow).map((p) => (
              <span
                key={p.id}
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  getParticleClasses(p.alignment)
                )}
              />
            ))}
            {showCount && (
              <span className="text-[10px] text-tertiary light:text-tertiary-dark ml-0.5">
                +{particleCount - MAX_DOTS}
              </span>
            )}
          </>
        )}
      </span>

      {/* Alignment percentage */}
      <span
        className={cn(
          'w-10 text-right text-xs shrink-0 font-mono',
          alignmentPercentage !== null
            ? 'text-secondary light:text-secondary-dark'
            : 'text-tertiary/30 light:text-tertiary-dark/30'
        )}
      >
        {alignmentPercentage !== null ? `${alignmentPercentage}%` : '—'}
      </span>

      {/* Status icon */}
      <span
        className={cn(
          'w-5 text-center text-xs shrink-0',
          getStatusColor(intention?.status, isToday)
        )}
      >
        {getStatusIcon(intention?.status, isToday)}
      </span>
    </button>
  );
}
