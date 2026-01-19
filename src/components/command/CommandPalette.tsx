'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { CommandInput } from './CommandInput';
import { CommandList } from './CommandList';
import { SPRING } from '@/styles/design-tokens';
import {
  type Command,
  getCommands,
  getRecentCommands,
  addRecentCommand,
  subscribeToRegistry,
} from '@/lib/commandRegistry';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);

  // Subscribe to registry changes
  useEffect(() => {
    setCommands(getCommands());
    const unsubscribe = subscribeToRegistry(() => {
      setCommands(getCommands());
    });
    return unsubscribe;
  }, []);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Fuse.js instance for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(commands, {
      keys: ['label', 'keywords'],
      threshold: 0.4,
      includeMatches: true,
    });
  }, [commands]);

  // Filtered commands based on search query
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) {
      return commands;
    }
    return fuse.search(searchQuery).map((result) => result.item);
  }, [fuse, searchQuery, commands]);

  // Recent commands
  const recentCommands = useMemo(() => {
    if (searchQuery.trim()) {
      return [];
    }
    return getRecentCommands();
  }, [searchQuery]);

  // Total items count for keyboard navigation
  const totalItems = useMemo(() => {
    return (searchQuery ? 0 : recentCommands.length) + filteredCommands.length;
  }, [searchQuery, recentCommands, filteredCommands]);

  // Get command at a given flat index
  const getCommandAtIndex = useCallback(
    (index: number): Command | null => {
      const recentCount = searchQuery ? 0 : recentCommands.length;

      if (index < recentCount) {
        return recentCommands[index];
      }

      const commandIndex = index - recentCount;
      return filteredCommands[commandIndex] ?? null;
    },
    [searchQuery, recentCommands, filteredCommands]
  );

  // Handle command selection
  const handleSelect = useCallback(
    (command: Command) => {
      const isDisabled =
        typeof command.disabled === 'function' ? command.disabled() : command.disabled;

      if (isDisabled) {
        return;
      }

      addRecentCommand(command.id);
      command.action();
      onClose();
    },
    [onClose]
  );

  // Keyboard navigation (Arrow keys + vim-style J/K)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowDown':
        case 'j':
        case 'J':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % totalItems || 0);
          break;

        case 'ArrowUp':
        case 'k':
        case 'K':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems || 0);
          break;

        case 'Enter': {
          e.preventDefault();
          const command = getCommandAtIndex(selectedIndex);
          if (command) {
            handleSelect(command);
          }
          break;
        }

        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalItems, selectedIndex, getCommandAtIndex, handleSelect, onClose]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, totalItems]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 light:bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', ...SPRING.snappy }}
            className="fixed inset-x-0 top-[20%] z-50 flex justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div className="w-full max-w-lg bg-surface light:bg-surface-dark rounded-xl shadow-2xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden">
              <CommandInput
                value={searchQuery}
                onChange={setSearchQuery}
              />
              <CommandList
                commands={filteredCommands}
                recentCommands={recentCommands}
                selectedIndex={selectedIndex}
                onSelect={handleSelect}
                searchQuery={searchQuery}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
