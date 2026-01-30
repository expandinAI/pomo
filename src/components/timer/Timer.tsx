'use client';

import { useEffect, useReducer, useCallback, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { PresetSelector } from './PresetSelector';
import { SessionCounter } from './SessionCounter';
import { StatusMessage } from './StatusMessage';
import { EndConfirmationModal } from './EndConfirmationModal';
import { DailyGoalOverlay } from './DailyGoalOverlay';
import { ParticleDetailOverlay } from './ParticleDetailOverlay';
import { useTimerWorker } from '@/hooks/useTimerWorker';
import { useSound } from '@/hooks/useSound';
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
import { formatTime, formatEndTime } from '@/lib/utils';
import { useSessionStore, type UnifiedSession } from '@/contexts/SessionContext';
import { formatDuration, formatTime24h, formatSessionInfo } from '@/lib/session-storage';
import { calculateSessionFeedback, type SessionFeedback } from '@/lib/session-feedback';
import { addRecentTasksFromInput } from '@/lib/task-storage';
import { formatTasksForStorage, parseMultiLineInput } from '@/lib/smart-input-parser';
import { UnifiedTaskInput } from '@/components/task';
import { useProjects } from '@/hooks/useProjects';
import { useMilestones } from '@/components/milestones';
import { useWellbeingHint } from '@/hooks/useWellbeingHint';
import { useContextualHints } from '@/hooks/useContextualHints';

interface TimerProps {
  /** Callback when user clicks timer display to open timeline */
  onTimelineOpen?: () => void;
  /**
   * Callback before starting the timer.
   * Return false to prevent start (e.g., to show onboarding first).
   * If omitted, timer starts normally.
   */
  onBeforeStart?: () => boolean;
}

interface TimerState {
  mode: SessionType;
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  completedPomodoros: number;
  showCelebration: boolean;
  showSkipMessage: boolean;
  currentTask: string;
  autoStartCountdown: number | null;
}

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'SET_TIME'; time: number }
  | { type: 'COMPLETE'; durations: TimerDurations; sessionsUntilLong: number }
  | { type: 'SKIP'; durations: TimerDurations; sessionsUntilLong: number }
  | { type: 'SET_MODE'; mode: SessionType; durations: TimerDurations }
  | { type: 'HIDE_CELEBRATION' }
  | { type: 'HIDE_SKIP_MESSAGE' }
  | { type: 'SYNC_DURATIONS'; durations: TimerDurations }
  | { type: 'ADJUST_TIME'; delta: number; durations: TimerDurations }
  | { type: 'SET_TASK'; task: string }
  | { type: 'CLEAR_TASK' }
  | { type: 'START_AUTO_COUNTDOWN'; delay: number }
  | { type: 'TICK_AUTO_COUNTDOWN' }
  | { type: 'CANCEL_AUTO_COUNTDOWN' };

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return { ...state, isRunning: true, isPaused: false, autoStartCountdown: null };

    case 'PAUSE':
      return { ...state, isRunning: false, isPaused: true };

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
        autoStartCountdown: null, // Cancel any active countdown
      };
    }

    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        timeRemaining: action.durations[action.mode],
        isRunning: false,
        isPaused: false,
        autoStartCountdown: null, // Cancel any active countdown
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

    case 'CLEAR_TASK':
      return { ...state, currentTask: '' };

    case 'START_AUTO_COUNTDOWN':
      return { ...state, autoStartCountdown: action.delay };

    case 'TICK_AUTO_COUNTDOWN':
      if (state.autoStartCountdown === null || state.autoStartCountdown <= 0) {
        return state;
      }
      return { ...state, autoStartCountdown: state.autoStartCountdown - 1 };

    case 'CANCEL_AUTO_COUNTDOWN':
      return { ...state, autoStartCountdown: null, showCelebration: true };

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
  autoStartCountdown: null,
};

export function Timer({ onTimelineOpen, onBeforeStart }: TimerProps = {}) {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  // Custom timer settings (shared context)
  const { durations, isLoaded, sessionsUntilLong, applyPreset, activePresetId, overflowEnabled, dailyGoal, setDailyGoal, autoStartEnabled, autoStartDelay, setAutoStartEnabled, autoStartMode, showEndTime, celebrationEnabled, celebrationTrigger, breakBreathingEnabled, wellbeingHintsEnabled, appearanceMode, setAppearanceMode, isDarkMode } = useTimerSettingsContext();

  // Ref to always have current sessionsUntilLong
  const sessionsUntilLongRef = useRef(sessionsUntilLong);
  sessionsUntilLongRef.current = sessionsUntilLong;

  // Ref to always have current activePresetId
  const activePresetIdRef = useRef(activePresetId);
  activePresetIdRef.current = activePresetId;

  // Ref to always have current durations
  const durationsRef = useRef(durations);
  durationsRef.current = durations;

  // Ref to always have current overflowEnabled
  const overflowEnabledRef = useRef(overflowEnabled);
  overflowEnabledRef.current = overflowEnabled;

  // Ref to always have current autoStartEnabled, delay, and mode
  const autoStartEnabledRef = useRef(autoStartEnabled);
  autoStartEnabledRef.current = autoStartEnabled;
  const autoStartDelayRef = useRef(autoStartDelay);
  autoStartDelayRef.current = autoStartDelay;
  const autoStartModeRef = useRef(autoStartMode);
  autoStartModeRef.current = autoStartMode;

  // Ref for celebration settings (to use in callbacks)
  const celebrationEnabledRef = useRef(celebrationEnabled);
  celebrationEnabledRef.current = celebrationEnabled;
  const celebrationTriggerRef = useRef(celebrationTrigger);
  celebrationTriggerRef.current = celebrationTrigger;

  // Ref for selectedProjectId (to use in callbacks)
  const selectedProjectIdRef = useRef<string | null>(null);

  // Overflow state (tracked locally, updated by worker)
  const [isOverflow, setIsOverflow] = useState(false);
  const [overflowSeconds, setOverflowSeconds] = useState(0);

  // Ref to always have current overflowSeconds (for session save callbacks)
  const overflowSecondsRef = useRef(0);
  overflowSecondsRef.current = overflowSeconds;

  // One-off duration from smart input (e.g., "Meeting 30" → 30 min)
  const [oneOffDuration, setOneOffDuration] = useState<number | null>(null);

  // Ref to always have current oneOffDuration (for worker sync and overflow calculation)
  const oneOffDurationRef = useRef<number | null>(null);
  oneOffDurationRef.current = oneOffDuration;

  // Show max limit message when duration was capped
  const [showMaxLimitMessage, setShowMaxLimitMessage] = useState(false);

  // Track elapsed time for pause/resume
  const elapsedRef = useRef(0);

  // Sound notification
  const { play: playSound } = useSound();

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

  // Sound settings for mute toggle and completion sound
  const { toggleMute, muted, completionSoundEnabled } = useSoundSettings();

  // Wake lock to prevent screen from sleeping during active sessions
  const { request: requestWakeLock, release: releaseWakeLock } = useWakeLock();

  // Ambient visual effects
  const { setVisualState, setIsPaused: setParticlesPaused, setConvergenceTarget, setShouldTriggerBurst } = useAmbientEffects();

  // Track next slot position for convergence animation
  const [nextSlotPosition, setNextSlotPosition] = useState<{ x: number; y: number } | null>(null);

  // Trigger to refresh slot position (incremented before convergence)
  const [refreshPositionTrigger, setRefreshPositionTrigger] = useState(0);

  // Track if convergence has been triggered for current session
  const convergenceTriggeredRef = useRef(false);

  // Track if slowing has been triggered for current session
  const slowingTriggeredRef = useRef(false);

  // Track glow state for SessionCounter
  const [showSlotGlow, setShowSlotGlow] = useState(false);

  // Ref for glow/sound timeout (to prevent cleanup from canceling it)
  const glowTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Screen reader announcements
  const [statusAnnouncement, setStatusAnnouncement] = useState('');
  const [timerAnnouncement, setTimerAnnouncement] = useState('');
  const lastAnnouncedMinute = useRef<number | null>(null);

  // End confirmation modal (legacy - kept for potential future use)
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  // Daily goal overlay
  const [showDailyGoalOverlay, setShowDailyGoalOverlay] = useState(false);

  // Particle detail overlay
  const [selectedParticleId, setSelectedParticleId] = useState<string | null>(null);
  const [showParticleDetailOverlay, setShowParticleDetailOverlay] = useState(false);

  // Particle select mode (O + number to open particle)
  const [particleSelectMode, setParticleSelectMode] = useState(false);
  const particleSelectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Random task picker (Shift+R)
  const [pickedTaskIndex, setPickedTaskIndex] = useState<number | null>(null);

  // Today's completed sessions count (for daily goal)
  const [todayCount, setTodayCount] = useState(0);

  // Today's sessions list (for particle hover info)
  const [todaySessions, setTodaySessions] = useState<UnifiedSession[]>([]);

  // Particle hover info state
  const [particleHoverInfo, setParticleHoverInfo] = useState<string | null>(null);

  // Daily goal celebration
  const [showDailyGoalReached, setShowDailyGoalReached] = useState(false);
  const prevTodayCountRef = useRef(0);

  // Toast message (for Shift+A toggle, etc.)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Welcome message (shown after first rhythm onboarding)
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  // Contextual hint (shown after session completion based on user patterns)
  const [contextualHint, setContextualHint] = useState<string | null>(null);

  // Session feedback (kontextueller Moment after completion)
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedback | null>(null);

  // Hovered preset ID (for StatusMessage contextual display)
  const [hoveredPresetId, setHoveredPresetId] = useState<string | null>(null);

  // Collapsed view hover (for session info display during active session)
  const [isCollapsedHovered, setIsCollapsedHovered] = useState(false);

  // Hovered mode indicator (overflow/autoStart icons)
  const [hoveredModeIndicator, setHoveredModeIndicator] = useState<'overflow' | 'autoStart' | null>(null);

  // Task input ref for T shortcut
  const taskInputRef = useRef<HTMLInputElement>(null);

  // Projects
  const {
    activeProjects,
    selectedProjectId,
    selectProject,
    recentProjectIds,
    isLoading: projectsLoading,
    getById,
  } = useProjects();

  // Session store (IndexedDB/localStorage abstraction)
  const {
    addSession,
    getTodaySessions,
    getTotalSessionCount,
    isLoading: sessionsLoading,
  } = useSessionStore();

  // Milestones
  const { checkForMilestones } = useMilestones();

  // Wellbeing hints (only during breaks, when enabled)
  const isBreak = state.mode === 'shortBreak' || state.mode === 'longBreak';
  const wellbeingHint = useWellbeingHint({ isBreak, enabled: wellbeingHintsEnabled });

  // Contextual hints (shown after session completion based on user patterns)
  const { trackOverflow, trackEarlyStop, trackSessionStart, checkForHint, markHintShown } = useContextualHints();

  // Keep ref in sync with selectedProjectId
  useEffect(() => {
    selectedProjectIdRef.current = selectedProjectId;
  }, [selectedProjectId]);

  // Build project name map for particle hover info
  const projectNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const session of todaySessions) {
      if (session.projectId && !map.has(session.projectId)) {
        const project = getById(session.projectId);
        if (project) {
          map.set(session.projectId, project.name);
        }
      }
    }
    return map;
  }, [todaySessions, getById]);

  // Count of pending (uncompleted) tasks for random picker
  const pendingTaskCount = useMemo(() => {
    if (!state.currentTask) return 0;
    return parseMultiLineInput(state.currentTask).tasks.filter(t => !t.completed).length;
  }, [state.currentTask]);

  // Sync durations when settings load or change
  useEffect(() => {
    if (isLoaded) {
      dispatch({ type: 'SYNC_DURATIONS', durations });
    }
  }, [durations, isLoaded]);

  // Load and update today's session count and list
  useEffect(() => {
    if (isLoaded && !sessionsLoading) {
      const sessions = getTodaySessions();
      setTodaySessions(sessions);
      const newCount = sessions.length;
      setTodayCount(newCount);

      // Check for daily goal reached (only when count increases to match goal)
      if (
        dailyGoal &&
        newCount === dailyGoal &&
        prevTodayCountRef.current < dailyGoal
      ) {
        setShowDailyGoalReached(true);
      }

      prevTodayCountRef.current = newCount;
    }
  }, [isLoaded, sessionsLoading, state.completedPomodoros, dailyGoal, getTodaySessions]); // Re-calculate when pomodoros increment

  // Hide daily goal reached message after 3 seconds
  useEffect(() => {
    if (showDailyGoalReached) {
      const timeout = setTimeout(() => {
        setShowDailyGoalReached(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [showDailyGoalReached]);

  // Listen for G O navigation shortcut to open daily goal overlay
  useEffect(() => {
    function handleOpenGoals() {
      setShowDailyGoalOverlay(true);
    }

    window.addEventListener('particle:open-goals', handleOpenGoals);
    return () => window.removeEventListener('particle:open-goals', handleOpenGoals);
  }, []);

  // Listen for toast events and auto-clear after 2 seconds
  useEffect(() => {
    function handleToast(e: CustomEvent<{ message: string }>) {
      setToastMessage(e.detail.message);
    }

    window.addEventListener('particle:toast', handleToast as EventListener);
    return () => window.removeEventListener('particle:toast', handleToast as EventListener);
  }, []);

  // Auto-clear toast after 2 seconds
  useEffect(() => {
    if (toastMessage) {
      const timeout = setTimeout(() => {
        setToastMessage(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [toastMessage]);

  // Auto-clear session feedback after 6 seconds
  useEffect(() => {
    if (sessionFeedback) {
      const timeout = setTimeout(() => {
        setSessionFeedback(null);
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [sessionFeedback]);

  // Listen for first-start welcome event (after rhythm onboarding)
  useEffect(() => {
    function handleWelcome() {
      setWelcomeMessage('Your first particle. Press L to explore rhythms.');
    }
    window.addEventListener('particle:show-welcome', handleWelcome);
    return () => window.removeEventListener('particle:show-welcome', handleWelcome);
  }, []);

  // Auto-clear welcome message after 8 seconds (longer for readability)
  useEffect(() => {
    if (welcomeMessage) {
      const timeout = setTimeout(() => {
        setWelcomeMessage(null);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [welcomeMessage]);

  // Auto-clear contextual hint after 8 seconds
  useEffect(() => {
    if (contextualHint) {
      const timeout = setTimeout(() => {
        setContextualHint(null);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [contextualHint]);

  // Handle timer tick from worker
  const handleTick = useCallback((remaining: number, overflow?: number) => {
    dispatch({ type: 'SET_TIME', time: remaining });
    // Track overflow state
    if (overflow !== undefined && overflow > 0) {
      setIsOverflow(true);
      setOverflowSeconds(overflow);
      // Update ref immediately (state update is async, ref is sync)
      // This ensures callbacks have the current value even before re-render
      overflowSecondsRef.current = overflow;
    }
  }, []);

  // Handle timer reaching 0 (overflow mode - timer continues)
  const handleReachedZero = useCallback(() => {
    // Play completion sound when hitting 0 (even in overflow mode)
    if (completionSoundEnabled) {
      playSound('break');
    }
    // Haptic feedback
    vibrate('medium');
    // Mark that we're now in overflow
    setIsOverflow(true);
  }, [playSound, vibrate, completionSoundEnabled]);

  // Handle timer completion from worker (only called when overflow is disabled)
  const handleComplete = useCallback(() => {
    const sessionMode = state.mode;
    // Use one-off duration if set, otherwise use preset
    const sessionDuration = oneOffDuration ?? durationsRef.current[sessionMode];
    const wasWorkSession = sessionMode === 'work';

    // Save completed session to history with task data, preset info, and project
    const formattedTask = formatTasksForStorage(state.currentTask);
    const taskData = {
      ...(wasWorkSession && formattedTask && { task: formattedTask }),
      presetId: activePresetIdRef.current,
      ...(selectedProjectIdRef.current && { projectId: selectedProjectIdRef.current }),
      estimatedDuration: sessionDuration, // Planned duration (for rhythm tracking)
    };

    // Fire and forget - state is updated by SessionProvider
    void addSession(sessionMode, sessionDuration, taskData);

    // Save task to recent tasks (only for work sessions with a task)
    if (wasWorkSession && state.currentTask) {
      addRecentTasksFromInput(state.currentTask);
    }

    // Check for milestones (only for work sessions)
    // If a milestone is earned, the MilestoneMoment will show instead of normal celebration
    let milestoneEarned = false;
    if (wasWorkSession) {
      const milestone = checkForMilestones({
        lastSessionDurationSeconds: sessionDuration,
      });
      milestoneEarned = milestone !== undefined;
    }

    dispatch({ type: 'COMPLETE', durations: durationsRef.current, sessionsUntilLong: sessionsUntilLongRef.current });
    elapsedRef.current = 0;

    // Reset overflow state
    setIsOverflow(false);
    setOverflowSeconds(0);

    // Clear task after completion (only for work sessions)
    if (wasWorkSession) {
      dispatch({ type: 'CLEAR_TASK' });
    }

    // Reset one-off duration (next session uses preset)
    setOneOffDuration(null);

    // Haptic feedback on completion
    vibrate('medium');

    // Play completion sound (same sound for work and break sessions)
    // Skip if milestone was earned (milestone has its own sound)
    if (completionSoundEnabled && !milestoneEarned) {
      playSound('break');
    }

    // Play transition sound (Arrival: Focus→Break, Awakening: Break→Focus)
    if (wasWorkSession) {
      playSound('transition-arrival');
    } else {
      playSound('transition-awakening');
    }

    // Trigger auto-start countdown if enabled and conditions are met
    // Check: auto-start enabled, not in overflow mode, mode allows, daily goal not reached
    const isWorkToBreak = sessionMode === 'work';
    const autoStartAllowed = autoStartModeRef.current === 'all' || isWorkToBreak;

    // Calculate new today count after this session (for daily goal check and celebration)
    const newTodayCount = isWorkToBreak ? todayCount + 1 : todayCount;

    // Trigger celebration burst if enabled and conditions are met
    // Skip if milestone was earned (milestone has its own celebration)
    if (wasWorkSession && celebrationEnabledRef.current && !milestoneEarned) {
      const shouldTrigger =
        celebrationTriggerRef.current === 'every-session' ||
        (celebrationTriggerRef.current === 'daily-goal' &&
          dailyGoal !== null &&
          newTodayCount === dailyGoal);

      if (shouldTrigger) {
        setShouldTriggerBurst(true);
      }
    }

    // Calculate and set session feedback (only for work sessions)
    // Skip if milestone was earned (milestone has its own feedback)
    if (wasWorkSession && !milestoneEarned) {
      const totalCount = getTotalSessionCount();
      const feedback = calculateSessionFeedback(
        newTodayCount,
        totalCount,
        Math.round(sessionDuration / 60),
        0, // No overflow in normal completion
        state.currentTask || undefined,
        dailyGoal
      );
      setSessionFeedback(feedback);
    }

    const dailyGoalReached = dailyGoal !== null && newTodayCount >= dailyGoal;

    const shouldAutoStart =
      autoStartEnabledRef.current &&
      !overflowEnabledRef.current &&
      autoStartAllowed &&
      !dailyGoalReached;

    const countdownDelay = autoStartDelayRef.current;

    // Show toast if auto-start was blocked by daily goal
    if (autoStartEnabledRef.current && !overflowEnabledRef.current && autoStartAllowed && dailyGoalReached) {
      window.dispatchEvent(new CustomEvent('particle:toast', {
        detail: { message: 'Daily goal reached · Auto-start paused' }
      }));
    }

    if (shouldAutoStart) {
      setTimeout(() => {
        dispatch({ type: 'START_AUTO_COUNTDOWN', delay: countdownDelay });
      }, 100);
    }

    // Check for contextual hint after celebration (3.5s delay)
    if (wasWorkSession) {
      setTimeout(() => {
        const hint = checkForHint();
        if (hint) {
          setContextualHint(hint);
          markHintShown();
        }
      }, 3500);
    }
  }, [playSound, state.mode, state.currentTask, vibrate, completionSoundEnabled, oneOffDuration, todayCount, dailyGoal, setShouldTriggerBurst, checkForMilestones, checkForHint, markHintShown, addSession, getTotalSessionCount]);

  // Initialize Web Worker timer
  const {
    start: workerStart,
    pause: workerPause,
    reset: workerReset,
  } = useTimerWorker(durations[state.mode], {
    onTick: handleTick,
    onComplete: handleComplete,
    onReachedZero: handleReachedZero,
  });

  // Update tab title
  useEffect(() => {
    if (state.isRunning) {
      // In overflow: show total worked time (session duration + overflow)
      // Use oneOffDuration if set (custom duration from smart input), otherwise preset
      const sessionDuration = oneOffDuration ?? durationsRef.current[state.mode];
      const displayTime = isOverflow
        ? formatTime(sessionDuration + overflowSeconds)
        : formatTime(state.timeRemaining);
      document.title = TAB_TITLES.running(displayTime, SESSION_LABELS[state.mode]);
    } else if (state.isPaused) {
      // Use oneOffDuration if set (custom duration from smart input), otherwise preset
      const sessionDuration = oneOffDuration ?? durationsRef.current[state.mode];
      const displayTime = isOverflow
        ? formatTime(sessionDuration + overflowSeconds)
        : formatTime(state.timeRemaining);
      document.title = TAB_TITLES.paused(displayTime, SESSION_LABELS[state.mode]);
    } else {
      document.title = TAB_TITLES.idle;
    }
  }, [state.isRunning, state.isPaused, state.timeRemaining, state.mode, isOverflow, overflowSeconds, oneOffDuration]);

  // Sync worker with running state
  useEffect(() => {
    if (state.isRunning) {
      // Use oneOffDuration if set (custom duration from smart input), otherwise preset
      const duration = oneOffDurationRef.current ?? durationsRef.current[state.mode];
      const elapsed = duration - state.timeRemaining;
      // Pass overflowEnabled to worker
      workerStart(duration, elapsed, overflowEnabledRef.current);
    } else if (!state.isRunning && state.isPaused) {
      workerPause();
      // Use oneOffDuration if set for elapsed calculation
      const duration = oneOffDurationRef.current ?? durationsRef.current[state.mode];
      elapsedRef.current = duration - state.timeRemaining;
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

  // Reset celebration burst trigger when celebration ends
  useEffect(() => {
    if (!state.showCelebration) {
      setShouldTriggerBurst(false);
    }
  }, [state.showCelebration, setShouldTriggerBurst]);

  // Hide skip message after 2 seconds
  useEffect(() => {
    if (state.showSkipMessage) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'HIDE_SKIP_MESSAGE' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.showSkipMessage]);

  // Auto-start countdown tick
  useEffect(() => {
    if (state.autoStartCountdown === null) return;

    // When countdown reaches 0, play sound and start session
    if (state.autoStartCountdown === 0) {
      playSound('autostart');
      dispatch({ type: 'START' }); // START clears autoStartCountdown
      return;
    }

    const interval = setInterval(() => {
      dispatch({ type: 'TICK_AUTO_COUNTDOWN' });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.autoStartCountdown, playSound]);

  // Hide max limit message after 2 seconds
  useEffect(() => {
    if (showMaxLimitMessage) {
      const timeout = setTimeout(() => {
        setShowMaxLimitMessage(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showMaxLimitMessage]);

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

  // Convergence animation trigger at 3 seconds remaining (work sessions only)
  // Single continuous 3-second animation: slowing → convergence
  useEffect(() => {
    // Only trigger for work sessions when running
    if (!state.isRunning || state.mode !== 'work') {
      return;
    }

    // Refresh slot position at 4 seconds (before animation starts)
    if (state.timeRemaining === 4 && !slowingTriggeredRef.current && !document.hidden) {
      setRefreshPositionTrigger(prev => prev + 1);
    }

    // Start the complete animation at 3 seconds
    // Skip if document is hidden (tab not visible) - animation wouldn't be seen anyway
    if (state.timeRemaining === 3 && !convergenceTriggeredRef.current && nextSlotPosition && !document.hidden) {
      convergenceTriggeredRef.current = true;
      slowingTriggeredRef.current = true;
      setVisualState('converging');
      setConvergenceTarget(nextSlotPosition);

      // Start glow effect at ~0.3s before arrival (2.7s into 3s animation)
      // Store in ref to prevent cleanup from canceling it when timeRemaining changes
      glowTimeoutRef.current = setTimeout(() => {
        setShowSlotGlow(true);
      }, 2700);
    }
  }, [state.timeRemaining, state.isRunning, state.mode, nextSlotPosition, setVisualState, setConvergenceTarget]);

  // Handle tab visibility change during slowing/convergence
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If tab becomes hidden during slowing or convergence, skip to normal state
      if (document.hidden && (convergenceTriggeredRef.current || slowingTriggeredRef.current)) {
        setVisualState(state.mode === 'work' ? 'focus' : 'break');
        setShowSlotGlow(false);
        setConvergenceTarget(null);
        slowingTriggeredRef.current = false;
        // Clear pending glow/sound timeout
        if (glowTimeoutRef.current) {
          clearTimeout(glowTimeoutRef.current);
          glowTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.mode, setVisualState, setConvergenceTarget]);

  // Reset convergence and slowing state when session completes or mode changes
  useEffect(() => {
    if (!state.isRunning) {
      convergenceTriggeredRef.current = false;
      slowingTriggeredRef.current = false;
      setShowSlotGlow(false);
      setConvergenceTarget(null);
      // Clear any pending glow/sound timeout
      if (glowTimeoutRef.current) {
        clearTimeout(glowTimeoutRef.current);
        glowTimeoutRef.current = null;
      }
    }
  }, [state.isRunning, state.mode, setConvergenceTarget]);

  // Sync visual effects state with timer state
  useEffect(() => {
    if (state.showCelebration) {
      setVisualState('completed');
      setParticlesPaused(false);
    } else if (state.isRunning && !convergenceTriggeredRef.current && !slowingTriggeredRef.current) {
      // Only set focus/break state if not converging or slowing
      setVisualState(state.mode === 'work' ? 'focus' : 'break');
      setParticlesPaused(false);
    } else if (state.isPaused) {
      // Keep visual state active but pause particles (freeze in place)
      setVisualState(state.mode === 'work' ? 'focus' : 'break');
      setParticlesPaused(true);
    } else if (!state.isRunning && !state.isPaused && !state.showCelebration) {
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

  // Cancel session (stop without switching to next phase)
  // "Forest kills your tree. Particle doesn't."
  // Sessions ≥60s are saved with actual duration. No judgment, no punishment.
  const handleCancel = useCallback(() => {
    const sessionMode = state.mode;
    // Use one-off duration if set, otherwise use preset
    const fullDuration = oneOffDurationRef.current ?? durationsRef.current[sessionMode];
    // Calculate elapsed time
    const currentOverflowSeconds = overflowSecondsRef.current;
    const elapsedTime = isOverflow
      ? fullDuration + currentOverflowSeconds
      : fullDuration - state.timeRemaining;
    const isWorkSession = sessionMode === 'work';

    // Stop the timer
    workerPause();

    // Save particle if ≥60 seconds elapsed (only for work sessions)
    if (elapsedTime >= 60 && isWorkSession) {
      const formattedTask = formatTasksForStorage(state.currentTask);
      const taskData = {
        ...(formattedTask && { task: formattedTask }),
        presetId: activePresetIdRef.current,
        ...(selectedProjectIdRef.current && { projectId: selectedProjectIdRef.current }),
        ...(isOverflow && currentOverflowSeconds > 0 && { overflowDuration: currentOverflowSeconds }),
        estimatedDuration: fullDuration,
      };

      // Save with actual elapsed time - state is updated by SessionProvider
      void addSession(sessionMode, elapsedTime, taskData);

      // Show feedback with saved time (sessions will update via context)
      const minutes = Math.round(elapsedTime / 60);
      setToastMessage(`Session ended · ${minutes} min saved`);
    } else {
      // Show simple feedback (nothing saved)
      setToastMessage('Session ended');
    }

    // Reset to ready state (same mode, full duration)
    dispatch({ type: 'SET_MODE', mode: sessionMode, durations: durationsRef.current });
    workerReset(durationsRef.current[sessionMode]);
    elapsedRef.current = 0;

    // Reset overflow state
    setIsOverflow(false);
    setOverflowSeconds(0);

    // Clear task when cancelling work session
    if (isWorkSession) {
      dispatch({ type: 'CLEAR_TASK' });
    }

    // Reset one-off duration
    setOneOffDuration(null);

    // Light haptic feedback
    vibrate('light');
  }, [state.mode, state.timeRemaining, state.currentTask, isOverflow, workerPause, workerReset, vibrate, addSession]);

  // Skip session (complete early with actual elapsed time)
  const handleSkip = useCallback(() => {
    const sessionMode = state.mode;
    // Use refs to get current values (avoid closure issues)
    const currentOverflowSeconds = overflowSecondsRef.current;
    // Use one-off duration if set, otherwise use preset
    const fullDuration = oneOffDurationRef.current ?? durationsRef.current[sessionMode];
    // Include overflow time in elapsed calculation
    const elapsedTime = isOverflow
      ? fullDuration + currentOverflowSeconds
      : fullDuration - state.timeRemaining;
    const isWorkSession = sessionMode === 'work';

    // Only save if > 60 seconds elapsed (minimum threshold)
    if (elapsedTime > 60) {
      const formattedTask = formatTasksForStorage(state.currentTask);
      const taskData = {
        ...(isWorkSession && formattedTask && { task: formattedTask }),
        presetId: activePresetIdRef.current,
        ...(selectedProjectIdRef.current && { projectId: selectedProjectIdRef.current }),
        // Track overflow separately
        ...(isOverflow && currentOverflowSeconds > 0 && { overflowDuration: currentOverflowSeconds }),
        estimatedDuration: fullDuration, // Planned duration (for rhythm tracking)
      };

      // Save ACTUAL elapsed time (including overflow) - state is updated by SessionProvider
      void addSession(sessionMode, elapsedTime, taskData);
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

    // Reset overflow state
    setIsOverflow(false);
    setOverflowSeconds(0);

    playSound('break');
    vibrate('light');

    // Track early stop for contextual hints (work sessions only)
    if (isWorkSession) {
      trackEarlyStop();
    }

    // Clear task when skipping work session
    if (isWorkSession) {
      dispatch({ type: 'CLEAR_TASK' });
    }

    // Reset one-off duration (next session uses preset)
    setOneOffDuration(null);
  }, [state.mode, state.timeRemaining, state.currentTask, state.completedPomodoros, isOverflow, playSound, vibrate, workerReset, trackEarlyStop, addSession]);

  // Complete session from overflow mode (Enter key in overflow)
  // This is a proper completion that increments the counter
  const handleCompleteFromOverflow = useCallback(() => {
    if (!isOverflow) return;

    const sessionMode = state.mode;
    // Use refs to get current values (avoid closure issues)
    const currentOverflowSeconds = overflowSecondsRef.current;
    // Use one-off duration if set, otherwise use preset
    const fullDuration = oneOffDurationRef.current ?? durationsRef.current[sessionMode];
    const totalDuration = fullDuration + currentOverflowSeconds;
    const wasWorkSession = sessionMode === 'work';

    // Save session with full duration + overflow
    const formattedTask = formatTasksForStorage(state.currentTask);
    const taskData = {
      ...(wasWorkSession && formattedTask && { task: formattedTask }),
      presetId: activePresetIdRef.current,
      ...(selectedProjectIdRef.current && { projectId: selectedProjectIdRef.current }),
      // Track overflow separately
      ...(currentOverflowSeconds > 0 && { overflowDuration: currentOverflowSeconds }),
      estimatedDuration: fullDuration, // Planned duration (for rhythm tracking)
    };

    // Fire and forget - state is updated by SessionProvider
    void addSession(sessionMode, totalDuration, taskData);

    // Save task to recent tasks (only for work sessions with a task)
    if (wasWorkSession && state.currentTask) {
      addRecentTasksFromInput(state.currentTask);
    }

    // Check for milestones (only for work sessions)
    let milestoneEarned = false;
    if (wasWorkSession) {
      const milestone = checkForMilestones({
        lastSessionDurationSeconds: totalDuration,
      });
      milestoneEarned = milestone !== undefined;
    }

    // Track overflow for contextual hints (work sessions only)
    if (wasWorkSession) {
      trackOverflow();
    }

    // Proper COMPLETE action (increments counter, shows celebration)
    dispatch({ type: 'COMPLETE', durations: durationsRef.current, sessionsUntilLong: sessionsUntilLongRef.current });

    // Reset worker to next session
    const isWork = sessionMode === 'work';
    const newCount = isWork ? state.completedPomodoros + 1 : state.completedPomodoros;
    const nextMode: SessionType = isWork
      ? (newCount % sessionsUntilLongRef.current === 0 ? 'longBreak' : 'shortBreak')
      : 'work';
    workerReset(durationsRef.current[nextMode]);
    elapsedRef.current = 0;

    // Reset overflow state
    setIsOverflow(false);
    setOverflowSeconds(0);

    // Clear task after completion (only for work sessions)
    if (wasWorkSession) {
      dispatch({ type: 'CLEAR_TASK' });
    }

    // Reset one-off duration (next session uses preset)
    setOneOffDuration(null);

    vibrate('medium');

    // Play transition sound (Arrival: Focus→Break, Awakening: Break→Focus)
    if (wasWorkSession) {
      playSound('transition-arrival');
    } else {
      playSound('transition-awakening');
    }

    // Trigger auto-start countdown if enabled and conditions are met
    const isWorkToBreak = sessionMode === 'work';
    const autoStartAllowed = autoStartModeRef.current === 'all' || isWorkToBreak;

    // Calculate new today count after this session (for daily goal check and celebration)
    const newTodayCount = isWorkToBreak ? todayCount + 1 : todayCount;

    // Trigger celebration burst if enabled and conditions are met
    // Skip if milestone was earned (milestone has its own celebration)
    if (wasWorkSession && celebrationEnabledRef.current && !milestoneEarned) {
      const shouldTrigger =
        celebrationTriggerRef.current === 'every-session' ||
        (celebrationTriggerRef.current === 'daily-goal' &&
          dailyGoal !== null &&
          newTodayCount === dailyGoal);

      if (shouldTrigger) {
        setShouldTriggerBurst(true);
      }
    }

    // Calculate and set session feedback (only for work sessions)
    // Skip if milestone was earned (milestone has its own feedback)
    if (wasWorkSession && !milestoneEarned) {
      const totalSessionCount = getTotalSessionCount();
      const feedback = calculateSessionFeedback(
        newTodayCount,
        totalSessionCount,
        Math.round(totalDuration / 60),
        currentOverflowSeconds,
        state.currentTask || undefined,
        dailyGoal
      );
      setSessionFeedback(feedback);
    }

    const dailyGoalReached = dailyGoal !== null && newTodayCount >= dailyGoal;

    const shouldAutoStart =
      autoStartEnabledRef.current &&
      autoStartAllowed &&
      !dailyGoalReached;

    const countdownDelay = autoStartDelayRef.current;

    // Show toast if auto-start was blocked by daily goal
    if (autoStartEnabledRef.current && autoStartAllowed && dailyGoalReached) {
      window.dispatchEvent(new CustomEvent('particle:toast', {
        detail: { message: 'Daily goal reached · Auto-start paused' }
      }));
    }

    if (shouldAutoStart) {
      setTimeout(() => {
        dispatch({ type: 'START_AUTO_COUNTDOWN', delay: countdownDelay });
      }, 100);
    }

    // Check for contextual hint after celebration (3.5s delay)
    if (wasWorkSession) {
      setTimeout(() => {
        const hint = checkForHint();
        if (hint) {
          setContextualHint(hint);
          markHintShown();
        }
      }, 3500);
    }
  }, [isOverflow, state.mode, state.currentTask, state.completedPomodoros, vibrate, workerReset, playSound, todayCount, dailyGoal, setShouldTriggerBurst, checkForMilestones, trackOverflow, checkForHint, markHintShown, addSession, getTotalSessionCount]);

  // End session early with success (E key confirmation)
  // This is a proper completion with elapsed time - user earns the particle
  const handleEndEarly = useCallback(() => {
    const sessionMode = state.mode;
    // Use one-off duration if set, otherwise use preset
    const fullDuration = oneOffDurationRef.current ?? durationsRef.current[sessionMode];
    // Calculate elapsed time (how much they actually worked)
    const elapsedTime = fullDuration - state.timeRemaining;
    const wasWorkSession = sessionMode === 'work';

    // Save session with ELAPSED time (user earned this time)
    const formattedTask = formatTasksForStorage(state.currentTask);
    const taskData = {
      ...(wasWorkSession && formattedTask && { task: formattedTask }),
      presetId: activePresetIdRef.current,
      ...(selectedProjectIdRef.current && { projectId: selectedProjectIdRef.current }),
      estimatedDuration: fullDuration, // Planned duration (for rhythm tracking)
    };

    // Fire and forget - state is updated by SessionProvider
    void addSession(sessionMode, elapsedTime, taskData);

    // Save task to recent tasks (only for work sessions with a task)
    if (wasWorkSession && state.currentTask) {
      addRecentTasksFromInput(state.currentTask);
    }

    // Check for milestones (only for work sessions)
    let milestoneEarned = false;
    if (wasWorkSession) {
      const milestone = checkForMilestones({
        lastSessionDurationSeconds: elapsedTime,
      });
      milestoneEarned = milestone !== undefined;
    }

    // Proper COMPLETE action (increments counter, shows celebration)
    dispatch({ type: 'COMPLETE', durations: durationsRef.current, sessionsUntilLong: sessionsUntilLongRef.current });

    // Reset worker to next session
    const isWork = sessionMode === 'work';
    const newCount = isWork ? state.completedPomodoros + 1 : state.completedPomodoros;
    const nextMode: SessionType = isWork
      ? (newCount % sessionsUntilLongRef.current === 0 ? 'longBreak' : 'shortBreak')
      : 'work';
    workerReset(durationsRef.current[nextMode]);
    elapsedRef.current = 0;

    // Reset overflow state
    setIsOverflow(false);
    setOverflowSeconds(0);

    // Clear task after completion (only for work sessions)
    if (wasWorkSession) {
      dispatch({ type: 'CLEAR_TASK' });
    }

    // Reset one-off duration (next session uses preset)
    setOneOffDuration(null);

    vibrate('medium');

    // Play completion sound
    // Skip if milestone was earned (milestone has its own sound)
    if (completionSoundEnabled && !milestoneEarned) {
      playSound('break');
    }

    // Play transition sound (Arrival: Focus→Break, Awakening: Break→Focus)
    if (wasWorkSession) {
      playSound('transition-arrival');
    } else {
      playSound('transition-awakening');
    }

    // Trigger auto-start countdown if enabled and conditions are met
    const isWorkToBreak = sessionMode === 'work';
    const autoStartAllowed = autoStartModeRef.current === 'all' || isWorkToBreak;

    // Calculate new today count after this session (for daily goal check and celebration)
    const newTodayCount = isWorkToBreak ? todayCount + 1 : todayCount;

    // Trigger celebration burst if enabled and conditions are met
    // Skip if milestone was earned (milestone has its own celebration)
    if (wasWorkSession && celebrationEnabledRef.current && !milestoneEarned) {
      const shouldTrigger =
        celebrationTriggerRef.current === 'every-session' ||
        (celebrationTriggerRef.current === 'daily-goal' &&
          dailyGoal !== null &&
          newTodayCount === dailyGoal);

      if (shouldTrigger) {
        setShouldTriggerBurst(true);
      }
    }

    // Calculate and set session feedback (only for work sessions)
    // Skip if milestone was earned (milestone has its own feedback)
    if (wasWorkSession && !milestoneEarned) {
      const totalSessionCount = getTotalSessionCount();
      const feedback = calculateSessionFeedback(
        newTodayCount,
        totalSessionCount,
        Math.round(elapsedTime / 60),
        0, // No overflow when ending early
        state.currentTask || undefined,
        dailyGoal
      );
      setSessionFeedback(feedback);
    }

    const dailyGoalReached = dailyGoal !== null && newTodayCount >= dailyGoal;

    const shouldAutoStart =
      autoStartEnabledRef.current &&
      autoStartAllowed &&
      !dailyGoalReached;

    const countdownDelay = autoStartDelayRef.current;

    // Show toast if auto-start was blocked by daily goal
    if (autoStartEnabledRef.current && autoStartAllowed && dailyGoalReached) {
      window.dispatchEvent(new CustomEvent('particle:toast', {
        detail: { message: 'Daily goal reached · Auto-start paused' }
      }));
    }

    if (shouldAutoStart) {
      setTimeout(() => {
        dispatch({ type: 'START_AUTO_COUNTDOWN', delay: countdownDelay });
      }, 100);
    }
  }, [state.mode, state.timeRemaining, state.currentTask, state.completedPomodoros, vibrate, workerReset, playSound, completionSoundEnabled, todayCount, dailyGoal, setShouldTriggerBurst, checkForMilestones, addSession, getTotalSessionCount]);

  // Start/Pause handlers with sound
  const handleStart = useCallback(() => {
    // Check if we should intercept (e.g., for onboarding)
    if (onBeforeStart && !onBeforeStart()) {
      return; // Prevented - onboarding will handle it
    }
    playSound('timer-start');
    vibrate('light');
    trackSessionStart(); // Track for contextual hints (first-week milestone)
    dispatch({ type: 'START' });
    setPickedTaskIndex(null); // Reset random pick when session starts
  }, [onBeforeStart, playSound, vibrate, trackSessionStart]);

  // Force start (bypasses onBeforeStart) - used after onboarding completes
  const forceStart = useCallback(() => {
    playSound('timer-start');
    vibrate('light');
    trackSessionStart(); // Track for contextual hints (first-week milestone)
    dispatch({ type: 'START' });
    setPickedTaskIndex(null);
  }, [playSound, vibrate, trackSessionStart]);

  // Listen for force start event (after onboarding)
  useEffect(() => {
    function handleForceStart() {
      forceStart();
    }
    window.addEventListener('particle:start-timer', handleForceStart);
    return () => window.removeEventListener('particle:start-timer', handleForceStart);
  }, [forceStart]);

  const handlePause = useCallback(() => {
    playSound('timer-pause');
    vibrate('double');
    dispatch({ type: 'PAUSE' });
  }, [playSound, vibrate]);

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
          // Cancel auto-start countdown if active
          if (state.autoStartCountdown !== null && state.autoStartCountdown > 0) {
            dispatch({ type: 'CANCEL_AUTO_COUNTDOWN' });
          } else if (state.isRunning) {
            handlePause();
          } else {
            handleStart();
          }
          break;
        case 'Escape':
          // Cancel particle select mode if active
          if (particleSelectMode) {
            e.preventDefault();
            setParticleSelectMode(false);
            if (particleSelectTimeoutRef.current) {
              clearTimeout(particleSelectTimeoutRef.current);
              particleSelectTimeoutRef.current = null;
            }
            break;
          }
          // Cancel auto-start countdown if active
          if (state.autoStartCountdown !== null && state.autoStartCountdown > 0) {
            e.preventDefault();
            dispatch({ type: 'CANCEL_AUTO_COUNTDOWN' });
            break;
          }
          // Cancel running session
          // "Forest kills your tree. Particle doesn't."
          if (state.isRunning || state.isPaused) {
            e.preventDefault();
            handleCancel();
          }
          break;
        // O = Open particle select mode
        case 'o':
        case 'O':
          if (!showParticleDetailOverlay && !showDailyGoalOverlay) {
            // Get fresh sessions from localStorage to ensure we have current data
            const freshSessions = getTodaySessions();
            if (freshSessions.length > 0) {
              e.preventDefault();
              // Update state to sync with localStorage
              setTodaySessions(freshSessions);
              setTodayCount(freshSessions.length);
              setParticleSelectMode(true);
              // Auto-cancel after 2 seconds
              if (particleSelectTimeoutRef.current) {
                clearTimeout(particleSelectTimeoutRef.current);
              }
              particleSelectTimeoutRef.current = setTimeout(() => {
                setParticleSelectMode(false);
                particleSelectTimeoutRef.current = null;
              }, 2000);
            }
          }
          break;
        case 's':
        case 'S':
          handleSkip();
          break;
        case 'd':
        case 'D':
          {
            // Cycle through appearance modes: light → dark → system → light
            const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
            const currentIndex = modes.indexOf(appearanceMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            setAppearanceMode(nextMode);
            const modeLabels = { light: 'Light mode', dark: 'Dark mode', system: 'System mode' };
            window.dispatchEvent(new CustomEvent('particle:toast', {
              detail: { message: modeLabels[nextMode] }
            }));
          }
          break;
        // Number keys: Particle select (when in mode) or Preset switching (1-4)
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          if (particleSelectMode) {
            e.preventDefault();
            const particleNum = parseInt(e.key, 10);
            // Get fresh sessions from localStorage to avoid stale state
            const currentSessions = getTodaySessions();
            // Sessions are newest-first, so index = length - particleNum
            const sessionIndex = currentSessions.length - particleNum;
            if (sessionIndex >= 0 && sessionIndex < currentSessions.length) {
              const session = currentSessions[sessionIndex];
              setSelectedParticleId(session.id);
              setShowParticleDetailOverlay(true);
            }
            // Cancel select mode
            setParticleSelectMode(false);
            if (particleSelectTimeoutRef.current) {
              clearTimeout(particleSelectTimeoutRef.current);
              particleSelectTimeoutRef.current = null;
            }
          } else if (!state.isRunning) {
            // Preset switching (only 1-4)
            const presets: Record<string, string> = {
              '1': 'classic',
              '2': 'deepWork',
              '3': 'ultradian',
              '4': 'custom',
            };
            const preset = presets[e.key];
            if (preset) {
              applyPreset(preset as 'classic' | 'deepWork' | 'ultradian' | 'custom');
            }
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
        // E = End/Cancel session (same as Escape, but faster to reach)
        case 'e':
        case 'E':
          if (state.isRunning || state.isPaused) {
            e.preventDefault();
            handleCancel();
          }
          break;
        // Sound controls
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'a':
        case 'A':
          if (e.shiftKey) {
            // Shift+A = Toggle Auto-Start
            e.preventDefault();
            const newEnabled = !autoStartEnabled;
            setAutoStartEnabled(newEnabled);
            // Dispatch toast event
            window.dispatchEvent(new CustomEvent('particle:toast', {
              detail: { message: newEnabled ? 'Auto-Start enabled' : 'Auto-Start disabled' }
            }));
          } else {
            cycleAmbientType();
          }
          break;
        // Task input focus (only when idle and in work mode)
        case 't':
        case 'T':
          // Always allow focusing task input in work mode
          if (state.mode === 'work') {
            e.preventDefault();
            // Dispatch event to trigger edit mode in UnifiedTaskInput
            window.dispatchEvent(new CustomEvent('particle:focus-task-input'));
          }
          break;
        // Enter = Complete from overflow (Done)
        case 'Enter':
          if (isOverflow && state.isRunning) {
            e.preventDefault();
            handleCompleteFromOverflow();
          }
          break;
        // B = Start break immediately (in overflow)
        case 'b':
        case 'B':
          if (isOverflow && state.isRunning) {
            e.preventDefault();
            handleCompleteFromOverflow();
          }
          break;
        // R = Pick random task
        case 'r':
        case 'R':
          e.preventDefault();
          {
            const parsed = parseMultiLineInput(state.currentTask);
            const pendingIndices = parsed.tasks
              .map((t, i) => ({ task: t, index: i }))
              .filter(({ task }) => !task.completed)
              .map(({ index }) => index);

            if (pendingIndices.length < 2) {
              window.dispatchEvent(new CustomEvent('particle:toast', {
                detail: { message: 'Need 2+ tasks to pick' }
              }));
              return;
            }

            // Exclude current pick to ensure a different task is picked
            const pickable = pendingIndices.filter(i => i !== pickedTaskIndex);
            const randomIdx = pickable[Math.floor(Math.random() * pickable.length)];
            setPickedTaskIndex(randomIdx);
          }
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isRunning, state.mode, state.isPaused, state.autoStartCountdown, state.currentTask, isOverflow, appearanceMode, setAppearanceMode, toggleMute, cycleAmbientType, applyPreset, handleSkip, handleCancel, handleCompleteFromOverflow, autoStartEnabled, setAutoStartEnabled, particleSelectMode, todaySessions, showParticleDetailOverlay, showDailyGoalOverlay, pickedTaskIndex, handleStart, handlePause, getTodaySessions]);

  const handleModeChange = useCallback((mode: SessionType) => {
    dispatch({ type: 'SET_MODE', mode, durations: durationsRef.current });
    workerReset(durationsRef.current[mode]);
    elapsedRef.current = 0;
    // Reset overflow state
    setIsOverflow(false);
    setOverflowSeconds(0);
  }, [workerReset]);

  // Open settings via custom event
  const handleOpenSettings = useCallback(() => {
    window.dispatchEvent(new CustomEvent('particle:open-settings'));
  }, []);

  // Toggle auto-start (for command palette)
  const handleToggleAutoStart = useCallback(() => {
    const newEnabled = !autoStartEnabled;
    setAutoStartEnabled(newEnabled);
    // Dispatch toast event
    window.dispatchEvent(new CustomEvent('particle:toast', {
      detail: { message: newEnabled ? 'Auto-Start enabled' : 'Auto-Start disabled' }
    }));
  }, [autoStartEnabled, setAutoStartEnabled]);

  // Pick random task (for command palette)
  const handlePickRandomTask = useCallback(() => {
    const parsed = parseMultiLineInput(state.currentTask);
    const pendingIndices = parsed.tasks
      .map((t, i) => ({ task: t, index: i }))
      .filter(({ task }) => !task.completed)
      .map(({ index }) => index);

    if (pendingIndices.length < 2) {
      window.dispatchEvent(new CustomEvent('particle:toast', {
        detail: { message: 'Need 2+ tasks to pick' }
      }));
      return;
    }

    // Exclude current pick to ensure a different task is picked
    const pickable = pendingIndices.filter(i => i !== pickedTaskIndex);
    const randomIdx = pickable[Math.floor(Math.random() * pickable.length)];
    setPickedTaskIndex(randomIdx);
  }, [state.currentTask, pickedTaskIndex]);

  // Task handlers
  const handleTaskChange = useCallback((task: string) => {
    dispatch({ type: 'SET_TASK', task });
    setPickedTaskIndex(null); // Reset random pick when task text changes
  }, []);

  // Start session when pressing Enter in task input
  const handleTaskEnter = useCallback(() => {
    if (!state.isRunning && !state.isPaused) {
      handleStart();
    }
  }, [state.isRunning, state.isPaused, handleStart]);

  // Handle smart task input with custom duration (e.g., "Meeting 30")
  const handleTaskSubmitWithDuration = useCallback((
    task: string | null,
    durationSeconds: number,
    wasLimited: boolean
  ) => {
    // Set task if provided
    if (task) {
      dispatch({ type: 'SET_TASK', task });
    }

    // Store one-off duration
    setOneOffDuration(durationSeconds);

    // Show max limit message if capped
    if (wasLimited) {
      setShowMaxLimitMessage(true);
    }

    // Set time to custom duration (prevents worker-sync effect from overriding)
    dispatch({ type: 'SET_TIME', time: durationSeconds });

    // Start timer with custom duration
    workerStart(durationSeconds, 0, overflowEnabledRef.current);
    dispatch({ type: 'START' });
    vibrate('light');
    setPickedTaskIndex(null); // Reset random pick when session starts
  }, [workerStart, vibrate]);

  // Handle end confirmation (must be before early return to follow hooks rules)
  // Uses handleEndEarly for proper completion with elapsed time (user earns the particle)
  const handleEndConfirm = useCallback(() => {
    handleEndEarly();
    setShowEndConfirmation(false);
  }, [handleEndEarly]);

  const handleEndCancel = useCallback(() => {
    setShowEndConfirmation(false);
  }, []);

  // Particle detail overlay handlers
  const handleParticleClick = useCallback((sessionId: string) => {
    setSelectedParticleId(sessionId);
    setShowParticleDetailOverlay(true);
  }, []);

  // Calculate particle index (1-based, oldest first) for display
  const selectedParticleIndex = useMemo(() => {
    if (!selectedParticleId || todaySessions.length === 0) return undefined;
    // todaySessions is newest-first, so we reverse the index
    const newestFirstIndex = todaySessions.findIndex(s => s.id === selectedParticleId);
    if (newestFirstIndex === -1) return undefined;
    // Convert to 1-based oldest-first index
    return todaySessions.length - newestFirstIndex;
  }, [selectedParticleId, todaySessions]);

  const handleParticleOverlayClose = useCallback(() => {
    setShowParticleDetailOverlay(false);
    setSelectedParticleId(null);
  }, []);

  const handleSessionUpdated = useCallback(() => {
    const sessions = getTodaySessions();
    setTodaySessions(sessions);
    setTodayCount(sessions.length);
  }, [getTodaySessions]);

  const handleSessionDeleted = useCallback(() => {
    const sessions = getTodaySessions();
    setTodaySessions(sessions);
    setTodayCount(sessions.length);
  }, [getTodaySessions]);

  // Show skeleton while settings or sessions are loading to prevent layout shift
  if (!isLoaded || sessionsLoading) {
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

      {/* Daily Goal Overlay */}
      <DailyGoalOverlay
        isOpen={showDailyGoalOverlay}
        onClose={() => setShowDailyGoalOverlay(false)}
        currentGoal={dailyGoal}
        todayCount={todayCount}
        onGoalChange={setDailyGoal}
      />

      {/* Particle Detail Overlay */}
      <ParticleDetailOverlay
        isOpen={showParticleDetailOverlay}
        sessionId={selectedParticleId}
        particleIndex={selectedParticleIndex}
        onClose={handleParticleOverlayClose}
        onSessionUpdated={handleSessionUpdated}
        onSessionDeleted={handleSessionDeleted}
        projects={activeProjects}
        recentProjectIds={recentProjectIds}
      />

      {/* Command Palette Registration */}
      <CommandRegistration
        timerIsRunning={state.isRunning}
        timerIsPaused={state.isPaused}
        isMuted={muted}
        autoStartEnabled={autoStartEnabled}
        appearanceMode={appearanceMode}
        isDarkMode={isDarkMode}
        onStart={handleStart}
        onPause={handlePause}
        onSkip={handleSkip}
        onOpenSettings={handleOpenSettings}
        onToggleMute={toggleMute}
        onPresetChange={applyPreset}
        onToggleAutoStart={handleToggleAutoStart}
        onCycleAppearanceMode={() => {
          const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
          const currentIndex = modes.indexOf(appearanceMode);
          setAppearanceMode(modes[(currentIndex + 1) % modes.length]);
        }}
        pendingTaskCount={pendingTaskCount}
        onPickRandomTask={handlePickRandomTask}
      />

      {/* Preset selector */}
      <PresetSelector
        disabled={state.isRunning}
        isSessionActive={state.isRunning || state.isPaused}
        currentMode={state.mode}
        durations={durations}
        nextBreakIsLong={(state.completedPomodoros + 1) % sessionsUntilLong === 0}
        overrideWorkDuration={oneOffDuration}
        autoStartEnabled={autoStartEnabled}
        overflowEnabled={overflowEnabled}
        onPresetHover={setHoveredPresetId}
        onCollapsedHover={setIsCollapsedHovered}
        onModeIndicatorHover={setHoveredModeIndicator}
      />

      {/* Timer display - clickable to open timeline */}
      <button
        onClick={onTimelineOpen}
        className="bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-0 rounded-xl p-2 -m-2 transition-opacity hover:opacity-80"
        aria-label="Open timeline"
      >
        <TimerDisplay
          timeRemaining={state.timeRemaining}
          isRunning={state.isRunning}
          showCelebration={state.showCelebration}
          isOverflow={isOverflow}
          overflowSeconds={overflowSeconds}
          sessionDuration={oneOffDuration ?? durations[state.mode]}
          isBreak={state.mode !== 'work'}
          breakBreathingEnabled={breakBreathingEnabled}
        />
      </button>

      {/* Unified task and project input (only for work sessions) */}
      {state.mode === 'work' && !projectsLoading && (
        <UnifiedTaskInput
          taskText={state.currentTask}
          onTaskChange={handleTaskChange}
          onEnter={handleTaskEnter}
          onSubmitWithDuration={handleTaskSubmitWithDuration}
          projectId={selectedProjectId}
          onProjectSelect={selectProject}
          projects={activeProjects}
          recentProjectIds={recentProjectIds}
          disabled={false}
          inputRef={taskInputRef}
          isSessionRunning={state.isRunning}
          pickedTaskIndex={pickedTaskIndex}
        />
      )}

      {/* Controls */}
      <TimerControls
        isRunning={state.isRunning}
        isPaused={state.isPaused}
        onStart={handleStart}
        onPause={handlePause}
        onComplete={handleCompleteFromOverflow}
        mode={state.mode}
        isOverflow={isOverflow}
      />

      {/* Session counter */}
      <SessionCounter
        count={state.completedPomodoros}
        sessionsUntilLong={sessionsUntilLong}
        onNextSlotPosition={setNextSlotPosition}
        showGlow={showSlotGlow}
        refreshPositionTrigger={refreshPositionTrigger}
        dailyGoal={dailyGoal}
        todayCount={todayCount}
        onCounterClick={() => setShowDailyGoalOverlay(true)}
        todaySessions={todaySessions}
        projectNameMap={projectNameMap}
        onParticleHover={(info) => setParticleHoverInfo(info?.displayText ?? null)}
        onParticleClick={handleParticleClick}
        particleSelectMode={particleSelectMode}
      />

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

      {/* Fixed status message slot at bottom of screen */}
      <StatusMessage
        message={
          toastMessage
            ? toastMessage
            : contextualHint
              ? contextualHint
              : welcomeMessage
                ? welcomeMessage
                : showMaxLimitMessage
                  ? 'Maximum 180 min'
                  : state.showSkipMessage
                    ? `Skipped to ${SESSION_LABELS[state.mode]}`
                    : particleSelectMode
                      ? 'Select particle...'
                      : particleHoverInfo
                        ? particleHoverInfo
                        : null
        }
        autoStartCountdown={state.autoStartCountdown}
        nextMode={SESSION_LABELS[state.mode]}
        hoveredPresetId={hoveredPresetId}
        durations={durations}
        isRunning={state.isRunning}
        mode={state.mode}
        isCollapsedHovered={isCollapsedHovered}
        nextBreakIsLong={(state.completedPomodoros + 1) % sessionsUntilLong === 0}
        sessionFeedback={sessionFeedback}
        endTimePreview={showEndTime && state.isRunning ? formatEndTime(isOverflow ? overflowSeconds : state.timeRemaining, isOverflow, state.mode) : null}
        wellbeingHint={wellbeingHint}
        hoveredModeIndicator={hoveredModeIndicator}
        overflowEnabled={overflowEnabled}
        autoStartEnabled={autoStartEnabled}
      />
    </div>
  );
}
