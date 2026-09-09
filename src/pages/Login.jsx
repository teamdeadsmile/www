import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ShieldCheck } from '@phosphor-icons/react';
import { useLanguage } from '../context/LanguageContext';
import './AuthPages.css';

export function Login() {
  const { login, refresh } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/account';

  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSubmitting, setTwoFactorSubmitting] = useState(false);

async function handleSubmit(e) {
  e.preventDefault();
  setError(null);
  setSubmitting(true);
  try {
    const response = await login(form.email, form.password);
    console.log('Login response FULL:', response); // ← log completo
    if (response?.requiresTwoFactor) {
      console.log('2FA required, userId:', response.userId); // ← log específico
      setTwoFactorRequired(true);
      setTempUserId(response.userId);
      setSubmitting(false);
    } else {
      navigate(from, { replace: true });
    }
  } catch (err) {
    setError(err.message);
    setSubmitting(false);
  } finally {
    setSubmitting(false);
  }
}

async function verifyTwoFactor(e) {
  e.preventDefault();
  setTwoFactorSubmitting(true);
  setError(null);
  const payload = { userId: tempUserId, token: twoFactorCode };
  console.log('verify payload:', payload); // ← log do payload
  try {
    await api.post('/auth/verify-2fa', payload);
    await refresh();
    navigate(from, { replace: true });
  } catch (err) {
    setError(err.message);
  } finally {
    setTwoFactorSubmitting(false);
  }
}

  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <Link to="/" className="back-link">
          <ArrowLeft weight="bold" />
          <span>Back</span>
        </Link>

        <h1>{twoFactorRequired ? 'Two-Factor Authentication' : t('auth.login')}</h1>

        {error && <p className="auth-page__error" role="alert">{error}</p>}

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
          <form onSubmit={verifyTwoFactor} noValidate>
            <div className="auth-page__field">
              <label htmlFor="twoFactorCode">Authenticator Code</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck weight="bold" size={20} style={{ color: '#888' }} />
                <input
                  id="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
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