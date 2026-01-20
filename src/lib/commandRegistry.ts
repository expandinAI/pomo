/**
 * Command Registry for the Command Palette
 * Central management of all app commands
 */

import type { ReactNode } from 'react';

export type CommandCategory = 'timer' | 'navigation' | 'settings' | 'presets';

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  category: CommandCategory;
  action: () => void;
  icon?: ReactNode;
  keywords?: string[];
  disabled?: boolean | (() => boolean);
}

// Internal command storage
const commands: Map<string, Command> = new Map();

// Event listeners for registry changes
type RegistryListener = () => void;
const listeners: Set<RegistryListener> = new Set();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Register a new command
 */
export function registerCommand(command: Command): void {
  commands.set(command.id, command);
  notifyListeners();
}

/**
 * Register multiple commands at once
 */
export function registerCommands(newCommands: Command[]): void {
  newCommands.forEach((command) => {
    commands.set(command.id, command);
  });
  notifyListeners();
}

/**
 * Unregister a command by ID
 */
export function unregisterCommand(id: string): void {
  commands.delete(id);
  notifyListeners();
}

/**
 * Get all registered commands
 */
export function getCommands(): Command[] {
  return Array.from(commands.values());
}

/**
 * Get a specific command by ID
 */
export function getCommandById(id: string): Command | undefined {
  return commands.get(id);
}

/**
 * Execute a command by ID
 */
export function executeCommand(id: string): boolean {
  const command = commands.get(id);
  if (!command) {
    return false;
  }

  // Check if command is disabled
  const isDisabled =
    typeof command.disabled === 'function' ? command.disabled() : command.disabled;

  if (isDisabled) {
    return false;
  }

  command.action();
  return true;
}

/**
 * Get commands grouped by category
 */
export function getCommandsByCategory(): Record<CommandCategory, Command[]> {
  const grouped: Record<CommandCategory, Command[]> = {
    timer: [],
    navigation: [],
    settings: [],
    presets: [],
  };

  commands.forEach((command) => {
    grouped[command.category].push(command);
  });

  return grouped;
}

/**
 * Subscribe to registry changes
 */
export function subscribeToRegistry(listener: RegistryListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Clear all commands (useful for testing)
 */
export function clearCommands(): void {
  commands.clear();
  notifyListeners();
}

// Recent commands storage key
const RECENT_COMMANDS_KEY = 'particle-recent-commands';
const MAX_RECENT_COMMANDS = 5;

/**
 * Get recent command IDs from localStorage
 */
export function getRecentCommandIds(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(RECENT_COMMANDS_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Add a command to recent history
 */
export function addRecentCommand(id: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const recent = getRecentCommandIds();
    // Remove if already exists
    const filtered = recent.filter((cmdId) => cmdId !== id);
    // Add to front
    filtered.unshift(id);
    // Limit to max
    const limited = filtered.slice(0, MAX_RECENT_COMMANDS);
    localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(limited));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get recent commands (resolved from IDs)
 */
export function getRecentCommands(): Command[] {
  const ids = getRecentCommandIds();
  return ids
    .map((id) => getCommandById(id))
    .filter((cmd): cmd is Command => cmd !== undefined);
}

/**
 * Clear recent commands
 */
export function clearRecentCommands(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(RECENT_COMMANDS_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
