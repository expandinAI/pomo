'use client';

import { CommandPalette } from './CommandPalette';
import { useCommandPalette } from '@/contexts/CommandPaletteContext';

export function CommandPaletteWrapper() {
  const { isOpen, close } = useCommandPalette();

  return <CommandPalette isOpen={isOpen} onClose={close} />;
}
