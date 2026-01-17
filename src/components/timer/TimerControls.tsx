'use client';

import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { SPRING } from '@/styles/design-tokens';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isBreathing: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  isRunning,
  isPaused,
  isBreathing,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', ...SPRING.gentle, delay: 0.1 }}
    >
      {/* Reset button */}
      <IconButton
        label="Reset timer"
        onClick={onReset}
        disabled={isBreathing}
        size="lg"
      >
        <RotateCcw className="w-full h-full" />
      </IconButton>

      {/* Main action button */}
      <Button
        variant="primary"
        size="lg"
        onClick={isRunning ? onPause : onStart}
        disabled={isBreathing}
        className="min-w-[120px] gap-2"
      >
        {isRunning ? (
          <>
            <Pause className="w-5 h-5" />
            Pause
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            {isPaused ? 'Resume' : 'Start'}
          </>
        )}
      </Button>

      {/* Spacer for visual balance */}
      <div className="w-12 h-12" />
    </motion.div>
  );
}
