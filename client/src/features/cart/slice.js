// Cart slice. Holds the customer's pending items entirely in the browser.
// Persisted to localStorage via features/cart/persist.js (subscribe in store.js).
//
// Each line stores enough product info to render the cart without re-fetching:
//   { productId, name: {en,ar}, image, price, quantity }
// On checkout we send only { productId, quantity }; the server re-prices.

import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action) {
      const p = action.payload;
      const existing = state.items.find((i) => i.productId === p._id);
      if (existing) {
        existing.quantity = Math.min(99, existing.quantity + 1);
      } else {
        state.items.push({
          productId: p._id,
          name: p.name,
          image: p.image || '',
          price: p.price,
          quantity: 1,
        });
      }
    },
    setQuantity(state, action) {
      const { productId, quantity } = action.payload;
      const line = state.items.find((i) => i.productId === productId);
      if (!line) return;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.productId !== productId);
      } else {
        line.quantity = Math.min(99, quantity);
      }
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
    // Used by persist.js on boot to hydrate from localStorage.
    hydrate(state, action) {
      const next = action.payload;
      if (next && Array.isArray(next.items)) state.items = next.items;
    },
  },
});

export const { addItem, setQuantity, removeItem, clearCart, hydrate } = slice.actions;

export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = (s) =>
  s.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartSubtotal = (s) =>
  Math.round(s.cart.items.reduce((n, i) => n + i.price * i.quantity, 0) * 100) / 100;

export default slice.reducer;
