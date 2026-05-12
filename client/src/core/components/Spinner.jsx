import { cn } from '../utils/cn';

/**
 * Centered loading spinner. Pass `full` to take up the viewport, otherwise
 * it's an inline ~24px spinner suitable for buttons or card placeholders.
 */
export default function Spinner({ full = false, label = 'Loading…' }) {
  const ring = (
    <span
      role="status"
      aria-label={label}
      className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-ink/20 border-t-primary"
    />
  );
  if (!full) return ring;
  return (
    <div className={cn('flex min-h-[40vh] items-center justify-center')}>
      {ring}
    </div>
  );
}
