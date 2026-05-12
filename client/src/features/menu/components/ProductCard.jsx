import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import useLocalizedField from '../../../core/hooks/useLocalizedField';
import { formatCurrency } from '../../../core/utils/currency';
import Button from '../../../core/components/Button';
import { addItem } from '../../cart/slice';
import { cn } from '../../../core/utils/cn';

// Stagger classes are 1..8 — wrap around so a long grid keeps animating.
const staggerClass = (i) => `stagger-${((i ?? 0) % 8) + 1}`;

/**
 * Single menu item card. Renders bilingual name + description, the localized
 * price, and an "Add" button that drops the product into the Redux cart.
 *
 * `index` is used to stagger the entry animation in a grid. Optional — falls
 * back to no delay if the parent doesn't pass it.
 */
export default function ProductCard({ product, index }) {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();
  const name = useLocalizedField(product.name);
  const desc = useLocalizedField(product.description);
  const price = formatCurrency(product.price, i18n.resolvedLanguage);

  // Brief "added" pulse on the price tag so the click feels acknowledged
  // without us needing a full toast. Resets after one animation cycle.
  const [bumped, setBumped] = useState(false);
  const bumpTimer = useRef(null);
  const handleAdd = () => {
    dispatch(addItem(product));
    setBumped(true);
    clearTimeout(bumpTimer.current);
    bumpTimer.current = setTimeout(() => setBumped(false), 500);
  };

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-card bg-surface shadow-soft',
        'transition-all duration-300 hover:-translate-y-1 hover:shadow-lift',
        'animate-fade-up',
        staggerClass(index),
      )}
    >
      <Link to={`/menu/${product._id}`} className="block aspect-[4/3] overflow-hidden bg-bg">
        {product.image ? (
          <img
            src={product.image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-ink/20">🍽️</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-ink">{name}</h3>
        {desc && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{desc}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span
            key={bumped ? 'bumped' : 'idle'}
            className={cn(
              'text-lg font-bold text-primary',
              bumped && 'animate-bounce-soft',
            )}
          >
            {price}
          </span>
          <Button size="sm" onClick={handleAdd}>
            {t('product.add')}
          </Button>
        </div>
      </div>
    </article>
  );
}
