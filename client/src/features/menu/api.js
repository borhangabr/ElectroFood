import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBase';

export const menuApi = createApi({
  reducerPath: 'menuApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Category', 'Product'],
  endpoints: (b) => ({
    listCategories: b.query({
      query: () => '/menu/categories',
      transformResponse: (r) => r.data.items,
      providesTags: ['Category'],
    }),
    listProducts: b.query({
      // Strips empty values so the cache key is stable across "search-then-clear".
      query: ({ category, q, page = 1, limit = 12 } = {}) => {
        const p = new URLSearchParams();
        if (category) p.set('category', category);
        if (q) p.set('q', q);
        p.set('page', String(page));
        p.set('limit', String(limit));
        return `/menu/products?${p}`;
      },
      transformResponse: (r) => r.data,
      providesTags: ['Product'],
    }),
    getProduct: b.query({
      query: (id) => `/menu/products/${id}`,
      transformResponse: (r) => r.data.product,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),
  }),
});

export const {
  useListCategoriesQuery,
  useListProductsQuery,
  useGetProductQuery,
} = menuApi;
