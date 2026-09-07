import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Play } from '@phosphor-icons/react';
import './GameHero.css';

export function GameHero({ game, isDetail = false, carouselIndex = 0, carouselCount = 0, onNext, onPrev }) {
  return (
    <section className={`game-hero ${isDetail ? 'game-hero--detail' : ''}`}>
      {/* =====================================================
          DEADSMILE GAME HERO IMAGE

          SUBSTITUIR ESTE PLACEHOLDER PELA IMAGEM REAL.

          Local:
          /public/assets/games/[slug]/hero.jpg
      ===================================================== */}
      <div className="game-hero__media">
        <img src={game.heroImage || '/assets/placeholders/game-hero.svg'} alt="" className="game-hero__image" />
        <div className="game-hero__scrim" />
      </div>

      <div className="game-hero__content container">
        {game.featuredLabel && <p className="game-hero__eyebrow">{game.featuredLabel}</p>}
        <h1 className="game-hero__title">{game.title}</h1>
        {game.shortDescription && <p className="game-hero__desc">{game.shortDescription}</p>}

        {!isDetail && (
          <div className="game-hero__actions">
            {game.trailerUrl && (
              <a className="btn btn--primary" href={game.trailerUrl} target="_blank" rel="noreferrer">
                <Play weight="fill"/><span>Watch trailer</span>
              </a>
            )}
            <Link className="btn btn--secondary" to={`/games/${game.slug}`}>
              <span>Learn more</span><ArrowUpRight weight="bold"/>
            </Link>
          </div>
        )}
        {!isDetail && carouselCount > 1 && <div className="game-hero__controls" aria-label="Featured games">
          <button type="button" onClick={onPrev} aria-label="Previous featured game"><ArrowLeft weight="bold"/></button>
          <span>{String(carouselIndex + 1).padStart(2,'0')} / {String(carouselCount).padStart(2,'0')}</span>
          <button type="button" onClick={onNext} aria-label="Next featured game"><ArrowRight weight="bold"/></button>
        </div>}
      </div>
    </section>
  );
}
