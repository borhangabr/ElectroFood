import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useListOrdersQuery, useUpdateOrderStatusMutation } from '../api';
import Spinner from '../../../core/components/Spinner';
import { formatCurrency } from '../../../core/utils/currency';

const STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState(''); // '' = all
  const { data, isLoading } = useListOrdersQuery({ status: status || undefined, limit: 100 });
  const [updateStatus] = useUpdateOrderStatusMutation();

  if (isLoading) return <Spinner full />;
  const items = data?.items || [];

  // Group orders for the Kanban view when "all" is selected; otherwise show flat list.
  const grouped = status
    ? { [status]: items }
    : STATUSES.reduce((m, s) => ({ ...m, [s]: items.filter((o) => o.status === s) }), {});

  function onChange(orderId, next) {
    updateStatus({ id: orderId, status: next });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Orders ({items.length})</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={() => setStatus('')}
            className={`rounded-full px-3 py-1 ${status === '' ? 'bg-primary text-white' : 'border border-ink/10 text-ink-muted'}`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 ${status === s ? 'bg-primary text-white' : 'border border-ink/10 text-ink-muted'}`}
            >
              {t(`orders.status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {(status ? [status] : STATUSES).map((col) => (
          <section key={col} className="rounded-card bg-surface p-3 shadow-soft">
            <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {t(`orders.status.${col}`)} <span className="text-ink/40">({grouped[col]?.length || 0})</span>
            </h3>
            <ul className="mt-3 space-y-2">
              {(grouped[col] || []).map((o) => (
                <li key={o._id} className="rounded-md border border-ink/10 bg-bg/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-ink-muted">#{o._id.slice(-6)}</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(o.total, i18n.resolvedLanguage)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    {o.user?.name || o.guest?.name || 'Guest'}
                    {!o.user && (
                      <span className="ms-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-dark">
                        Guest
                      </span>
                    )}
                    <span className="text-ink-muted"> · {o.items.length} items</span>
                  </div>
                  <div className="mt-1 text-xs text-ink-muted">
                    {new Date(o.createdAt).toLocaleString(i18n.resolvedLanguage === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                  {/* Stack: status select on its own row, then payment chip
                      on a separate row so the long 'stripe · pending' label
                      doesn't squeeze the dropdown on the narrow Kanban columns. */}
                  <div className="mt-3 space-y-2">
                    <select
                      value={o.status}
                      onChange={(e) => onChange(o._id, e.target.value)}
                      className="block w-full rounded border border-ink/15 bg-surface px-2 py-1.5 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{t(`orders.status.${s}`)}</option>
                      ))}
                    </select>
                    <span
                      className={`inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        o.paymentStatus === 'paid'
                          ? 'bg-success/10 text-success'
                          : o.paymentStatus === 'failed'
                            ? 'bg-danger/10 text-danger'
                            : 'bg-ink/5 text-ink-muted'
                      }`}
                    >
                      {o.paymentMethod} · {o.paymentStatus}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
