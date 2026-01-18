'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-tertiary/10 dark:bg-tertiary-dark/10 skeleton-shimmer',
        className
      )}
      aria-hidden="true"
    />
  );
}

interface TimerSkeletonProps {
  className?: string;
}

export function TimerSkeleton({ className }: TimerSkeletonProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-8 w-full max-w-lg mx-auto', className)}>
      {/* Session type selector skeleton */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-surface dark:bg-surface-dark shadow-soft">
        <Skeleton className="w-20 h-9 rounded-md" />
        <Skeleton className="w-24 h-9 rounded-md" />
        <Skeleton className="w-24 h-9 rounded-md" />
      </div>

      {/* Timer display skeleton */}
      <div className="relative flex items-center justify-center">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full flex items-center justify-center bg-surface dark:bg-surface-dark shadow-large">
          <Skeleton className="w-48 h-16 sm:w-56 sm:h-20 lg:w-64 lg:h-24 rounded-lg" />
        </div>
      </div>

      {/* Controls skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="w-[120px] h-12 rounded-lg" />
        <div className="w-12 h-12" />
      </div>

      {/* Session counter skeleton */}
      <Skeleton className="w-24 h-5 rounded-full" />
    </div>
  );
}
