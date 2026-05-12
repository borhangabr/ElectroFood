import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBase';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Order', 'Orders'],
  endpoints: (b) => ({
    createOrder: b.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      transformResponse: (r) => r.data.order,
      invalidatesTags: ['Orders'],
    }),
    listMyOrders: b.query({
      query: ({ page = 1, limit = 20 } = {}) => `/orders/mine?page=${page}&limit=${limit}`,
      transformResponse: (r) => r.data,
      providesTags: ['Orders'],
    }),
    // Accepts either a string id or { id, token } for guest reads.
    getOrder: b.query({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        const token = typeof arg === 'string' ? null : arg.token;
        return token
          ? `/orders/${id}?token=${encodeURIComponent(token)}`
          : `/orders/${id}`;
      },
      transformResponse: (r) => r.data.order,
      providesTags: (_r, _e, arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        return [{ type: 'Order', id }];
      },
    }),
    // Accepts { orderId, guestToken? }.
    createCheckoutSession: b.mutation({
      query: (body) => ({
        url: '/payment/checkout-session',
        method: 'POST',
        body,
      }),
      transformResponse: (r) => r.data,
    }),
    // Local-dev fallback for when Stripe CLI isn't tunneling webhooks.
    // Server asks Stripe directly via sessions.retrieve and marks paid if so.
    // Invalidates the matching Order so the tracking page refetches & shows "paid".
    confirmPayment: b.mutation({
      query: (body) => ({ url: '/payment/confirm', method: 'POST', body }),
      transformResponse: (r) => r.data,
      invalidatesTags: (_r, _e, body) => [{ type: 'Order', id: body.orderId }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useListMyOrdersQuery,
  useGetOrderQuery,
  useCreateCheckoutSessionMutation,
  useConfirmPaymentMutation,
} = orderApi;
