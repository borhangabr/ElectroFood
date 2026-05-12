// Middleware that resets every RTK Query cache whenever the auth user changes.
//
// Why this exists: when user A logs out and user B logs in, RTK Query keeps
// A's `useListMyOrdersQuery()` result cached — B briefly sees A's orders before
// the refetch lands. Worse, after the silent refresh path in apiBase fails,
// `clearUser()` is dispatched directly (bypassing authApi.logout's onQueryStarted),
// so we'd miss the manual cache reset there too.
//
// A single middleware listening for setUser/clearUser handles every path uniformly,
// AND keeps apiBase.js free of import cycles with feature APIs.

import { menuApi } from '../features/menu/api';
import { orderApi } from '../features/orders/api';
import { adminApi } from '../features/admin/api';
import { setUser, clearUser } from '../features/auth/slice';

export function makeAuthCacheResetMiddleware() {
  return (storeApi) => (next) => (action) => {
    const before = storeApi.getState().auth?.user?.id || null;
    const result = next(action);
    if (action.type === setUser.type || action.type === clearUser.type) {
      const after = storeApi.getState().auth?.user?.id || null;
      // Only reset if the IDENTITY changed; setUser to the same user (e.g. /me
      // hydration confirming the existing session) shouldn't blow away caches.
      if (before !== after) {
        storeApi.dispatch(menuApi.util.resetApiState());
        storeApi.dispatch(orderApi.util.resetApiState());
        storeApi.dispatch(adminApi.util.resetApiState());
      }
    }
    return result;
  };
}
