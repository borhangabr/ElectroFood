// Redux Toolkit store. Slices and RTK Query APIs plug in as phases land.

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import authReducer from '../features/auth/slice';
import cartReducer from '../features/cart/slice';
import { authApi } from '../features/auth/api';
import { menuApi } from '../features/menu/api';
import { orderApi } from '../features/orders/api';
import { adminApi } from '../features/admin/api';
import { makeAuthCacheResetMiddleware } from './authCacheReset';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [authApi.reducerPath]: authApi.reducer,
    [menuApi.reducerPath]: menuApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (gDM) =>
    gDM().concat(
      authApi.middleware,
      menuApi.middleware,
      orderApi.middleware,
      adminApi.middleware,
      makeAuthCacheResetMiddleware(),
    ),
});

setupListeners(store.dispatch);
