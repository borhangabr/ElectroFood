import { useTranslation } from 'react-i18next';
import { useStatsQuery } from '../api';
import Spinner from '../../../core/components/Spinner';
import { formatCurrency } from '../../../core/utils/currency';

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-card bg-surface p-6 shadow-soft">
      <div className="text-sm text-ink-muted">{title}</div>
      <div className="mt-2 text-2xl font-bold text-ink">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-ink-muted">{subtitle}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { i18n } = useTranslation();
  const { data, isLoading, error } = useStatsQuery();

  if (isLoading) return <Spinner full />;
  if (error) return <p className="text-danger">{error.data?.message || 'Failed to load stats'}</p>;

  const r = data.revenue;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Revenue today"
          value={formatCurrency(r.today.total, i18n.resolvedLanguage)}
          subtitle={`${r.today.count} orders`}
        />
        <StatCard
          title="Revenue (7 days)"
          value={formatCurrency(r.week.total, i18n.resolvedLanguage)}
          subtitle={`${r.week.count} orders`}
        />
        <StatCard
          title="Revenue (month)"
          value={formatCurrency(r.month.total, i18n.resolvedLanguage)}
          subtitle={`${r.month.count} orders`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard title="Products" value={data.productCount} />
        <StatCard title="Categories" value={data.categoryCount} />
        <StatCard title="Customers" value={data.userCount} />
        <StatCard
          title="Open orders"
          value={
            (data.ordersByStatus.pending || 0) +
            (data.ordersByStatus.confirmed || 0) +
            (data.ordersByStatus.preparing || 0) +
            (data.ordersByStatus.out_for_delivery || 0)
          }
        />
      </div>

      <div className="rounded-card bg-surface p-6 shadow-soft">
        <h2 className="font-semibold">Orders by status</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
            <li key={s} className="rounded-md border border-ink/10 px-3 py-2 text-sm">
              <div className="text-xs uppercase tracking-wide text-ink-muted">{s.replace(/_/g, ' ')}</div>
              <div className="font-bold">{data.ordersByStatus[s] || 0}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
