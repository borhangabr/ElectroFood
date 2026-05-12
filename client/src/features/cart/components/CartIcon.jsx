import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCartCount } from '../slice';
import { cn } from '../../../core/utils/cn';

/**
 * Cart icon for the navbar with a small badge of total item count.
 *
 * Triggers a brief pop animation on the badge whenever the count grows,
 * giving customers visual confirmation that their click landed.
 */
export default function CartIcon() {
  const count = useSelector(selectCartCount);
  const prev = useRef(count);
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    // Only animate on increase. Decreases (removals) shouldn't celebrate.
    if (count > prev.current) {
      setBumped(true);
      const t = setTimeout(() => setBumped(false), 400);
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  // Keep prev in sync after the animation flag flips off.
  useEffect(() => {
    if (!bumped) prev.current = count;
  }, [bumped, count]);

  return (
    <Link
      to="/cart"
      className="relative rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      aria-label="Cart"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M3 4h2l2.4 12.3a2 2 0 0 0 2 1.7h7.2a2 2 0 0 0 2-1.5L20 8H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1.5" fill="currentColor" />
        <circle cx="17" cy="20" r="1.5" fill="currentColor" />
      </svg>
      {count > 0 && (
        <span
          // `key` forces the element to remount when `bumped` flips, which
          // restarts the CSS animation. Without this, repeated rapid clicks
          // wouldn't re-trigger the pop.
          key={bumped ? `b-${count}` : 'idle'}
          className={cn(
            'absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center',
            'rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-white',
            bumped && 'animate-pop-in',
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
