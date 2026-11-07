import React, { useEffect, useRef, useState } from 'react';
import '../landing/landing.css';
import { useAuth } from '../context/AuthContext.tsx';
import { STARTER_TEMPLATES } from '../lib/starterTemplates.ts';
import { DEMO_SITES, PCIU, PCIU_IMAGES, TEAM } from '../lib/siteData.ts';
import {
  Avatar,
  FallbackImg,
  LandingFooter,
  LandingNav,
  SiteCard,
  scrollToSection,
  useSolid
} from '../components/landing/Shared.tsx';

interface HomePageProps {
  navigate: (path: string) => void;
}

const cv = (o: Record<string, string | number>) => o as unknown as React.CSSProperties;

/* Little wireframe drawings for the template ring, in the same order as STARTER_TEMPLATES. */
const WIREFRAMES: React.ReactNode[] = [
  <>
    <i className="bar-w" /><i className="ln w80" /><i className="fld" /><i className="fld" /><i className="fld dd" />
    <span className="row"><i className="chk" /><i className="ln w60" /></span><i className="btn-w" />
  </>,
  <>
    <i className="bar-w" /><i className="ln w80" /><i className="ln w60" />
    <span className="row"><i className="rd" /><i className="ln w60" /></span>
    <span className="row"><i className="rd on" /><i className="ln w80" /></span>
    <span className="row"><i className="rd" /><i className="ln w40" /></span>
    <i className="ln w80" /><span className="row"><i className="pill" /><i className="pill on" /><i className="pill" /></span><i className="btn-w" />
  </>,
  <>
    <i className="img" /><i className="bar-w" /><i className="ln w80" />
    <span className="row"><i className="pill on" /><i className="pill" /></span><i className="fld" /><i className="fld" /><i className="btn-w" />
  </>,
  <>
    <i className="bar-w" /><span className="grid3"><i className="fld" /><i className="fld" /><i className="fld dd" /></span>
    <i className="btn-w" style={{ width: '36%' }} />
    <div className="rows"><i /><i /><i /><i /><i /></div>
  </>,
  <>
    <i className="bar-w" /><i className="ln w80" />
    <span className="row"><i className="ln" /><i className="pill" style={{ flex: 'none', width: '3em' }} /></span>
    <span className="row"><i className="ln" /><i className="pill" style={{ flex: 'none', width: '3em' }} /></span>
    <span className="row"><i className="ln" /><i className="pill" style={{ flex: 'none', width: '3em' }} /></span>
    <span className="grid3"><i className="pill" /><i className="pill on" /><i className="pill" /><i className="pill" /><i className="pill" /><i className="pill" /></span><i className="btn-w" />
  </>,
  <>
    <span className="row"><i className="avatar" /><span className="lns"><i className="ln w80" /><i className="ln w60" /></span></span>
    <i className="ln" /><i className="ln w80" />
    <span className="grid3"><i className="img sm" /><i className="img sm" /><i className="img sm" /></span>
    <i className="fld" /><i className="btn-w" />
  </>,
  <>
    <i className="bar-w" /><i className="ln" /><i className="ln w80" />
    <span className="row"><i className="avatar" /><i className="avatar" /><i className="avatar" /></span>
    <span className="bars"><i style={{ height: '40%' }} /><i style={{ height: '70%' }} /><i style={{ height: '55%' }} /><i style={{ height: '92%' }} /><i style={{ height: '62%' }} /></span>
    <div className="rows"><i /><i /><i /></div>
  </>
];

const FEATURES: Array<{ title: string; text: string }> = [
  {
    title: 'Seven starter templates',
    text: 'Sign-up, survey, event, attendance, booking, portfolio and research pages. Preview each one, then make your own copy.'
  },
  {
    title: 'A drag-and-drop editor',
    text: 'Headings, text, images, buttons, tables and ready form fields. Check the page in laptop, tablet and phone views.'
  },
  {
    title: 'Saved versions',
    text: 'Your work saves as you go. Open the version history to see up to 20 saved versions and go back to any of them.'
  },
  {
    title: 'Your own profile',
    text: 'Add a picture, a short bio and links. Anyone can open your public profile page.'
  },
  {
    title: 'Sign in your way',
    text: 'Register with an email and a password, or continue with your Google account.'
  },
  {
    title: 'Safety built in',
    text: 'Passwords are stored hashed, sessions last 7 days, and an account locks for a while after five wrong tries.'
  }
];

const CampusArt: React.FC = () => (
  <svg viewBox="0 0 600 380" role="img" aria-label="Drawing of a university building" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bi-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8CA8FF" />
        <stop offset="1" stopColor="#DCE6FF" />
      </linearGradient>
    </defs>
    <rect width="600" height="380" fill="url(#bi-sky)" />
    <circle cx="505" cy="70" r="30" fill="#FFD23F" />
    <rect x="60" y="150" width="480" height="195" rx="6" fill="#1630C8" />
    <rect x="250" y="96" width="100" height="249" rx="6" fill="#2347F0" />
    {[0, 1, 2].map((r) =>
      [0, 1, 2, 3, 4, 5, 6, 7].map((c) => {
        const x = c < 4 ? 82 + c * 42 : 392 + (c - 4) * 36;
        return <rect key={`${r}-${c}`} x={x} y={172 + r * 50} width="22" height="30" rx="3" fill="#DCE6FF" opacity="0.92" />;
      })
    )}
    {[0, 1, 2, 3].map((r) => (
      <rect key={`t${r}`} x="283" y={116 + r * 52} width="34" height="32" rx="3" fill="#FFD23F" opacity="0.9" />
    ))}
    <rect x="0" y="345" width="600" height="35" fill="#0A1458" />
    <text x="300" y="368" textAnchor="middle" fill="#fff" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="15" letterSpacing="3">
      PORT CITY INTERNATIONAL UNIVERSITY
    </text>
  </svg>
);

const LabArt: React.FC = () => (
  <svg viewBox="0 0 600 380" role="img" aria-label="Drawing of a computer lab" preserveAspectRatio="xMidYMid slice">
    <rect width="600" height="380" fill="#E7ECFB" />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${40 + i * 180} 120)`}>
        <rect width="140" height="90" rx="8" fill="#0A1458" />
        <rect x="8" y="8" width="124" height="74" rx="4" fill="#4A6CFF" />
        <rect x="22" y="22" width="60" height="8" rx="4" fill="#fff" opacity="0.9" />
        <rect x="22" y="38" width="96" height="6" rx="3" fill="#fff" opacity="0.6" />
        <rect x="22" y="52" width="80" height="6" rx="3" fill="#fff" opacity="0.6" />
        <rect x="60" y="90" width="20" height="26" fill="#0A1458" />
        <rect x="30" y="116" width="80" height="10" rx="5" fill="#0A1458" />
      </g>
    ))}
    <rect x="0" y="300" width="600" height="80" fill="#C9D3F5" />
    <text x="300" y="350" textAnchor="middle" fill="#1630C8" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="17" letterSpacing="2">
      DEPARTMENT OF CSE
    </text>
  </svg>
);

const LogoArt: React.FC = () => (
  <svg viewBox="0 0 240 120" role="img" aria-label="PCIU" preserveAspectRatio="xMidYMid meet">
    <rect x="6" y="6" width="108" height="108" rx="18" fill="#1630C8" />
    <path d="M60 26l34 16v8H26v-8zM34 56h12v30H34zm20 0h12v30H54zm20 0h12v30H74zM26 90h68v8H26z" fill="#fff" />
    <text x="128" y="62" fill="#0A1458" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="34">PCIU</text>
    <text x="128" y="86" fill="#46507A" fontFamily="system-ui, sans-serif" fontWeight="600" fontSize="11">Port City</text>
  </svg>
);

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const solid = useSolid(24);

  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringStageRef = useRef<HTMLDivElement>(null);
  const stepRing = useRef<(dir: number) => void>(() => {});
  const [ringName, setRingName] = useState(STARTER_TEMPLATES[0]?.name ?? '');
  const [ringCategory, setRingCategory] = useState(STARTER_TEMPLATES[0]?.category ?? '');

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };
  const jump = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSection(id);
  };

  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const scene = sceneRef.current;
    const ring = ringRef.current;
    const rs = ringStageRef.current;
    if (!hero || !stage || !scene || !ring || !rs) return;

    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
    let disposed = false;
    const observers: IntersectionObserver[] = [];

    /* ---- hero scene: tilts with the pointer, spreads on hover, closes as the page scrolls ---- */
    let tx = 0, ty = 0, cx = 0, cy = 0, hv = 0, chv = 0;
    let heroOn = true;
    let sceneRunning = false;
    const paintScene = () => {
      const prog = clamp((window.pageYOffset || 0) / Math.max(1, hero.offsetHeight * 0.7), 0, 1);
      scene.style.setProperty('--rx', (54 - cy * 6 + prog * 10).toFixed(2) + 'deg');
      scene.style.setProperty('--rz', (-32 + cx * 9 - prog * 14).toFixed(2) + 'deg');
      scene.style.setProperty('--spread', (1 + chv * 0.28 - prog * 0.55).toFixed(3));
    };
    const sceneLoop = () => {
      if (disposed) return;
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      chv += (hv - chv) * 0.06;
      paintScene();
      if (heroOn) requestAnimationFrame(sceneLoop);
      else sceneRunning = false;
    };
    const startScene = () => {
      if (!sceneRunning && !reduce) {
        sceneRunning = true;
        requestAnimationFrame(sceneLoop);
      }
    };
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      tx = clamp((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1);
      ty = clamp((e.clientY - (r.top + r.height / 2)) / r.height, -1, 1);
    };
    const onHeroLeave = () => { tx = 0; ty = 0; };
    const onStageEnter = () => { hv = 1; };
    const onStageLeave = () => { hv = 0; };
    const onScrollPaint = () => { if (reduce) paintScene(); };
    if (!reduce) {
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onHeroLeave);
      stage.addEventListener('pointerenter', onStageEnter);
      stage.addEventListener('pointerleave', onStageLeave);
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((en) => {
          heroOn = en[0].isIntersecting;
          if (heroOn) startScene();
        });
        io.observe(hero);
        observers.push(io);
      }
      startScene();
    } else {
      paintScene();
    }
    window.addEventListener('scroll', onScrollPaint, { passive: true });

    /* ---- template ring ---- */
    const cards = Array.from(ring.querySelectorAll<HTMLElement>('.tcard'));
    const STEP = 360 / Math.max(1, cards.length);
    let ang = 0, target = 0, hold = false, ringOn = true, ringRunning = false, last = 0, front = -1;
    const paintRing = () => {
      ring.style.setProperty('--ang', ang.toFixed(2) + 'deg');
      let best = 0;
      let bestD = 999;
      cards.forEach((c, i) => {
        const a = ((((i * STEP + ang) % 360) + 540) % 360) - 180;
        const d = Math.abs(a);
        c.style.setProperty('--shade', (0.5 * clamp((d - 20) / 110, 0, 1)).toFixed(3));
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best !== front) {
        front = best;
        const t = STARTER_TEMPLATES[best];
        if (t) {
          setRingName(t.name);
          setRingCategory(t.category);
        }
      }
    };
    const ringLoop = (t: number) => {
      if (disposed) return;
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      if (!reduce && !hold) target -= dt * 7;
      ang += (target - ang) * Math.min(1, dt * 5);
      paintRing();
      if (ringOn && (!reduce || Math.abs(target - ang) > 0.05)) requestAnimationFrame(ringLoop);
      else { ringRunning = false; last = 0; }
    };
    const startRing = () => {
      if (!ringRunning) {
        ringRunning = true;
        requestAnimationFrame(ringLoop);
      }
    };
    stepRing.current = (dir: number) => {
      target = Math.round(target / STEP) * STEP + dir * STEP;
      startRing();
    };
    const hold1 = () => { hold = true; };
    const hold0 = () => { hold = false; };
    ['pointerenter', 'focusin'].forEach((n) => rs.addEventListener(n, hold1));
    ['pointerleave', 'focusout'].forEach((n) => rs.addEventListener(n, hold0));
    if ('IntersectionObserver' in window) {
      const io2 = new IntersectionObserver((en) => {
        ringOn = en[0].isIntersecting;
        if (ringOn) startRing();
      });
      io2.observe(rs);
      observers.push(io2);
    }
    paintRing();
    startRing();

    return () => {
      disposed = true;
      observers.forEach((o) => o.disconnect());
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onHeroLeave);
      stage.removeEventListener('pointerenter', onStageEnter);
      stage.removeEventListener('pointerleave', onStageLeave);
      window.removeEventListener('scroll', onScrollPaint);
      ['pointerenter', 'focusin'].forEach((n) => rs.removeEventListener(n, hold1));
      ['pointerleave', 'focusout'].forEach((n) => rs.removeEventListener(n, hold0));
    };
  }, []);

  return (
    <div className={'bi' + (solid ? ' is-solid' : '')}>
      <LandingNav navigate={navigate} solid={solid} onSection={scrollToSection} current="home" />

      <main id="top">
        {/* ------------------------------------------------ hero */}
        <section className="hero" id="hero" ref={heroRef}>
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="badge"><i />Port City International University · CSE-322 Project</p>
              <h1>Build small websites and forms without writing code</h1>
              <p className="lede">
                Drag blocks onto a page, start from one of seven ready-made templates, and go back to any saved version. No code needed.
              </p>
              <div className="cta-row">
                {user ? (
                  <a className="btn btn-sun" href="/dashboard" onClick={go('/dashboard')}>Open your dashboard</a>
                ) : (
                  <a className="btn btn-sun" href="/register" onClick={go('/register')}>Start building</a>
                )}
                <a className="btn btn-line" href="#showcase" onClick={jump('showcase')}>See sites made with BuildIt</a>
              </div>
              <p className="aud">Made for club officers, student teams and class projects.</p>
            </div>

            <div className="stage" ref={stageRef} aria-hidden="true">
              <div className="scene" ref={sceneRef}>
                <div className="floor" />

                <div className="layer" style={cv({ '--z': '0em' })}><div className="float" style={cv({ '--d': '0s' })}>
                  <div className="panel">
                    <div className="bar"><span className="dots"><i /><i /><i /></span><span className="url">Robotics Club · Draft</span><span className="pub">Save</span></div>
                    <div className="page-grid" />
                  </div>
                  <span className="tag" style={cv({ '--ty': '4em' })}><b>Page</b></span>
                </div></div>

                <div className="layer" style={cv({ '--z': '4.5em' })}><div className="float" style={cv({ '--d': '-1.4s' })}>
                  <div className="blk blk-head"><h3>Robotics Club</h3><p>Meets every Thursday, Room 304</p><i className="hd a" /><i className="hd b" /><i className="hd c" /><i className="hd d" /></div>
                  <div className="blk blk-img"><i className="sun" /><i className="hill h1" /><i className="hill h2" /></div>
                  <span className="tag" style={cv({ '--ty': '7em' })}><b>Blocks</b></span>
                </div></div>

                <div className="layer" style={cv({ '--z': '9em' })}><div className="float" style={cv({ '--d': '-2.8s' })}>
                  <div className="card form-card">
                    <h4>Join the club</h4>
                    <label>Name<span className="fl" /></label>
                    <label>Email<span className="fl" /></label>
                    <label>Department<span className="fl dd" /></label>
                    <span className="agree"><i />I agree to the rules</span>
                    <span className="go">Submit</span>
                  </div>
                </div></div>

                <div className="layer" style={cv({ '--z': '13.5em' })}><div className="float" style={cv({ '--d': '-4.2s' })}>
                  <div className="card ans-card">
                    <header><h4>Versions</h4><span className="count"><span className="c2">2</span><span className="c3">3</span></span></header>
                    <div className="ans-row head"><span>Saved</span><span>By</span><span>Time</span></div>
                    <div className="ans-row new"><span>Version 3</span><span>You</span><span>11:05</span></div>
                    <div className="ans-row"><span>Version 2</span><span>You</span><span>10:51</span></div>
                    <div className="ans-row"><span>Version 1</span><span>You</span><span>10:42</span></div>
                  </div>
                  <span className="tag" style={cv({ '--ty': '24em' })}><b>History</b></span>
                </div></div>

                <div className="layer" style={cv({ '--z': '18em' })}><div className="float" style={cv({ '--d': '-5.6s' })}>
                  <div className="chip link"><div className="face"><i />Saved as version 3</div></div>
                  <div className="chip fresh"><div className="face"><i />New version</div></div>
                  <div className="cur cur-a"><div className="face"><svg className="arrow" viewBox="0 0 22 26"><path d="M3 2.5l15.5 9.2-6.8 1.7 4 7.6-3.2 1.7-4-7.5L3 19.4z" fill="currentColor" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" /></svg><span className="nm">You</span></div></div>
                </div></div>
              </div>
            </div>
            <p className="sr">Illustration: a web page built from four layers. The page, the blocks on it, a ready-made form template, and a list of saved versions.</p>
          </div>
        </section>

        {/* ------------------------------------------------ how it works */}
        <section className="sec" id="how">
          <div className="wrap">
            <h2>From a blank page to a finished page in three steps</h2>
            <ol className="steps">
              <li><span className="n" aria-hidden="true">1</span><h3>Start from a template</h3><p>Pick one of seven ready-made pages or begin with a blank canvas. You can preview any template without an account.</p></li>
              <li><span className="n" aria-hidden="true">2</span><h3>Drag blocks and edit</h3><p>Drop headings, images, buttons, tables and form fields where you want them. Switch between laptop, tablet and phone views.</p></li>
              <li><span className="n" aria-hidden="true">3</span><h3>Save and come back</h3><p>Your work saves as you go. Every manual save is kept in the version history, so you can return to an earlier version.</p></li>
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------ template ring */}
        <section className="sec templates" id="templates">
          <div className="wrap">
            <h2>Seven templates to start from</h2>
            <p className="sub">Each one works on a phone. Preview any of them without logging in.</p>
          </div>
          <div className="ring-stage" ref={ringStageRef}>
            <div className="ring-floor" aria-hidden="true" />
            <div className="ring" ref={ringRef}>
              {STARTER_TEMPLATES.slice(0, 7).map((t, i) => (
                <a
                  key={t.id}
                  className="tcard"
                  style={cv({ '--i': i })}
                  href={`/templates/preview/${t.id}`}
                  onClick={go(`/templates/preview/${t.id}`)}
                  aria-label={`Preview the ${t.name} template`}
                >
                  <div className="wf" aria-hidden="true">{WIREFRAMES[i]}</div>
                </a>
              ))}
            </div>
          </div>
          <div className="wrap ring-ui">
            <p className="ring-cap" aria-live="polite"><b>{ringName}</b><span>{ringCategory}</span></p>
            <button className="step-btn" type="button" aria-label="Previous template" onClick={() => stepRing.current(1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button className="step-btn" type="button" aria-label="Next template" onClick={() => stepRing.current(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
            </button>
            <a className="btn btn-blue" href="/templates" onClick={go('/templates')}>Browse templates</a>
          </div>
        </section>

        {/* ------------------------------------------------ showcase */}
        <section className="sec showcase" id="showcase">
          <div className="wrap">
            <span className="eyebrow">Showcase</span>
            <h2>Sites our team made with BuildIt</h2>
            <p className="sub">
              Each site below was made from a BuildIt template by one of the four team accounts. Open one to see it full size.
            </p>
            <div className="sc-grid">
              {DEMO_SITES.map((site) => (
                <SiteCard key={site.slug} site={site} navigate={navigate} />
              ))}
            </div>
            <div className="sc-cta">
              <div>
                <h3>Like what you see? Make one of your own.</h3>
                <p>Create a free account, pick a template and start editing in a minute.</p>
              </div>
              <div className="cta-row" style={{ marginTop: 0 }}>
                {user ? (
                  <a className="btn btn-sun" href="/dashboard" onClick={go('/dashboard')}>Open your dashboard</a>
                ) : (
                  <>
                    <a className="btn btn-sun" href="/register" onClick={go('/register')}>Create your account</a>
                    <a className="btn btn-line" href="/login" onClick={go('/login')}>Log in</a>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ features */}
        <section className="sec" id="features">
          <div className="wrap feat-grid">
            <div className="feat-head">
              <h2>What works today</h2>
              <p className="sub">Everything a club or class project needs to design a page and keep every version of it.</p>
            </div>
            <div>
              <dl className="feat-list">
                {FEATURES.map((f) => (
                  <div key={f.title}><dt>{f.title}</dt><dd>{f.text}</dd></div>
                ))}
              </dl>
              <div className="soon">
                <b>On the roadmap:</b>
                <span className="pl">Publishing at your own address</span>
                <span className="pl">Forms with an answers table</span>
                <span className="pl">Team editing and chat</span>
                <span className="pl">AI helper in the editor</span>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ team */}
        <section className="sec team" id="team">
          <div className="wrap">
            <span className="eyebrow">The team</span>
            <h2>Meet the builders</h2>
            <p className="sub">
              Four students of the Department of CSE at Port City International University built BuildIt for the CSE-322 course.
            </p>
            <div className="team-grid">
              {TEAM.map((m) => (
                <article className="tm" key={m.slug}>
                  <div className="tm-photo"><Avatar member={m} mono /></div>
                  <h3>{m.name}</h3>
                  <span className="tm-role">{m.role}</span>
                  <span className="tm-id">ID {m.studentId}</span>
                  <span className="tm-pass">Passion</span>
                  <blockquote>{m.passion}</blockquote>
                  <ul aria-label={`${m.name} worked on`}>
                    {m.worked.map((w) => <li key={w}>{w}</li>)}
                  </ul>
                  <a className="tm-link" href={`/u/${m.userId}`} onClick={go(`/u/${m.userId}`)}>View public profile</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ PCIU */}
        <section className="pciu" id="pciu">
          <div className="wrap pciu-in">
            <div>
              <span className="eyebrow">Our university</span>
              <h2>{PCIU.name}</h2>
              <p className="sub">{PCIU.intro}</p>
              <dl className="facts">
                {PCIU.facts.map((f) => (
                  <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
                ))}
              </dl>
              <p className="vision">{PCIU.vision}</p>
              <p className="src">
                {PCIU.sourceNote} Visit <a href={PCIU.website} target="_blank" rel="noreferrer">{PCIU.websiteLabel}</a> for the latest details.
              </p>
            </div>
            <div className="pciu-stack">
              <div className="pf a"><FallbackImg sources={PCIU_IMAGES.campus} alt="Port City International University campus" fallback={<CampusArt />} /></div>
              <div className="pf b"><FallbackImg sources={PCIU_IMAGES.cse} alt="Department of Computer Science and Engineering, PCIU" fallback={<LabArt />} /></div>
              <div className="pf c"><FallbackImg sources={PCIU_IMAGES.logo} alt="PCIU logo" fallback={<LogoArt />} /></div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ closing band */}
        <section className="cta" id="register">
          <div className="wrap cta-in">
            <div>
              <h2>Make your first page today</h2>
              <p>Registering takes a minute. Start from a template or a blank page.</p>
              {user ? (
                <a className="btn btn-sun" href="/dashboard" onClick={go('/dashboard')}>Open your dashboard</a>
              ) : (
                <a className="btn btn-sun" href="/register" onClick={go('/register')}>Start building</a>
              )}
            </div>
            <div className="turn" aria-hidden="true">
              <div className="turn-in">
                <i style={cv({ '--z': '0em' })} /><i style={cv({ '--z': '3.6em' })} /><i style={cv({ '--z': '7.2em' })} /><i style={cv({ '--z': '10.8em' })} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter navigate={navigate} />
    </div>
  );
};
