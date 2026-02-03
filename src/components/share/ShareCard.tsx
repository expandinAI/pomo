'use client';

import { forwardRef } from 'react';
import type { ParticleOfWeek } from '@/lib/coach/particle-of-week';

interface ShareCardProps {
  potw: ParticleOfWeek;
}

/**
 * Visual card designed for image export.
 * Fixed dimensions, no Tailwind (inline styles for html2canvas).
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ potw }, ref) {
    const duration = Math.round(potw.session.duration / 60);
    const date = new Date(potw.session.completedAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return (
      <div
        ref={ref}
        style={{
          width: 480,
          height: 320,
          backgroundColor: '#000000',
          color: '#FAFAFA',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Gold particle */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            boxShadow: '0 0 12px rgba(255, 215, 0, 0.5)',
            marginBottom: 24,
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 14,
            color: '#808080',
            marginBottom: 16,
            letterSpacing: '0.05em',
          }}
        >
          MY MOMENT OF THE WEEK
        </div>

        {/* Duration */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 600,
            color: '#FAFAFA',
            marginBottom: 8,
          }}
        >
          {duration} min
        </div>

        {/* Task */}
        {potw.session.task && (
          <div
            style={{
              fontSize: 16,
              color: '#808080',
              marginBottom: 16,
            }}
          >
            {potw.session.task}
          </div>
        )}

        {/* Narrative excerpt */}
        <div
          style={{
            fontSize: 14,
            color: '#4A4A4A',
            textAlign: 'center',
            maxWidth: 360,
            lineHeight: 1.5,
          }}
        >
          &ldquo;{potw.narrative.opening}&rdquo;
        </div>

        {/* Branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 24,
            fontSize: 11,
            color: '#4A4A4A',
          }}
        >
          made with Particle
        </div>

        {/* Date */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 24,
            fontSize: 11,
            color: '#4A4A4A',
          }}
        >
          {formattedDate}
        </div>
      </div>
    );
  }
);
