'use client';

import { useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Moon,
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
} from 'lucide-react';
import { registerCommands, clearCommands, type Command } from '@/lib/commandRegistry';

interface CommandRegistrationProps {
  timerIsRunning: boolean;
  timerIsPaused: boolean;
  isMuted: boolean;
  autoStartEnabled?: boolean;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
  onPresetChange?: (presetId: string) => void;
  onToggleAutoStart?: () => void;
  pendingTaskCount?: number;
  onPickRandomTask?: () => void;
}

export function CommandRegistration({
  timerIsRunning,
  timerIsPaused,
  isMuted,
  autoStartEnabled,
  onStart,
  onPause,
  onSkip,
  onToggleTheme,
  onOpenSettings,
  onToggleMute,
  onPresetChange,
  onToggleAutoStart,
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
      {
        id: 'toggle-theme',
        label: 'Toggle Dark/Light',
        shortcut: 'D',
        category: 'settings',
        action: onToggleTheme,
        icon: <Moon className="w-4 h-4" />,
        keywords: ['dark', 'light', 'mode', 'theme', 'appearance'],
      },
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
        id: 'set-daily-goal',
        label: 'Set Daily Goal',
        shortcut: 'G O',
        category: 'navigation',
        action: () => {
          window.dispatchEvent(new CustomEvent('particle:open-goals'));
        },
        icon: <Target className="w-4 h-4" />,
        keywords: ['goal', 'daily', 'target', 'particles', 'objective'],
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
    onStart,
    onPause,
    onSkip,
    onToggleTheme,
    onOpenSettings,
    onToggleMute,
    onPresetChange,
    onToggleAutoStart,
    pendingTaskCount,
    onPickRandomTask,
  ]);

  return null;
}
