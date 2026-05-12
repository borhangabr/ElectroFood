// Auth endpoints.
//
// Cross-user data leak prevention is handled by app/authCacheReset.js: a
// middleware watches for setUser/clearUser identity changes and dispatches
// resetApiState() on every feature API. That way the silent-refresh path in
// apiBase.js gets the same treatment as the explicit login/logout flow,
// with no import cycles.

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../app/apiBase';
import { setUser, clearUser } from './slice';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (b) => ({
    me: b.query({
      query: () => '/auth/me',
      transformResponse: (r) => r.data.user,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {
          dispatch(clearUser());
        }
      },
    }),
    login: b.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (r) => r.data.user,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {
          /* error surfaces via mutation result */
        }
      },
    }),
    register: b.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (r) => r.data.user,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch {
          /* swallow */
        }
      },
    }),
    logout: b.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearUser());
        }
      },
    }),
  }),
});

export const {
  useMeQuery,
  useLazyMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = authApi;
