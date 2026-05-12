import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
//
// The `/api` proxy keeps the browser talking only to :5173 in dev, so
// httpOnly cookies behave as same-origin — sidestepping SameSite/secure
// pain on cross-origin localhost. Production builds hit VITE_API_URL directly.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
