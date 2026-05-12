import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../../../core/utils/cn';

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/users', label: 'Users' },
];

export default function AdminLayout() {
  const tab = ({ isActive }) =>
    cn(
      'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
      isActive ? 'bg-primary text-white shadow-soft' : 'text-ink-muted hover:text-ink',
    );

  return (
    <section className="container-app py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Admin</h1>
        <nav className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={tab}>
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <div className="mt-8">
        <Outlet />
      </div>
    </section>
  );
}
