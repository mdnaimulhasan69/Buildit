import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { buildSiteDocument, initialsOf, memberBySlug } from '../../lib/siteData.ts';
import type { DemoSite, TeamMember } from '../../lib/siteData.ts';

/** True once the page has been scrolled a little. Used to turn the top bar white. */
export function useSolid(threshold = 24): boolean {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid((window.pageYOffset || document.documentElement.scrollTop) > threshold);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [threshold]);
  return solid;
}

/** Smooth scroll to a section of the current page. */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

interface LandingNavProps {
  navigate: (path: string) => void;
  solid: boolean;
  /** Called for links that point to a section of the home page. */
  onSection: (id: string) => void;
  current?: 'home' | 'showcase';
}

export const LandingNav: React.FC<LandingNavProps> = ({ navigate, solid, onSection, current }) => {
  const { user, logoutUser } = useAuth();

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };
  const section = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onSection(id);
  };

  return (
    <header className={'nav' + (solid ? ' is-solid' : '')}>
      <div className="wrap nav-in">
        <a className="brand" href="/" onClick={go('/')} aria-label="BuildIt home">
          <span className="mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </span>
          <span className="brand-text"><b>BuildIt</b><small>No-code builder</small></span>
        </a>
        <nav className="nav-links" aria-label="Main">
          <a href="/showcase" className={current === 'showcase' ? 'on' : ''} onClick={go('/showcase')}>Showcase</a>
          <a href="/templates" onClick={go('/templates')}>Templates</a>
          <a href="/#team" onClick={section('team')}>Team</a>
          <a href="/#pciu" onClick={section('pciu')}>PCIU</a>
          {user ? (
            <a className="keep" href="/dashboard" onClick={go('/dashboard')}>Dashboard</a>
          ) : (
            <a className="keep" href="/login" onClick={go('/login')}>Log in</a>
          )}
        </nav>
        {user ? (
          <button
            type="button"
            className="btn btn-nav"
            onClick={() => {
              logoutUser();
              navigate('/');
            }}
          >
            Log out
          </button>
        ) : (
          <a className="btn btn-nav" href="/register" onClick={go('/register')}>Register</a>
        )}
      </div>
    </header>
  );
};

export const LandingFooter: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => (
  <footer className="foot">
    <div className="wrap">
      <span>BuildIt is a CSE-322 project by Team BuildIt, Port City International University. Payments run in test mode only.</span>
      <span>
        <a href="/showcase" onClick={(e) => { e.preventDefault(); navigate('/showcase'); }}>Showcase</a>
        {' · '}
        <a href="/templates" onClick={(e) => { e.preventDefault(); navigate('/templates'); }}>Templates</a>
        {' · '}
        <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Register</a>
      </span>
    </div>
  </footer>
);

/** Small live picture of a demo site. The page inside is locked: no scripts, no clicks. */
export const DemoThumb: React.FC<{ site: DemoSite }> = ({ site }) => {
  const doc = useMemo(() => buildSiteDocument(site.title, site.html, site.css), [site]);
  return (
    <iframe
      title={site.title + ' preview'}
      srcDoc={doc}
      sandbox=""
      loading="lazy"
      tabIndex={-1}
      aria-hidden="true"
    />
  );
};

/** Round avatar: the photo from public/team if it exists, otherwise the person's initials. */
export const Avatar: React.FC<{ member: TeamMember; mono?: boolean }> = ({ member, mono }) => {
  const [i, setI] = useState(0);
  const sources = [`/team/${member.slug}.jpg`, `/team/${member.slug}.png`];
  if (i < sources.length) {
    return <img src={sources[i]} alt={mono ? member.name : ''} onError={() => setI(i + 1)} />;
  }
  return mono ? (
    <span className="tm-mono" aria-hidden="true">{initialsOf(member.name)}</span>
  ) : (
    <span aria-hidden="true">{initialsOf(member.name)}</span>
  );
};

/** Tries each picture address in turn, then shows the fallback. */
export const FallbackImg: React.FC<{
  sources: string[];
  alt: string;
  fallback: React.ReactNode;
}> = ({ sources, alt, fallback }) => {
  const [i, setI] = useState(0);
  if (i >= sources.length) return <>{fallback}</>;
  return (
    <img
      src={sources[i]}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setI(i + 1)}
    />
  );
};

/** One card of the showcase grid. */
export const SiteCard: React.FC<{ site: DemoSite; navigate: (path: string) => void }> = ({ site, navigate }) => {
  const owner = memberBySlug(site.ownerSlug);
  const href = `/showcase/${site.slug}`;
  return (
    <a
      className="sc"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      <div className="sc-shot">
        <DemoThumb site={site} />
        <span className="sc-open">Open demo</span>
      </div>
      <div className="sc-body">
        <span className="sc-cat">{site.category}</span>
        <h3>{site.title}</h3>
        <p>{site.blurb}</p>
        {owner && (
          <div className="sc-by">
            <span className="av"><Avatar member={owner} /></span>
            <span>by <b>{owner.name}</b></span>
          </div>
        )}
      </div>
    </a>
  );
};
