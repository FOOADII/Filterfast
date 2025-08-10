import React, { useEffect, useMemo, useState } from 'react';
import { PERSONAL_LINKS } from './config.js';
import { LinkedInIcon, TelegramIcon, MailIcon, XIcon, GitHubIcon, SunIcon, MoonIcon, LogoMarkIcon } from './icons.jsx';

const IconByKind = ({ kind }) => {
  const common = { className: 'icon' };
  switch (kind) {
    case 'linkedin': return <LinkedInIcon {...common} />;
    case 'telegram': return <TelegramIcon {...common} />;
    case 'email': return <MailIcon {...common} />;
    case 'x': return <XIcon {...common} />;
    case 'github': return <GitHubIcon {...common} />;
    default: return null;
  }
};

function App() {
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Theme state
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ff_theme');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        return;
      }
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } catch (_) {}
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ff_theme', theme); } catch (_) {}
  }, [theme]);

  // Repo UX state
  const [repoQuery, setRepoQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortKey, setSortKey] = useState('stars'); // stars | name

  // Recent searches
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ff_recent');
      if (raw) setRecent(JSON.parse(raw));
    } catch (_) {}
  }, []);
  const pushRecent = (name) => {
    const normalized = name.trim();
    if (!normalized) return;
    setRecent((prev) => {
      const next = [normalized, ...prev.filter(v => v.toLowerCase() !== normalized.toLowerCase())].slice(0, 6);
      try { localStorage.setItem('ff_recent', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const fetchGitHubProfile = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const response = await fetch(`http://localhost:5000/api/github/${username.trim()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      pushRecent(username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchGitHubProfile();
  };

  const languages = useMemo(() => {
    if (!profile?.repos) return [];
    const set = new Set();
    profile.repos.forEach(r => { if (r.language) set.add(r.language); });
    return Array.from(set).sort((a,b) => a.localeCompare(b));
  }, [profile]);

  const filteredRepos = useMemo(() => {
    if (!profile?.repos) return [];
    let repos = [...profile.repos];

    if (repoQuery.trim()) {
      const q = repoQuery.trim().toLowerCase();
      repos = repos.filter(r => r.name.toLowerCase().includes(q));
    }

    if (languageFilter !== 'all') {
      repos = repos.filter(r => (r.language || 'Not specified') === languageFilter);
    }

    if (sortKey === 'stars') {
      repos.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    } else if (sortKey === 'name') {
      repos.sort((a, b) => a.name.localeCompare(b.name));
    }

    return repos;
  }, [profile, repoQuery, languageFilter, sortKey]);

  const topLanguages = useMemo(() => {
    if (!profile?.repos) return [];
    const counts = new Map();
    profile.repos.forEach(r => {
      const lang = r.language || 'Other';
      counts.set(lang, (counts.get(lang) || 0) + 1);
    });
    const total = profile.repos.length || 1;
    return Array.from(counts.entries())
      .sort((a,b) => b[1] - a[1])
      .map(([lang, count]) => ({ lang, count, pct: Math.round((count/total)*100) }));
  }, [profile]);

  const ThemeIcon = theme === 'dark' ? SunIcon : MoonIcon;

  const handleAnchorClick = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const searchEl = document.querySelector('.search-section');
      if (searchEl) searchEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <div className="container">
      {/* Decorative vectors behind content */}
      <div className="vectors" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="ring r1" />
        <span className="ring r2" />
        <span className="vgrid" />
      </div>

      {/* Top Navigation */}
      <nav className="topnav glass sticky">
        <a className="logo no-underline" href="#top" onClick={handleAnchorClick('top')}>
          <LogoMarkIcon style={{ marginRight: 8 }} />
          FilterFast
        </a>
        <div className="nav-links">
          <a className="nav-link" href="#scoring" onClick={handleAnchorClick('scoring')}>Scoring</a>
          <a className="nav-link" href="#api" onClick={handleAnchorClick('api')}>API</a>
          <a className="nav-link" href="#about" onClick={handleAnchorClick('about')}>About</a>
        </div>
        <div className="nav-right">
          {Array.isArray(PERSONAL_LINKS) && PERSONAL_LINKS.length > 0 && (
            <div className="nav-icons">
              {PERSONAL_LINKS.slice(0,5).map((l) => (
                <a key={l.url} className="icon-btn" href={l.url} target="_blank" rel="noreferrer" title={l.label}>
                  <IconByKind kind={l.kind} />
                </a>
              ))}
            </div>
          )}
          <button className="theme-toggle icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            <ThemeIcon className="icon" />
          </button>
        </div>
      </nav>

      <header className="header" id="top">
        <h1 className="title">FilterFast</h1>
        <p className="tagline">Instantly screen and score applicants</p>
        <p className="hero-desc">FilterFast analyzes a candidate’s public GitHub footprint in seconds — followers, repositories, stars, languages — and produces a weighted score you can use to triage at scale. Built for hackathons, accelerators, hiring sprints, and community events.</p>
        <div className="badge-row">
          <span className="badge">No Auth Required</span>
          <span className="badge">Real-time GitHub Data</span>
          <span className="badge">Monochrome UI</span>
        </div>
        {Array.isArray(PERSONAL_LINKS) && PERSONAL_LINKS.length > 0 && (
          <div className="icon-row" style={{ justifyContent: 'center' }}>
            {PERSONAL_LINKS.map(link => (
              <a key={link.url} href={link.url} className="icon-btn lg" target="_blank" rel="noreferrer" title={link.label}>
                <IconByKind kind={link.kind} />
              </a>
            ))}
          </div>
        )}
        <div className="hero-cta">
          <a className="ghost-btn" href="#scoring">See how scoring works ↓</a>
        </div>
      </header>

      <section className="search-section glass">
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Enter GitHub username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className="search-button"
            disabled={loading || !username.trim()}
          >
            {loading ? 'Fetching...' : 'Fetch Profile'}
          </button>
        </form>
        {recent.length > 0 && (
          <div className="chip-row">
            {recent.map((name) => (
              <button key={name} className="chip" onClick={() => setUsername(name)}>
                {name}
              </button>
            ))}
          </div>
        )}
        <p className="hint">Tip: try "torvalds", "gaearon", or your own username</p>
      </section>

      {loading && (
        <div className="results-section glass">
          <div className="skeleton profile-skeleton" />
          <div className="skeleton metrics-skeleton" />
          <div className="skeleton repos-skeleton" />
        </div>
      )}

      {error && (
        <div className="error glass">
          <p>Error: {error}</p>
        </div>
      )}

      {profile && (
        <section className="results-section glass">
          <div className="profile-header">
            <img
              src={profile.avatar_url}
              alt={`${profile.name}'s avatar`}
              className="avatar avatar-ring"
            />
            <div className="profile-info">
              <div className="name-line">
                <h2>{profile.name}</h2>
                <a className="ghost-btn" href={`https://github.com/${profile.username}`} target="_blank" rel="noreferrer">Open on GitHub ↗</a>
              </div>
              <p>@{profile.username}</p>
              {Array.isArray(profile.socialLinks) && profile.socialLinks.length > 0 && (
                <div className="social-links">
                  {profile.socialLinks.map((link, idx) => (
                    <a key={idx} href={link.url} className="social-badge" target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="metrics-grid anchor-target" id="scoring">
            <div className="metric-card">
              <div className="metric-value">{profile.followers}</div>
              <div className="metric-label">Followers</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{profile.publicReposCount}</div>
              <div className="metric-label">Public Repos</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{profile.totalStars}</div>
              <div className="metric-label">Total Stars</div>
            </div>
            <div className="metric-card score-card">
              <div className="metric-value">{profile.score}</div>
              <div className="metric-label">Score</div>
            </div>
          </div>

          {topLanguages.length > 0 && (
            <div className="languages-section" id="scoring">
              <h3>Top Languages</h3>
              <div className="lang-bars">
                {topLanguages.map(({ lang, pct, count }) => (
                  <div key={lang} className="lang-row">
                    <span className="lang-name">{lang}</span>
                    <div className="bar">
                      <div className="bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="lang-pct">{pct}%</span>
                    <span className="lang-count">({count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="repos-toolbar">
            <input
              className="repo-filter"
              placeholder="Filter repositories..."
              value={repoQuery}
              onChange={(e) => setRepoQuery(e.target.value)}
            />
            <select className="repo-select" value={languageFilter} onChange={(e)=>setLanguageFilter(e.target.value)}>
              <option value="all">All languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <select className="repo-select" value={sortKey} onChange={(e)=>setSortKey(e.target.value)}>
              <option value="stars">Sort by stars</option>
              <option value="name">Sort by name</option>
            </select>
          </div>

          <div className="repos-section anchor-target" id="api">
            <h3>Repositories ({filteredRepos.length})</h3>
            <div className="repos-list">
              {filteredRepos.map((repo, index) => (
                <div key={index} className="repo-item">
                  <div className="repo-name">{repo.name}</div>
                  <div className="repo-meta">
                    <div className="repo-stars">
                      <span className="star-icon">★</span>
                      {repo.stars}
                    </div>
                    <div className="repo-language">{repo.language || 'Other'}</div>
                  </div>
                </div>
              ))}
              {filteredRepos.length === 0 && (
                <div className="empty">No repositories match the current filters.</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features section */}
      <section className="features grid glass">
        <div className="info-card">
          <h3>Fast triage</h3>
          <p>Paste a username and get an instant overview: followers, public repos, stars, and a single score that’s easy to compare.</p>
        </div>
        <div className="info-card">
          <h3>Actionable insights</h3>
          <p>Filter and sort repositories, scan languages, and open the profile directly on GitHub to dive deeper.</p>
        </div>
        <div className="info-card">
          <h3>Works anywhere</h3>
          <p>Runs locally with CORS-enabled API. No login, no tokens required for basic usage.</p>
        </div>
      </section>

      {/* Informational sections */}
      <section className="info grid glass anchor-target" id="about">
        <div className="info-card">
          <h3>How it works</h3>
          <p>We fetch your GitHub profile and up to 100 public repositories, compute followers, total stars, and a weighted score.</p>
          <pre className="formula">Score = (Followers × 2) + (Public Repos × 1.5) + Total Stars</pre>
        </div>
        <div className="info-card">
          <h3>Why it helps</h3>
          <ul>
            <li>Instant, objective snapshot</li>
            <li>Language and repo insights</li>
            <li>No sign-in, zero setup</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Privacy-first</h3>
          <p>We only query public GitHub endpoints and never store results on a server. Everything runs client-side against your local API.</p>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} FilterFast</p>
      </footer>
    </div>
  );
}

export default App;
