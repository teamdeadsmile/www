import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft } from '@phosphor-icons/react';
import './AuthPages.css';

export function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password });
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <Link to="/login" className="back-link">
          <ArrowLeft weight="bold" />
          <span>Back</span>
        </Link>
        <h1>{t('auth.register')}</h1>

        {error && <p className="auth-page__error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-page__field">
            <label htmlFor="username">{t('auth.username')}</label>
            <input id="username" required minLength={3} maxLength={24} value={form.username} onChange={update('username')} autoComplete="username" />
          </div>
          <div className="auth-page__field">
            <label htmlFor="reg-email">{t('auth.email')}</label>
            <input id="reg-email" type="email" required value={form.email} onChange={update('email')} autoComplete="email" />
          </div>
          <div className="auth-page__field">
            <label htmlFor="reg-password">{t('auth.password')}</label>
            <input id="reg-password" type="password" required minLength={8} value={form.password} onChange={update('password')} autoComplete="new-password" />
          </div>
          <div className="auth-page__field">
            <label htmlFor="confirmPassword">{t('auth.confirm')}</label>
            <input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" />
          </div>
          <Button type="submit" className="auth-page__submit" disabled={submitting}>
            {submitting ? t('auth.creating') : t('auth.create')}
          </Button>
        </form>

        <p className="auth-page__footer">
          {t('auth.existing')} <Link to="/login">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
}
