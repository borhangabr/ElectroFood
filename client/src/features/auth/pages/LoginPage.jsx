import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AuthForm from '../components/AuthForm';
import Button from '../../../core/components/Button';
import Input from '../../../core/components/Input';
import { useLoginMutation } from '../api';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading, error }] = useLoginMutation();
  const [form, setForm] = useState({ email: '', password: '' });

  const apiError =
    error && (error.data?.message || error.error || t('common.error'));

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login(form).unwrap();
      const next = location.state?.from?.pathname || '/menu';
      navigate(next, { replace: true });
    } catch {
      /* error surfaced via mutation `error` */
    }
  }

  return (
    <AuthForm
      title={t('nav.login')}
      subtitle="Welcome back."
      onSubmit={onSubmit}
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            {t('nav.register')}
          </Link>
        </>
      }
    >
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
      />
      {apiError && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {apiError}
        </p>
      )}
      <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
        {isLoading ? t('common.loading') : t('nav.login')}
      </Button>
    </AuthForm>
  );
}
