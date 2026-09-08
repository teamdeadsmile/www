import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { GameHero } from '../components/games/GameHero';
import { GameMeta } from '../components/games/GameMeta';
import { GameGrid } from '../components/games/GameGrid';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { Lightbox } from '../components/ui/Lightbox';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, ShoppingCart, Heart, HeartStraight, Play, DownloadSimple } from '@phosphor-icons/react';
import './GameDetails.css';

export function GameDetails() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const { status: authStatus } = useAuth();
  const [state, setState] = useState({
    status: 'loading',
    game: null,
    error: null,
  });
  const [revision, setRevision] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const game = state.game;
  const numericGameId = game?.id ? Number(game.id) : null;
  const isValidGameId = numericGameId && !isNaN(numericGameId) && Number.isInteger(numericGameId);
  const { inWishlist, loading: wishlistLoading, toggle } = useWishlist(isValidGameId ? numericGameId : null);

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

  const totalImages = 6;
  const screenshots = game
    ? Array.from({ length: totalImages }, (_, i) =>
        `/assets/games/screenshots/${game.slug}/${i + 1}.png`
      )
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
            {game.purchaseUrl && (
              <a
                href={game.purchaseUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn--primary game-details__btn"
              >
                <ShoppingCart weight="bold" />
                <span>Get Game</span>
              </a>
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

            {game.downloadUrl && (
              <a
                href={game.downloadUrl}
                className="btn btn--secondary game-details__btn"
              >
                <DownloadSimple weight="bold" />
                <span>Download</span>
              </a>
            )}
          </div>

          <div className="game-details__screenshots">
            <h3 className="game-details__screenshots-title">Screenshots</h3>
            {screenshots.length > 0 ? (
              <div className="game-details__screenshots-grid">
                {screenshots.map((src, i) => (
                  <div
                    key={i}
                    className="game-details__screenshot-item"
                    onClick={() => openLightbox(i)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open screenshot ${i + 1}`}
                  >
                    <img src={src} alt={`Screenshot ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="game-details__screenshots-empty">No screenshots available.</p>
            )}
          </div>
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
    </div>
  );
}