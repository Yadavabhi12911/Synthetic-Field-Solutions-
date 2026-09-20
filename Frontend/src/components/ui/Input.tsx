import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function RequiredMark() {
  return (
    <span className="ml-0.5 text-danger" aria-hidden="true">
      *
    </span>
  );
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, icon, trailing, required, ...props }, ref) => {
    const inputId = id || props.name;
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const hintId = hint && inputId ? `${inputId}-hint` : undefined;

    return (
      <div className="flex min-w-0 flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="type-label">
            {label}
            {required ? <RequiredMark /> : null}
          </label>
        )}
        <div
          className={cn(
            'flex min-h-11 items-stretch overflow-hidden rounded-md border border-border bg-surface transition-colors focus-within:border-primary',
            error && 'border-danger focus-within:border-danger'
          )}
        >
          {icon ? (
            <span
              className="pointer-events-none flex w-11 shrink-0 items-center justify-center border-r border-border text-muted"
              aria-hidden
            >
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-required={required || undefined}
            aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
            className={cn(
              'min-h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted sm:min-h-10 sm:text-sm',
              className
            )}
            {...props}
          />
          {trailing ? (
            <div className="flex shrink-0 items-center pr-1.5">{trailing}</div>
          ) : null}
        </div>
        {error ? (
          <p id={errorId} className="type-body-sm text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="type-body-sm">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
