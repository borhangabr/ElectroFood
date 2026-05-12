import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useLocalizedField from '../../../core/hooks/useLocalizedField';
import { formatCurrency } from '../../../core/utils/currency';
import { setQuantity, removeItem } from '../slice';

export default function CartItem({ line }) {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const name = useLocalizedField(line.name);
  const lineTotal = formatCurrency(line.price * line.quantity, i18n.resolvedLanguage);

  return (
    <li className="flex items-center gap-4 py-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-bg">
        {line.image && (
          <img src={line.image} alt={name} className="h-full w-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className="mt-1 text-sm text-ink-muted">
          {formatCurrency(line.price, i18n.resolvedLanguage)} × {line.quantity}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => dispatch(setQuantity({ productId: line.productId, quantity: line.quantity - 1 }))}
          className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:border-primary hover:text-primary"
          aria-label="Decrease"
        >
          −
        </button>
        <span className="min-w-6 text-center text-sm font-semibold">{line.quantity}</span>
        <button
          type="button"
          onClick={() => dispatch(setQuantity({ productId: line.productId, quantity: line.quantity + 1 }))}
          className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:border-primary hover:text-primary"
          aria-label="Increase"
        >
          +
        </button>
      </div>
      <div className="w-20 text-end font-semibold">{lineTotal}</div>
      <button
        type="button"
        onClick={() => dispatch(removeItem(line.productId))}
        className="rounded p-1 text-ink-muted hover:text-danger"
        aria-label="Remove"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}
