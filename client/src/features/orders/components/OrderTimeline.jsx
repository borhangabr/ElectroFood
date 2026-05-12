import { useTranslation } from 'react-i18next';
import { cn } from '../../../core/utils/cn';

const STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

/**
 * Renders the 5-stage progression. Each completed stage shows the timestamp
 * from `statusHistory` if available; the current stage is highlighted.
 *
 * Indexes the history by status (latest entry wins if duplicated).
 */
export default function OrderTimeline({ order }) {
  const { t, i18n } = useTranslation();

  const isCancelled = order.status === 'cancelled';
  const currentIndex = STATUSES.indexOf(order.status);

  const stampByStatus = (order.statusHistory || []).reduce((m, h) => {
    m[h.status] = h.at;
    return m;
  }, {});

  if (isCancelled) {
    return (
      <p className="rounded-md bg-danger/10 px-4 py-3 text-sm text-danger">
        {t('orders.cancelled')}
      </p>
    );
  }

  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {STATUSES.map((s, i) => {
        const done = i <= currentIndex;
        const current = i === currentIndex;
        const at = stampByStatus[s];
        return (
          <li
            key={s}
            className={cn(
              'rounded-md border p-3',
              done && current && 'border-primary bg-primary/5 text-primary',
              done && !current && 'border-success/40 bg-success/5 text-success',
              !done && 'border-ink/10 text-ink-muted',
            )}
          >
            <div className="text-xs font-semibold uppercase tracking-wide">
              {t(`orders.status.${s}`)}
            </div>
            {at && (
              <div className="mt-1 text-[11px] opacity-80">
                {new Date(at).toLocaleTimeString(
                  i18n.resolvedLanguage === 'ar' ? 'ar-SA' : 'en-US',
                  { hour: '2-digit', minute: '2-digit' },
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
