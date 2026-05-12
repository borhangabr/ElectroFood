import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useListCategoriesQuery, useListProductsQuery } from '../api';
import useDebounce from '../../../core/hooks/useDebounce';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import Spinner from '../../../core/components/Spinner';

export default function MenuPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();

  // URL is the source of truth — bookmarks and shares work, back button works.
  const category = params.get('category') || '';
  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const q = useDebounce(searchInput, 300);

  const { data: categories = [] } = useListCategoriesQuery();
  const { data: page, isFetching, error } = useListProductsQuery({
    category: category || undefined,
    q: q || undefined,
    page: 1,
    limit: 24,
  });

  function onCategory(slug) {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setParams(next, { replace: true });
  }

  function onSearchInput(v) {
    setSearchInput(v);
    const next = new URLSearchParams(params);
    if (v) next.set('q', v);
    else next.delete('q');
    setParams(next, { replace: true });
  }

  const items = page?.items || [];

  return (
    <section className="container-app py-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.menu')}</h1>
          <p className="mt-1 text-ink-muted">
            {t('menu.subtitle', { defaultValue: 'Tap an item to add it to your cart.' })}
          </p>
        </div>
        <div className="w-full sm:w-80">
          <SearchBar value={searchInput} onChange={onSearchInput} />
        </div>
      </header>

      <div className="mt-6">
        <CategoryFilter categories={categories} active={category} onChange={onCategory} />
      </div>

      {error && (
        <div className="mt-8 rounded-card bg-danger/10 px-4 py-3 text-sm text-danger">
          {error.data?.message || t('common.error')}
        </div>
      )}

      {isFetching && !items.length ? (
        <Spinner full />
      ) : items.length === 0 ? (
        <div className="mt-12 rounded-card bg-surface px-6 py-12 text-center shadow-soft">
          <p className="text-lg font-medium">
            {t('menu.empty', { defaultValue: 'Nothing matched your search.' })}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {t('menu.tryAgain', { defaultValue: 'Try a different keyword or category.' })}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
