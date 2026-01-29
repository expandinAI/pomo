'use client';

import { CommandItem } from './CommandItem';
import type { Command, CommandCategory } from '@/lib/commandRegistry';

interface CommandListProps {
  commands: Command[];
  recentCommands: Command[];
  selectedIndex: number;
  onSelect: (command: Command) => void;
  onHover: (index: number) => void;
  searchQuery: string;
}

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  timer: 'Timer',
  presets: 'Presets',
  navigation: 'Navigation',
  settings: 'Settings',
  projects: 'Projects',
  learn: 'Learn',
};

const CATEGORY_ORDER: CommandCategory[] = ['timer', 'presets', 'projects', 'navigation', 'learn', 'settings'];

export function CommandList({
  commands,
  recentCommands,
  selectedIndex,
  onSelect,
  onHover,
  searchQuery,
}: CommandListProps) {
  // Build flat list for index calculation
  const flatList: { type: 'recent' | 'command'; command: Command }[] = [];

  // Add recent commands if no search query and there are recent commands
  if (!searchQuery && recentCommands.length > 0) {
    recentCommands.forEach((cmd) => {
      flatList.push({ type: 'recent', command: cmd });
    });
  }

  // Group commands by category
  const groupedCommands: Record<CommandCategory, Command[]> = {
    timer: [],
    presets: [],
    navigation: [],
    settings: [],
    projects: [],
    learn: [],
  };

  commands.forEach((cmd) => {
    groupedCommands[cmd.category].push(cmd);
  });

  // Add grouped commands to flat list
  CATEGORY_ORDER.forEach((category) => {
    groupedCommands[category].forEach((cmd) => {
      flatList.push({ type: 'command', command: cmd });
    });
  });

  if (flatList.length === 0) {
    return (
      <div className="py-8 text-center text-tertiary light:text-tertiary-dark text-sm">
        No commands found
      </div>
    );
  }

  // Track current index for selection state
  let currentIndex = 0;

  return (
    <div className="py-2 max-h-[300px] overflow-y-auto">
      {/* Recent Commands Section */}
      {!searchQuery && recentCommands.length > 0 && (
        <div className="mb-2">
          <div className="px-3 py-1.5 text-xs font-medium text-tertiary/70 light:text-tertiary-dark/70 uppercase tracking-wider">
            Recent
          </div>
          <div className="px-1">
            {recentCommands.map((cmd) => {
              const index = currentIndex++;
              return (
                <CommandItem
                  key={`recent-${cmd.id}`}
                  command={cmd}
                  isSelected={selectedIndex === index}
                  onSelect={onSelect}
                  onHover={() => onHover(index)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Grouped Commands */}
      {CATEGORY_ORDER.map((category) => {
        const categoryCommands = groupedCommands[category];
        if (categoryCommands.length === 0) return null;

        return (
          <div key={category} className="mb-2">
            <div className="px-3 py-1.5 text-xs font-medium text-tertiary/70 light:text-tertiary-dark/70 uppercase tracking-wider">
              {CATEGORY_LABELS[category]}
            </div>
            <div className="px-1">
              {categoryCommands.map((cmd) => {
                const index = currentIndex++;
                return (
                  <CommandItem
                    key={cmd.id}
                    command={cmd}
                    isSelected={selectedIndex === index}
                    onSelect={onSelect}
                    onHover={() => onHover(index)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
