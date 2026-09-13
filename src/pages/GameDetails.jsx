import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { GameHero } from '../components/games/GameHero';
import { GameMeta } from '../components/games/GameMeta';
import { GameGrid } from '../components/games/GameGrid';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { Lightbox } from '../components/ui/Lightbox';
import { Modal } from '../components/ui/Modal';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, ShoppingCart, Heart, HeartStraight, Play, DownloadSimple, GameController } from '@phosphor-icons/react';
import './GameDetails.css';

const LAUNCHER_DOWNLOAD_URL = 'https://github.com/deadsmilegames/launcher/releases/latest';

export function GameDetails() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const { status: authStatus } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({
    status: 'loading',
    game: null,
    error: null,
  });
  const [revision, setRevision] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [owned, setOwned] = useState(false);
  const [purchase, setPurchase] = useState({ open: false, status: 'idle', message: '' });
  const [launcherMissing, setLauncherMissing] = useState(false);

  const game = state.game;
  const gameId = game?.id || null;
  const isValidGameId = gameId && typeof gameId === 'string' && gameId.length > 0;
  const { inWishlist, loading: wishlistLoading, toggle } = useWishlist(isValidGameId ? gameId : null);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', game: null, error: null });

    api.get(`/games/${slug}`)
      .then((game) => {
        if (!cancelled) setState({ status: 'success', game, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            status: err.status === 404 ? 'not-found' : 'error',
            game: null,
            error: err.message,
          });
        }
      });

    return () => { cancelled = true; };
  }, [slug, revision]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !gameId) return;
    api.get('/library')
      .then((data) => setOwned((data?.items || []).some((item) => item.id === gameId)))
      .catch(() => {});
  }, [authStatus, gameId]);

  async function verifyPurchase(openCheckout = true) {
    if (authStatus !== 'authenticated') {
      navigate('/login', { state: { from: `/games/${slug}` } });
      return;
    }
    try {
      setPurchase({ open: true, status: 'checking', message: '' });
      const result = await api.post(`/library/${gameId}/verify`);
      if (result.owned) {
        setOwned(true);
        setPurchase({ open: true, status: 'owned', message: '' });
        return;
      }
      setPurchase({ open: true, status: 'checkout', message: '' });
      if (openCheckout && result.purchaseUrl) window.open(result.purchaseUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      if (error?.code === 'ITCH_NOT_CONNECTED') {
        setPurchase({ open: true, status: 'connect', message: '' });
      } else {
        setPurchase({ open: true, status: 'error', message: 'We could not verify this purchase right now. Please try again.' });
      }
    }
  }

  async function connectItch() {
    try {
      const result = await api.post('/integrations/itch/connect', {
        client: 'site',
        locale: 'en',
        returnPath: `/games/${slug}`,
      });
      window.location.assign(result.authorizeUrl);
    } catch {
      setPurchase({ open: true, status: 'error', message: 'We could not start the itch.io connection right now.' });
    }
  }
  function openInLauncher() {
    setLauncherMissing(false);
    const url = `deadsmile://launch?gameId=${gameId}`;
    window.location.href = url;
    const timer = setTimeout(() => setLauncherMissing(true), 2000);
    const cleanup = () => clearTimeout(timer);
    window.addEventListener('blur', cleanup, { once: true });
    window.addEventListener('visibilitychange', cleanup, { once: true });
  }

  useEffect(() => {
    if (!purchase.open || purchase.status !== 'checkout') return undefined;
    const onFocus = () => verifyPurchase(false);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [purchase.open, purchase.status, gameId]);

  const screenshots = game
    ? (game.screenshots && game.screenshots.length > 0
        ? game.screenshots
        : Array.from({ length: 6 }, (_, i) =>
            `/assets/games/screenshots/${game.slug}/${i + 1}.png`
          ))
    : [];

  const openLightbox = (index) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);
  const goPrev = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + screenshots.length) % screenshots.length);
  };
  const goNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % screenshots.length);
  };

  if (state.status === 'loading') {
    return (
      <div className="game-details container">
        <Skeleton style={{ height: '60vh', marginTop: 'var(--header-height)' }} />
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className="container game-details__notfound">
        <ErrorState
          title="GAME NOT FOUND"
          message="That title doesn't exist in our catalog."
        />
        <Link to="/games" className="btn btn--secondary">
          <ArrowLeft weight="bold" />
          <span>Browse games</span>
        </Link>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="container game-details__notfound">
        <Link to="/games" className="back-link">
          <ArrowLeft weight="bold" />
          <span>Back</span>
        </Link>
        <ErrorState
          message={state.error}
          onRetry={() => setRevision((v) => v + 1)}
        />
      </div>
    );
  }

  return (
    <div className="game-details">
      <GameHero game={game} isDetail />

      <div className="container game-details__body">
        <div className="game-details__main">
          <h2>{t('games.about')}</h2>
          <p>{game.description || game.shortDescription}</p>

          <div className="game-details__actions">
            {game.commerceEnabled && !owned && (
              <button
                type="button"
                onClick={() => verifyPurchase(true)}
                className="btn btn--primary game-details__btn"
              >
                <ShoppingCart weight="bold" />
                <span>Buy on itch.io</span>
              </button>
            )}

            {game.commerceEnabled && owned && (
              <button
                type="button"
                onClick={openInLauncher}
                className="btn btn--primary game-details__btn"
              >
                <GameController weight="bold" />
                <span>Play in Launcher</span>
              </button>
            )}
            {launcherMissing && (
              <p className="game-details__launcher-hint">
                Launcher not found.{' '}
                <a
                  href={LAUNCHER_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download it here
                </a>{' '}
                and try again.
              </p>
            )}

            {authStatus === 'authenticated' && isValidGameId && (
              <button
                className={`btn game-details__btn ${inWishlist ? 'btn--primary' : 'btn--secondary'}`}
                onClick={toggle}
                disabled={wishlistLoading}
              >
                {inWishlist ? (
                  <>
                    <HeartStraight weight="fill" />
                    <span>Wishlisted</span>
                  </>
                ) : (
                  <>
                    <Heart weight="bold" />
                    <span>Wishlist</span>
                  </>
                )}
              </button>
            )}

            {game.trailerUrl && (
              <a
                href={game.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn--secondary game-details__btn"
              >
                <Play weight="bold" />
                <span>Trailer</span>
              </a>
            )}

            {!game.commerceEnabled && game.downloadUrl && (
              <a
                href={game.downloadUrl}
                className="btn btn--secondary game-details__btn"
              >
                <DownloadSimple weight="bold" />
                <span>Download</span>
              </a>
            )}
          </div>

          {screenshots.length > 0 && (
            <div className="game-details__screenshots">
              <h3 className="game-details__screenshots-title">Screenshots</h3>
              <div className="game-details__screenshots-grid">
                {screenshots.map((src, i) => (
                  <div
                    key={i}
                    className="game-details__screenshot-item"
                    onClick={() => openLightbox(i)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openLightbox(i)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open screenshot ${i + 1}`}
                  >
                    <img src={src} alt={`Screenshot ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="game-details__aside">
          <GameMeta game={game} />
          {game.trailerUrl && (
            <a
              href={game.trailerUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary game-details__trailer"
            >
              <Play weight="bold" />
              Watch trailer
            </a>
          )}
        </aside>
      </div>

      {game.relatedGames?.length > 0 && (
        <section className="container game-details__related">
          <h2>{t('games.related')}</h2>
          <GameGrid games={game.relatedGames} />
        </section>
      )}

      <Lightbox
        images={screenshots}
        selectedIndex={selectedImageIndex}
        onClose={closeLightbox}
        onPrev={goPrev}
        onNext={goNext}
      />
      <Modal
        open={purchase.open}
        onClose={() => setPurchase((current) => ({ ...current, open: false }))}
        labelledBy="purchase-dialog-title"
      >
        <div className="purchase-dialog">
          <h2 id="purchase-dialog-title">
            {purchase.status === 'connect' && 'Connect your itch.io account'}
            {purchase.status === 'checking' && 'Checking your library'}
            {purchase.status === 'checkout' && 'Complete your purchase'}
            {purchase.status === 'owned' && 'Game verified'}
            {purchase.status === 'error' && 'Verification unavailable'}
          </h2>
          <p>
            {purchase.status === 'connect' && 'Deadsmile uses your itch.io account only to verify games you purchased or claimed.'}
            {purchase.status === 'checking' && 'We are securely checking this game against your itch.io library.'}
            {purchase.status === 'checkout' && 'Complete the checkout on itch.io, then return to this tab. Your library will update automatically.'}
            {purchase.status === 'owned' && 'This game is now available in your Deadsmile library and launcher.'}
            {purchase.status === 'error' && purchase.message}
          </p>
          <div className="purchase-dialog__actions">
            {purchase.status === 'connect' && <button className="btn btn--primary" onClick={connectItch}>Connect itch.io</button>}
            {purchase.status === 'checkout' && <button className="btn btn--primary" onClick={() => verifyPurchase(false)}>Verify purchase</button>}
            {purchase.status === 'checkout' && <a className="btn btn--secondary" href={game.purchaseUrl} target="_blank" rel="noreferrer">Open checkout</a>}
            {purchase.status === 'error' && <button className="btn btn--secondary" onClick={() => verifyPurchase(false)}>Try again</button>}
            {purchase.status === 'owned' && (
              <button className="btn btn--primary" onClick={() => { setPurchase((c) => ({ ...c, open: false })); openInLauncher(); }}>
                <GameController weight="bold" />
                Play in Launcher
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
