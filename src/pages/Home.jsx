import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import { useLanguage } from '../context/LanguageContext';
import { GameHero } from '../components/games/GameHero';
import { GameGrid } from '../components/games/GameGrid';
import { Reveal } from '../components/ui/Reveal';
import { api } from '../services/api';
import { ArrowUpRight } from '@phosphor-icons/react';
import './Home.css';

export function Home() {
  const { t } = useLanguage();
  const catalog = useGames({ limit: 8 });
  const games = catalog.games || [];
  const [news, setNews] = useState([]);
  const [newsStatus, setNewsStatus] = useState('loading');
  const [newsError, setNewsError] = useState('');
  const [videos, setVideos] = useState([]);
  const [videosStatus, setVideosStatus] = useState('loading');
  const [videosError, setVideosError] = useState('');
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const featured = useMemo(
    () => games.filter((game) => game.featured).slice(0, 3),
    [games]
  );
  const heroGames =
    featured.length > 0
      ? featured
      : games.slice(0, 3);
  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setNewsStatus('loading');
      setNewsError('');

      try {
        const response = await api.get('/news');

        if (cancelled) return;
        let data = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (Array.isArray(response?.items)) {
          data = response.items;
        } else if (Array.isArray(response?.news)) {
          data = response.news;
        } else if (Array.isArray(response?.data)) {
          data = response.data;
        } else if (Array.isArray(response?.data?.items)) {
          data = response.data.items;
        } else if (Array.isArray(response?.data?.news)) {
          data = response.data.news;
        }

        setNews(data);
        setNewsStatus('success');
      } catch (error) {
        if (cancelled) return;

        setNews([]);
        setNewsError(
          error?.message || 'Unable to load news.'
        );
        setNewsStatus('error');
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;

    async function loadVideos() {
      setVideosStatus('loading');
      setVideosError('');

      try {
        const response = await api.get('/videos');

        if (cancelled) return;
        let data = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (Array.isArray(response?.items)) {
          data = response.items;
        } else if (Array.isArray(response?.videos)) {
          data = response.videos;
        } else if (Array.isArray(response?.data)) {
          data = response.data;
        } else if (Array.isArray(response?.data?.items)) {
          data = response.data.items;
        } else if (Array.isArray(response?.data?.videos)) {
          data = response.data.videos;
        }

        setVideos(data);
        setVideosStatus('success');
      } catch (error) {
        if (cancelled) return;

        setVideos([]);
        setVideosError(
          error?.message || 'Unable to load videos.'
        );
        setVideosStatus('error');
      }
    }

    loadVideos();

    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (heroGames.length < 2) {
      setSlide(0);
      return;
    }
    setSlide(
      (current) => current % heroGames.length
    );

    const id = setInterval(() => {
      setSlide(
        (current) =>
          (current + 1) % heroGames.length
      );
    }, 6500);

    return () => clearInterval(id);
  }, [heroGames.length]);
  async function subscribe(e) {
    e.preventDefault();
    setMessage('');

    try {
      await api.post('/newsletter', {
        email,
      });

      setMessage('You are on the list.');
      setEmail('');
    } catch (error) {
      setMessage(
        error?.message || 'Unable to subscribe.'
      );
    }
  }

  const active = heroGames[slide] || null;

  return (
    <div className="home">
      {active && (
        <GameHero
          game={active}
          carouselIndex={slide}
          carouselCount={heroGames.length}
          onNext={() =>
            setSlide((current) =>
              heroGames.length
                ? (current + 1) %
                  heroGames.length
                : 0
            )
          }
          onPrev={() =>
            setSlide((current) =>
              heroGames.length
                ? (current - 1 +
                    heroGames.length) %
                    heroGames.length
                : 0
            )
          }
        />
      )}

      {!active &&
        catalog.status === 'success' && (
          <section className="home__empty container">
            <h1>No games available yet.</h1>

            <p>
              There are no games registered
              in the database yet.
            </p>
          </section>
        )}
      <section className="home__news container">
        <Reveal>
          <div className="home__section-head">
            <div>
              <h2>Newswire</h2>
            </div>

            <Link
              to="/news"
              className="circle-link"
              aria-label="View all news"
            >
              <ArrowUpRight
                size={24}
                weight="bold"
              />
            </Link>
          </div>
        </Reveal>

        {newsStatus === 'loading' && (
          <div className="home__loading">
            Loading news…
          </div>
        )}

        {newsStatus === 'error' && (
          <div className="home__loading">
            {newsError}
          </div>
        )}

        {newsStatus === 'success' &&
          news.length === 0 && (
            <div className="home__empty">
              <p>
                No news available yet.
              </p>
            </div>
          )}

        {newsStatus === 'success' &&
          news.length > 0 && (
            <div className="home__news-grid">
              {news
                .slice(0, 3)
                .map((item, index) => (
                  <Reveal
                    key={
                      item.id ||
                      item.slug ||
                      item.title
                    }
                    delay={index * 70}
                  >
                    <Link
                      to={`/news/${item.slug}`}
                      className={`news-card news-card--${
                        index + 1
                      }`}
                    >

                      <div className="news-card__visual">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <div className="news-card__visual-placeholder">
                            <span>
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                '0'
                              )}
                            </span>
                          </div>
                        )}

                        <span className="news-card__number">
                          {String(
                            index + 1
                          ).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="news-card__meta">

                        <small>
                          {item.category ||
                            item.type ||
                            'NEWS'}

                          {' · '}

                          {item.published_at
                            ? new Date(
                                item.published_at
                              )
                                .toLocaleDateString(
                                  'en-US',
                                  {
                                    day: '2-digit',
                                    month:
                                      'short',
                                    year: 'numeric',
                                    timeZone: 'UTC',
                                  }
                                )
                                .toUpperCase()
                            : ''}
                        </small>

                        <h3>
                          {item.title}
                        </h3>

                        <span className="news-card__arrow">
                          <ArrowUpRight
                            size={18}
                            weight="bold"
                          />
                        </span>

                      </div>
                    </Link>
                  </Reveal>
                ))}
            </div>
          )}

      </section>
      <section className="home__games container">

        <Reveal>
          <div className="home__section-head">
            <div>
              <h2>Games</h2>
            </div>

            <Link
              to="/games"
              className="circle-link"
              aria-label="View all games"
            >
              <ArrowUpRight
                size={24}
                weight="bold"
              />
            </Link>
          </div>
        </Reveal>
        {catalog.status === 'loading' && (
          <div className="home__loading">
            Loading games…
          </div>
        )}
        {catalog.status === 'error' && (
          <div className="home__loading">
            {catalog.error}
          </div>
        )}
        {catalog.status === 'success' &&
          games.length === 0 && (
            <div className="home__empty">
              <p>
                No games available yet.
              </p>
            </div>
          )}
        {catalog.status === 'success' &&
          games.length > 0 && (
            <Reveal delay={80}>
              <GameGrid games={games} />
            </Reveal>
          )}

      </section>
      <section className="home__feature">

        <div className="container home__feature-inner">

          <Reveal>

            <h2>
              Create worlds.
              <br />
              <em>
                Explore beyond.
              </em>
            </h2>

            <p>
              We make games designed to
              piss you off, push your limits,
              and test how far you’re willing
              to go. We turn frustration into
              the challenge that keeps you
              coming back.
            </p>

            <Link
              to="/studio"
              className="btn btn--primary"
            >
              Meet the studio

              <ArrowUpRight
                size={16}
                weight="bold"
              />
            </Link>

          </Reveal>

        </div>

      </section>
      <section className="home__media container">

        <Reveal>
          <div className="home__section-head">

            <div>
              <h2>Watch</h2>
            </div>

            <Link
              to="/videos"
              className="circle-link"
              aria-label="View all videos"
            >
              <ArrowUpRight
                size={24}
                weight="bold"
              />
            </Link>

          </div>
        </Reveal>

        {videosStatus === 'loading' && (
          <div className="home__loading">
            Loading videos…
          </div>
        )}
        {videosStatus === 'error' && (
          <div className="home__loading">
            {videosError}
          </div>
        )}
        {videosStatus === 'success' &&
          videos.length === 0 && (
            <div className="home__empty">
              <p>
                No videos available yet.
              </p>
            </div>
          )}
        {videosStatus === 'success' &&
          videos.length > 0 && (
            <div className="home__video-grid">

              {videos
                .slice(0, 3)
                .map((video, index) => (

                  <Link
                    to={`/videos/${video.id}`}
                    className="video-card"
                    key={
                      video.id ||
                      video.slug ||
                      video.title
                    }
                  >
                    <div className="video-card__visual">

                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <div className="video-card__visual-placeholder" />
                      )}

                      <div className="video-card__overlay">

                        <b>
                          {String(
                            index + 1
                          ).padStart(2, '0')}
                        </b>

                      </div>

                    </div>
                    <div>

                      <small>
                        {video.category ||
                          video.type ||
                          'VIDEO'}
                      </small>

                      <h3>
                        {video.title}
                      </h3>

                    </div>

                  </Link>

                ))}

            </div>
          )}

      </section>
      <section className="home__newsletter">

        <div className="container home__newsletter-inner">

          <div>

            <h2>
              Newsletter
            </h2>

            <p>
              News, announcements, updates
              and upcoming releases.
            </p>

          </div>

          <form
            onSubmit={subscribe}
            className="newsletter-form"
            noValidate
          >
            <label htmlFor="newsletter-email">
              Email address
            </label>

            <div>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <button type="submit">
                Subscribe
              </button>
            </div>

            {message && (
              <small aria-live="polite">
                {message}
              </small>
            )}
          </form>

        </div>

      </section>

    </div>
  );
}