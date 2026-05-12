import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { useGetProductQuery } from '../api';
import useLocalizedField from '../../../core/hooks/useLocalizedField';
import { formatCurrency } from '../../../core/utils/currency';
import Spinner from '../../../core/components/Spinner';
import Button from '../../../core/components/Button';
import { addItem, setQuantity, selectCartItems } from '../../cart/slice';
import { useSelector } from 'react-redux';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const [qty, setQty] = useState(1);

  const { data: product, isLoading, error } = useGetProductQuery(id);
  // Always call hooks unconditionally — pass an empty object when product isn't loaded yet.
  const name = useLocalizedField(product?.name || { en: '', ar: '' });
  const desc = useLocalizedField(product?.description || { en: '', ar: '' });

  if (isLoading) return <Spinner full />;
  if (error) {
    return (
      <section className="container-app py-16 text-center">
        <h1 className="text-2xl font-bold">{t('common.error')}</h1>
        <p className="mt-2 text-ink-muted">{error.data?.message}</p>
        <Link to="/menu" className="mt-6 inline-block text-primary hover:underline">
          ← {t('product.backToMenu', { defaultValue: 'Back to menu' })}
        </Link>
      </section>
    );
  }
  if (!product) return null;

  const inCart = cart.find((c) => c.productId === product._id)?.quantity || 0;

  function onAdd() {
    // Dispatch addItem `qty` times for clarity. (Cheaper than building a separate
    // bulk-add action for a prototype; max(qty) is 99 from the input cap below.)
    for (let i = 0; i < qty; i += 1) dispatch(addItem(product));
  }

  return (
    <section className="container-app py-10">
      <Link to={`/menu?category=${product.category?.slug || ''}`} className="text-sm text-ink-muted hover:text-ink">
        ← {t('product.backToMenu', { defaultValue: 'Back to menu' })}
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-card bg-surface shadow-soft">
          {product.image ? (
            <img
              src={product.image}
              alt={name}
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-6xl text-ink/20">
              🍽️
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category?.slug && (
            <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {product.category.name?.[i18n.resolvedLanguage] || product.category.name?.en || product.category.slug}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{name}</h1>
          <p className="mt-2 text-2xl font-bold text-primary">
            {formatCurrency(product.price, i18n.resolvedLanguage)}
          </p>
          {desc && <p className="mt-6 max-w-prose text-ink-muted">{desc}</p>}

          {inCart > 0 && (
            <p className="mt-6 inline-flex w-fit items-center rounded-full bg-success/10 px-3 py-1 text-sm text-success">
              {t('product.inCart', { count: inCart, defaultValue: `${inCart} in cart` })}
            </p>
          )}

          {/* Quantity stepper + add button */}
          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-ink/15 bg-surface">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 text-lg hover:text-primary disabled:opacity-40"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-8 text-center font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="h-11 w-11 text-lg hover:text-primary"
                aria-label="Increase"
              >
                +
              </button>
            </div>
            <Button onClick={onAdd} size="lg" variant="primary">
              {t('product.addQty', { defaultValue: 'Add to cart' })} ·{' '}
              {formatCurrency(product.price * qty, i18n.resolvedLanguage)}
            </Button>
          </div>

          {/* Quick-update if already in cart */}
          {inCart > 0 && (
            <button
              type="button"
              onClick={() => dispatch(setQuantity({ productId: product._id, quantity: 0 }))}
              className="mt-4 text-sm text-ink-muted hover:text-danger"
            >
              {t('product.removeFromCart', { defaultValue: 'Remove from cart' })}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
