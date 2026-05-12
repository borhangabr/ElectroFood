// Shared RTK Query baseQuery for the whole app.
//
// Two responsibilities:
//   1. Send credentials (cookies) with every request, since auth is httpOnly-cookie based.
//   2. On a 401, transparently try POST /auth/refresh once, then replay the original request.
//      If the refresh fails, the user is logged out (slice clears + redirect happens in UI).
//
// Every feature's api.js does `createApi({ baseQuery: baseQueryWithReauth, ... })`.

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setUser, clearUser } from '../features/auth/slice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  credentials: 'include',
});

// Coalesce concurrent refresh attempts — if two requests both 401 at the same
// moment, the second one waits on the first refresh instead of firing a duplicate.
let refreshPromise = null;

export async function baseQueryWithReauth(args, api, extraOptions) {
  let result = await rawBaseQuery(args, api, extraOptions);

  // Don't try to refresh the refresh call itself.
  const isAuthCall =
    typeof args === 'string'
      ? args.startsWith('/auth/')
      : args.url?.startsWith('/auth/');

  if (result.error?.status === 401 && !isAuthCall) {
    if (!refreshPromise) {
      refreshPromise = rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      ).finally(() => {
        // Always clear so the next 401 can trigger a fresh attempt.
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      });
    }
    const refresh = await refreshPromise;

    if (refresh.data?.success) {
      // Sync the user slice with whoever logged in, then replay the original request.
      api.dispatch(setUser(refresh.data.data.user));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearUser());
    }
  }

  return result;
}
