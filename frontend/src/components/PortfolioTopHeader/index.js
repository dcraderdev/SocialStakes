import { useEffect, useRef, useState } from 'react';
import './PortfolioTopHeader.css';

const HOST_GATE = /\.vercel\.app$|\.dcrader\.dev$|^localhost$|^127\.0\.0\.1$/;

const INDUSTRIES = [
  ['Restaurants',   'https://restaurants.templates.dcrader.dev'],
  ['Pet services',  'https://pets.templates.dcrader.dev'],
  ['Trades',        'https://trades.templates.dcrader.dev'],
  ['Dental',        'https://dentists.templates.dcrader.dev'],
  ['Chiropractors', 'https://chiropractors.templates.dcrader.dev'],
  ['Photographers', 'https://photographers.templates.dcrader.dev'],
  ['Auto',          'https://auto.templates.dcrader.dev'],
  ['Salons',        'https://salons.templates.dcrader.dev'],
  ['Landscape',     'https://landscape.templates.dcrader.dev'],
  ['Real estate',   'https://realestate.templates.dcrader.dev'],
  ['Tattoo',        'https://tattoo.templates.dcrader.dev'],
  ['Trainers',      'https://trainers.templates.dcrader.dev'],
];

export default function PortfolioTopHeader() {
  const [show, setShow] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (HOST_GATE.test(window.location.hostname)) setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) { ticking = false; return; }
      setHidden(y > lastY && y > 60);
      lastY = y;
      ticking = false;
    };
    const handler = () => {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [show]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  if (!show) return null;

  return (
    <div
      id="dcrader-th"
      ref={barRef}
      role="navigation"
      aria-label="dcrader portfolio"
      className={hidden ? 'dt-hidden' : ''}
    >
      <div className="dt-inner">
        <a className="dt-home dt-pri" href="https://dcrader.dev">&larr; dcrader.dev</a>
        <nav>
          <a href="https://dcrader.dev/pricing">Pricing</a>
          <a href="https://dcrader.dev/contact">Contact</a>
          <div className="dt-dd">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            >
              Browse templates &#9662;
            </button>
            <div className="dt-menu" hidden={!menuOpen}>
              <div className="dt-sec">Industries</div>
              {INDUSTRIES.map(([label, href]) => (
                <a key={href} href={href}>{label}</a>
              ))}
              <div className="dt-sec">Portfolio</div>
              <a href="https://dcrader.dev">&larr; Back to dcrader.dev</a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
