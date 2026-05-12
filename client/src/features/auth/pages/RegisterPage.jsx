import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AuthForm from '../components/AuthForm';
import Button from '../../../core/components/Button';
import Input from '../../../core/components/Input';
import { useRegisterMutation } from '../api';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  // Surface either the top-level message or a list of field-validation issues.
  const fieldErrors = (error?.data?.details || []).reduce((m, e) => {
    m[e.path] = e.message;
    return m;
  }, {});
  const apiMessage =
    error &&
    !error.data?.details &&
    (error.data?.message || error.error || t('common.error'));

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await register(form).unwrap();
      navigate('/menu', { replace: true });
    } catch {
      /* mutation error rendered below */
    }
  }

  return (
    <AuthForm
      title={t('nav.register')}
      subtitle="Create your account in 30 seconds."
      onSubmit={onSubmit}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            {t('nav.login')}
          </Link>
        </>
      }
    >
      <Input
        name="name"
        label="Name"
        autoComplete="name"
        required
        value={form.name}
        error={fieldErrors.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        value={form.email}
        error={fieldErrors.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        required
        hint="8+ characters, with a letter and a digit."
        value={form.password}
        error={fieldErrors.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
      />
      {apiMessage && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {apiMessage}
        </p>
      )}
      <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
        {isLoading ? t('common.loading') : t('nav.register')}
      </Button>
    </AuthForm>
  );
}
