import { useTranslation } from 'react-i18next';
import { cn } from '../../../core/utils/cn';

const OPTIONS = [
  {
    value: 'stripe',
    titleKey: 'checkout.paymentStripe',
    titleFallback: 'Pay online (Stripe)',
    descKey: 'checkout.paymentStripeDesc',
    descFallback: 'Credit / debit card via Stripe-hosted checkout.',
  },
  {
    value: 'cod',
    titleKey: 'checkout.paymentCod',
    titleFallback: 'Cash on delivery',
    descKey: 'checkout.paymentCodDesc',
    descFallback: 'Pay in cash when your order arrives.',
  },
];

export default function PaymentMethodPicker({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      {OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-card border p-4 transition-colors',
              active
                ? 'border-primary bg-primary/5'
                : 'border-ink/10 bg-surface hover:border-ink/30',
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={o.value}
              checked={active}
              onChange={() => onChange(o.value)}
              className="mt-1 h-4 w-4 text-primary focus:ring-primary"
            />
            <div>
              <div className="font-medium">{t(o.titleKey, { defaultValue: o.titleFallback })}</div>
              <div className="mt-0.5 text-sm text-ink-muted">
                {t(o.descKey, { defaultValue: o.descFallback })}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
