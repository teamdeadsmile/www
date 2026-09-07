import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowUpRight, Plus, Minus } from '@phosphor-icons/react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Reveal } from '../components/ui/Reveal';
import './Support.css';

const faqs = [
  'How do I update a game?',
  'Where can I find system requirements?',
  'How do I recover my account?',
  'Where can I report a technical issue?',
];

export function Support() {
  const { t } = useLanguage();

  const [open, setOpen] = useState(0);
  const [form, setForm] = useState({
    email: '',
    category: 'technical',
    message: '',
  });
  const [message, setMessage] = useState('');

  async function submit(e) {
    e.preventDefault();
    setMessage('');

    try {
      await api.post('/support', form);

      setMessage('Request received.');

      setForm((value) => ({
        ...value,
        message: '',
      }));
    } catch (err) {
      setMessage(err?.message || 'Unable to send request.');
    }
  }

  return (
    <div className="support-page container">
      <Link to="/" className="back-link">
        {t('common.back')}
      </Link>

      <Reveal>
        <h1>{t('support.title')}</h1>

        <p className="support-page__intro">
          {t('support.intro')}
        </p>
      </Reveal>

      <section className="support-page__grid">

        {/* FAQ */}
        <Reveal>
          <div className="support-card">
            <span>01</span>

            <h2>{t('support.faq')}</h2>

            <div className="support-faq">
              {faqs.map((question, index) => {
                const isOpen = open === index;

                return (
                  <div
                    className="support-faq-item"
                    key={question}
                  >
                    <button
                      type="button"
                      className="support-faq-question"
                      onClick={() =>
                        setOpen(isOpen ? -1 : index)
                      }
                      aria-expanded={isOpen}
                    >
                      <span>{question}</span>

                      {isOpen ? (
                        <Minus
                          size={20}
                          weight="bold"
                          aria-hidden="true"
                        />
                      ) : (
                        <Plus
                          size={20}
                          weight="bold"
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    {isOpen && (
                      <p className="support-faq-answer">
                        Find the relevant game, account or
                        technical guidance through the
                        DEADSMILE support team.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

      

      </section>
    </div>
  );
}