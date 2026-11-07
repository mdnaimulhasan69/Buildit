import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../landing/landing.css';
import { useAuth } from '../context/AuthContext.tsx';
import { DEMO_SITES, buildSiteDocument, memberBySlug } from '../lib/siteData.ts';
import {
  Avatar,
  LandingFooter,
  LandingNav,
  SiteCard,
  scrollToSection,
  useSolid
} from '../components/landing/Shared.tsx';

interface ShowcasePageProps {
  slug?: string;
  navigate: (path: string) => void;
}

/**
 * Inside a demo, forms and links do nothing. A form submit tells this page, which shows a message
 * that invites the visitor to register.
 */
const DEMO_SCRIPT =
  '<script>' +
  'document.addEventListener("submit",function(e){e.preventDefault();parent.postMessage({type:"bi-demo-submit"},"*");});' +
  'document.addEventListener("click",function(e){var a=e.target&&e.target.closest?e.target.closest("a"):null;if(a){e.preventDefault();}});' +
  '</script>';

export const ShowcasePage: React.FC<ShowcasePageProps> = ({ slug, navigate }) => {
  const { user } = useAuth();
  const solid = useSolid(24);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [toastOn, setToastOn] = useState(false);

  const site = slug ? DEMO_SITES.find((s) => s.slug === slug) : undefined;
  const owner = site ? memberBySlug(site.ownerSlug) : undefined;

  const onSection = (id: string) => {
    navigate('/');
    window.setTimeout(() => scrollToSection(id), 150);
  };
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const doc = useMemo(
    () => (site ? buildSiteDocument(site.title, site.html, site.css, DEMO_SCRIPT) : ''),
    [site]
  );

  useEffect(() => {
    setToastOn(false);
    let timer = 0;
    const onMessage = (e: MessageEvent) => {
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return;
      if (e.data && e.data.type === 'bi-demo-submit') {
        setToastOn(true);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setToastOn(false), 7000);
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      window.clearTimeout(timer);
    };
  }, [slug]);

  const registerCta = user ? (
    <a className="btn btn-sun" href="/dashboard" onClick={go('/dashboard')}>Open your dashboard</a>
  ) : (
    <>
      <a className="btn btn-sun" href="/register" onClick={go('/register')}>Create your account</a>
      <a className="btn btn-line" href="/login" onClick={go('/login')}>Log in</a>
    </>
  );

  const ctaBlock = (
    <div className="sc-cta">
      <div>
        <h3>Like what you see? Make one of your own.</h3>
        <p>Create a free account, pick a template and start editing in a minute.</p>
      </div>
      <div className="cta-row" style={{ marginTop: 0 }}>{registerCta}</div>
    </div>
  );

  /* ------------------------------------------------ one demo site */
  if (slug) {
    if (!site) {
      return (
        <div className={'bi' + (solid ? ' is-solid' : '')}>
          <LandingNav navigate={navigate} solid={solid} onSection={onSection} current="showcase" />
          <main>
            <div className="page-top">
              <div className="wrap">
                <h1>We could not find that demo</h1>
                <p>The link may be old. Open the showcase to see all the demo sites.</p>
                <div className="cta-row">
                  <a className="btn btn-sun" href="/showcase" onClick={go('/showcase')}>Open the showcase</a>
                </div>
              </div>
            </div>
          </main>
          <LandingFooter navigate={navigate} />
        </div>
      );
    }

    const others = DEMO_SITES.filter((s) => s.slug !== site.slug).slice(0, 3);

    // This page has no dark banner behind the top bar, so the bar is always white here.
    return (
      <div className="bi is-solid">
        <LandingNav navigate={navigate} solid onSection={onSection} current="showcase" />
        <main>
          <div className="wrap demo-head">
            <div>
              <span className="eyebrow">{site.category}</span>
              <h1>{site.title}</h1>
              {owner && (
                <div className="demo-meta">
                  <span className="av"><Avatar member={owner} /></span>
                  <span>
                    Made by <b>{owner.name}</b> ({owner.studentId}) from the {site.templateName} template
                  </span>
                </div>
              )}
            </div>
            <div className="cta-row" style={{ marginTop: 0 }}>
              <a className="btn btn-ghost" href="/showcase" onClick={go('/showcase')}>All demos</a>
              <a className="btn btn-blue" href={`/templates/preview/${site.templateId}`} onClick={go(`/templates/preview/${site.templateId}`)}>
                See the template
              </a>
            </div>
          </div>

          <div className="demo-bar" style={{ marginTop: 20 }}>
            <div className="wrap">
              <p>This is a demo site. Buttons and forms here do not send anything.</p>
              {!user && (
                <a className="btn btn-blue" href="/register" onClick={go('/register')}>Create your account</a>
              )}
            </div>
          </div>

          <div className="wrap">
            <div className="demo-frame">
              <iframe
                ref={frameRef}
                title={site.title}
                srcDoc={doc}
                sandbox="allow-scripts"
              />
            </div>

            {ctaBlock}

            <div className="more">
              <h2>More sites made with BuildIt</h2>
              <div className="sc-grid">
                {others.map((s) => (
                  <SiteCard key={s.slug} site={s} navigate={navigate} />
                ))}
              </div>
            </div>
          </div>
        </main>

        <div className={'toast' + (toastOn ? ' on' : '')} role="status" aria-live="polite">
          <p>This is a demo, so nothing was sent. Create your own account to build and save real pages.</p>
          {!user && <a className="btn btn-sun" href="/register" onClick={go('/register')}>Register</a>}
        </div>

        <LandingFooter navigate={navigate} />
      </div>
    );
  }

  /* ------------------------------------------------ the gallery */
  return (
    <div className={'bi' + (solid ? ' is-solid' : '')}>
      <LandingNav navigate={navigate} solid={solid} onSection={onSection} current="showcase" />
      <main>
        <div className="page-top">
          <div className="wrap">
            <h1>Sites made with BuildIt</h1>
            <p>
              Seven sites, one for each template, made by the four team accounts. Open any of them to see it full size.
              When you are ready, create your own account.
            </p>
            <div className="cta-row">{registerCta}</div>
          </div>
        </div>
        <section className="sec showcase" style={{ paddingTop: 'clamp(36px,5vw,64px)' }}>
          <div className="wrap">
            <div className="sc-grid" style={{ marginTop: 0 }}>
              {DEMO_SITES.map((s) => (
                <SiteCard key={s.slug} site={s} navigate={navigate} />
              ))}
            </div>
            {ctaBlock}
          </div>
        </section>
      </main>
      <LandingFooter navigate={navigate} />
    </div>
  );
};
