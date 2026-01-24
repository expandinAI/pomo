'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SPRING, SESSION_LABELS } from '@/styles/design-tokens';
import type { TimelineSession } from '@/hooks/useTimelineData';
import { formatDuration, formatTime24h } from '@/lib/session-storage';

interface TimelineBlockProps {
  session: TimelineSession;
  left: number;
  width: number;
  onClick?: () => void;
  /** Position hint for tooltip alignment (0-100) */
  positionPercent: number;
}

/**
 * TimelineBlock
 *
 * Represents a single session block on the timeline.
 * Work blocks are taller and clickable, breaks are shorter.
 */
export function TimelineBlock({
  session,
  left,
  width,
  onClick,
  positionPercent,
}: TimelineBlockProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isWork = session.type === 'work';
  const height = isWork ? 48 : 24;

  // Work blocks use project brightness, breaks use fixed low opacity
  const opacity = isWork ? session.brightness : 0.3;

  // Smart tooltip positioning based on block position
  // Left edge: align tooltip left, Right edge: align tooltip right, Center: center it
  const isNearLeft = positionPercent < 15;
  const isNearRight = positionPercent > 85;

  const tooltipPositionClass = isNearLeft
    ? 'left-0'
    : isNearRight
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  const arrowPositionClass = isNearLeft
    ? 'left-4'
    : isNearRight
      ? 'right-4'
      : 'left-1/2 -translate-x-1/2';

  // Format time range
  const startTime = formatTime24h(session.startTime.toISOString());
  const endTime = formatTime24h(session.endTime.toISOString());

  return (
    <motion.div
      className="absolute bottom-0"
      style={{
        left: `${left}%`,
        width: `${Math.max(width, 0.5)}%`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isWork ? onClick : undefined}
    >
      {/* Hover Info Panel */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.1 }}
          className={`absolute bottom-full mb-3 z-50 ${tooltipPositionClass}`}
        >
          <div className="bg-surface light:bg-surface-dark rounded-xl px-4 py-3 shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 whitespace-nowrap">
            {isWork ? (
              <>
                {/* Project with brightness indicator */}
                {session.projectName && (
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: `rgba(255, 255, 255, ${session.brightness})` }}
                    />
                    <p className="text-sm font-medium text-primary light:text-primary-dark">
                      {session.projectName}
                    </p>
                  </div>
                )}

                {/* Task description */}
                {session.task && (
                  <p className="text-sm text-secondary light:text-secondary-dark max-w-[240px] truncate mb-2">
                    {session.task}
                  </p>
                )}
              </>
            ) : (
              /* Break type label */
              <p className="text-sm font-medium text-primary light:text-primary-dark mb-2">
                {SESSION_LABELS[session.type]}
              </p>
            )}

            {/* Time and duration info */}
            <div className="flex items-center gap-3 text-xs text-tertiary light:text-tertiary-dark">
              <span className="tabular-nums">{startTime} – {endTime}</span>
              <span className="opacity-50">·</span>
              <span>{formatDuration(session.duration)}</span>
            </div>
          </div>

          {/* Arrow pointing down */}
          <div className={`absolute top-full ${arrowPositionClass}`}>
            <div className="w-2.5 h-2.5 bg-surface light:bg-surface-dark border-r border-b border-tertiary/10 light:border-tertiary-dark/10 rotate-45 -translate-y-1.5" />
          </div>
        </motion.div>
      )}

      {/* Block */}
      <motion.div
        className="w-full rounded-sm"
        style={{
          height: `${height}px`,
          backgroundColor: `rgba(255, 255, 255, ${opacity})`,
          cursor: isWork ? 'pointer' : 'default',
        }}
        initial={false}
        animate={{
          scaleY: isHovered && isWork ? 1.5 : 1,
          opacity: isHovered && isWork ? 1 : opacity,
        }}
        transition={{ type: 'spring', ...SPRING.snappy }}
        whileHover={isWork ? { opacity: 1 } : undefined}
      />
    </motion.div>
  );
}
