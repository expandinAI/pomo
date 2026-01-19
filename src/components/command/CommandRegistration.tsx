'use client';

import { useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Moon,
  Settings,
  VolumeX,
  Volume2,
  Timer,
  Clock,
} from 'lucide-react';
import { registerCommands, clearCommands, type Command } from '@/lib/commandRegistry';

interface CommandRegistrationProps {
  timerIsRunning: boolean;
  timerIsPaused: boolean;
  isMuted: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
  onPresetChange?: (presetId: string) => void;
}

export function CommandRegistration({
  timerIsRunning,
  timerIsPaused,
  isMuted,
  onStart,
  onPause,
  onReset,
  onSkip,
  onToggleTheme,
  onOpenSettings,
  onToggleMute,
  onPresetChange,
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
        id: 'reset-timer',
        label: 'Reset Timer',
        shortcut: 'R',
        category: 'timer',
        action: onReset,
        icon: <RotateCcw className="w-4 h-4" />,
        keywords: ['restart', 'clear'],
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

      // Preset commands
      ...(onPresetChange ? [
        {
          id: 'preset-pomodoro',
          label: 'Switch to Pomodoro (25/5)',
          shortcut: '1',
          category: 'presets',
          action: () => onPresetChange('pomodoro'),
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
        id: 'open-settings',
        label: 'Open Settings',
        shortcut: '⌘,',
        category: 'navigation',
        action: onOpenSettings,
        icon: <Settings className="w-4 h-4" />,
        keywords: ['preferences', 'config', 'options'],
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
    onStart,
    onPause,
    onReset,
    onSkip,
    onToggleTheme,
    onOpenSettings,
    onToggleMute,
    onPresetChange,
  ]);

  return null;
}
