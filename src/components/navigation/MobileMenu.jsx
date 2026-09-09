import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowUpRight, MagnifyingGlass, X, Heart, File, LockKey } from '@phosphor-icons/react';
import './MobileMenu.css';

export function MobileMenu({ open, onClose, onOpenSearch }) {
    const { user, status } = useAuth();
    const { t } = useLanguage();
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        document.body.style.overflow = 'hidden';
        const key = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', key);
        panelRef.current?.focus();
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', key);
        };
    }, [open, onClose]);

    const links = [
        ['/', 'nav.home'],
        ['/games', 'nav.games'],
        ['/downloads', 'nav.downloads'],
        ['/news', 'nav.news'],
        ['/videos', 'nav.videos'],
        ['/support', 'nav.support'],
    ];

    return (
        <div className={`mobile-menu ${open ? 'mobile-menu--open' : ''}`} aria-hidden={!open}>
            <div className="mobile-menu__backdrop" onClick={onClose} />
            <div
                className="mobile-menu__panel"
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                ref={panelRef}
            >
                <div className="mobile-menu__top">
                    <Link to="/" className="mobile-menu__brand" onClick={onClose}>
                        <img src="/assets/branding/deadsmile-mark.svg" alt="Deadsmile Games" style={{ height: 28 }} />
                    </Link>
                    <button
                        type="button"
                        className="mobile-menu__close"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <X weight="bold" />
                    </button>
                </div>

                <nav className="mobile-menu__nav">
                    {links.map(([to, key], i) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={onClose}
                            className="mobile-menu__link"
                            style={{ '--menu-delay': `${i * 45}ms` }}
                        >
                            <span>{t(key)}</span>
                            <ArrowUpRight weight="bold" className="mobile-menu__arrow" />
                        </Link>
                    ))}

                    <button
                        type="button"
                        className="mobile-menu__link mobile-menu__link--button"
                        onClick={() => {
                            onClose();
                            onOpenSearch?.();
                        }}
                    >
                        <span>{t('nav.search')}</span>
                        <MagnifyingGlass weight="bold" className="mobile-menu__arrow" />
                    </button>

                    <Link to="/presskit" onClick={onClose} className="mobile-menu__link" style={{ '--menu-delay': '200ms' }}>
                        <span>Press Kit</span>
                        <File weight="bold" className="mobile-menu__arrow" />
                    </Link>

                    <Link to="/privacy" onClick={onClose} className="mobile-menu__link" style={{ '--menu-delay': '245ms' }}>
                        <span>Privacy</span>
                        <LockKey weight="bold" className="mobile-menu__arrow" />
                    </Link>

                    {status === 'authenticated' && (
                        <Link to="/wishlist" onClick={onClose} className="mobile-menu__link" style={{ '--menu-delay': '290ms' }}>
                            <span>Wishlist</span>
                            <Heart weight="bold" className="mobile-menu__arrow" />
                        </Link>
                    )}
                </nav>

                <div className="mobile-menu__footer">
                    {status === 'authenticated' ? (
                        <Link to="/account" className="mobile-menu__account" onClick={onClose}>
                            {user?.username}
                        </Link>
                    ) : (
                        <Link to="/login" className="mobile-menu__account" onClick={onClose}>
                            {t('nav.signIn')}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
