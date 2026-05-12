// Auth slice — just the current user object and a hydration flag.
// Token storage isn't a concern: tokens live in httpOnly cookies the JS can't see.
//
//   status: 'idle'    — haven't asked the server yet (boot)
//           'loading' — /auth/me in flight
//           'ready'   — we have a definitive answer (user or null)

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  status: 'idle',
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setStatus(state, action) {
      state.status = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.status = 'ready';
    },
    clearUser(state) {
      state.user = null;
      state.status = 'ready';
    },
  },
});

export const { setStatus, setUser, clearUser } = slice.actions;

// Selectors — keep selectors with their slice so consumers don't have to know shape.
export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectIsAuthed = (s) => Boolean(s.auth.user);
export const selectIsAdmin = (s) => s.auth.user?.role === 'admin';
export const selectAuthReady = (s) => s.auth.status === 'ready';

export default slice.reducer;
