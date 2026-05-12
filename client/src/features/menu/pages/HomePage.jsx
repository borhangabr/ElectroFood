import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Button from '../../../core/components/Button';
import { useListCategoriesQuery } from '../api';
import useLocalizedField from '../../../core/hooks/useLocalizedField';
import { cn } from '../../../core/utils/cn';

// Fallback emojis keyed by slug — used if a category has no image yet.
const EMOJI_BY_SLUG = { pizza: '🍕', burgers: '🍔', desserts: '🍰', salads: '🥗', drinks: '🥤' };

const PRICE_HINT = { pizza: 'From $9', burgers: 'From $7', desserts: 'From $4', salads: 'From $6' };

const staggerClass = (i) => `stagger-${((i ?? 0) % 8) + 1}`;

function CategoryTile({ category, index }) {
  const label = useLocalizedField(category.name);
  const emoji = EMOJI_BY_SLUG[category.slug] || '🍽️';
  return (
    <Link
      to={`/menu?category=${encodeURIComponent(category.slug)}`}
      className={cn(
        'group flex flex-col items-start overflow-hidden rounded-card bg-surface p-6 shadow-soft',
        'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift',
        'animate-fade-up',
        staggerClass(index),
      )}
    >
      {category.image ? (
        <img
          src={category.image}
          alt={label}
          loading="lazy"
          className="mb-3 h-16 w-16 rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        // Emoji wiggles on hover — playful, but only on this homepage tile, so
        // it doesn't show up everywhere food icons appear.
        <div className="mb-3 text-4xl transition-transform group-hover:animate-wiggle">
          {emoji}
        </div>
      )}
      <div className="font-semibold text-ink transition-colors group-hover:text-primary">
        {label}
      </div>
      <div className="mt-1 text-sm text-ink-muted">
        {PRICE_HINT[category.slug] || ' '}
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
        {/* Hero copy fades in from below; the CTA arrives a beat after the heading. */}
        <div>
          <h1 className="animate-fade-up text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
            {t('home.tagline')}
          </h1>
          <p className="mt-5 max-w-prose animate-fade-up stagger-2 text-lg text-ink-muted">
            {t('home.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up stagger-3">
            <Link to="/menu">
              <Button variant="primary" size="lg">
                {t('home.cta')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          {/* Soft animated glow behind the tiles — fades in once. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 translate-y-6 rounded-card bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-2xl animate-fade-in"
          />
          <div className="grid grid-cols-2 gap-4">
            {tiles.length > 0
              ? tiles.map((c, i) => <CategoryTile key={c._id} category={c} index={i} />)
              : // Placeholder skeletons while categories load (or during dev without seed).
                [0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-32 skeleton rounded-card" />
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
