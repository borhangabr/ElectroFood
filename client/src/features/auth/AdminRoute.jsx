import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMeQuery } from './api';
import { selectAuthReady, selectIsAdmin, selectIsAuthed } from './slice';
import Spinner from '../../core/components/Spinner';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const ready = useSelector(selectAuthReady);
  const authed = useSelector(selectIsAuthed);
  const admin = useSelector(selectIsAdmin);

  useMeQuery(undefined, { skip: ready });

  if (!ready) return <Spinner full />;
  if (!authed) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!admin) return <Navigate to="/" replace />;
  return children;
}
