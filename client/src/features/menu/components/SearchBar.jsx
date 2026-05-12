import { useTranslation } from 'react-i18next';

/**
 * Debouncing happens in MenuPage; this component is purely controlled.
 */
export default function SearchBar({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('menu.searchPlaceholder', { defaultValue: 'Search the menu…' })}
        className="block w-full rounded-full border border-ink/15 bg-surface px-5 py-2.5 ps-11 text-sm placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {/* Magnifier — purely decorative, logical position so RTL flips it */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
      >
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
