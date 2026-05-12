import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Button from '../../../core/components/Button';
import CartItem from '../components/CartItem';
import { selectCartItems, selectCartSubtotal, clearCart } from '../slice';
import { formatCurrency } from '../../../core/utils/currency';

const DELIVERY_FEE = 3; // mirrors server DELIVERY_FEE_CENTS=300; surfaced for UX only.

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const total = Math.round((subtotal + (items.length ? DELIVERY_FEE : 0)) * 100) / 100;

  if (items.length === 0) {
    return (
      <section className="container-app py-16 text-center">
        <h1 className="animate-fade-up text-2xl font-bold">
          {t('cart.empty', { defaultValue: 'Your cart is empty' })}
        </h1>
        <p className="mt-2 animate-fade-up stagger-2 text-ink-muted">
          {t('cart.emptyHint', { defaultValue: 'Browse the menu and pick something delicious.' })}
        </p>
        <Link to="/menu" className="mt-6 inline-block animate-fade-up stagger-3">
          <Button variant="primary">{t('home.cta')}</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container-app py-10">
      <h1 className="text-3xl font-bold">{t('nav.cart')}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-ink/5 rounded-card bg-surface px-6 shadow-soft">
            {items.map((line) => (
              <CartItem key={line.productId} line={line} />
            ))}
          </ul>
          <button
            type="button"
            onClick={() => dispatch(clearCart())}
            className="mt-4 text-sm text-ink-muted hover:text-danger"
          >
            {t('cart.clear', { defaultValue: 'Clear cart' })}
          </button>
        </div>

        <aside className="rounded-card bg-surface p-6 shadow-soft animate-fade-up stagger-2">
          <h2 className="text-lg font-semibold">{t('cart.summary', { defaultValue: 'Order summary' })}</h2>
          <dl className="mt-4 space-y-2 text-sm tabular-nums">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t('cart.subtotal', { defaultValue: 'Subtotal' })}</dt>
              <dd>{formatCurrency(subtotal, i18n.resolvedLanguage)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t('cart.delivery', { defaultValue: 'Delivery' })}</dt>
              <dd>{formatCurrency(DELIVERY_FEE, i18n.resolvedLanguage)}</dd>
            </div>
            <div className="mt-3 flex justify-between border-t border-ink/5 pt-3 text-base font-bold">
              <dt>{t('cart.total', { defaultValue: 'Total' })}</dt>
              <dd className="text-primary">{formatCurrency(total, i18n.resolvedLanguage)}</dd>
            </div>
          </dl>
          <Link to="/checkout" className="mt-6 block">
            <Button variant="primary" fullWidth size="lg">
              {t('cart.checkout', { defaultValue: 'Checkout' })}
            </Button>
          </Link>
          <p className="mt-3 text-center text-xs text-ink-muted">
            {t('cart.finalNote', { defaultValue: 'Final prices and tax confirmed at checkout.' })}
          </p>
        </aside>
      </div>
    </section>
  );
}
