import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import useLocalizedField from '../../../core/hooks/useLocalizedField';
import { formatCurrency } from '../../../core/utils/currency';
import Button from '../../../core/components/Button';
import { addItem } from '../../cart/slice';

/**
 * Single menu item card. Renders bilingual name + description, the localized
 * price, and an "Add" button that drops the product into the Redux cart.
 */
export default function ProductCard({ product }) {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();
  const name = useLocalizedField(product.name);
  const desc = useLocalizedField(product.description);
  const price = formatCurrency(product.price, i18n.resolvedLanguage);

  return (
    <article className="group flex flex-col overflow-hidden rounded-card bg-surface shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={`/menu/${product._id}`} className="block aspect-[4/3] overflow-hidden bg-bg">
        {product.image ? (
          <img
            src={product.image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          <span className="text-lg font-bold text-primary">{price}</span>
          <Button size="sm" onClick={() => dispatch(addItem(product))}>
            {t('product.add')}
          </Button>
        </div>
      </div>
    </article>
  );
}
