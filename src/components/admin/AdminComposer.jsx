import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import {
  X,
  Trash,
  Newspaper,
  FilmStrip,
  GameController,
  List,
  CheckCircle,
  WarningCircle,
  Gear,
} from '@phosphor-icons/react';
import './AdminComposer.css';

const initial = {
  title: '',
  excerpt: '',
  body: '',
  image: '',
  category: 'Devlog',
  thumbnail: '',
  videoUrl: '',
  durationSeconds: '',
  slug: '',
  shortDescription: '',
  description: '',
  status: 'announced',
  releaseDate: '',
  heroImage: '',
  coverImage: '',
  trailerUrl: '',
  featured: false,
  genres: '',
  platforms: '',
  purchaseUrl: '',
  downloadUrl: '',
};

function normalizeList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.games)) {
    return response.games;
  }

  if (Array.isArray(response?.news)) {
    return response.news;
  }

  if (Array.isArray(response?.videos)) {
    return response.videos;
  }

  return [];
}

export function AdminComposer() {
  const { user, refresh } = useAuth();

  const [type, setType] = useState(null);
  const [form, setForm] = useState({ ...initial });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [manage, setManage] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [items, setItems] = useState({
    news: [],
    videos: [],
    games: [],
  });

  const [loadingItems, setLoadingItems] = useState(false);
  const [deleting, setDeleting] = useState(null);

  if (user?.role !== 'admin') {
    return null;
  }

  const set = (key) => (event) => {
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value;

    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  function open(typeName) {
    setType(typeName);
    setMenuOpen(false);
    setForm({ ...initial });
    setError('');
    setSaved(false);
  }

  function closeComposer() {
    if (saving) {
      return;
    }

    setType(null);
    setError('');
    setSaved(false);
  }

  async function authedRequest(fn) {
    try {
      return await fn();
    } catch (err) {
      if (
        err?.status === 401 ||
        err?.code === 'UNAUTHENTICATED'
      ) {
        await refresh();
        return fn();
      }

      throw err;
    }
  }

  async function submit(event) {
    event.preventDefault();

    setSaving(true);
    setError('');
    setSaved(false);

    try {
      let path;
      let payload;

      if (type === 'newsletter') {
        path = '/admin/newsletter';

        payload = {
          title: form.title,
          excerpt: form.excerpt,
          body: form.body,
          image: form.image,
        };
      }

      if (type === 'video') {
        path = '/admin/video';

        payload = {
          title: form.title,
          category: form.category,
          thumbnail: form.thumbnail,
          videoUrl: form.videoUrl || null,
          durationSeconds: form.durationSeconds
            ? Number(form.durationSeconds)
            : null,
        };
      }

      if (type === 'game') {
        path = '/admin/game';

        payload = {
          title: form.title,
          slug: form.slug,
          shortDescription: form.shortDescription,
          description: form.description,
          status: form.status,
          releaseDate: form.releaseDate || null,
          heroImage: form.heroImage,
          coverImage: form.coverImage,
          trailerUrl: form.trailerUrl || null,
          featured: form.featured,
          purchaseUrl: form.purchaseUrl || null,
          downloadUrl: form.downloadUrl || null,

          genres: form.genres
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),

          platforms: form.platforms
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        };
      }

      await authedRequest(() =>
        api.post(path, payload)
      );

      setSaved(true);

      window.setTimeout(() => {
        setType(null);
        window.location.reload();
      }, 500);
    } catch (err) {
      setError(
        err?.message || 'Unable to publish.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function openManage() {
    setManage(true);
    setMenuOpen(false);
    setLoadingItems(true);
    setError('');

    try {
      const [
        newsResponse,
        videosResponse,
        gamesResponse,
      ] = await Promise.all([
        api.get('/news', {
          limit: 48,
        }),

        api.get('/videos', {
          limit: 48,
        }),

        api.get('/games', {
          page: 1,
          limit: 48,
        }),
      ]);

      setItems({
        news: normalizeList(newsResponse),
        videos: normalizeList(videosResponse),
        games: normalizeList(gamesResponse),
      });
    } catch (err) {
      setError(
        err?.message ||
          'Unable to load content.'
      );

      setItems({
        news: [],
        video: [],
        games: [],
      });
    } finally {
      setLoadingItems(false);
    }
  }

  async function remove(kind, id) {
    const confirmed = window.confirm(
      'Delete this item permanently? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    const deleteKey = `${kind}:${id}`;

    setDeleting(deleteKey);
    setError('');

    try {
      await authedRequest(() =>
        api.delete(
          `/admin/${kind}/${id}`
        )
      );

      setItems((current) => ({
        ...current,

        [kind]: current[kind].filter(
          (item) => item.id !== id
        ),
      }));
    } catch (err) {
      setError(
        err?.message ||
          'Unable to delete item.'
      );
    } finally {
      setDeleting(null);
    }
  }

  const sections = [
    ['news', 'Newswire', Newspaper],
    ['videos', 'Videos', FilmStrip],
    ['games', 'Games', GameController],
  ];

  return (
    <>
      <div
        className={`admin-composer ${
          menuOpen ? 'is-open' : ''
        }`}
      >
        {menuOpen && (
          <div
            className="admin-composer__menu"
            role="menu"
          >
            <div className="admin-composer__label">
              Configuration
            </div>

            <button
              type="button"
              role="menuitem"
              onClick={() =>
                open('newsletter')
              }
            >
              <Newspaper weight="bold" />
              <span>Newsletter</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() =>
                open('video')
              }
            >
              <FilmStrip weight="bold" />
              <span>Video</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() =>
                open('game')
              }
            >
              <GameController weight="bold" />
              <span>Game</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className="admin-composer__manage"
              onClick={openManage}
            >
              <List weight="bold" />
              <span>Manage</span>
            </button>
          </div>
        )}

        <button
          type="button"
          className="admin-composer__toggle"
          onClick={() =>
            setMenuOpen((open) => !open)
          }
          aria-label={
            menuOpen
              ? 'Close admin menu'
              : 'Open admin menu'
          }
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X weight="bold" />
          ) : (
            <Gear weight="bold" />
          )}
        </button>
      </div>

      <Modal
        open={!!type}
        onClose={closeComposer}
        labelledBy="admin-composer-title"
      >
        <div className="admin-modal">
          <header>
            <div>

              <h2 id="admin-composer-title">
                Publish {type}
              </h2>
            </div>

            <button
              type="button"
              className="admin-modal__close"
              onClick={closeComposer}
              disabled={saving}
              aria-label="Close"
            >
              <X weight="bold" />
            </button>
          </header>

          <form onSubmit={submit}>

            {type === 'newsletter' && (
              <>
                <Field
                  label="Title"
                  value={form.title}
                  onChange={set('title')}
                  required
                />

                <Field
                  label="Excerpt"
                  value={form.excerpt}
                  onChange={set('excerpt')}
                />

                <Text
                  label="Body"
                  value={form.body}
                  onChange={set('body')}
                  required
                />

                <Field
                  label="Image URL"
                  value={form.image}
                  onChange={set('image')}
                />
              </>
            )}

            {type === 'video' && (
              <>
                <Field
                  label="Title"
                  value={form.title}
                  onChange={set('title')}
                  required
                />

                <Field
                  label="Category"
                  value={form.category}
                  onChange={set('category')}
                  required
                />

                <Field
                  label="Video URL"
                  value={form.videoUrl}
                  onChange={set('videoUrl')}
                />

                <Field
                  label="Thumbnail URL"
                  value={form.thumbnail}
                  onChange={set('thumbnail')}
                />

                <Field
                  label="Duration (seconds)"
                  type="number"
                  min="0"
                  value={form.durationSeconds}
                  onChange={set(
                    'durationSeconds'
                  )}
                />
              </>
            )}

            {type === 'game' && (
              <>
                <Field
                  label="Title"
                  value={form.title}
                  onChange={set('title')}
                  required
                />

                <Field
                  label="Slug"
                  value={form.slug}
                  onChange={set('slug')}
                  required
                />

                <Text
                  label="Short description"
                  value={
                    form.shortDescription
                  }
                  onChange={set(
                    'shortDescription'
                  )}
                  required
                />

                <Text
                  label="Description"
                  value={form.description}
                  onChange={set(
                    'description'
                  )}
                />

                <div className="admin-modal__row">
                  <Field
                    label="Status"
                    as="select"
                    value={form.status}
                    onChange={set('status')}
                    options={[
                      'announced',
                      'in_development',
                      'released',
                    ]}
                  />

                  <Field
                    label="Release date"
                    type="date"
                    value={
                      form.releaseDate
                    }
                    onChange={set(
                      'releaseDate'
                    )}
                  />
                </div>

                <Field
                  label="Hero image URL"
                  value={form.heroImage}
                  onChange={set(
                    'heroImage'
                  )}
                />

                <Field
                  label="Cover image URL"
                  value={form.coverImage}
                  onChange={set(
                    'coverImage'
                  )}
                />

                <Field
                  label="Trailer URL"
                  value={form.trailerUrl}
                  onChange={set(
                    'trailerUrl'
                  )}
                />

                <Field
                  label="Purchase URL"
                  value={form.purchaseUrl}
                  onChange={set('purchaseUrl')}
                  placeholder="https://store.steampowered.com/..."
                />

                <Field
                  label="Download URL"
                  value={form.downloadUrl}
                  onChange={set('downloadUrl')}
                  placeholder="https://..."
                />

                <Field
                  label="Genres (comma separated)"
                  value={form.genres}
                  onChange={set('genres')}
                />

                <Field
                  label="Platforms (comma separated)"
                  value={form.platforms}
                  onChange={set(
                    'platforms'
                  )}
                />

                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={set(
                      'featured'
                    )}
                  />

                  <span>
                    Feature on homepage
                  </span>
                </label>
              </>
            )}

            {error && (
              <p className="admin-modal__error">
                <WarningCircle weight="bold" />
                <span>{error}</span>
              </p>
            )}

            {saved && (
              <p className="admin-modal__saved">
                <CheckCircle weight="bold" />
                <span>
                  Published successfully.
                </span>
              </p>
            )}

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Saving…'
                : 'Save & publish'}
            </Button>
          </form>
        </div>
      </Modal>

      <Modal
        open={manage}
        onClose={() =>
          setManage(false)
        }
        labelledBy="admin-manage-title"
      >
        <div className="admin-manage">
          <header>
            <div>

              <h2 id="admin-manage-title">
                Content
              </h2>
            </div>

            <button
              type="button"
              className="admin-modal__close"
              onClick={() =>
                setManage(false)
              }
              aria-label="Close"
            >
              <X weight="bold" />
            </button>
          </header>

          {error && (
            <p className="admin-modal__error">
              <WarningCircle weight="bold" />
              <span>{error}</span>
            </p>
          )}

          {loadingItems ? (
            <p className="admin-manage__loading">
              Loading content…
            </p>
          ) : (
            sections.map(
              ([kind, label, Icon]) => {
                const list =
                  items[kind] || [];

                return (
                  <section
                    key={kind}
                    className="admin-manage__section"
                  >
                    <div className="admin-manage__section-head">
                      <h3>
                        <Icon weight="bold" />
                        {label}
                      </h3>

                      <span>
                        {list.length}
                      </span>
                    </div>

                    {list.length === 0 ? (
                      <p className="admin-manage__empty">
                        No items published.
                      </p>
                    ) : (
                      list.map((item) => {
                        const deleteKey = `${kind}:${item.id}`;

                        return (
                          <div
                            className="admin-manage__item"
                            key={item.id}
                          >
                            <div>
                              <strong>
                                {item.title}
                              </strong>

                              <small>
                                {item.category ||
                                  item.slug ||
                                  item.status ||
                                  'Published'}
                              </small>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                remove(
                                  kind === 'news'
                                    ? 'newsletter'
                                    : kind,
                                  item.id
                                )
                              }
                              disabled={
                                deleting ===
                                deleteKey
                              }
                              aria-label={`Delete ${item.title}`}
                            >
                              {deleting ===
                              deleteKey ? (
                                <span>…</span>
                              ) : (
                                <Trash weight="bold" />
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </section>
                );
              }
            )
          )}
        </div>
      </Modal>
    </>
  );
}

function Field({
  label,
  as = 'input',
  options = [],
  ...props
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>

      {as === 'select' ? (
        <select {...props}>
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input {...props} />
      )}
    </label>
  );
}

function Text({
  label,
  ...props
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>

      <textarea
        rows="6"
        {...props}
      />
    </label>
  );
}