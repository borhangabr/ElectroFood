import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Button from '../../../core/components/Button';
import Input from '../../../core/components/Input';
import AddressForm from '../components/AddressForm';
import PaymentMethodPicker from '../components/PaymentMethodPicker';
import { selectCartItems, selectCartSubtotal, clearCart } from '../../cart/slice';
import { selectIsAuthed } from '../../auth/slice';
import { useCreateOrderMutation, useCreateCheckoutSessionMutation } from '../api';
import { formatCurrency } from '../../../core/utils/currency';

const DELIVERY_FEE = 3;

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const isAuthed = useSelector(selectIsAuthed);
  const total = Math.round((subtotal + (items.length ? DELIVERY_FEE : 0)) * 100) / 100;

  const [createOrder, { isLoading: orderLoading, error: orderError }] = useCreateOrderMutation();
  const [createSession, { isLoading: sessionLoading, error: sessionError }] =
    useCreateCheckoutSessionMutation();

  const [address, setAddress] = useState({ line1: '', city: '', phone: '', notes: '' });
  // Guest contact (only visible to non-authed users). Name + phone + email.
  const [guest, setGuest] = useState({ name: '', phone: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const error = orderError || sessionError;
  const isLoading = orderLoading || sessionLoading;

  const fieldErrors = (error?.data?.details || []).reduce((m, e) => {
    m[e.path] = e.message;
    return m;
  }, {});
  const topError =
    error && !error.data?.details && (error.data?.message || t('common.error'));

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const body = {
        items: items.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        address,
        paymentMethod,
      };
      if (!isAuthed) {
        // Guest contact: name + phone + email. We mirror the phone into the address
        // block so admin sees the same number in both places without surprise.
        const phone = (guest.phone || address.phone).trim();
        body.guest = { name: guest.name.trim(), phone, email: guest.email.trim() };
        body.address = { ...body.address, phone: body.address.phone || phone };
      }
      const order = await createOrder(body).unwrap();
      dispatch(clearCart());

      // Build a tracking URL — append ?token=... for guests so they can read back.
      const trackingPath = order.guestToken
        ? `/orders/${order._id}?token=${encodeURIComponent(order.guestToken)}`
        : `/orders/${order._id}`;

      if (paymentMethod === 'stripe') {
        const sessionBody = { orderId: order._id };
        if (order.guestToken) sessionBody.guestToken = order.guestToken;
        const { url } = await createSession(sessionBody).unwrap();
        // Hand the browser to Stripe-hosted checkout.
        window.location.href = url;
        return;
      }

      navigate(trackingPath);
    } catch {
      /* error rendered below */
    }
  }

  if (items.length === 0) {
    return (
      <section className="container-app py-16 text-center">
        <h1 className="text-2xl font-bold">{t('cart.empty')}</h1>
        <Link to="/menu" className="mt-4 inline-block text-primary hover:underline">
          {t('home.cta')}
        </Link>
      </section>
    );
  }

  return (
    <section className="container-app py-10">
      <h1 className="text-3xl font-bold">{t('checkout.title')}</h1>
      {!isAuthed && (
        <p className="mt-2 text-sm text-ink-muted">
          {t('checkout.guestHint', { defaultValue: 'Checking out as a guest. ' })}
          <Link to="/login" className="text-primary hover:underline">
            {t('checkout.haveAccount', { defaultValue: 'Have an account? Sign in.' })}
          </Link>
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-3" noValidate>
        <div className="space-y-6 lg:col-span-2">
          {!isAuthed && (
            <div className="rounded-card bg-surface p-6 shadow-soft">
              <h2 className="text-lg font-semibold">
                {t('checkout.contactTitle', { defaultValue: 'Contact info' })}
              </h2>
              <div className="mt-4 space-y-4">
                <Input
                  name="guest_name"
                  label={t('checkout.fullName', { defaultValue: 'Full name' })}
                  value={guest.name}
                  onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                  error={fieldErrors['guest.name']}
                  autoComplete="name"
                  required
                />
                <Input
                  name="guest_phone"
                  type="tel"
                  label={t('checkout.phone', { defaultValue: 'Phone' })}
                  value={guest.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                  error={fieldErrors['guest.phone']}
                  autoComplete="tel"
                  required
                />
                <Input
                  name="guest_email"
                  type="email"
                  label={t('checkout.email', { defaultValue: 'Email' })}
                  value={guest.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                  error={fieldErrors['guest.email']}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
          )}

          <div className="rounded-card bg-surface p-6 shadow-soft">
            <h2 className="text-lg font-semibold">{t('checkout.deliveryTo')}</h2>
            <div className="mt-4">
              <AddressForm value={address} onChange={setAddress} errors={fieldErrors} />
            </div>
          </div>

          <div className="rounded-card bg-surface p-6 shadow-soft">
            <h2 className="text-lg font-semibold">{t('checkout.payment')}</h2>
            <div className="mt-4">
              <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
            </div>
          </div>

          {topError && (
            <div className="rounded-card bg-danger/10 px-4 py-3 text-sm text-danger">
              {topError}
            </div>
          )}
        </div>

        <aside className="rounded-card bg-surface p-6 shadow-soft">
          <h2 className="text-lg font-semibold">{t('cart.summary')}</h2>
          <ul className="mt-4 divide-y divide-ink/5 text-sm">
            {items.map((line) => (
              <li key={line.productId} className="flex justify-between py-2">
                <span>
                  {line.name[i18n.resolvedLanguage] || line.name.en} × {line.quantity}
                </span>
                <span>{formatCurrency(line.price * line.quantity, i18n.resolvedLanguage)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-ink/5 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t('cart.subtotal')}</dt>
              <dd>{formatCurrency(subtotal, i18n.resolvedLanguage)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t('cart.delivery')}</dt>
              <dd>{formatCurrency(DELIVERY_FEE, i18n.resolvedLanguage)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink/5 pt-3 text-base font-bold">
              <dt>{t('cart.total')}</dt>
              <dd className="text-primary">{formatCurrency(total, i18n.resolvedLanguage)}</dd>
            </div>
          </dl>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            className="mt-6"
            disabled={isLoading}
          >
            {isLoading
              ? t('common.loading')
              : paymentMethod === 'stripe'
                ? t('checkout.payNow')
                : t('checkout.placeOrder')}
          </Button>
        </aside>
      </form>
    </section>
  );
}
