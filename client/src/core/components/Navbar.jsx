import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import LangToggle from './LangToggle';
import BrandMark from './BrandMark';
import { cn } from '../utils/cn';
import { selectIsAuthed, selectIsAdmin, selectUser } from '../../features/auth/slice';
import { useLogoutMutation } from '../../features/auth/api';
import CartIcon from '../../features/cart/components/CartIcon';

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthed = useSelector(selectIsAuthed);
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectUser);
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  const link = ({ isActive }) =>
    cn(
      'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
      isActive ? 'text-primary' : 'text-ink-muted hover:text-ink',
    );

  async function onLogout() {
    try {
      await logout().unwrap();
    } catch {
      /* still clears state */
    }
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-bg/85 backdrop-blur">
      <nav className="container-app flex h-16 items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-ink">
          <BrandMark className="h-6 w-6 text-primary" />
          {t('brand')}
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <NavLink to="/menu" className={link}>
            {t('nav.menu')}
          </NavLink>
          {isAuthed && (
            <NavLink to="/orders" className={link}>
              {t('nav.orders')}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={link}>
              {t('nav.admin')}
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-1">
          <CartIcon />
          <LangToggle />
          {isAuthed ? (
            <>
              <span className="ms-2 hidden text-sm text-ink-muted sm:inline">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                className="ms-1 rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink disabled:opacity-50"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="ms-1 rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="ms-1 hidden rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark sm:inline-block"
              >
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
