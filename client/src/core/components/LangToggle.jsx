import { useTranslation } from 'react-i18next';
import Button from './Button';

/**
 * Two-language toggle. Calls i18n.changeLanguage(); the config.js listener
 * handles <html lang>/<html dir> + localStorage persistence.
 */
export default function LangToggle({ className }) {
  const { i18n, t } = useTranslation();
  const next = i18n.resolvedLanguage === 'ar' ? 'en' : 'ar';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => i18n.changeLanguage(next)}
      className={className}
      aria-label={`Switch to ${next.toUpperCase()}`}
    >
      {/* The label says the language we'd switch TO, in that language. */}
      {t('lang.toggleTo')}
    </Button>
  );
}
