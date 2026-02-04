'use client';

import { useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Moon,
  Sun,
  Monitor,
  Settings,
  VolumeX,
  Volume2,
  Timer,
  Clock,
  FolderKanban,
  Plus,
  Repeat,
  Target,
  FastForward,
  CalendarClock,
  Activity,
  Award,
  BarChart3,
  Shuffle,
  BookOpen,
  Sparkles,
  X,
} from 'lucide-react';
import { registerCommands, clearCommands, type Command } from '@/lib/commandRegistry';
import type { AppearanceMode } from '@/contexts/TimerSettingsContext';

interface CommandRegistrationProps {
  timerIsRunning: boolean;
  timerIsPaused: boolean;
  isMuted: boolean;
  autoStartEnabled?: boolean;
  appearanceMode?: AppearanceMode;
  isDarkMode?: boolean;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
  onPresetChange?: (presetId: string) => void;
  onToggleAutoStart?: () => void;
  onCycleAppearanceMode?: () => void;
  pendingTaskCount?: number;
  onPickRandomTask?: () => void;
}

export function CommandRegistration({
  timerIsRunning,
  timerIsPaused,
  isMuted,
  autoStartEnabled,
  appearanceMode,
  isDarkMode,
  onStart,
  onPause,
  onSkip,
  onOpenSettings,
  onToggleMute,
  onPresetChange,
  onToggleAutoStart,
  onCycleAppearanceMode,
  pendingTaskCount = 0,
  onPickRandomTask,
}: CommandRegistrationProps) {
  useEffect(() => {
    const commands: Command[] = [
      // Timer commands
      {
        id: 'start-session',
        label: 'Start Session',
        shortcut: 'Space',
        category: 'timer',
        action: onStart,
        icon: <Play className="w-4 h-4" />,
        keywords: ['play', 'begin', 'resume', 'focus'],
        disabled: () => timerIsRunning && !timerIsPaused,
      },
      {
        id: 'pause-session',
        label: 'Pause Session',
        shortcut: 'Space',
        category: 'timer',
        action: onPause,
        icon: <Pause className="w-4 h-4" />,
        keywords: ['stop', 'halt', 'break'],
        disabled: () => !timerIsRunning,
      },
      {
        id: 'skip-session',
        label: 'Skip Session',
        shortcut: 'S',
        category: 'timer',
        action: onSkip,
        icon: <SkipForward className="w-4 h-4" />,
        keywords: ['next', 'complete', 'finish'],
      },
      ...(onPickRandomTask ? [{
        id: 'pick-random-task',
        label: 'Random Pick',
        shortcut: 'R',
        category: 'timer',
        action: onPickRandomTask,
        icon: <Shuffle className="w-4 h-4" />,
        keywords: ['random', 'pick', 'task', 'shuffle', 'choose'],
        disabled: () => pendingTaskCount < 2,
      }] as Command[] : []),

      // Settings commands
      ...(onCycleAppearanceMode ? [{
        id: 'cycle-appearance-mode',
        label: appearanceMode === 'light' ? 'Switch to Dark Mode'
             : appearanceMode === 'dark' ? 'Switch to System Mode'
             : 'Switch to Light Mode',
        shortcut: 'D',
        category: 'settings',
        action: onCycleAppearanceMode,
        icon: appearanceMode === 'light' ? <Sun className="w-4 h-4" />
            : appearanceMode === 'dark' ? <Moon className="w-4 h-4" />
            : <Monitor className="w-4 h-4" />,
        keywords: ['night', 'day', 'mode', 'dim', 'bright', 'dark', 'light', 'system', 'appearance', 'theme'],
      }] as Command[] : []),
      {
        id: 'toggle-mute',
        label: isMuted ? 'Unmute Sound' : 'Mute Sound',
        shortcut: 'M',
        category: 'settings',
        action: onToggleMute,
        icon: isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />,
        keywords: ['sound', 'audio', 'volume', 'mute', 'unmute'],
      },
      ...(onToggleAutoStart ? [
        {
          id: 'toggle-auto-start',
          label: autoStartEnabled ? 'Disable Auto-Start' : 'Enable Auto-Start',
          shortcut: '⇧A',
          category: 'settings',
          action: onToggleAutoStart,
          icon: <FastForward className="w-4 h-4" />,
          keywords: ['auto', 'start', 'automatic', 'flow', 'next', 'session'],
        },
      ] as Command[] : []),

      // Preset commands
      ...(onPresetChange ? [
        {
          id: 'preset-classic',
          label: 'Switch to Classic (25/5)',
          shortcut: '1',
          category: 'presets',
          action: () => onPresetChange('classic'),
          icon: <Timer className="w-4 h-4" />,
          keywords: ['classic', 'traditional', '25', 'pomodoro'],
          disabled: () => timerIsRunning,
        },
        {
          id: 'preset-deepwork',
          label: 'Switch to Deep Work (52/17)',
          shortcut: '2',
          category: 'presets',
          action: () => onPresetChange('deepWork'),
          icon: <Timer className="w-4 h-4" />,
          keywords: ['deep', 'work', '52', 'desktime'],
          disabled: () => timerIsRunning,
        },
        {
          id: 'preset-ultradian',
          label: 'Switch to 90-Min Block',
          shortcut: '3',
          category: 'presets',
          action: () => onPresetChange('ultradian'),
          icon: <Clock className="w-4 h-4" />,
          keywords: ['90', 'ultradian', 'long', 'kleitman'],
          disabled: () => timerIsRunning,
        },
        {
          id: 'preset-custom',
          label: 'Switch to Custom Preset',
          shortcut: '4',
          category: 'presets',
          action: () => onPresetChange('custom'),
          icon: <Settings className="w-4 h-4" />,
          keywords: ['custom', 'personal', 'my'],
          disabled: () => timerIsRunning,
        },
      ] as Command[] : []),

      // Navigation commands
      {
        id: 'open-timeline',
        label: 'Go to Timeline',
        shortcut: 'G T',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-timeline'));
        },
        icon: <CalendarClock className="w-4 h-4" />,
        keywords: ['timeline', 'day', 'view', 'sessions', 'history'],
      },
      {
        id: 'open-coach',
        label: 'Open Coach',
        shortcut: 'G C',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-coach'));
        },
        icon: <Sparkles className="w-4 h-4" />,
        keywords: ['coach', 'ai', 'assistant', 'help', 'insight', 'advice', 'chat'],
      },
      {
        id: 'open-settings',
        label: 'Go to Settings',
        shortcut: '⌘,',
        category: 'navigation',
        action: onOpenSettings,
        icon: <Settings className="w-4 h-4" />,
        keywords: ['preferences', 'config', 'options'],
      },
      {
        id: 'go-to-projects',
        label: 'Go to Projects',
        shortcut: 'G P',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-projects'));
        },
        icon: <FolderKanban className="w-4 h-4" />,
        keywords: ['projects', 'list', 'view', 'manage'],
      },
      {
        id: 'set-intention',
        label: 'Set Intention',
        shortcut: 'G I',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-intentions'));
        },
        icon: <Target className="w-4 h-4" />,
        keywords: ['intention', 'focus', 'daily', 'goal', 'target', 'particles', 'objective', 'what'],
      },
      {
        id: 'set-daily-goal',
        label: 'Set Daily Goal',
        shortcut: 'G O',
        category: 'navigation',
        action: () => {
          // Backwards compat: redirect to intentions
          window.dispatchEvent(new CustomEvent('particle:open-intentions'));
        },
        icon: <Target className="w-4 h-4" />,
        keywords: ['goal', 'daily', 'target', 'particles', 'objective'],
      },
      {
        id: 'clear-intention',
        label: 'Clear Intention',
        shortcut: '⇧I',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:clear-intention'));
        },
        icon: <X className="w-4 h-4" />,
        keywords: ['intention', 'clear', 'remove', 'reset', 'delete'],
      },
      {
        id: 'end-of-day',
        label: 'End of Day',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-evening-reflection'));
        },
        icon: <Moon className="w-4 h-4" />,
        keywords: ['evening', 'reflection', 'end', 'day', 'done', 'close', 'night'],
      },
      {
        id: 'open-rhythm',
        label: 'Go to Rhythm',
        shortcut: 'G R',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-rhythm'));
        },
        icon: <Activity className="w-4 h-4" />,
        keywords: ['rhythm', 'estimation', 'trend', 'analytics', 'flow', 'structure', 'precision'],
      },
      {
        id: 'open-milestones',
        label: 'Go to Milestones',
        shortcut: 'G M',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-milestones'));
        },
        icon: <Award className="w-4 h-4" />,
        keywords: ['milestones', 'achievements', 'journey', 'progress', 'badges'],
      },
      {
        id: 'open-statistics',
        label: 'Go to Statistics',
        shortcut: 'G S',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-dashboard'));
        },
        icon: <BarChart3 className="w-4 h-4" />,
        keywords: ['statistics', 'stats', 'dashboard', 'charts', 'analytics', 'insights'],
      },
      {
        id: 'open-hall-of-fame',
        label: 'Go to Hall of Fame',
        shortcut: 'G F',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-hall-of-fame'));
        },
        icon: <Award className="w-4 h-4" />,
        keywords: ['hall', 'fame', 'potw', 'particle', 'week', 'highlights', 'best', 'gold'],
      },

      // Project commands
      {
        id: 'new-project',
        label: 'New Project',
        shortcut: 'N',
        category: 'projects',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:new-project'));
        },
        icon: <Plus className="w-4 h-4" />,
        keywords: ['create', 'add', 'new', 'project'],
      },
      {
        id: 'switch-project',
        label: 'Switch Project',
        shortcut: 'P',
        category: 'projects',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:toggle-project-selector'));
        },
        icon: <Repeat className="w-4 h-4" />,
        keywords: ['change', 'select', 'switch', 'project'],
      },

      // Replay intro command
      {
        id: 'replay-intro',
        label: 'Replay Intro',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:replay-intro'));
        },
        icon: <Sparkles className="w-4 h-4" />,
        keywords: ['intro', 'replay', 'animation', 'start', 'again', 'particle', 'welcome'],
      },
      // Show inspiration command
      {
        id: 'show-inspiration',
        label: 'Show Inspiration',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:show-inspiration'));
        },
        icon: <Sparkles className="w-4 h-4" />,
        keywords: ['inspiration', 'daily', 'intention', 'quote', 'motivation', 'mindful'],
      },

      // Library commands
      {
        id: 'library-open',
        label: 'Open Library',
        shortcut: 'L',
        category: 'learn',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-learn'));
        },
        icon: <BookOpen className="w-4 h-4" />,
        keywords: ['library', 'learn', 'understand', 'help', 'guide', 'why', 'explain'],
      },
      {
        id: 'library-rhythms',
        label: 'Library: The Three Rhythms',
        category: 'learn',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-learn', {
            detail: { section: 'rhythms' }
          }));
        },
        icon: <BookOpen className="w-4 h-4" />,
        keywords: ['rhythms', 'modes', 'presets', '25', '52', '90', 'three'],
      },
      {
        id: 'library-classic',
        label: 'Library: Classic (25/5)',
        category: 'learn',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-learn', {
            detail: { section: 'rhythms', rhythm: 'classic' }
          }));
        },
        icon: <BookOpen className="w-4 h-4" />,
        keywords: ['classic', 'pomodoro', '25', 'traditional', 'cirillo'],
      },
      {
        id: 'library-deepwork',
        label: 'Library: Deep Work (52/17)',
        category: 'learn',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-learn', {
            detail: { section: 'rhythms', rhythm: 'deepWork' }
          }));
        },
        icon: <BookOpen className="w-4 h-4" />,
        keywords: ['deep', 'work', '52', '17', 'desktime', 'productive'],
      },
      {
        id: 'library-ultradian',
        label: 'Library: 90-Min Block',
        category: 'learn',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-learn', {
            detail: { section: 'rhythms', rhythm: 'ultradian' }
          }));
        },
        icon: <BookOpen className="w-4 h-4" />,
        keywords: ['ultradian', '90', 'kleitman', 'long', 'block', 'natural'],
      },
    ];

    registerCommands(commands);

    return () => {
      clearCommands();
    };
  }, [
    timerIsRunning,
    timerIsPaused,
    isMuted,
    autoStartEnabled,
    appearanceMode,
    isDarkMode,
    onStart,
    onPause,
    onSkip,
    onOpenSettings,
    onToggleMute,
    onPresetChange,
    onToggleAutoStart,
    onCycleAppearanceMode,
    pendingTaskCount,
    onPickRandomTask,
  ]);

  return null;
}
