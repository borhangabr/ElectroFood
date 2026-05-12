// Live order tracking. Polls every 7s until the order hits a terminal status
// (delivered or cancelled), then stops to spare both bandwidth and Mongo.
// `skipPollingIfUnfocused: true` pauses polling when the browser tab is hidden.

import { useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useGetOrderQuery, useConfirmPaymentMutation } from '../api';
import { selectIsAuthed } from '../../auth/slice';
import OrderTimeline from '../components/OrderTimeline';
import Spinner from '../../../core/components/Spinner';
import { formatCurrency } from '../../../core/utils/currency';

const TERMINAL_STATUSES = new Set(['delivered', 'cancelled']);
const POLL_MS = 7000;

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const paymentParam = params.get('payment'); // 'success' | 'cancel' | null
  const token = params.get('token'); // guest read token
  const isAuthed = useSelector(selectIsAuthed);

  // Pack the query argument so it works for both authed and guest paths.
  const queryArg = token ? { id, token } : id;

  // pollingInterval: 0 means "don't poll" — we stop once we hit a terminal status.
  const { data: order, isLoading, error } = useGetOrderQuery(queryArg, {
    pollingInterval: 0, // initial; we set it below once we have an order
    skipPollingIfUnfocused: true,
  });

  // Recompute the active polling interval based on current status.
  const isTerminal = order ? TERMINAL_STATUSES.has(order.status) : false;
  useGetOrderQuery(queryArg, {
    pollingInterval: isTerminal ? 0 : POLL_MS,
    skipPollingIfUnfocused: true,
  });

  // After Stripe redirects back with ?payment=success, ask the server to ask
  // Stripe whether the session is actually paid. This is the local-dev fallback
  // for when the Stripe CLI isn't running and webhooks can't reach localhost.
  // The mutation invalidates the Order tag so the tracking page refetches.
  const [confirmPayment] = useConfirmPaymentMutation();
  useEffect(() => {
    if (paymentParam !== 'success') return;
    if (order?.paymentStatus === 'paid') return;
    const body = { orderId: id };
    if (token) body.guestToken = token;
    // Try a couple of times — Stripe occasionally needs a beat after redirect.
    let cancelled = false;
    let tries = 0;
    async function attempt() {
      if (cancelled) return;
      tries += 1;
      try {
        const res = await confirmPayment(body).unwrap();
        if (!cancelled && !res.paid && tries < 4) {
          setTimeout(attempt, 1500);
        }
      } catch {
        // Likely Stripe not configured or network blip; tracking page still works.
      }
    }
    attempt();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentParam, id, token, order?.paymentStatus]);

  // Clean the ?payment=... query param after a few seconds so refreshes don't re-flash the banner.
  // We keep the `token` param (guest auth) untouched.
  useEffect(() => {
    if (!paymentParam) return;
    const tid = setTimeout(() => {
      const next = new URLSearchParams(params);
      next.delete('payment');
      setParams(next, { replace: true });
    }, 8000);
    return () => clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentParam]);

  if (isLoading) return <Spinner full />;
  if (error) {
    return (
      <section className="container-app py-16 text-center">
        <h1 className="text-2xl font-bold">{t('common.error')}</h1>
        <p className="mt-2 text-ink-muted">{error.data?.message}</p>
      </section>
    );
  }
  if (!order) return null;

  return (
    <section className="container-app py-10">
      {isAuthed ? (
        <Link to="/orders" className="text-sm text-ink-muted hover:text-ink">
          ← {t('orders.backToList')}
        </Link>
      ) : (
        <Link to="/menu" className="text-sm text-ink-muted hover:text-ink">
          ← {t('product.backToMenu', { defaultValue: 'Back to menu' })}
        </Link>
      )}
      <h1 className="mt-2 text-3xl font-bold">
        {t('orders.order')}{' '}
        <span className="font-mono text-base text-ink-muted">#{order._id.slice(-6)}</span>
      </h1>

      {paymentParam === 'success' && (
        <div className="mt-4 rounded-md bg-success/10 px-4 py-3 text-sm text-success">
          {order.paymentStatus === 'paid'
            ? t('orders.paymentSuccess', { defaultValue: 'Payment received. Thanks!' })
            : t('orders.paymentProcessing', { defaultValue: 'Confirming payment…' })}
        </div>
      )}
      {paymentParam === 'cancel' && (
        <div className="mt-4 rounded-md bg-warning/10 px-4 py-3 text-sm text-warning">
          {t('orders.paymentCancelled', {
            defaultValue: 'Payment was cancelled. Your order is still here if you want to retry.',
          })}
        </div>
      )}

      <div className="mt-6 rounded-card bg-surface p-6 shadow-soft">
        <OrderTimeline order={order} />
        <p className="mt-4 text-sm text-ink-muted">
          {t('orders.paymentLabel')}:{' '}
          <span className="font-medium text-ink">
            {order.paymentMethod === 'cod'
              ? t('checkout.paymentCod')
              : t('checkout.paymentStripe')}{' '}
            · {order.paymentStatus}
          </span>
          {!isTerminal && (
            <span className="ms-3 inline-flex items-center gap-1 text-xs text-ink-muted/70">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {t('orders.live', { defaultValue: 'Live' })}
            </span>
          )}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-card bg-surface p-6 shadow-soft lg:col-span-2">
          <h2 className="font-semibold">{t('orders.items')}</h2>
          <ul className="mt-4 divide-y divide-ink/5">
            {order.items.map((it) => (
              <li key={it.product} className="flex justify-between py-3">
                <span>
                  {it.name_snapshot[i18n.resolvedLanguage] || it.name_snapshot.en} × {it.quantity}
                </span>
                <span>
                  {formatCurrency(it.price_snapshot * it.quantity, i18n.resolvedLanguage)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="rounded-card bg-surface p-6 shadow-soft">
          <h2 className="font-semibold">{t('cart.summary')}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t('cart.subtotal')}</dt>
              <dd>{formatCurrency(order.subtotal, i18n.resolvedLanguage)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t('cart.delivery')}</dt>
              <dd>{formatCurrency(order.deliveryFee, i18n.resolvedLanguage)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink/5 pt-3 font-bold">
              <dt>{t('cart.total')}</dt>
              <dd className="text-primary">{formatCurrency(order.total, i18n.resolvedLanguage)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
