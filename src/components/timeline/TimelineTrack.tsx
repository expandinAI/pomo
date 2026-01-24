'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TimelineMarkers } from './TimelineMarkers';
import { TimelineBlock } from './TimelineBlock';
import { TimelineNowMarker } from './TimelineNowMarker';
import type { TimelineSession } from '@/hooks/useTimelineData';

interface TimelineTrackProps {
  sessions: TimelineSession[];
  onBlockClick?: (sessionId: string) => void;
  /** Whether we're viewing today's timeline */
  isToday?: boolean;
}

// Timeline configuration - full 24h day
const TIMELINE_START = 0;   // Midnight
const TIMELINE_END = 24;    // Midnight
const TOTAL_HOURS = 24;

/**
 * Calculate horizontal position (%) for a given time
 */
function getPosition(time: Date): number {
  const hours = time.getHours() + time.getMinutes() / 60;
  const offset = hours - TIMELINE_START;
  return Math.max(0, Math.min(100, (offset / TOTAL_HOURS) * 100));
}

/**
 * Calculate width (%) for a given duration
 */
function getWidth(durationSeconds: number): number {
  const hours = durationSeconds / 3600;
  return Math.max(0.5, (hours / TOTAL_HOURS) * 100); // Min 0.5%
}

/**
 * TimelineTrack
 *
 * The main horizontal timeline track with markers and session blocks.
 * Sessions are positioned based on their start time and duration.
 */
export function TimelineTrack({ sessions, onBlockClick, isToday = false }: TimelineTrackProps) {
  // Hover glow state
  const [glowPosition, setGlowPosition] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringEmpty, setIsHoveringEmpty] = useState(false);

  // Calculate current time position for "now" marker
  const nowPosition = isToday ? getPosition(new Date()) : -1;

  // Check if mouse is over a session block
  const isPositionOverSession = useCallback((xPercent: number): boolean => {
    return sessions.some(session => {
      const left = getPosition(session.startTime);
      const width = getWidth(session.duration);
      return xPercent >= left && xPercent <= left + width;
    });
  }, [sessions]);

  // Handle mouse move for hover glow
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;

    if (!isPositionOverSession(xPercent)) {
      setGlowPosition({ x, y });
      setIsHoveringEmpty(true);
    } else {
      setIsHoveringEmpty(false);
    }
  }, [isPositionOverSession]);

  const handleMouseLeave = useCallback(() => {
    setGlowPosition(null);
    setIsHoveringEmpty(false);
  }, []);

  return (
    <div className="relative w-full overflow-visible">
      {/* Track container with markers and blocks - overflow visible for tooltips */}
      <div
        className="relative h-24 mb-8 overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Hover glow effect for empty areas */}
        {isHoveringEmpty && glowPosition && (
          <div
            className="absolute pointer-events-none z-0 transition-opacity duration-150"
            style={{
              left: glowPosition.x - 60,
              top: glowPosition.y - 60,
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Background track line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-tertiary/30 light:bg-tertiary-dark/30" />

        {/* Time markers */}
        <TimelineMarkers startHour={TIMELINE_START} endHour={TIMELINE_END} />

        {/* Now marker - only shown for today */}
        {isToday && nowPosition >= 0 && nowPosition <= 100 && (
          <div className="absolute inset-0 overflow-visible">
            <TimelineNowMarker position={nowPosition} />
          </div>
        )}

        {/* Session blocks - no clipPath to allow tooltip overflow */}
        <div className="absolute inset-0 overflow-visible">
          {sessions.map((session, index) => {
            const left = getPosition(session.startTime);
            const width = getWidth(session.duration);
            // Calculate center position for tooltip alignment
            const centerPosition = left + width / 2;

            // Handle sessions outside visible range
            if (left < 0 || left >= 100) return null;

            return (
              <TimelineBlock
                key={session.id}
                session={session}
                left={left}
                width={width}
                positionPercent={centerPosition}
                onClick={() => onBlockClick?.(session.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
