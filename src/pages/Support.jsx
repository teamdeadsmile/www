import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowUpRight, Plus, Minus, Envelope, Chat, Question, CheckCircle, XCircle } from '@phosphor-icons/react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Reveal } from '../components/ui/Reveal';
import './Support.css';
import { ArrowLeft } from "@phosphor-icons/react";
const API_BASE = import.meta.env.VITE_API_URL || 'https://apideadsmile.vercel.app/api';

const CORE_ENDPOINTS = [
  { name: 'API Gateway', endpoint: '/health' },
  { name: 'CSRF Token', endpoint: '/csrf' },
];

const REQUEST_TIMEOUT = 5000;

async function checkEndpoint(endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      signal: controller.signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);
    return res.status < 500;
  } catch {
    clearTimeout(timeout);
    return false;
  }
}

function useApiStatus() {
  const [status, setStatus] = useState({ allUp: true, lastChecked: null, loading: true });

  const check = async () => {
    const results = await Promise.all(CORE_ENDPOINTS.map((ep) => checkEndpoint(ep.endpoint)));
    const allUp = results.every((v) => v === true);
    setStatus({ allUp, lastChecked: new Date(), loading: false });
  };

  useEffect(() => {
    check();
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
const faqs = [
  {
    question: 'How do I update my game?',
    answer: 'Game updates are automatically downloaded when you launch the game. If you experience issues, verify your game files or contact support.',
  },
  {
    question: 'What are the system requirements?',
    answer: 'Each game has specific system requirements. Visit the game\'s detail page and check the "System Requirements" section for minimum and recommended specifications.',
  },
  {
    question: 'How do I recover my account?',
    answer: 'Use the "Forgot password" option on the login page. If you still can\'t access your account, contact our support team with your registered email address.',
  },
  {
    question: 'Where do I report a technical issue?',
    answer: 'You can report technical issues through the form on this page or by emailing deadsmilegames@gmail.com. Please include your system specs and steps to reproduce the issue.',
  },
  {
    question: 'How do I refund a purchase?',
    answer: 'Refunds are handled on a case-by-case basis. Contact our support team via the form below or email us at deadsmilegames@gmail.com within 14 days of purchase.',
  },
];
export function Support() {
  const { t } = useLanguage();
  const { allUp, lastChecked, loading } = useApiStatus();

  const [openIndex, setOpenIndex] = useState(null);
  const [form, setForm] = useState({
    email: '',
    category: 'technical',
    message: '',
  });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setStatus('');
    setSubmitting(true);

    try {
      await api.post('/support', form);
      setStatus('success');
      setForm((prev) => ({ ...prev, message: '' }));
      setTimeout(() => setStatus(''), 5000);
    } catch (err) {
      console.error('Support form error:', err);
      setStatus('error');
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setSubmitting(false);
    }
  }

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="support-page container">
      <Link to="/" className="back-link">
        <ArrowLeft weight="bold" />
        <span>Back</span>
      </Link>

      <Reveal>
        <div className="support-page__header">
          <h1>{t('support.title') || 'Support'}</h1>
          <p className="support-page__intro">
            {t('support.intro') || "Need help? Find answers to common questions or reach out to our team. We're here to help with game issues, account problems, and more."}
          </p>
        </div>
      </Reveal>

      <section className="support-page__grid">
        <Reveal>
          <div className="support-card support-card--faq">
            <div className="support-card__icon">
              <Question weight="bold" size={28} />
            </div>
            <h2>{t('support.faq') || 'Frequently Asked'}</h2>
            <p className="support-card__sub">Quick answers to common questions.</p>

            <div className="support-faq">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div className="support-faq-item" key={index}>
                    <button
                      type="button"
                      className="support-faq-question"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <Minus size={20} weight="bold" aria-hidden="true" />
                      ) : (
                        <Plus size={20} weight="bold" aria-hidden="true" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="support-faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="support-card support-card--accent">
            <div className="support-card__icon">
              <Envelope weight="bold" size={28} />
            </div>
            <h2>{t('support.contact') || 'Contact Us'}</h2>
            <p className="support-card__sub">
              Send us a message and we'll get back to you as soon as possible.
            </p>

            <form onSubmit={submit} className="support-form" noValidate>
              <div className="support-form__field">
                <label htmlFor="support-email">Email</label>
                <input
                  id="support-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>

              <div className="support-form__field">
                <label htmlFor="support-category">Category</label>
                <select
                  id="support-category"
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                >
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account Help</option>
                  <option value="game">Game Support</option>
                  <option value="faq">FAQ / General</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="support-form__field">
                <label htmlFor="support-message">Message</label>
                <textarea
                  id="support-message"
                  required
                  rows="4"
                  value={form.message}
                  onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <button type="submit" className="support-form__submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Message'}
                <ArrowUpRight size={18} weight="bold" />
              </button>

              {status === 'success' && (
                <p className="support-form__status support-form__status--success">
                  ✓ Message sent successfully. We'll get back to you soon.
                </p>
              )}
              {status === 'error' && (
                <p className="support-form__status support-form__status--error">
                  ✗ Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>
        </Reveal>
      </section>
      <section className="support-page__extra">
        <Reveal>
          <div className="support-extra">
            <div className="support-extra__item">
              <div className="status-icon-wrapper">
                {loading ? (
                  <span className="status-spinner">…</span>
                ) : allUp ? (
                  <CheckCircle weight="fill" size={24} className="status-icon up" />
                ) : (
                  <XCircle weight="fill" size={24} className="status-icon down" />
                )}
              </div>
              <div>
                <h3>Live Status</h3>
                <p>
                  {loading
                    ? 'Checking services…'
                    : allUp
                    ? 'All systems operational.'
                    : 'Some services are experiencing issues.'}
                  {lastChecked && (
                    <span className="status-timestamp">
                      {' '}
                      · Updated {lastChecked.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="support-extra__item">
              <Envelope weight="bold" size={24} />
              <div>
                <h3>Direct Email</h3>
                <p>
                  For urgent issues, reach us directly at{' '}
                  <a href="mailto:deadsmilegames@gmail.com">deadsmilegames@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}