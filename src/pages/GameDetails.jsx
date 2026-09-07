import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { GameHero } from '../components/games/GameHero';
import { GameMeta } from '../components/games/GameMeta';
import { GameGallery } from '../components/games/GameGallery';
import { GameGrid } from '../components/games/GameGrid';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import './GameDetails.css';
import { useLanguage } from '../context/LanguageContext';

export function GameDetails() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [state, setState] = useState({ status: 'loading', game: null, error: null });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', game: null, error: null });

    api
      .get(`/games/${slug}`)
      .then((game) => {
        if (!cancelled) setState({ status: 'success', game, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: err.status === 404 ? 'not-found' : 'error', game: null, error: err.message });
      });

    return () => { cancelled = true; };
  }, [slug, revision]);

  if (state.status === 'loading') {
    return (
      <div className="game-details container">
        <Skeleton style={{ height: '60vh', marginTop: 'var(--header-height)' }} />
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className="container game-details__notfound"><Link to="/games" className="back-link">{t('common.back')}</Link>
        <ErrorState title="GAME NOT FOUND" message="That title doesn't exist in our catalog." />
        <Link to="/games" className="btn btn--secondary">{t('common.back')}</Link>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="container game-details__notfound"><Link to="/games" className="back-link">{t('common.back')}</Link>
        <ErrorState message={state.error} onRetry={() => setRevision((value) => value + 1)} />
      </div>
    );
  }

  const { game } = state;

  return (
    <div className="game-details">
      <GameHero game={game} isDetail />

      <div className="container game-details__body">
        <div className="game-details__main">
          <h2>{t('games.about')}</h2>
          <p>{game.description || game.shortDescription}</p>
          <GameGallery images={game.screenshots || []} />
        </div>

        <aside className="game-details__aside">
          <GameMeta game={game} />
          {game.trailerUrl && (
            <a href={game.trailerUrl} target="_blank" rel="noreferrer" className="btn btn--primary game-details__trailer">
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
    </div>
  );
}
