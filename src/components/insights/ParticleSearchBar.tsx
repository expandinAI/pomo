'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface ParticleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Search bar with 300ms debounce for filtering particles by task name
 * Keyboard: '/' focuses the search field
 */
export function ParticleSearchBar({
  value,
  onChange,
  placeholder = 'Search particles...',
}: ParticleSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  // Global keyboard shortcut: '/' to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only handle if not already in an input
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary light:text-tertiary-dark pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 rounded-lg text-sm bg-tertiary/5 light:bg-tertiary-dark/5 border border-tertiary/10 light:border-tertiary-dark/10 text-primary light:text-primary-dark placeholder:text-tertiary light:placeholder:text-tertiary-dark focus:outline-none focus:border-accent/30 light:focus:border-accent-dark/30 transition-colors"
        aria-label="Search particles"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark hover:bg-tertiary/10 light:hover:bg-tertiary-dark/10 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
