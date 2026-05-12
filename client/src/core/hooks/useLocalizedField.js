import { useTranslation } from 'react-i18next';

/**
 * Picks the right language field from a `{ en, ar }` shape.
 * Falls back to EN if the active language is missing.
 *
 *   const name = useLocalizedField(product.name);
 */
export default function useLocalizedField(obj, fallback = 'en') {
  const { i18n } = useTranslation();
  if (!obj) return '';
  const lng = i18n.resolvedLanguage;
  return obj[lng] || obj[fallback] || '';
}
