import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from '@phosphor-icons/react';
import './AuthPages.css';

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) setError('This reset link is invalid or incomplete.');
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err?.message || 'Unable to reset password.');
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

        <h1>New password</h1>

        {done ? (
          <p style={{ color: '#79cf8a', lineHeight: 1.6 }}>
            Password updated. Redirecting to sign in…
          </p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <p className="auth-page__error" role="alert">{error}</p>
            )}

            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 20 }}>
              Choose a new password for your account.
            </p>

            <div className="auth-page__field">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="auth-page__field">
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="auth-page__submit"
              disabled={submitting || !token}
            >
              {submitting ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}