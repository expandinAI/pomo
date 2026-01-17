'use client';

import { useEffect, useReducer, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { SessionType as SessionTypeComponent } from './SessionType';
import { SessionCounter } from './SessionCounter';
import { BreathingAnimation } from './BreathingAnimation';
import {
  TIMER_DURATIONS,
  LONG_BREAK_INTERVAL,
  type SessionType,
  SESSION_LABELS,
} from '@/styles/design-tokens';
import { TAB_TITLES } from '@/lib/constants';
import { formatTime } from '@/lib/utils';

interface TimerState {
  mode: SessionType;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isBreathing: boolean;
  completedPomodoros: number;
  showCelebration: boolean;
}

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK' }
  | { type: 'COMPLETE' }
  | { type: 'SET_MODE'; mode: SessionType }
  | { type: 'START_BREATHING' }
  | { type: 'END_BREATHING' }
  | { type: 'HIDE_CELEBRATION' };

function getInitialTime(mode: SessionType): number {
  return TIMER_DURATIONS[mode];
}

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START_BREATHING':
      return { ...state, isBreathing: true };

    case 'END_BREATHING':
      return { ...state, isBreathing: false, isRunning: true, isPaused: false };

    case 'START':
      return { ...state, isRunning: true, isPaused: false };

    case 'PAUSE':
      return { ...state, isRunning: false, isPaused: true };

    case 'RESET':
      return {
        ...state,
        timeRemaining: getInitialTime(state.mode),
        isRunning: false,
        isPaused: false,
        isBreathing: false,
      };

    case 'TICK':
      if (state.timeRemaining <= 0) {
        return state;
      }
      return { ...state, timeRemaining: state.timeRemaining - 1 };

    case 'COMPLETE': {
      const isWorkSession = state.mode === 'work';
      const newCompletedPomodoros = isWorkSession
        ? state.completedPomodoros + 1
        : state.completedPomodoros;

      // Determine next mode
      let nextMode: SessionType;
      if (isWorkSession) {
        nextMode =
          newCompletedPomodoros % LONG_BREAK_INTERVAL === 0 ? 'longBreak' : 'shortBreak';
      } else {
        nextMode = 'work';
      }

      return {
        ...state,
        mode: nextMode,
        timeRemaining: getInitialTime(nextMode),
        isRunning: false,
        isPaused: false,
        completedPomodoros: newCompletedPomodoros,
        showCelebration: isWorkSession,
      };
    }

    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        timeRemaining: getInitialTime(action.mode),
        isRunning: false,
        isPaused: false,
        isBreathing: false,
      };

    case 'HIDE_CELEBRATION':
      return { ...state, showCelebration: false };

    default:
      return state;
  }
}

const initialState: TimerState = {
  mode: 'work',
  timeRemaining: TIMER_DURATIONS.work,
  isRunning: false,
  isPaused: false,
  isBreathing: false,
  completedPomodoros: 0,
  showCelebration: false,
};

export function Timer() {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // Update tab title
  useEffect(() => {
    if (state.isRunning) {
      document.title = TAB_TITLES.running(formatTime(state.timeRemaining), SESSION_LABELS[state.mode]);
    } else if (state.isPaused) {
      document.title = TAB_TITLES.paused(formatTime(state.timeRemaining), SESSION_LABELS[state.mode]);
    } else {
      document.title = TAB_TITLES.idle;
    }
  }, [state.isRunning, state.isPaused, state.timeRemaining, state.mode]);

  // Timer tick
  useEffect(() => {
    if (!state.isRunning || state.isBreathing) return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, state.isBreathing]);

  // Check for completion
  useEffect(() => {
    if (state.timeRemaining === 0 && state.isRunning) {
      dispatch({ type: 'COMPLETE' });
    }
  }, [state.timeRemaining, state.isRunning]);

  // Hide celebration after animation
  useEffect(() => {
    if (state.showCelebration) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'HIDE_CELEBRATION' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.showCelebration]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (state.isBreathing) return;
          if (state.isRunning) {
            dispatch({ type: 'PAUSE' });
          } else if (state.mode === 'work' && !state.isPaused) {
            dispatch({ type: 'START_BREATHING' });
          } else {
            dispatch({ type: 'START' });
          }
          break;
        case 'r':
          dispatch({ type: 'RESET' });
          break;
        case 's':
          dispatch({ type: 'COMPLETE' });
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isRunning, state.isBreathing, state.mode, state.isPaused]);

  const handleStart = useCallback(() => {
    if (state.mode === 'work' && !state.isPaused) {
      dispatch({ type: 'START_BREATHING' });
    } else {
      dispatch({ type: 'START' });
    }
  }, [state.mode, state.isPaused]);

  const handlePause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const handleModeChange = useCallback((mode: SessionType) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  const handleBreathingComplete = useCallback(() => {
    dispatch({ type: 'END_BREATHING' });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-lg mx-auto">
      {/* Session type selector */}
      <SessionTypeComponent
        currentMode={state.mode}
        onModeChange={handleModeChange}
        disabled={state.isRunning || state.isBreathing}
      />

      {/* Timer display with breathing animation overlay */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {state.isBreathing ? (
            <BreathingAnimation key="breathing" onComplete={handleBreathingComplete} />
          ) : (
            <motion.div
              key="timer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <TimerDisplay
                timeRemaining={state.timeRemaining}
                isRunning={state.isRunning}
                showCelebration={state.showCelebration}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <TimerControls
        isRunning={state.isRunning}
        isPaused={state.isPaused}
        isBreathing={state.isBreathing}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
      />

      {/* Session counter */}
      <SessionCounter count={state.completedPomodoros} />
    </div>
  );
}
