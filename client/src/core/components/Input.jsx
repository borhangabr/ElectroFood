import { forwardRef } from 'react';
import { cn } from '../utils/cn';

/**
 * Project Input. Renders a label + control + error stack.
 * Pass `error` as a string to show validation feedback.
 */
const Input = forwardRef(function Input(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const inputId = id || rest.name;
  return (
    <div className="block">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'block w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm',
          'placeholder:text-ink-muted/70',
          'focus:outline-none',
          error
            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/30'
            : 'border-ink/15 focus:border-primary focus:ring-2 focus:ring-primary/30',
          className,
        )}
        {...rest}
      />
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

export default Input;
