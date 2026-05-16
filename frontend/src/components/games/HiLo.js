import React, { useState } from 'react';
import Navigation from '../Navigation';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const rankLabel = (r) => RANK_LABELS[r] || String(r);

function drawCard() {
  const rank = 1 + Math.floor(Math.random() * 13);
  const suit = SUITS[Math.floor(Math.random() * 4)];
  return { rank, suit };
}

function CardArt({ card, big }) {
  if (!card) {
    return (
      <div style={{
        width: big ? 110 : 70, height: big ? 160 : 100,
        borderRadius: 10, border: '1.5px dashed var(--ss-border)',
        opacity: 0.5,
      }} />
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div style={{
      width: big ? 110 : 70, height: big ? 160 : 100,
      borderRadius: 10, background: '#fafaf6',
      boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
      position: 'relative', padding: 10,
      color: isRed ? '#d63a3a' : '#111',
      fontWeight: 800,
    }}>
      <div style={{ fontSize: big ? 18 : 13 }}>{rankLabel(card.rank)}{card.suit}</div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: big ? 42 : 28 }}>{card.suit}</div>
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: big ? 18 : 13, transform: 'rotate(180deg)' }}>{rankLabel(card.rank)}{card.suit}</div>
    </div>
  );
}

function HiLo() {
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(25);
  const [current, setCurrent] = useState(drawCard());
  const [next, setNext] = useState(null);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);

  const guess = (direction) => {
    if (bet > bankroll || bet <= 0) return;
    const n = drawCard();
    setNext(n);
    let won;
    if (n.rank === current.rank) won = false;          // tie loses
    else if (direction === 'higher') won = n.rank > current.rank;
    else won = n.rank < current.rank;

    const delta = won ? bet : -bet;
    const newStreak = won ? streak + 1 : 0;
    setBankroll(b => b + delta);
    setStreak(newStreak);
    setHistory(h => [{ from: current, to: n, direction, delta }, ...h].slice(0, 10));

    setTimeout(() => {
      setCurrent(n);
      setNext(null);
    }, 900);
  };

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Hi-Lo</h1>
        <p className="ss-sub">Will the next card be higher or lower? Ties lose. Even-money payout.</p>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div className="ss-stat-label">Bankroll</div>
                <div className="ss-stat-value">${bankroll.toLocaleString()}</div>
              </div>
              <div>
                <div className="ss-stat-label">Streak</div>
                <div className="ss-stat-value" style={{ color: streak > 2 ? 'var(--ss-gold)' : 'var(--ss-text)' }}>{streak}</div>
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

            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24, minHeight: 200 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Current</div>
                <CardArt card={current} big />
              </div>
              <div style={{ fontSize: 32, color: 'var(--ss-text-muted)' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Next</div>
                <CardArt card={next} big />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="ss-btn ss-btn-primary"
                onClick={() => guess('higher')}
                disabled={!!next || bet > bankroll}
                style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                ↑ Higher
              </button>
              <button
                className="ss-btn"
                onClick={() => guess('lower')}
                disabled={!!next || bet > bankroll}
                style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                ↓ Lower
              </button>
            </div>
          </div>

          <div className="ss-card">
            <div className="ss-stat-label" style={{ marginBottom: 12 }}>Recent hands</div>
            {history.length === 0 ? (
              <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No hands yet.</div>
            ) : (
              history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid var(--ss-border-soft)',
                  fontSize: 13,
                }}>
                  <span className="ss-mono" style={{ color: 'var(--ss-text-muted)' }}>
                    {rankLabel(h.from.rank)}{h.from.suit} {h.direction === 'higher' ? '↑' : '↓'} {rankLabel(h.to.rank)}{h.to.suit}
                  </span>
                  <span style={{ color: h.delta > 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600 }} className="ss-mono">
                    {h.delta > 0 ? '+' : ''}${h.delta}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HiLo;
