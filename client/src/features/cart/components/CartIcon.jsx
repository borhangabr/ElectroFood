import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCartCount } from '../slice';

/**
 * Cart icon for the navbar with a small badge of total item count.
 */
export default function CartIcon() {
  const count = useSelector(selectCartCount);
  return (
    <Link
      to="/cart"
      className="relative rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      aria-label="Cart"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M3 4h2l2.4 12.3a2 2 0 0 0 2 1.7h7.2a2 2 0 0 0 2-1.5L20 8H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1.5" fill="currentColor" />
        <circle cx="17" cy="20" r="1.5" fill="currentColor" />
      </svg>
      {count > 0 && (
        <span className="absolute -end-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold leading-none text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
