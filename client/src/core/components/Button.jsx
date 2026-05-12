import { cn } from '../utils/cn';

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark disabled:bg-primary/40 shadow-soft',
  secondary:
    'bg-surface text-ink border border-ink/10 hover:border-ink/30 disabled:opacity-60',
  ghost: 'text-ink hover:bg-ink/5 disabled:opacity-60',
  danger: 'bg-danger text-white hover:bg-primary-dark disabled:bg-danger/40',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

/**
 * Project Button. One component, four variants, three sizes.
 * Always renders a real <button> (a11y) — use <a> styled with .button-* if you need a link.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium',
        // Animate color, shadow, and a subtle scale on press for tactile feedback.
        'transition-all duration-150 ease-out',
        'active:scale-[0.97] hover:shadow-lift',
        'disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  );
}
