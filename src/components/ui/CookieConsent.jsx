import { useEffect, useState } from 'react';
import './CookieConsent.css';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'deadsmile-cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'accepted') {
      setAccepted(true);
      setVisible(false);
    } else if (stored === 'declined') {
      setAccepted(false);
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setAccepted(true);
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setAccepted(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-label="Cookie consent">
      <div className="cookie-consent__inner">
        <div className="cookie-consent__message">
          <p>
            We use cookies to improve your experience and analyze site traffic.
            By clicking “Accept”, you consent to the use of all cookies.
          </p>
        </div>
        <div className="cookie-consent__actions">
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--accept"
            onClick={handleAccept}
          >
            Accept
          </button>
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--decline"
            onClick={handleDecline}
          >
            Decline
          </button>
          <Link to="/privacy" className="cookie-consent__link">
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
}