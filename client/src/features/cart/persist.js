// Tiny cart persister. Lightweight on purpose — we don't need the
// ceremony of redux-persist for 5 lines of code.
//
// `attachCartPersistence(store)` does two things:
//   1. Hydrates the slice from localStorage on boot.
//   2. Writes the slice back to localStorage on every cart change.
// Other slices are unaffected.

import { hydrate } from './slice';

const KEY = 'fo_cart';

function safeRead() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function attachCartPersistence(store) {
  // Hydrate once.
  const saved = safeRead();
  if (saved) store.dispatch(hydrate(saved));

  // Subscribe — write only when the cart slice changes.
  let last = store.getState().cart;
  store.subscribe(() => {
    const next = store.getState().cart;
    if (next === last) return;
    last = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* quota or private mode — fail silently */
    }
  });
}
