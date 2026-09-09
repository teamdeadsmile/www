import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './GameHero.css';
import { ArrowUpRight, Play } from '@phosphor-icons/react';

export function GameHero({
  game,
  carouselIndex,
  carouselCount,
  onNext,
  onPrev,
}) {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const DURATION = 6500;

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
    if (paused) return;

    const start = performance.now();
    const tick = (now) => {
      const pct = Math.min(((now - start) / DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [carouselIndex, paused]);

  if (!game) return null;

  const backgroundSrc = game.heroImage || game.coverImage || '';
  const logoSrc       = game.logo || '';
  const title         = game.title || '';
  const eyebrow       = game.genres?.[0] || game.shortDescription || '';

  return (
    <section
      className="rs-hero"
      aria-label={`Featured: ${title}`}
      style={backgroundSrc ? { backgroundImage: `url(${backgroundSrc})` } : undefined}
    >
      <div className="rs-hero__overlay" />

      <div className="rs-hero__content container">
        <div className="rs-hero__identity">

          {logoSrc && (
            <div className="rs-hero__logo-col">
              <img
                src={logoSrc}
                alt={`${title} logo`}
                className="rs-hero__logo"
              />
            </div>
          )}

          <div className="rs-hero__text-col">
            {eyebrow && (
              <p className="rs-hero__eyebrow">{eyebrow}</p>
            )}

            <h1 className="rs-hero__title">{title}</h1>

            <div className="rs-hero__actions">
              {game.trailerUrl && (
                <a
                  href={game.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  <Play weight="fill" />
                  <span>Watch Trailer</span>
                </a>
              )}
              {game.slug && (
                <Link
                  to={`/games/${game.slug}`}
                  className="btn btn--secondary"
                >
                  Explore Game
                  <ArrowUpRight weight="bold" />
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>

      {carouselCount > 1 && (
        <div className="rs-hero__controls">

          <button
            className="rs-hero__ctrl-btn"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Retomar' : 'Pausar'}
          >
            {paused ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            )}
          </button>

          <div className="rs-hero__pips" role="tablist">
            {Array.from({ length: carouselCount }).map((_, i) => {
              const isActive = i === carouselIndex;
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slide ${i + 1}`}
                  className={`rs-hero__pip${isActive ? ' rs-hero__pip--active' : ''}`}
                  onClick={() => {
                    const diff = i - carouselIndex;
                    if (diff > 0) for (let d = 0; d < diff; d++) onNext();
                    if (diff < 0) for (let d = 0; d > diff; d--) onPrev();
                  }}
                >
                  <span
                    className="rs-hero__pip-fill"
                    style={isActive ? { width: `${progress}%` } : {}}
                  />
                </button>
              );
            })}
          </div>

          <button className="rs-hero__ctrl-btn" onClick={onPrev} aria-label="Anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button className="rs-hero__ctrl-btn" onClick={onNext} aria-label="Próximo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
      )}
    </section>
  );
}