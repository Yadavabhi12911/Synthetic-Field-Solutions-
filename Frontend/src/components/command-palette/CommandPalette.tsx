import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/cn';
import { buildCommandItems, filterCommandItems, groupCommandItems } from './commandItems';
import { getModifierKeyLabel } from './utils';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { user, userType, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const allItems = useMemo(
    () =>
      buildCommandItems({
        user,
        userType,
        navigate,
        logout,
        onClose,
      }),
    [user, userType, navigate, logout, onClose]
  );

  const filteredItems = useMemo(
    () => filterCommandItems(allItems, query),
    [allItems, query]
  );

  const groupedItems = useMemo(() => groupCommandItems(filteredItems), [filteredItems]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, Math.max(filteredItems.length - 1, 0)));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, filteredItems.length]);

  useEffect(() => {
    const activeElement = listRef.current?.querySelector<HTMLElement>(
      `[data-command-index="${activeIndex}"]`
    );
    activeElement?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, filteredItems]);

  if (!open) return null;

  const modKey = getModifierKeyLabel();

  const handleSelect = (index: number) => {
    const item = filteredItems[index];
    if (item) item.onSelect();
  };

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[12vh]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="flex max-h-[min(28rem,70vh)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            id={labelId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSelect(activeIndex);
              }
            }}
            placeholder="Search pages and actions..."
            className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-controls="command-palette-list"
            aria-activedescendant={
              filteredItems[activeIndex] ? `command-item-${filteredItems[activeIndex].id}` : undefined
            }
          />
        </div>

        <div
          id="command-palette-list"
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="overflow-y-auto p-2"
        >
          {filteredItems.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">No matching commands.</p>
          ) : (
            groupedItems.map(({ group, items }) => (
              <div key={group} className="mb-2 last:mb-0">
                <p className="px-3 py-1.5 type-meta">{group}</p>
                <ul>
                  {items.map((item) => {
                    runningIndex += 1;
                    const itemIndex = runningIndex;
                    const Icon = item.icon;
                    const isActive = itemIndex === activeIndex;

                    return (
                      <li key={item.id}>
                        <button
                          id={`command-item-${item.id}`}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          data-command-index={itemIndex}
                          onMouseEnter={() => setActiveIndex(itemIndex)}
                          onClick={() => handleSelect(itemIndex)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left type-label transition-colors',
                            isActive
                              ? 'bg-primary-muted text-foreground'
                              : 'text-foreground hover:bg-surface-muted'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 shrink-0',
                              isActive ? 'text-primary' : 'text-muted'
                            )}
                          />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 type-meta">
          <span>Use ↑↓ to navigate</span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono">
              Enter
            </kbd>
            <span>to select</span>
            <kbd className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono">
              {modKey}K
            </kbd>
            <span>to toggle</span>
          </span>
        </div>
      </div>
    </div>
  );
}
