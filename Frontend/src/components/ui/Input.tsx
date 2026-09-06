import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="type-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary',
            error && 'border-danger focus:border-danger',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="type-body-sm text-danger">{error}</p>
        ) : hint ? (
          <p className="type-body-sm">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
