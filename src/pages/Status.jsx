import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowClockwise,
  CheckCircle,
  XCircle,
  Warning,
  CaretDown,
  Circle,
  ShieldCheck,
  User,
  GameController,
  Newspaper,
  Video,
  MagnifyingGlass,
  Envelope,
  Headset,
  Star,
  Package,
  Download,
  Lock,
} from '@phosphor-icons/react';
import './Status.css';

const API_BASE =
  import.meta.env.VITE_API_URL || 'https://apideadsmile.vercel.app/api';

const POLL_INTERVAL = 60_000;
const REQUEST_TIMEOUT = 6_000;
const API_SECTIONS = [
  {
    id: 'core',
    label: 'Core',
    icon: ShieldCheck,
    probe: '/health',
    description: 'Health check and CSRF security token.',
    routes: [
      { method: 'GET', path: '/api/health', note: 'Heartbeat — no auth needed' },
      { method: 'GET', path: '/api/csrf', note: 'Returns a fresh CSRF token' },
    ],
  },
  {
    id: 'auth',
    label: 'Auth',
    icon: Lock,
    probe: '/auth/me',
    description: 'Registration, login, logout and session check.',
    routes: [
      { method: 'POST', path: '/api/auth/register', note: 'Create a new account' },
      { method: 'POST', path: '/api/auth/login', note: 'Email + password sign-in' },
      { method: 'POST', path: '/api/auth/logout', note: 'Destroy the current session' },
      { method: 'GET', path: '/api/auth/me', note: 'Returns the authenticated user' },
    ],
  },
  {
    id: 'games',
    label: 'Games',
    icon: GameController,
    probe: '/games',
    description: 'Game catalog listing and individual game detail pages.',
    routes: [
      { method: 'GET', path: '/api/games', note: 'Paginated catalog — supports filters' },
      { method: 'GET', path: '/api/games/:slug', note: 'Full details for a single game' },
    ],
  },
  {
    id: 'news',
    label: 'News',
    icon: Newspaper,
    probe: '/news',
    description: 'Studio news posts — list and detail.',
    routes: [
      { method: 'GET', path: '/api/news', note: 'Paginated news articles' },
      { method: 'GET', path: '/api/news/:slug', note: 'Full article by slug' },
    ],
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: Video,
    probe: '/videos',
    description: 'Studio video content — list and individual video.',
    routes: [
      { method: 'GET', path: '/api/videos', note: 'Paginated video list' },
      { method: 'GET', path: '/api/videos/:id', note: 'Single video by ID' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    icon: User,
    probe: '/account/profile/deadsmile',
    description: 'Profile management — public profiles and private settings.',
    routes: [
      { method: 'GET', path: '/api/account/profile/:username', note: 'Public profile view' },
      { method: 'GET', path: '/api/account', note: 'Current user details (auth)' },
      { method: 'PATCH', path: '/api/account', note: 'Update profile (auth)' },
      { method: 'DELETE', path: '/api/account', note: 'Delete account (auth)' },
    ],
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: Star,
    probe: '/wishlist',
    description: 'Authenticated wishlist — add, remove and check games.',
    routes: [
      { method: 'GET', path: '/api/wishlist', note: 'List saved games (auth)' },
      { method: 'POST', path: '/api/wishlist', note: 'Add a game (auth)' },
      { method: 'DELETE', path: '/api/wishlist/:gameId', note: 'Remove a game (auth)' },
      { method: 'GET', path: '/api/wishlist/:gameId/check', note: 'Check if a game is saved (auth)' },
    ],
  },
  {
    id: 'search',
    label: 'Search',
    icon: MagnifyingGlass,
    probe: '/search?q=deadsmile',
    description: 'Full-text search across games and news.',
    routes: [
      { method: 'GET', path: '/api/search?q=…', note: 'Returns ranked matches — rate-limited' },
    ],
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    icon: Envelope,
    probe: '/news',
    description: 'Email subscription endpoint.',
    routes: [
      { method: 'POST', path: '/api/newsletter', note: 'Subscribe to studio news — rate-limited' },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    icon: Headset,
    probe: '/news',
    description: 'Contact form submission.',
    routes: [
      { method: 'POST', path: '/api/support', note: 'Open a support ticket — rate-limited' },
    ],
  },
  {
    id: 'downloads',
    label: 'Downloads',
    icon: Download,
    probe: '/downloads',
    description: 'Public game download links.',
    routes: [
      { method: 'GET', path: '/api/downloads', note: 'List available downloads' },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    probe: '/products',
    description: 'Merch and digital products catalog.',
    routes: [
      { method: 'GET', path: '/api/products', note: 'List store products' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    probe: '/news',
    description: 'Protected admin actions — requires the admin role.',
    routes: [
      { method: 'POST', path: '/api/admin/newsletter', note: 'Publish a newsletter (admin)' },
      { method: 'POST', path: '/api/admin/video', note: 'Upload a new video (admin)' },
      { method: 'POST', path: '/api/admin/game', note: 'Add a game to the catalog (admin)' },
      { method: 'DELETE', path: '/api/admin/newsletter/:id', note: 'Delete a newsletter (admin)' },
      { method: 'DELETE', path: '/api/admin/video/:id', note: 'Delete a video (admin)' },
      { method: 'DELETE', path: '/api/admin/game/:id', note: 'Delete a game (admin)' },
    ],
  },
];

function methodColor(method) {
  switch (method) {
    case 'GET': return 'get';
    case 'POST': return 'post';
    case 'PATCH': return 'patch';
    case 'DELETE': return 'delete';
    default: return '';
  }
}

async function probe(endpoint) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT);
  const start = Date.now();
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      signal: ctrl.signal,
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    const latency = Date.now() - start;
    return { ok: res.status < 500, latency };
  } catch {
    clearTimeout(timer);
    return { ok: false, latency: null };
  }
}

const INITIAL = Object.fromEntries(
  API_SECTIONS.map((s) => [s.id, { status: 'idle', latency: null }])
);

function statusReducer(state, action) {
  switch (action.type) {
    case 'CHECK_START':
      return Object.fromEntries(
        Object.entries(state).map(([k, v]) => [k, { ...v, status: 'checking' }])
      );
    case 'SECTION_RESULT':
      return {
        ...state,
        [action.id]: { status: action.ok ? 'up' : 'down', latency: action.latency },
      };
    default:
      return state;
  }
}

export function Status() {
  const [sections, dispatch] = useReducer(statusReducer, INITIAL);
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [expanded, setExpanded] = useState({});
  const timerRef = useRef(null);

  const runChecks = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);
    dispatch({ type: 'CHECK_START' });

    await Promise.all(
      API_SECTIONS.map(async (section) => {
        const result = await probe(section.probe);
        dispatch({ type: 'SECTION_RESULT', id: section.id, ...result });
      })
    );

    setLastChecked(new Date());
    setIsChecking(false);
  }, [isChecking]);

  useEffect(() => {
    runChecks();
    timerRef.current = setInterval(runChecks, POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, []);

  function toggleSection(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  const total = API_SECTIONS.length;
  const upCount = API_SECTIONS.filter((s) => sections[s.id]?.status === 'up').length;
  const downCount = API_SECTIONS.filter((s) => sections[s.id]?.status === 'down').length;
  const allOk = downCount === 0 && !isChecking && lastChecked;
  const anyDown = downCount > 0;

  const overallClass = isChecking || !lastChecked
    ? 'checking'
    : anyDown
    ? 'down'
    : 'up';

  return (
    <div className="status-page container">
      <Link to="/" className="back-link">
        <ArrowLeft weight="bold" />
        <span>Back</span>
      </Link>
      <div className="status-header">
        <h1>API Status</h1>
        <p className="status-intro">
          Live health of every Deadsmile service.
        </p>

        <div className={`status-banner status-banner--${overallClass}`}>
          <div className="status-banner__icon">
            {isChecking || !lastChecked ? (
              <Circle weight="fill" className="status-pulse" />
            ) : anyDown ? (
              <Warning weight="fill" />
            ) : (
              <CheckCircle weight="fill" />
            )}
          </div>
          <div className="status-banner__body">
            <strong>
              {isChecking || !lastChecked
                ? 'Checking services…'
                : anyDown
                ? `${downCount} service${downCount > 1 ? 's' : ''} degraded`
                : 'All systems operational'}
            </strong>
            <span>
              {lastChecked
                ? `${upCount} / ${total} up · checked ${lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'First check in progress'}
            </span>
          </div>
          <button
            className="status-refresh"
            onClick={runChecks}
            disabled={isChecking}
            aria-label="Refresh now"
          >
            <ArrowClockwise
              weight="bold"
              size={16}
              className={isChecking ? 'spinning' : ''}
            />
            Refresh
          </button>
        </div>
      </div>
      <div className="status-sections">
        {API_SECTIONS.map((section) => {
          const state = sections[section.id];
          const isUp = state.status === 'up';
          const isDown = state.status === 'down';
          const isOpen = !!expanded[section.id];
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className={`status-section${isDown ? ' status-section--down' : ''}`}
            >
              <button
                className="status-section__head"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
              >
                <span className="status-section__icon-wrap">
                  <Icon size={18} weight="bold" />
                </span>

                <span className="status-section__label">{section.label}</span>

                <span className="status-section__desc">{section.description}</span>

                <span className={`status-dot status-dot--${state.status}`} aria-hidden="true" />

                <span className={`status-section__badge status-section__badge--${state.status}`}>
                  {state.status === 'idle' || state.status === 'checking'
                    ? '…'
                    : isUp
                    ? 'Up'
                    : 'Down'}
                </span>

                {state.latency !== null && state.status === 'up' && (
                  <span className="status-section__latency">{state.latency}ms</span>
                )}

                <span className={`status-section__caret${isOpen ? ' open' : ''}`}>
                  <CaretDown size={14} weight="bold" />
                </span>
              </button>
              {isOpen && (
                <div className="status-section__routes">
                  <div className="status-routes-list">
                    {section.routes.map((route, i) => (
                      <div key={i} className="status-route">
                        <span className={`status-method status-method--${methodColor(route.method)}`}>
                          {route.method}
                        </span>
                        <code className="status-route__path">{route.path}</code>
                        <span className="status-route__note">{route.note}</span>
                      </div>
                    ))}
                  </div>
                  <p className="status-route__probe">
                    Probed via <code>{API_BASE}{section.probe}</code>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="status-footer-note">
        Health is determined by HTTP response code — any response below 500 confirms
        the service is reachable and functioning. Auth-only endpoints will return
        401, which still counts as operational.
      </p>
    </div>
  );
}