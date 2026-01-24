'use client';

import { motion } from 'framer-motion';

interface TimelineMarkersProps {
  /** Timeline starts at this hour (default: 0) */
  startHour?: number;
  /** Timeline ends at this hour (default: 24) */
  endHour?: number;
}

/**
 * TimelineMarkers
 *
 * Renders time markers (12am, 6am, 12pm, 6pm, etc.) along the timeline.
 * Markers appear at 6-hour intervals for a full 24h day.
 */
export function TimelineMarkers({
  startHour = 0,
  endHour = 24,
}: TimelineMarkersProps) {
  const totalHours = endHour - startHour;

  // Generate markers at 6-hour intervals
  const markers: { hour: number; label: string; position: number }[] = [];

  for (let hour = startHour; hour <= endHour; hour += 6) {
    const position = ((hour - startHour) / totalHours) * 100;
    const label = hour === 0 || hour === 24
      ? '12am'
      : hour === 12
        ? '12pm'
        : hour < 12
          ? `${hour}am`
          : `${hour - 12}pm`;

    markers.push({ hour, label, position });
  }

  return (
    <div className="absolute inset-x-0 top-0 h-full pointer-events-none">
      {markers.map((marker, index) => {
        // First marker: align label to the right of the line
        // Last marker: align label to the left of the line
        // Middle markers: center the label
        const isFirst = marker.position === 0;
        const isLast = marker.position === 100;
        const labelClass = isFirst
          ? 'left-0'
          : isLast
            ? 'right-0'
            : '-translate-x-1/2';

        return (
          <motion.div
            key={marker.hour}
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: `${marker.position}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Vertical line */}
            <div className="w-px h-full bg-tertiary/20 light:bg-tertiary-dark/20" />

            {/* Time label */}
            <span className={`absolute -bottom-6 text-xs text-tertiary light:text-tertiary-dark ${labelClass}`}>
              {marker.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
