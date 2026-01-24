'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SPRING } from '@/styles/design-tokens';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { BrightnessSelector } from './BrightnessSelector';
import {
  type Project,
  type CreateProjectData,
  type UpdateProjectData,
  DEFAULT_BRIGHTNESS,
  MAX_PROJECT_NAME_LENGTH,
} from '@/lib/projects';

interface ProjectFormProps {
  /** Existing project for edit mode (undefined for create) */
  project?: Project;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Called when a project is created */
  onCreate?: (data: CreateProjectData) => void;
  /** Called when a project is updated */
  onUpdate?: (id: string, data: UpdateProjectData) => void;
  /** Called when archive is requested (edit mode only) */
  onArchive?: (id: string) => void;
  /** Check if a name is duplicate */
  checkDuplicateName?: (name: string, excludeId?: string) => boolean;
}

/**
 * Modal form for creating or editing projects
 *
 * Features:
 * - Name input with character limit (50)
 * - Brightness selector (5 presets)
 * - Keyboard shortcuts (Cmd+Enter to save, Escape to close)
 * - Archive option in edit mode
 */
export function ProjectForm({
  project,
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  onArchive,
  checkDuplicateName,
}: ProjectFormProps) {
  const isEditMode = !!project;
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [brightness, setBrightness] = useState(DEFAULT_BRIGHTNESS);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        setName(project.name);
        setBrightness(project.brightness);
      } else {
        setName('');
        setBrightness(DEFAULT_BRIGHTNESS);
      }
      setError(null);
      setIsDuplicate(false);

      // Focus input after render
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, project]);

  // Focus trap
  useFocusTrap(modalRef, isOpen);

  // Check for duplicate name
  useEffect(() => {
    if (name.trim() && checkDuplicateName) {
      setIsDuplicate(checkDuplicateName(name, project?.id));
    } else {
      setIsDuplicate(false);
    }
  }, [name, project?.id, checkDuplicateName]);

  // Handle name change with limit
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_PROJECT_NAME_LENGTH);
    setName(value);
    setError(null);
  }, []);

  // Validate and save
  const handleSave = useCallback(() => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Project name is required');
      inputRef.current?.focus();
      return;
    }

    if (isEditMode && project) {
      onUpdate?.(project.id, { name: trimmedName, brightness });
    } else {
      onCreate?.({ name: trimmedName, brightness });
    }

    onClose();
  }, [name, brightness, isEditMode, project, onCreate, onUpdate, onClose]);

  // Handle archive click
  const handleArchive = useCallback(() => {
    if (project) {
      onArchive?.(project.id);
      onClose();
    }
  }, [project, onArchive, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Close on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Save on Cmd+Enter or Ctrl+Enter
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleSave]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' as const }}
            exit={{ opacity: 0, pointerEvents: 'none' as const }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 light:bg-black/40"
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', ...SPRING.gentle }}
              className="w-[90vw] max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="project-form-title"
                className="bg-surface light:bg-surface-dark rounded-2xl shadow-xl border border-tertiary/10 light:border-tertiary-dark/10 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                  <h2
                    id="project-form-title"
                    className="text-lg font-semibold text-primary light:text-primary-dark"
                  >
                    {isEditMode ? 'Edit Project' : 'New Project'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1 -mr-1 rounded-lg text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="px-6 py-4 space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="project-name"
                      className="block text-sm text-secondary light:text-secondary-dark"
                    >
                      Name
                    </label>
                    <input
                      ref={inputRef}
                      id="project-name"
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Enter project name..."
                      className="w-full px-4 py-3 rounded-xl bg-background light:bg-background-light border border-tertiary/20 light:border-tertiary-dark/20 text-primary light:text-primary-dark placeholder:text-tertiary light:placeholder:text-tertiary-dark focus:outline-none focus:border-accent/50 light:focus:border-accent-dark/50 transition-colors"
                      aria-describedby={error ? 'name-error' : isDuplicate ? 'name-warning' : 'name-count'}
                    />
                    <div className="flex items-center justify-between text-xs">
                      {error ? (
                        <span id="name-error" className="text-red-400">
                          {error}
                        </span>
                      ) : isDuplicate ? (
                        <span id="name-warning" className="text-amber-400">
                          A project with this name already exists
                        </span>
                      ) : (
                        <span className="text-transparent">-</span>
                      )}
                      <span
                        id="name-count"
                        className={`text-tertiary light:text-tertiary-dark ${
                          name.length >= MAX_PROJECT_NAME_LENGTH ? 'text-amber-400' : ''
                        }`}
                      >
                        {name.length}/{MAX_PROJECT_NAME_LENGTH}
                      </span>
                    </div>
                  </div>

                  {/* Brightness Selector */}
                  <BrightnessSelector
                    value={brightness}
                    onChange={setBrightness}
                  />
                </div>

                {/* Archive Section (Edit mode only) */}
                {isEditMode && onArchive && (
                  <div className="px-6 py-4 border-t border-tertiary/10 light:border-tertiary-dark/10">
                    <button
                      onClick={handleArchive}
                      className="w-full px-4 py-3 rounded-xl text-sm text-left text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <span className="font-medium">Archive Project</span>
                      <span className="block mt-0.5 text-xs opacity-70">
                        Hides project from list, keeps all data
                      </span>
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 px-6 py-4 border-t border-tertiary/10 light:border-tertiary-dark/10">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-tertiary/10 light:bg-tertiary-dark/10 text-secondary light:text-secondary-dark hover:bg-tertiary/20 light:hover:bg-tertiary-dark/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Cancel
                    <kbd className="ml-2 text-xs text-tertiary light:text-tertiary-dark">Esc</kbd>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!name.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-accent light:bg-accent-dark text-background light:text-background-light hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditMode ? 'Save' : 'Create'}
                    <kbd className="ml-2 text-xs opacity-70">⌘↵</kbd>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
