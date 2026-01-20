'use client';

import { useEffect, useReducer, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { PresetSelector } from './PresetSelector';
import { SessionCounter } from './SessionCounter';
import { EndConfirmationModal } from './EndConfirmationModal';
import { useTimerWorker } from '@/hooks/useTimerWorker';
import { useSound } from '@/hooks/useSound';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useAmbientSoundContext } from '@/contexts/AmbientSoundContext';
import { useTimerSettingsContext, type TimerDurations } from '@/contexts/TimerSettingsContext';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAmbientEffects } from '@/contexts/AmbientEffectsContext';
import { TimerSkeleton } from '@/components/ui/Skeleton';
import { CommandRegistration } from '@/components/command';
import {
  type SessionType,
  SESSION_LABELS,
} from '@/styles/design-tokens';
import { TAB_TITLES } from '@/lib/constants';
import { formatTime } from '@/lib/utils';
import { addSession } from '@/lib/session-storage';
import { addRecentTask } from '@/lib/task-storage';
import { QuickTaskInput } from '@/components/task';

interface TimerState {
  mode: SessionType;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  completedPomodoros: number;
  showCelebration: boolean;
  showSkipMessage: boolean;
  currentTask: string;
  estimatedPomodoros: number | null;
}

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET'; durations: TimerDurations }
  | { type: 'SET_TIME'; time: number }
  | { type: 'COMPLETE'; durations: TimerDurations; sessionsUntilLong: number }
  | { type: 'SKIP'; durations: TimerDurations; sessionsUntilLong: number }
  | { type: 'SET_MODE'; mode: SessionType; durations: TimerDurations }
  | { type: 'HIDE_CELEBRATION' }
  | { type: 'HIDE_SKIP_MESSAGE' }
  | { type: 'SYNC_DURATIONS'; durations: TimerDurations }
  | { type: 'ADJUST_TIME'; delta: number; durations: TimerDurations }
  | { type: 'SET_TASK'; task: string }
  | { type: 'SET_ESTIMATE'; estimate: number | null }
  | { type: 'CLEAR_TASK' };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
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
      };

    case 'SET_TIME':
      return { ...state, timeRemaining: action.time };

    case 'COMPLETE': {
      const isWorkSession = state.mode === 'work';
      const newCompletedPomodoros = isWorkSession
        ? state.completedPomodoros + 1
        : state.completedPomodoros;

      // Determine next mode (use sessionsUntilLong from active preset)
      let nextMode: SessionType;
      if (isWorkSession) {
        nextMode =
          newCompletedPomodoros % action.sessionsUntilLong === 0 ? 'longBreak' : 'shortBreak';
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

    case 'SKIP': {
      const isWorkSession = state.mode === 'work';

      // Determine next mode (same logic as COMPLETE, but don't increment counter)
      let nextMode: SessionType;
      if (isWorkSession) {
        // Use current count + 1 for break calculation, but don't actually increment
        nextMode = (state.completedPomodoros + 1) % action.sessionsUntilLong === 0
          ? 'longBreak'
          : 'shortBreak';
      } else {
        nextMode = 'work';
      }

      return {
        ...state,
        mode: nextMode,
        timeRemaining: action.durations[nextMode],
        isRunning: false,
        isPaused: false,
        // NO completedPomodoros increment
        // NO showCelebration
        showSkipMessage: true,
      };
    }

    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        timeRemaining: action.durations[action.mode],
        isRunning: false,
        isPaused: false,
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

    case 'HIDE_SKIP_MESSAGE':
      return { ...state, showSkipMessage: false };

    case 'ADJUST_TIME': {
      // Only allow adjustment when paused or idle (not running)
      if (state.isRunning) return state;
      const minTime = 60; // Minimum 1 minute
      const maxTime = action.durations[state.mode];
      const newTime = Math.max(minTime, Math.min(maxTime, state.timeRemaining + action.delta));
      return { ...state, timeRemaining: newTime };
    }

    case 'SET_TASK':
      return { ...state, currentTask: action.task };

    case 'SET_ESTIMATE':
      return { ...state, estimatedPomodoros: action.estimate };

    case 'CLEAR_TASK':
      return { ...state, currentTask: '', estimatedPomodoros: null };

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
  completedPomodoros: 0,
  showCelebration: false,
  showSkipMessage: false,
  currentTask: '',
  estimatedPomodoros: null,
};

export function Timer() {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // Custom timer settings (shared context)
  const { durations, isLoaded, sessionsUntilLong, applyPreset, activePresetId } = useTimerSettingsContext();

  // Ref to always have current sessionsUntilLong
  const sessionsUntilLongRef = useRef(sessionsUntilLong);
  sessionsUntilLongRef.current = sessionsUntilLong;

  // Ref to always have current activePresetId
  const activePresetIdRef = useRef(activePresetId);
  activePresetIdRef.current = activePresetId;

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

  // Ambient sound (shared context)
  const {
    play: playAmbient,
    stop: stopAmbient,
    type: ambientType,
    setType: setAmbientType,
    presets: ambientPresets,
  } = useAmbientSoundContext();

  // Sound settings for mute toggle
  const { toggleMute, muted } = useSoundSettings();

  // Wake lock to prevent screen from sleeping during active sessions
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  // Ambient visual effects
  const { setVisualState, setIsPaused: setParticlesPaused } = useAmbientEffects();

  // Screen reader announcements
  const [statusAnnouncement, setStatusAnnouncement] = useState('');
  const [timerAnnouncement, setTimerAnnouncement] = useState('');
  const lastAnnouncedMinute = useRef<number | null>(null);

  // End confirmation modal
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  // Task input ref for T shortcut
  const taskInputRef = useRef<HTMLInputElement>(null);

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
    const wasWorkSession = sessionMode === 'work';

    // Save completed session to history with task data and preset info
    const taskData = {
      ...(wasWorkSession && state.currentTask && { task: state.currentTask }),
      ...(wasWorkSession && state.estimatedPomodoros && { estimatedPomodoros: state.estimatedPomodoros }),
      presetId: activePresetIdRef.current,
    };

    addSession(sessionMode, sessionDuration, taskData);

    // Save task to recent tasks (only for work sessions with a task)
    if (wasWorkSession && state.currentTask) {
      addRecentTask({
        text: state.currentTask,
        lastUsed: new Date().toISOString(),
        estimatedPomodoros: state.estimatedPomodoros ?? undefined,
      });
    }

    dispatch({ type: 'COMPLETE', durations: durationsRef.current, sessionsUntilLong: sessionsUntilLongRef.current });
    elapsedRef.current = 0;

    // Clear task after completion (only for work sessions)
    if (wasWorkSession) {
      dispatch({ type: 'CLEAR_TASK' });
    }

    // Haptic feedback on completion
    vibrate('medium');

    // Play sound on completion
    playSound(wasWorkSession ? 'completion' : 'break');
  }, [playSound, state.mode, state.currentTask, state.estimatedPomodoros, vibrate]);

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
    if (state.isRunning) {
      const duration = durationsRef.current[state.mode];
      const elapsed = duration - state.timeRemaining;
      workerStart(duration, elapsed);
    } else if (!state.isRunning && state.isPaused) {
      workerPause();
      elapsedRef.current = durationsRef.current[state.mode] - state.timeRemaining;
    }
  }, [state.isRunning, state.isPaused, state.mode, state.timeRemaining, workerStart, workerPause]);

  // Hide celebration after 3 seconds (auto-transition delay)
  useEffect(() => {
    if (state.showCelebration) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'HIDE_CELEBRATION' });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [state.showCelebration]);

  // Hide skip message after 2 seconds
  useEffect(() => {
    if (state.showSkipMessage) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'HIDE_SKIP_MESSAGE' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.showSkipMessage]);

  // Control ambient sound based on timer state
  // Plays during work sessions only, stops on pause/break/completion
  useEffect(() => {
    if (state.isRunning && state.mode === 'work' && ambientType !== 'silence') {
      playAmbient();
    } else {
      stopAmbient();
    }
  }, [state.isRunning, state.mode, ambientType, playAmbient, stopAmbient]);

  // Wake lock: prevent screen from sleeping during active sessions
  useEffect(() => {
    if (state.isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [state.isRunning, requestWakeLock, releaseWakeLock]);

  // Sync visual effects state with timer state
  useEffect(() => {
    if (state.showCelebration) {
      setVisualState('completed');
      setParticlesPaused(false);
    } else if (state.isRunning) {
      setVisualState(state.mode === 'work' ? 'focus' : 'break');
      setParticlesPaused(false);
    } else if (state.isPaused) {
      // Keep visual state active but pause particles (freeze in place)
      setVisualState(state.mode === 'work' ? 'focus' : 'break');
      setParticlesPaused(true);
    } else {
      // Truly idle (reset, initial state)
      setVisualState('idle');
      setParticlesPaused(false);
    }
  }, [state.isRunning, state.isPaused, state.mode, state.showCelebration, setVisualState, setParticlesPaused]);

  // Screen reader: Announce timer every 5 minutes
  useEffect(() => {
    if (!state.isRunning) {
      lastAnnouncedMinute.current = null;
      return;
    }

    const minutes = Math.floor(state.timeRemaining / 60);
    // Announce at 5-minute intervals (25, 20, 15, 10, 5) and at 1 minute
    const shouldAnnounce =
      (minutes > 0 && minutes % 5 === 0 && lastAnnouncedMinute.current !== minutes) ||
      (minutes === 1 && lastAnnouncedMinute.current !== 1);

    if (shouldAnnounce) {
      lastAnnouncedMinute.current = minutes;
      const label = minutes === 1 ? '1 minute remaining' : `${minutes} minutes remaining`;
      setTimerAnnouncement(label);
      // Clear after announcement
      setTimeout(() => setTimerAnnouncement(''), 1000);
    }
  }, [state.timeRemaining, state.isRunning]);

  // Screen reader: Announce status changes
  const prevRunningRef = useRef(state.isRunning);
  const prevModeRef = useRef(state.mode);
  useEffect(() => {
    const wasRunning = prevRunningRef.current;
    const prevMode = prevModeRef.current;
    prevRunningRef.current = state.isRunning;
    prevModeRef.current = state.mode;

    // Session started
    if (state.isRunning && !wasRunning && !state.isPaused) {
      const minutes = Math.floor(durationsRef.current[state.mode] / 60);
      setStatusAnnouncement(`${SESSION_LABELS[state.mode]} started, ${minutes} minutes`);
    }
    // Session paused
    else if (!state.isRunning && wasRunning && state.isPaused) {
      setStatusAnnouncement('Session paused');
    }
    // Session resumed
    else if (state.isRunning && !wasRunning && state.isPaused) {
      setStatusAnnouncement('Session resumed');
    }
    // Session completed (mode changed)
    else if (state.mode !== prevMode && !state.isRunning) {
      if (state.showCelebration) {
        setStatusAnnouncement('Focus session complete. Well done!');
      } else if (state.showSkipMessage) {
        setStatusAnnouncement(`Session skipped. Starting ${SESSION_LABELS[state.mode]}.`);
      } else if (prevMode !== 'work') {
        setStatusAnnouncement('Break complete. Ready for focus.');
      }
    }

    // Clear announcement after delay
    if (statusAnnouncement) {
      const timeout = setTimeout(() => setStatusAnnouncement(''), 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.isRunning, state.isPaused, state.mode, state.showCelebration, state.showSkipMessage, statusAnnouncement]);

  // Cycle to next ambient type
  const cycleAmbientType = useCallback(() => {
    const currentIndex = ambientPresets.findIndex((p) => p.id === ambientType);
    const nextIndex = (currentIndex + 1) % ambientPresets.length;
    setAmbientType(ambientPresets[nextIndex].id);
  }, [ambientType, ambientPresets, setAmbientType]);

  // Skip session (complete early with actual elapsed time)
  const handleSkip = useCallback(() => {
    const sessionMode = state.mode;
    const fullDuration = durationsRef.current[sessionMode];
    const elapsedTime = fullDuration - state.timeRemaining;
    const isWorkSession = sessionMode === 'work';

    // Only save if > 60 seconds elapsed (minimum threshold)
    if (elapsedTime > 60) {
      const taskData = {
        ...(isWorkSession && state.currentTask && { task: state.currentTask }),
        presetId: activePresetIdRef.current,
      };

      // Save ACTUAL elapsed time, not full duration
      addSession(sessionMode, elapsedTime, taskData);
    }

    // Calculate next mode (same logic as reducer)
    let nextMode: SessionType;
    if (isWorkSession) {
      nextMode = (state.completedPomodoros + 1) % sessionsUntilLongRef.current === 0
        ? 'longBreak'
        : 'shortBreak';
    } else {
      nextMode = 'work';
    }

    // Dispatch SKIP action (not COMPLETE!)
    dispatch({
      type: 'SKIP',
      durations: durationsRef.current,
      sessionsUntilLong: sessionsUntilLongRef.current,
    });

    // Reset worker to new session duration
    workerReset(durationsRef.current[nextMode]);
    elapsedRef.current = 0;

    playSound('break');
    vibrate('light');

    // Clear task when skipping work session
    if (isWorkSession) {
      dispatch({ type: 'CLEAR_TASK' });
    }
  }, [state.mode, state.timeRemaining, state.currentTask, state.completedPomodoros, playSound, vibrate, workerReset]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (state.isRunning) {
            dispatch({ type: 'PAUSE' });
          } else {
            dispatch({ type: 'START' });
          }
          break;
        case 'r':
        case 'R':
          dispatch({ type: 'RESET', durations: durationsRef.current });
          break;
        case 's':
        case 'S':
          handleSkip();
          break;
        case 'd':
        case 'D':
          toggleTheme();
          break;
        // Preset switching (1-4)
        case '1':
          if (!state.isRunning) {
            applyPreset('classic');
          }
          break;
        case '2':
          if (!state.isRunning) {
            applyPreset('deepWork');
          }
          break;
        case '3':
          if (!state.isRunning) {
            applyPreset('ultradian');
          }
          break;
        case '4':
          if (!state.isRunning) {
            applyPreset('custom');
          }
          break;
        // Time adjustment (only when not running)
        // ↑ = +1 min, Shift+↑ = +5 min
        case 'ArrowUp':
          if (!state.isRunning) {
            e.preventDefault();
            const deltaUp = e.shiftKey ? 5 * 60 : 60;
            dispatch({ type: 'ADJUST_TIME', delta: deltaUp, durations: durationsRef.current });
          }
          break;
        // ↓ = -1 min, Shift+↓ = -5 min
        case 'ArrowDown':
          if (!state.isRunning) {
            e.preventDefault();
            const deltaDown = e.shiftKey ? -5 * 60 : -60;
            dispatch({ type: 'ADJUST_TIME', delta: deltaDown, durations: durationsRef.current });
          }
          break;
        // E = End session early (with confirmation)
        case 'e':
        case 'E':
          if (state.isRunning) {
            e.preventDefault();
            setShowEndConfirmation(true);
          }
          break;
        // Sound controls
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'a':
        case 'A':
          cycleAmbientType();
          break;
        // Task input focus (only when idle and in work mode)
        case 't':
        case 'T':
          if (!state.isRunning && state.mode === 'work') {
            e.preventDefault();
            taskInputRef.current?.focus();
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isRunning, state.mode, state.isPaused, toggleTheme, toggleMute, cycleAmbientType, applyPreset, handleSkip]);

  const handleStart = useCallback(() => {
    vibrate('light');
    dispatch({ type: 'START' });
  }, [vibrate]);

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

  // Open settings via custom event
  const handleOpenSettings = useCallback(() => {
    window.dispatchEvent(new CustomEvent('particle:open-settings'));
  }, []);

  // Task handlers
  const handleTaskChange = useCallback((task: string) => {
    dispatch({ type: 'SET_TASK', task });
  }, []);

  const handleEstimateChange = useCallback((estimate: number | null) => {
    dispatch({ type: 'SET_ESTIMATE', estimate });
  }, []);

  // Start session when pressing Enter in task input
  const handleTaskEnter = useCallback(() => {
    if (!state.isRunning && !state.isPaused) {
      handleStart();
    }
  }, [state.isRunning, state.isPaused, handleStart]);

  // Handle end confirmation (must be before early return to follow hooks rules)
  const handleEndConfirm = useCallback(() => {
    handleSkip();
    setShowEndConfirmation(false);
  }, [handleSkip]);

  const handleEndCancel = useCallback(() => {
    setShowEndConfirmation(false);
  }, []);

  // Show skeleton while settings are loading to prevent layout shift
  if (!isLoaded) {
    return <TimerSkeleton />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full max-w-lg mx-auto">
      {/* End Confirmation Modal */}
      <EndConfirmationModal
        isOpen={showEndConfirmation}
        onConfirm={handleEndConfirm}
        onCancel={handleEndCancel}
      />

      {/* Command Palette Registration */}
      <CommandRegistration
        timerIsRunning={state.isRunning}
        timerIsPaused={state.isPaused}
        isMuted={muted}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onSkip={handleSkip}
        onToggleTheme={toggleTheme}
        onOpenSettings={handleOpenSettings}
        onToggleMute={toggleMute}
        onPresetChange={applyPreset}
      />

      {/* Preset selector */}
      <PresetSelector
        disabled={state.isRunning}
      />

      {/* Timer display */}
      <TimerDisplay
        timeRemaining={state.timeRemaining}
        isRunning={state.isRunning}
        showCelebration={state.showCelebration}
      />

      {/* Skip feedback message */}
      <AnimatePresence>
        {state.showSkipMessage && (
          <motion.p
            className="mt-4 text-sm text-secondary light:text-secondary-dark"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Skipped to {SESSION_LABELS[state.mode]}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Task input (only for work sessions) */}
      {state.mode === 'work' && (
        <QuickTaskInput
          value={state.currentTask}
          onChange={handleTaskChange}
          estimatedPomodoros={state.estimatedPomodoros}
          onEstimateChange={handleEstimateChange}
          disabled={state.isRunning}
          onEnter={handleTaskEnter}
          inputRef={taskInputRef}
        />
      )}

      {/* Controls */}
      <TimerControls
        isRunning={state.isRunning}
        isPaused={state.isPaused}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        mode={state.mode}
      />

      {/* Session counter */}
      <SessionCounter count={state.completedPomodoros} sessionsUntilLong={sessionsUntilLong} />

      {/* Screen reader live regions */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {statusAnnouncement}
      </div>
      <div
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {timerAnnouncement}
      </div>
    </div>
  );
}
