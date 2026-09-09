import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react';
import { useLanguage } from '../context/LanguageContext';
import './AuthPages.css';

export function Login() {
  const { login, verifyTwoFactor } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSubmitting, setTwoFactorSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/account';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await login(form.email, form.password);

      if (response?.requiresTwoFactor) {
        setTwoFactorRequired(true);
        setTwoFactorCode('');
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTwoFactorSubmit(e) {
    e.preventDefault();
    setError(null);

    const token = twoFactorCode.replace(/\D/g, '').slice(0, 6);
    if (token.length !== 6) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setTwoFactorSubmitting(true);

    try {
      await verifyTwoFactor(token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setTwoFactorSubmitting(false);
    }
  }

  function cancelTwoFactor() {
    setTwoFactorRequired(false);
    setTwoFactorCode('');
    setError(null);
  }

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <Link to="/" className="back-link">
          <ArrowLeft weight="bold" />
          <span>Back</span>
        </Link>

        <h1>{twoFactorRequired ? 'Two-Factor Authentication' : t('auth.login')}</h1>

        {error && <p className="auth-page__error" role="alert" aria-live="polite">{error}</p>}

        {!twoFactorRequired ? (
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
        ) : (
          <form onSubmit={handleTwoFactorSubmit} noValidate>
            <div className="auth-page__field">
              <label htmlFor="twoFactorCode">Authenticator Code</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck weight="bold" size={20} style={{ color: '#888' }} />
                <input
                  id="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  required
                  autoFocus
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#777', marginTop: 8 }}>
                Enter the code from your authenticator app.
              </p>
            </div>
            <Button type="submit" className="auth-page__submit" disabled={twoFactorSubmitting}>
              {twoFactorSubmitting ? 'Verifying…' : 'Verify & Sign In'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={cancelTwoFactor}
              disabled={twoFactorSubmitting}
            >
              Back to sign in
            </Button>
          </form>
        )}

        {!twoFactorRequired && (
          <p className="auth-page__footer">
            {t('auth.newTo')} <Link to="/register">{t('auth.create')}</Link>
          </p>
        )}
      </div>
    </div>
  );
}
