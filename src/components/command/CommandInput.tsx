'use client';

import { useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CommandInput({
  value,
  onChange,
  placeholder = 'Type a command or search...',
}: CommandInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative flex items-center border-b border-tertiary/10 light:border-tertiary-dark/10">
      <Search className="absolute left-4 w-4 h-4 text-tertiary light:text-tertiary-dark pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full py-4 pl-11 pr-4
          bg-transparent
          text-primary light:text-primary-dark
          placeholder:text-tertiary/60 light:placeholder:text-tertiary-dark/60
          text-sm
          focus:outline-none
        "
        aria-label="Search commands"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <kbd className="absolute right-4 px-1.5 py-0.5 text-xs font-mono text-tertiary light:text-tertiary-dark bg-background light:bg-background-dark rounded border border-tertiary/20 light:border-tertiary-dark/20">
        esc
      </kbd>
    </div>
  );
}
