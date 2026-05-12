import { useTranslation } from 'react-i18next';
import Input from '../../../core/components/Input';

export default function AddressForm({ value, onChange, errors = {} }) {
  const { t } = useTranslation();
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="space-y-4">
      <Input
        name="line1"
        label={t('checkout.line1', { defaultValue: 'Street address' })}
        value={value.line1}
        onChange={set('line1')}
        error={errors['address.line1']}
        autoComplete="street-address"
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="city"
          label={t('checkout.city', { defaultValue: 'City' })}
          value={value.city}
          onChange={set('city')}
          error={errors['address.city']}
          autoComplete="address-level2"
        />
        <Input
          name="phone"
          label={t('checkout.phone', { defaultValue: 'Phone' })}
          value={value.phone}
          onChange={set('phone')}
          error={errors['address.phone']}
          autoComplete="tel"
          required
        />
      </div>
      <Input
        name="notes"
        label={t('checkout.notes', { defaultValue: 'Notes (optional)' })}
        value={value.notes}
        onChange={set('notes')}
        error={errors['address.notes']}
      />
    </div>
  );
}
