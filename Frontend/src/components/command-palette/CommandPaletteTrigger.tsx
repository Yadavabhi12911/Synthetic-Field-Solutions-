import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useCommandPalette } from './CommandPaletteProvider';
import { getModifierKeyLabel } from './utils';

interface CommandPaletteTriggerProps {
  className?: string;
  compact?: boolean;
}

export function CommandPaletteTrigger({ className, compact = false }: CommandPaletteTriggerProps) {
  const { toggle } = useCommandPalette();
  const modKey = getModifierKeyLabel();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-border bg-surface-muted type-label text-muted transition-colors hover:bg-surface hover:text-foreground',
        compact ? 'h-9 px-2.5' : 'h-9 min-w-[10rem] px-3',
        className
      )}
      aria-label="Open command palette"
    >
      <Search className="h-4 w-4 shrink-0" />
      {!compact && <span className="hidden sm:inline">Search...</span>}
      <kbd className="ml-auto hidden rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
        {modKey}K
      </kbd>
    </button>
  );
}
