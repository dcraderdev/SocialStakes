import React, { useContext, useEffect, useRef } from 'react';
import { ModalContext } from '../../context/ModalContext';
import socialstakesCards from '../../images/socialstakes-logo-cards2.svg';
import goldChip from '../../images/poker-chip.svg';
import './LandingPage.css';

const GAMES = [
  {
    id: 'multi_blackjack',
    name: 'Multiplayer Blackjack',
    tag: 'LIVE',
    desc: 'Real tables, real players. Beat the dealer together.',
    icon: 'BJ',
    suit: '♠',
    color: 'var(--ss-gold)',
    anim: 'card-flip',
  },
  {
    id: 'poker',
    name: "Texas Hold'em",
    tag: 'SOON',
    desc: 'Six players, one pot. May the best hand win.',
    icon: '♦',
    suit: '♣',
    color: '#c084fc',
    anim: 'chip-stack',
  },
  {
    id: 'coin_flip',
    name: 'Coin Flip',
    tag: 'SOLO',
    desc: 'Heads or tails. 50/50. Instant result.',
    icon: 'C',
    suit: null,
    color: '#fbbf24',
    anim: 'coin-spin',
  },
  {
    id: 'hi_lo',
    name: 'Hi / Lo',
    tag: 'SOLO',
    desc: 'Will the next card be higher or lower?',
    icon: '↕',
    suit: '♥',
    color: '#ef5d5d',
    anim: 'card-slide',
  },
  {
    id: 'acey_duecey',
    name: 'Acey-Duecey',
    tag: 'SOLO',
    desc: 'Will the third card fall between the first two?',
    icon: 'A',
    suit: '2',
    color: '#6aa9ff',
    anim: 'two-cards',
  },
  {
    id: 'slots',
    name: 'Slots',
    tag: 'SOON',
    desc: 'Pull the lever. Three in a row takes the pot.',
    icon: '7',
    suit: null,
    color: '#4ade80',
    anim: 'reel-spin',
  },
  {
    id: 'roulette',
    name: 'Roulette',
    tag: 'SOON',
    desc: 'Red or black. Zero to thirty-six. Place your bets.',
    icon: '○',
    suit: null,
    color: '#ef5d5d',
    anim: 'wheel-spin',
  },
];

const STEPS = [
  { num: '01', label: 'Sign Up Free', desc: 'No credit card. No real money. Just a username and password.' },
  { num: '02', label: 'Get Free Chips', desc: 'Start with $10,000 in demo chips. Lose it all? We reset you.' },
  { num: '03', label: 'Invite Friends', desc: 'Share a private table link. They join from anywhere.' },
  { num: '04', label: 'Play & Verify', desc: 'Every hand is provably fair — check the math yourself.' },
];

const QUOTES = [
  {
    text: "Finally a way to verify the dealer isn't cheating. I audited three hands and the math checked out every time.",
    name: 'Alex R.',
    sub: 'Software engineer, plays Friday nights',
  },
  {
    text: "Brought back our Saturday poker night across three time zones. Social Stakes is the only app that didn't feel like a grind.",
    name: 'Maya T.',
    sub: 'Plays Texas Hold\'em with college friends',
  },
  {
    text: "The provably fair thing sold me instantly. Every other site just says 'trust us'. These guys show their work.",
    name: 'Jordan K.',
    sub: 'Skeptic turned regular',
  },
];

function GameCard({ game, onCTA }) {
  return (
    <div className={`lp-game-card lp-anim-${game.anim}`} onClick={onCTA}>
      <div className="lp-game-card-badge" style={{ color: game.color }}>
        {game.tag}
      </div>
      <div className="lp-game-card-preview">
        <GameCardAnim game={game} />
      </div>
      <div className="lp-game-card-body">
        <div className="lp-game-card-name">{game.name}</div>
        <div className="lp-game-card-desc">{game.desc}</div>
      </div>
      <div className="lp-game-card-cta" style={{ color: game.color }}>
        {game.tag === 'SOON' ? 'Coming soon' : 'Play now →'}
      </div>
    </div>
  );
}

function GameCardAnim({ game }) {
  if (game.anim === 'card-flip') {
    return (
      <div className="lp-anim-cards">
        <div className="lp-card lp-card-back lp-card-1">
          <div className="lp-card-inner">
            <div className="lp-card-front"><span className="lp-suit-gold">A</span><span className="lp-suit-small">♠</span></div>
            <div className="lp-card-back-face" />
          </div>
        </div>
        <div className="lp-card lp-card-back lp-card-2">
          <div className="lp-card-inner">
            <div className="lp-card-front lp-red-card"><span>K</span><span className="lp-suit-small">♥</span></div>
            <div className="lp-card-back-face" />
          </div>
        </div>
        <div className="lp-card lp-card-back lp-card-3">
          <div className="lp-card-inner">
            <div className="lp-card-front"><span className="lp-suit-gold">Q</span><span className="lp-suit-small">♦</span></div>
            <div className="lp-card-back-face" />
          </div>
        </div>
      </div>
    );
  }
  if (game.anim === 'chip-stack') {
    return (
      <div className="lp-anim-chips">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`lp-chip lp-chip-${i}`} />
        ))}
      </div>
    );
  }
  if (game.anim === 'coin-spin') {
    return (
      <div className="lp-anim-coin">
        <div className="lp-coin">
          <div className="lp-coin-face lp-coin-h">H</div>
          <div className="lp-coin-face lp-coin-t">T</div>
        </div>
      </div>
    );
  }
  if (game.anim === 'card-slide') {
    return (
      <div className="lp-anim-hilo">
        <div className="lp-hilo-card lp-hilo-bot"><span className="lp-suit-gold">7</span><span className="lp-suit-small">♠</span></div>
        <div className="lp-hilo-arrows">
          <span className="lp-arrow lp-arrow-up">▲</span>
          <span className="lp-arrow lp-arrow-down">▼</span>
        </div>
        <div className="lp-hilo-card lp-hilo-reveal"><span className="lp-red-card">J</span><span className="lp-suit-small lp-red-card">♥</span></div>
      </div>
    );
  }
  if (game.anim === 'two-cards') {
    return (
      <div className="lp-anim-acey">
        <div className="lp-acey-card lp-acey-left"><span className="lp-suit-gold">2</span><span className="lp-suit-small">♣</span></div>
        <div className="lp-acey-mid">
          <div className="lp-acey-mid-label">between?</div>
          <div className="lp-acey-mid-card lp-acey-reveal"><span>9</span><span className="lp-suit-small">♦</span></div>
        </div>
        <div className="lp-acey-card lp-acey-right"><span className="lp-red-card">K</span><span className="lp-suit-small lp-red-card">♥</span></div>
      </div>
    );
  }
  if (game.anim === 'reel-spin') {
    const syms = ['7', '$', '♦', '★', '7'];
    return (
      <div className="lp-anim-slots">
        {[0, 1, 2].map(col => (
          <div key={col} className="lp-slot-reel">
            <div className={`lp-slot-strip lp-strip-${col}`}>
              {syms.map((s, i) => <div key={i} className="lp-slot-sym">{s}</div>)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (game.anim === 'wheel-spin') {
    return (
      <div className="lp-anim-roulette">
        <div className="lp-wheel">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`lp-wheel-seg ${i % 2 === 0 ? 'lp-seg-red' : 'lp-seg-dark'}`}
              style={{ transform: `rotate(${i * 30}deg)` }}
            />
          ))}
          <div className="lp-wheel-center" />
        </div>
        <div className="lp-roulette-ball" />
      </div>
    );
  }
  return null;
}

export default function LandingPage() {
  const { openModal } = useContext(ModalContext);
  const howRef = useRef(null);

  const scrollToHow = (e) => {
    e.preventDefault();
    howRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = () => openModal('signup');

  return (
    <div className="lp-root">

      {/* ── NAV ────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <div className="lp-nav-brand">
            <img src={socialstakesCards} alt="Social Stakes" className="lp-nav-logo" />
            <span className="lp-nav-name">SOCIAL <span className="lp-gold">STAKES</span></span>
          </div>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={() => openModal('login')}>Sign In</button>
            <button className="lp-btn-gold" onClick={handleCTA}>Sign Up Free</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-bg-grid" />
        <div className="lp-hero-glow" />
        <div className="lp-hero-inner">
          <div className="lp-hero-eyebrow">
            <span className="lp-eyebrow-dot" />
            No real money. No house edge tricks.
          </div>
          <h1 className="lp-hero-headline">
            Provably fair<br />
            <span className="lp-gold">blackjack</span> with friends
          </h1>
          <p className="lp-hero-sub">
            Verify every hand. Bring your crew. Play for fun —<br className="lp-br-desk" />
            not for your rent money.
          </p>
          <div className="lp-hero-ctas">
            <button className="lp-btn-hero-primary" onClick={handleCTA}>
              Play Free Now
              <span className="lp-btn-arrow">→</span>
            </button>
            <button className="lp-btn-hero-ghost" onClick={scrollToHow}>
              How fairness works
            </button>
          </div>
          <div className="lp-hero-chips" aria-hidden="true">
            <img src={goldChip} alt="" className="lp-chip-float lp-cf-1" loading="lazy" decoding="async" />
            <img src={goldChip} alt="" className="lp-chip-float lp-cf-2" loading="lazy" decoding="async" />
            <img src={goldChip} alt="" className="lp-chip-float lp-cf-3" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="lp-hero-cards-deco">
          <div className="lp-deco-card lp-deco-c1"><span className="lp-suit-gold">A</span><span className="lp-deco-suit">♠</span></div>
          <div className="lp-deco-card lp-deco-c2 lp-red-card"><span>K</span><span className="lp-deco-suit">♥</span></div>
          <div className="lp-deco-card lp-deco-c3"><span className="lp-suit-gold">Q</span><span className="lp-deco-suit">♦</span></div>
          <div className="lp-deco-card lp-deco-c4 lp-red-card"><span>J</span><span className="lp-deco-suit">♣</span></div>
        </div>
      </section>

      {/* ── GAME PREVIEW ROW ─────────────────────────────────── */}
      <section className="lp-games">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Eight ways to play</h2>
            <p className="lp-section-sub">Live tables, solo demos, and more on the way.</p>
          </div>
          <div className="lp-games-grid">
            {GAMES.map(g => (
              <GameCard key={g.id} game={g} onCTA={g.tag !== 'SOON' ? handleCTA : undefined} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY IT'S DIFFERENT ───────────────────────────────── */}
      <section className="lp-why">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <h2 className="lp-section-title">Why Social Stakes is different</h2>
          </div>
          <div className="lp-why-grid">
            <div className="lp-why-card">
              <div className="lp-why-icon lp-why-icon-gold">
                <span className="lp-icon-glyph">⧫</span>
              </div>
              <h3 className="lp-why-title">Provably Fair</h3>
              <p className="lp-why-desc">
                Every shuffle is seeded from a public Bitcoin block hash. After each hand, you get the seed — paste it into our verifier and confirm the cards were predetermined before the round started. No trust required.
              </p>
              <a href="#how" onClick={scrollToHow} className="lp-why-link lp-gold">See how it works →</a>
            </div>
            <div className="lp-why-card">
              <div className="lp-why-icon lp-why-icon-blue">
                <span className="lp-icon-glyph">◈</span>
              </div>
              <h3 className="lp-why-title">Friends First</h3>
              <p className="lp-why-desc">
                Invite friends to a private table, track your crew on the leaderboard, and trash-talk in real-time table chat. Built for Friday nights with people you actually know — not random strangers.
              </p>
            </div>
            <div className="lp-why-card">
              <div className="lp-why-icon lp-why-icon-green">
                <span className="lp-icon-glyph">◉</span>
              </div>
              <h3 className="lp-why-title">No Money on the Line</h3>
              <p className="lp-why-desc">
                Everyone starts with $10,000 in demo chips. No deposits, no withdrawals, no gambling. When your bankroll hits zero we reset it — because this is about the game, not the grind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="lp-how" id="how" ref={howRef}>
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <h2 className="lp-section-title">How it works</h2>
            <p className="lp-section-sub">Up and playing in under two minutes.</p>
          </div>
          <div className="lp-steps">
            {STEPS.map((step, i) => (
              <div className="lp-step" key={i}>
                <div className="lp-step-num lp-gold">{step.num}</div>
                <div className="lp-step-connector" />
                <div className="lp-step-body">
                  <div className="lp-step-label">{step.label}</div>
                  <div className="lp-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Provably fair detail */}
          <div className="lp-pf-box">
            <div className="lp-pf-header">
              <span className="lp-pf-badge lp-gold">Provably Fair — how it works</span>
            </div>
            <div className="lp-pf-steps">
              <div className="lp-pf-step">
                <div className="lp-pf-icon">1</div>
                <div className="lp-pf-text">Before dealing, we hash a Bitcoin block number to generate a deck seed.</div>
              </div>
              <div className="lp-pf-arrow">→</div>
              <div className="lp-pf-step">
                <div className="lp-pf-icon">2</div>
                <div className="lp-pf-text">Cards are drawn deterministically from that seed — the order is fixed before you bet.</div>
              </div>
              <div className="lp-pf-arrow">→</div>
              <div className="lp-pf-step">
                <div className="lp-pf-icon">3</div>
                <div className="lp-pf-text">After the hand, we reveal the seed. You can reproduce the exact shuffle yourself.</div>
              </div>
            </div>
            <button className="lp-btn-ghost lp-pf-cta" onClick={handleCTA}>
              Try the verifier after your first hand →
            </button>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────── */}
      <section className="lp-quotes">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <h2 className="lp-section-title">What players say</h2>
            <p className="lp-section-sub lp-quotes-note">Illustrative quotes — the feeling is real even if the names aren't.</p>
          </div>
          <div className="lp-quotes-grid">
            {QUOTES.map((q, i) => (
              <div className="lp-quote-card" key={i}>
                <div className="lp-quote-mark lp-gold">"</div>
                <p className="lp-quote-text">{q.text}</p>
                <div className="lp-quote-attr">
                  <div className="lp-quote-avatar">{q.name[0]}</div>
                  <div>
                    <div className="lp-quote-name">{q.name}</div>
                    <div className="lp-quote-sub">{q.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="lp-final-cta">
        <div className="lp-final-glow" />
        <div className="lp-section-inner lp-final-inner">
          <h2 className="lp-final-title">
            Ready to play<br /><span className="lp-gold">the honest way?</span>
          </h2>
          <p className="lp-final-sub">No credit card. No real money. No catch.</p>
          <button className="lp-btn-hero-primary lp-final-btn" onClick={handleCTA}>
            Start Playing Free
            <span className="lp-btn-arrow">→</span>
          </button>
          <div className="lp-final-footnote">No credit card &nbsp;·&nbsp; No real money &nbsp;·&nbsp; Cancel anytime</div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <img src={socialstakesCards} alt="Social Stakes" className="lp-footer-logo" />
            <span className="lp-footer-name">Social Stakes</span>
          </div>
          <div className="lp-footer-links">
            <button className="lp-footer-link" onClick={() => openModal('login')}>Sign In</button>
            <button className="lp-footer-link" onClick={handleCTA}>Sign Up</button>
          </div>
          <div className="lp-footer-note">Demo platform only. No real gambling. All chips are fictional.</div>
        </div>
      </footer>

    </div>
  );
}
