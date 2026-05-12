import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBase';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AdminCategory', 'AdminProduct', 'AdminOrder', 'AdminUser', 'AdminStats'],
  endpoints: (b) => ({
    // --- Stats ---
    stats: b.query({
      query: () => '/admin/stats',
      transformResponse: (r) => r.data,
      providesTags: ['AdminStats'],
    }),

    // --- Categories ---
    listCategories: b.query({
      query: () => '/admin/categories',
      transformResponse: (r) => r.data.items,
      providesTags: ['AdminCategory'],
    }),
    createCategory: b.mutation({
      query: (formData) => ({ url: '/admin/categories', method: 'POST', body: formData }),
      transformResponse: (r) => r.data.category,
      invalidatesTags: ['AdminCategory'],
    }),
    updateCategory: b.mutation({
      query: ({ id, formData }) => ({ url: `/admin/categories/${id}`, method: 'PATCH', body: formData }),
      transformResponse: (r) => r.data.category,
      invalidatesTags: ['AdminCategory'],
    }),
    deleteCategory: b.mutation({
      query: (id) => ({ url: `/admin/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminCategory'],
    }),

    // --- Products ---
    listProducts: b.query({
      query: ({ category, page = 1, limit = 50 } = {}) => {
        const p = new URLSearchParams();
        if (category) p.set('category', category);
        p.set('page', String(page));
        p.set('limit', String(limit));
        return `/admin/products?${p}`;
      },
      transformResponse: (r) => r.data,
      providesTags: ['AdminProduct'],
    }),
    createProduct: b.mutation({
      query: (formData) => ({ url: '/admin/products', method: 'POST', body: formData }),
      transformResponse: (r) => r.data.product,
      invalidatesTags: ['AdminProduct'],
    }),
    updateProduct: b.mutation({
      query: ({ id, formData }) => ({ url: `/admin/products/${id}`, method: 'PATCH', body: formData }),
      transformResponse: (r) => r.data.product,
      invalidatesTags: ['AdminProduct'],
    }),
    deleteProduct: b.mutation({
      query: (id) => ({ url: `/admin/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminProduct'],
    }),

    // --- Orders ---
    listOrders: b.query({
      query: ({ status, page = 1, limit = 50 } = {}) => {
        const p = new URLSearchParams();
        if (status) p.set('status', status);
        p.set('page', String(page));
        p.set('limit', String(limit));
        return `/admin/orders?${p}`;
      },
      transformResponse: (r) => r.data,
      providesTags: ['AdminOrder'],
    }),
    updateOrderStatus: b.mutation({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (r) => r.data.order,
      invalidatesTags: ['AdminOrder', 'AdminStats'],
    }),

    // --- Users ---
    listUsers: b.query({
      query: ({ page = 1, limit = 50 } = {}) => `/admin/users?page=${page}&limit=${limit}`,
      transformResponse: (r) => r.data,
      providesTags: ['AdminUser'],
    }),
    setUserBlocked: b.mutation({
      query: ({ id, isBlocked }) => ({
        url: `/admin/users/${id}/block`,
        method: 'PATCH',
        body: { isBlocked },
      }),
      transformResponse: (r) => r.data.user,
      invalidatesTags: ['AdminUser'],
    }),
  }),
});

export const {
  useStatsQuery,
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useListProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useListOrdersQuery,
  useUpdateOrderStatusMutation,
  useListUsersQuery,
  useSetUserBlockedMutation,
} = adminApi;
