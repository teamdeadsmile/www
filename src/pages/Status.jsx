import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from '@phosphor-icons/react';
import { Reveal } from '../components/ui/Reveal';
import './Status.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://apideadsmile.vercel.app/api';

// Definição dos serviços a serem monitorados
const SERVICES = [
  {
    category: 'Core',
    items: [
      { name: 'API Gateway', endpoint: '/health', description: 'Main API entry point' },
      { name: 'CSRF Token', endpoint: '/csrf', description: 'Security token endpoint' },
    ],
  },
  {
    category: 'Authentication',
    items: [
      { name: 'Login', endpoint: '/auth/login', description: 'User login (expects 401 without credentials)' },
      { name: 'Session Check', endpoint: '/auth/me', description: 'Current session validation' },
    ],
  },
  {
    category: 'Content',
    items: [
      { name: 'Games Catalog', endpoint: '/games', description: 'List all games' },
      { name: 'News', endpoint: '/news', description: 'Latest news and updates' },
      { name: 'Videos', endpoint: '/videos', description: 'Studio videos' },
    ],
  },
  {
    category: 'Interaction',
    items: [
      { name: 'Search', endpoint: '/search?q=test', description: 'Game search' },
      { name: 'Support Tickets', endpoint: '/support', description: 'Contact form submission' },
    ],
  },
];

// Timeout para cada requisição (5 segundos)
const REQUEST_TIMEOUT = 5000;

async function checkService(endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      signal: controller.signal,
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);

    // Consideramos "up" se resposta for 2xx, 3xx ou 4xx (exceto 5xx)
    // Para endpoints que exigem autenticação, 401 é esperado e OK
    return res.status < 500;
  } catch (err) {
    clearTimeout(timeout);
    // Se for abort (timeout) ou erro de rede, consideramos down
    return false;
  }
}

export function Status() {
  const [statuses, setStatuses] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função que verifica todos os serviços
  const checkAll = async () => {
    setLoading(true);
    const results = {};

    for (const category of SERVICES) {
      for (const item of category.items) {
        const key = `${category.category}-${item.name}`;
        const isUp = await checkService(item.endpoint);
        results[key] = isUp;
      }
    }

    setStatuses(results);
    setLastUpdate(new Date());
    setLoading(false);
  };

  // Inicializa e configura polling a cada 5 minutos
  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, 5 * 60 * 1000); // 5 minutos
    return () => clearInterval(interval);
  }, []);

  // Calcula o status geral (todos verdes?)
  const allUp = Object.values(statuses).every(v => v === true);
  const totalChecks = Object.keys(statuses).length;
  const upCount = Object.values(statuses).filter(v => v === true).length;

  return (
    <div className="status-page container">
      <Link to="/" className="back-link">
        <ArrowLeft weight="bold" />
        <span>Back</span>
      </Link>

      <Reveal>
        <div className="status-header">
          <h1>API Status</h1>
          <p className="status-intro">
            Real-time availability of all DEADSMILE services. Updates every 5 minutes.
          </p>
          <div className="status-summary">
            <div className="status-badge">
              {loading ? (
                <span>Checking…</span>
              ) : allUp ? (
                <>
                  <CheckCircle weight="fill" size={20} />
                  <span>All systems operational</span>
                </>
              ) : (
                <>
                  <XCircle weight="fill" size={20} />
                  <span>Some services are experiencing issues</span>
                </>
              )}
            </div>
            <div className="status-meta">
              <span>{upCount} / {totalChecks} services up</span>
              {lastUpdate && (
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              )}
              <button onClick={checkAll} className="refresh-btn" disabled={loading}>
                <RefreshCw weight="bold" size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="status-grid">
        {SERVICES.map((category, idx) => {
          const categoryKey = category.category;
          const items = category.items.map(item => {
            const key = `${categoryKey}-${item.name}`;
            const isUp = statuses[key];
            return { ...item, key, isUp };
          });

          const allUpCategory = items.every(item => item.isUp === true);

          return (
            <Reveal key={categoryKey} delay={idx * 80}>
              <div className="status-card">
                <div className="status-card-header">
                  <h2>{categoryKey}</h2>
                  <span className={`status-pill ${allUpCategory ? 'up' : 'down'}`}>
                    {allUpCategory ? 'All up' : 'Issues'}
                  </span>
                </div>
                <ul className="status-list">
                  {items.map((item) => (
                    <li key={item.key} className="status-item">
                      <div className="status-item-info">
                        <strong>{item.name}</strong>
                        <span className="status-item-desc">{item.description}</span>
                      </div>
                      <div className="status-item-indicator">
                        {loading && item.isUp === undefined ? (
                          <span className="status-spinner">…</span>
                        ) : item.isUp ? (
                          <CheckCircle weight="fill" size={18} className="status-icon up" />
                        ) : (
                          <XCircle weight="fill" size={18} className="status-icon down" />
                        )}
                        <span className="status-label">
                          {loading && item.isUp === undefined ? 'Checking' : item.isUp ? 'Up' : 'Down'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}