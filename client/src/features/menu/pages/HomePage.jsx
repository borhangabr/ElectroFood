import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../../../core/components/Button';
import { useListCategoriesQuery } from '../api';
import useLocalizedField from '../../../core/hooks/useLocalizedField';

// Fallback emojis keyed by slug — used if a category has no image yet.
const EMOJI_BY_SLUG = { pizza: '🍕', burgers: '🍔', desserts: '🍰', salads: '🥗', drinks: '🥤' };

const PRICE_HINT = { pizza: 'From $9', burgers: 'From $7', desserts: 'From $4', salads: 'From $6' };

function CategoryTile({ category }) {
  const label = useLocalizedField(category.name);
  const emoji = EMOJI_BY_SLUG[category.slug] || '🍽️';
  return (
    <Link
      to={`/menu?category=${encodeURIComponent(category.slug)}`}
      className="group flex flex-col items-start overflow-hidden rounded-card bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
    >
      {category.image ? (
        <img
          src={category.image}
          alt={label}
          loading="lazy"
          className="mb-3 h-16 w-16 rounded-md object-cover"
        />
      ) : (
        <div className="mb-3 text-4xl">{emoji}</div>
      )}
      <div className="font-semibold text-ink group-hover:text-primary">{label}</div>
      <div className="mt-1 text-sm text-ink-muted">
        {PRICE_HINT[category.slug] || ' '}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const { data: categories = [] } = useListCategoriesQuery();
  const tiles = categories.slice(0, 4);

  return (
    <section className="container-app py-16 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
            {t('home.tagline')}
          </h1>
          <p className="mt-5 max-w-prose text-lg text-ink-muted">
            {t('home.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu">
              <Button variant="primary" size="lg">
                {t('home.cta')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 translate-y-6 rounded-card bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-2xl"
          />
          <div className="grid grid-cols-2 gap-4">
            {tiles.length > 0
              ? tiles.map((c) => <CategoryTile key={c._id} category={c} />)
              : // Placeholder skeletons while categories load (or during dev without seed).
                [0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-card bg-surface shadow-soft" />
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
