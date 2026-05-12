import { useTranslation } from 'react-i18next';
import useLocalizedField from '../../../core/hooks/useLocalizedField';
import { cn } from '../../../core/utils/cn';

/**
 * Pill row of categories + an "All" pill. Active state in primary color.
 */
export default function CategoryFilter({ categories = [], active, onChange }) {
  const { t } = useTranslation();
  const pill = (selected) =>
    cn(
      'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
      selected
        ? 'bg-primary text-white shadow-soft'
        : 'bg-surface text-ink-muted border border-ink/10 hover:border-primary hover:text-primary',
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={pill(!active)} onClick={() => onChange(null)}>
        {t('menu.all', { defaultValue: 'All' })}
      </button>
      {categories.map((c) => (
        <CategoryPill key={c._id} category={c} active={active} onChange={onChange} pill={pill} />
      ))}
    </div>
  );
}

function CategoryPill({ category, active, onChange, pill }) {
  const label = useLocalizedField(category.name);
  return (
    <button
      type="button"
      className={pill(active === category.slug)}
      onClick={() => onChange(category.slug)}
    >
      {label}
    </button>
  );
}
