import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStatus } from './features/auth/slice';
import { useLazyMeQuery } from './features/auth/api';
import { selectAuthReady } from './features/auth/slice';

import Navbar from './core/components/Navbar';
import Footer from './core/components/Footer';
import AppRoutes from './routes/AppRoutes';

/**
 * App shell. On first mount we probe /auth/me once so the navbar and any
 * protected route knows immediately whether we already have a valid cookie.
 * The probe's outcome (success → setUser, failure → clearUser) is handled
 * inside the authApi endpoint onQueryStarted.
 */
export default function App() {
  const dispatch = useDispatch();
  const ready = useSelector(selectAuthReady);
  const [fetchMe] = useLazyMeQuery();

  useEffect(() => {
    if (ready) return;
    dispatch(setStatus('loading'));
    fetchMe();
  }, [ready, dispatch, fetchMe]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
