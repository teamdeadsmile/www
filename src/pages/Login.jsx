import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from '@phosphor-icons/react';
import { useLanguage } from '../context/LanguageContext';
import './AuthPages.css';

export function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/account';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
      <Link to="/" className="back-link">
        <ArrowLeft weight="bold" />
        <span>Back</span>
      </Link>
        <h1>{t('auth.login')}</h1>

        {error && <p className="auth-page__error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-page__field">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="auth-page__field">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <Button type="submit" className="auth-page__submit" disabled={submitting}>
            {submitting ? t('auth.signing') : t('auth.login')}
          </Button>
        </form>

        <p className="auth-page__footer">
          {t('auth.newTo')} <Link to="/register">{t('auth.create')}</Link>
        </p>
      </div>
    </div>
  );
}
