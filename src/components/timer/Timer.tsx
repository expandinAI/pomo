'use client';

import { useEffect, useReducer, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { SessionType as SessionTypeComponent } from './SessionType';
import { SessionCounter } from './SessionCounter';
import { BreathingAnimation } from './BreathingAnimation';
import { useTimerWorker } from '@/hooks/useTimerWorker';
import { useSound } from '@/hooks/useSound';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { useTimerSettings, type TimerDurations } from '@/hooks/useTimerSettings';
import {
  LONG_BREAK_INTERVAL,
  type SessionType,
  SESSION_LABELS,
} from '@/styles/design-tokens';
import { TAB_TITLES } from '@/lib/constants';
import { formatTime } from '@/lib/utils';
import { addSession } from '@/lib/session-storage';

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
  | { type: 'RESET'; durations: TimerDurations }
  | { type: 'SET_TIME'; time: number }
  | { type: 'COMPLETE'; durations: TimerDurations }
  | { type: 'SET_MODE'; mode: SessionType; durations: TimerDurations }
  | { type: 'START_BREATHING' }
  | { type: 'END_BREATHING' }
  | { type: 'HIDE_CELEBRATION' }
  | { type: 'SYNC_DURATIONS'; durations: TimerDurations };

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
        timeRemaining: action.durations[state.mode],
        isRunning: false,
        isPaused: false,
        isBreathing: false,
      };

    case 'SET_TIME':
      return { ...state, timeRemaining: action.time };

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
        timeRemaining: action.durations[nextMode],
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
        timeRemaining: action.durations[action.mode],
        isRunning: false,
        isPaused: false,
        isBreathing: false,
      };

    case 'SYNC_DURATIONS':
      // Only update time if timer is not running or paused
      if (!state.isRunning && !state.isPaused) {
        return {
          ...state,
          timeRemaining: action.durations[state.mode],
        };
      }
      return state;

    case 'HIDE_CELEBRATION':
      return { ...state, showCelebration: false };

    default:
      return state;
  }
}

// Default durations for initial state
const DEFAULT_DURATIONS: TimerDurations = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const initialState: TimerState = {
  mode: 'work',
  timeRemaining: DEFAULT_DURATIONS.work,
  isRunning: false,
  isPaused: false,
  isBreathing: false,
  completedPomodoros: 0,
  showCelebration: false,
};

export function Timer() {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // Custom timer settings
  const { durations, isLoaded } = useTimerSettings();

  // Ref to always have current durations
  const durationsRef = useRef(durations);
  durationsRef.current = durations;

  // Track elapsed time for pause/resume
  const elapsedRef = useRef(0);

  // Sound notification
  const { play: playSound } = useSound();

  // Theme management
  const { toggleTheme } = useTheme();

  // Haptic feedback
  const { vibrate } = useHaptics();

  // Ambient sound
  const {
    play: playAmbient,
    stop: stopAmbient,
    type: ambientType,
  } = useAmbientSound();

  // Sync durations when settings load or change
  useEffect(() => {
    if (isLoaded) {
      dispatch({ type: 'SYNC_DURATIONS', durations });
    }
  }, [durations, isLoaded]);

  // Handle timer tick from worker
  const handleTick = useCallback((remaining: number) => {
    dispatch({ type: 'SET_TIME', time: remaining });
  }, []);

  // Handle timer completion from worker
  const handleComplete = useCallback(() => {
    const sessionMode = state.mode;
    const sessionDuration = durationsRef.current[sessionMode];

    // Save completed session to history
    addSession(sessionMode, sessionDuration);

    const wasWorkSession = sessionMode === 'work';
    dispatch({ type: 'COMPLETE', durations: durationsRef.current });
    elapsedRef.current = 0;

    // Haptic feedback on completion
    vibrate('medium');

    // Play sound on completion
    playSound(wasWorkSession ? 'completion' : 'break');
  }, [playSound, state.mode, vibrate]);

  // Initialize Web Worker timer
  const {
    start: workerStart,
    pause: workerPause,
    reset: workerReset,
  } = useTimerWorker(durations[state.mode], {
    onTick: handleTick,
    onComplete: handleComplete,
  });

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

  // Sync worker with running state
  useEffect(() => {
    if (state.isRunning && !state.isBreathing) {
      const duration = durationsRef.current[state.mode];
      const elapsed = duration - state.timeRemaining;
      workerStart(duration, elapsed);
    } else if (!state.isRunning && state.isPaused) {
      workerPause();
      elapsedRef.current = durationsRef.current[state.mode] - state.timeRemaining;
    }
  }, [state.isRunning, state.isBreathing, state.isPaused, state.mode, state.timeRemaining, workerStart, workerPause]);

  // Hide celebration after 3 seconds (auto-transition delay)
  useEffect(() => {
    if (state.showCelebration) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'HIDE_CELEBRATION' });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [state.showCelebration]);

  // Control ambient sound based on timer state
  // Plays during work sessions only, stops on pause/break/completion
  useEffect(() => {
    if (state.isRunning && state.mode === 'work' && ambientType !== 'silence') {
      playAmbient();
    } else {
      stopAmbient();
    }
  }, [state.isRunning, state.mode, ambientType, playAmbient, stopAmbient]);

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
          dispatch({ type: 'RESET', durations: durationsRef.current });
          break;
        case 's':
          dispatch({ type: 'COMPLETE', durations: durationsRef.current });
          break;
        case 'd':
          toggleTheme();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isRunning, state.isBreathing, state.mode, state.isPaused, toggleTheme]);

  const handleStart = useCallback(() => {
    vibrate('light');
    if (state.mode === 'work' && !state.isPaused) {
      dispatch({ type: 'START_BREATHING' });
    } else {
      dispatch({ type: 'START' });
    }
  }, [state.mode, state.isPaused, vibrate]);

  const handlePause = useCallback(() => {
    vibrate('double');
    dispatch({ type: 'PAUSE' });
  }, [vibrate]);

  const handleReset = useCallback(() => {
    vibrate('heavy');
    dispatch({ type: 'RESET', durations: durationsRef.current });
    workerReset(durationsRef.current[state.mode]);
    elapsedRef.current = 0;
  }, [workerReset, state.mode, vibrate]);

  const handleModeChange = useCallback((mode: SessionType) => {
    dispatch({ type: 'SET_MODE', mode, durations: durationsRef.current });
    workerReset(durationsRef.current[mode]);
    elapsedRef.current = 0;
  }, [workerReset]);

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
