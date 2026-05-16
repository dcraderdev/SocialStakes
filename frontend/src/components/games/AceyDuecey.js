import React, { useState } from 'react';
import Navigation from '../Navigation';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const rankLabel = (r) => RANK_LABELS[r] || String(r);

function drawCard() {
  return { rank: 1 + Math.floor(Math.random() * 13), suit: SUITS[Math.floor(Math.random() * 4)] };
}

function CardArt({ card }) {
  if (!card) {
    return (
      <div style={{
        width: 90, height: 130, borderRadius: 10,
        border: '1.5px dashed var(--ss-border)', opacity: 0.5,
      }} />
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div style={{
      width: 90, height: 130, borderRadius: 10, background: '#fafaf6',
      boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
      position: 'relative', padding: 10,
      color: isRed ? '#d63a3a' : '#111', fontWeight: 800,
    }}>
      <div style={{ fontSize: 16 }}>{rankLabel(card.rank)}{card.suit}</div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 34 }}>{card.suit}</div>
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 16, transform: 'rotate(180deg)' }}>{rankLabel(card.rank)}{card.suit}</div>
    </div>
  );
}

/**
 * Acey-Duecey (also called "In Between"): two cards are dealt face up.
 * Player bets that a third card's rank will fall strictly between them.
 * Hitting one of the post cards is a "post" loss (we treat as -2x bet
 * to keep the math interesting). Tie-spread (both cards equal) ends the
 * round; player can match or pass.
 */
function AceyDuecey() {
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(25);
  const [cards, setCards] = useState(() => [drawCard(), drawCard()]);
  const [middle, setMiddle] = useState(null);
  const [result, setResult] = useState(null);

  const [low, high] = (() => {
    const a = cards[0].rank, b = cards[1].rank;
    return a < b ? [a, b] : [b, a];
  })();
  const spread = high - low - 1;

  const newRound = () => {
    setMiddle(null);
    setResult(null);
    setCards([drawCard(), drawCard()]);
  };

  const play = (action) => {
    if (bet > bankroll || bet <= 0) return;
    if (action === 'pass') {
      newRound();
      return;
    }
    const m = drawCard();
    setMiddle(m);
    let delta;
    let outcome;
    if (m.rank === cards[0].rank || m.rank === cards[1].rank) {
      delta = -2 * bet;
      outcome = 'Post! Penalty.';
    } else if (m.rank > low && m.rank < high) {
      delta = bet;
      outcome = 'Between — you win.';
    } else {
      delta = -bet;
      outcome = 'Outside — you lose.';
    }
    setBankroll(b => b + delta);
    setResult({ outcome, delta });
  };

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Acey-Duecey</h1>
        <p className="ss-sub">Bet that the third card falls strictly between the two posts. Match a post and pay double.</p>

        <div className="ss-card" style={{ padding: 28, maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div className="ss-stat-label">Bankroll</div>
              <div className="ss-stat-value">${bankroll.toLocaleString()}</div>
            </div>
            <div>
              <div className="ss-stat-label">Spread</div>
              <div className="ss-stat-value">{spread > 0 ? spread : '—'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ss-stat-label" style={{ margin: 0 }}>Bet</span>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
                className="ss-mono"
                style={{
                  width: 90, padding: '6px 10px', borderRadius: 8,
                  background: 'var(--ss-bg-soft)', border: '1px solid var(--ss-border)',
                  color: 'var(--ss-text)', fontSize: 14,
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 24, minHeight: 160 }}>
            <CardArt card={cards[0]} />
            <CardArt card={middle} />
            <CardArt card={cards[1]} />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              className="ss-btn ss-btn-primary"
              onClick={() => play('bet')}
              disabled={!!middle || bet > bankroll || spread <= 0}
              style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              Deal middle
            </button>
            <button
              className="ss-btn"
              onClick={() => play('pass')}
              style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              {middle ? 'Next round' : 'Pass'}
            </button>
          </div>

          {result && (
            <div style={{
              marginTop: 18, textAlign: 'center',
              color: result.delta > 0 ? 'var(--ss-green)' : 'var(--ss-red)',
              fontWeight: 600,
            }}>
              {result.outcome} {result.delta > 0 ? '+' : ''}${result.delta}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AceyDuecey;
