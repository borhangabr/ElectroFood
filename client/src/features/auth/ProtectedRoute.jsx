import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMeQuery } from './api';
import { selectAuthReady, selectIsAuthed } from './slice';
import Spinner from '../../core/components/Spinner';

/**
 * Gates a route on having a logged-in user.
 * Triggers a /auth/me probe if the slice hasn't been hydrated yet, so a fresh
 * page load doesn't bounce the user to /login while we figure out who they are.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const ready = useSelector(selectAuthReady);
  const authed = useSelector(selectIsAuthed);

  // Triggers the /me query only while we haven't resolved yet.
  useMeQuery(undefined, { skip: ready });

  if (!ready) return <Spinner full />;
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
