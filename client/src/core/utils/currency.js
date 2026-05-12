// Localized currency formatting. We treat the stored `price` as USD majors;
// arabic locale gets Arabic-Indic digits and the currency on the correct side.
export function formatCurrency(amount, lang = 'en', currency = 'USD') {
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount ?? 0);
  } catch {
    return `${amount ?? 0}`;
  }
}
