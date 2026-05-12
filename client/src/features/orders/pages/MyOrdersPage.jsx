import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useListMyOrdersQuery } from '../api';
import Spinner from '../../../core/components/Spinner';
import { formatCurrency } from '../../../core/utils/currency';

export default function MyOrdersPage() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, error } = useListMyOrdersQuery({ limit: 20 });

  if (isLoading) return <Spinner full />;
  if (error) {
    return (
      <section className="container-app py-16">
        <p className="text-danger">{error.data?.message || t('common.error')}</p>
      </section>
    );
  }
  const items = data?.items || [];

  return (
    <section className="container-app py-10">
      <h1 className="text-3xl font-bold">{t('nav.orders')}</h1>
      {items.length === 0 ? (
        <div className="mt-12 rounded-card bg-surface px-6 py-12 text-center shadow-soft">
          <p className="text-lg font-medium">
            {t('orders.none', { defaultValue: "You haven't placed any orders yet." })}
          </p>
          <Link to="/menu" className="mt-3 inline-block text-primary hover:underline">
            {t('home.cta')}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-ink/5 rounded-card bg-surface px-6 shadow-soft">
          {items.map((o) => (
            <li key={o._id} className="py-4">
              <Link to={`/orders/${o._id}`} className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">#{o._id.slice(-6)}</div>
                  <div className="mt-1 text-sm text-ink-muted">
                    {new Date(o.createdAt).toLocaleString(
                      i18n.resolvedLanguage === 'ar' ? 'ar-SA' : 'en-US',
                    )}{' '}
                    · {o.items.length} {t('orders.itemsShort', { defaultValue: 'items' })}
                  </div>
                </div>
                <div className="text-end">
                  <div className="font-bold text-primary">
                    {formatCurrency(o.total, i18n.resolvedLanguage)}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wide text-ink-muted">
                    {t(`orders.status.${o.status}`, { defaultValue: o.status.replace(/_/g, ' ') })}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
