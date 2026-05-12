// Shared RTK Query baseQuery for the whole app.
//
// Simplified: we use a single long-lived access token cookie (7d TTL), so
// there's no refresh dance. On a 401, we just clear the user — the UI will
// redirect to login.
//
// Every feature's api.js does `createApi({ baseQuery: baseQueryWithReauth, ... })`.

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clearUser } from '../features/auth/slice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  credentials: 'include',
});

export async function baseQueryWithReauth(args, api, extraOptions) {
  const result = await rawBaseQuery(args, api, extraOptions);

  const isMeCall =
    typeof args === 'string'
      ? args === '/auth/me'
      : args.url === '/auth/me';

  // On 401, clear the user state so UI redirects to login.
  // Don't clear on the /auth/me call itself — that's checked at app start
  // and a 401 there just means "not logged in yet."
  if (result.error?.status === 401 && !isMeCall) {
    api.dispatch(clearUser());
  }

  return result;
}
