import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Navigation';
import ProvablyFairPanel, { useProvablyFairSession } from '../ProvablyFairPanel';
import { deriveCard, consumeNonce } from '../../utils/provablyFair';
import { recordHand } from '../../utils/historyStore';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const rankLabel = (r) => RANK_LABELS[r] || String(r);

function randomCard() {
  return { rank: 1 + Math.floor(Math.random() * 13), suit: Math.floor(Math.random() * 4) };
}

function cardLabel(c) {
  return `${rankLabel(c.rank)}${SUITS[c.suit]}`;
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
  const suitSym = SUITS[card.suit];
  const isRed = suitSym === '♥' || suitSym === '♦';
  return (
    <div style={{
      width: big ? 110 : 70, height: big ? 160 : 100,
      borderRadius: 10, background: '#fafaf6',
      boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
      position: 'relative', padding: 10,
      color: isRed ? '#d63a3a' : '#111',
      fontWeight: 800,
    }}>
      <div style={{ fontSize: big ? 18 : 13 }}>{rankLabel(card.rank)}{suitSym}</div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: big ? 42 : 28 }}>{suitSym}</div>
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: big ? 18 : 13, transform: 'rotate(180deg)' }}>{rankLabel(card.rank)}{suitSym}</div>
    </div>
  );
}

function HiLo() {
  const { session, revealed, refresh, rotate } = useProvablyFairSession();
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(25);
  const [current, setCurrent] = useState(randomCard());
  const [next, setNext] = useState(null);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastHandId, setLastHandId] = useState(null);

  const guess = async (direction) => {
    if (!session || bet > bankroll || bet <= 0 || next) return;

    const advanced = consumeNonce();
    const n = await deriveCard(session.serverSeed, session.clientSeed, advanced.nonce);
    refresh(advanced);
    setNext(n);

    let won;
    if (n.rank === current.rank) won = false;
    else if (direction === 'higher') won = n.rank > current.rank;
    else won = n.rank < current.rank;

    const delta = won ? bet : -bet;
    const newStreak = won ? streak + 1 : 0;
    setBankroll((b) => b + delta);
    setStreak(newStreak);

    const record = recordHand({
      game: 'hilo',
      stake: bet,
      delta,
      result: won ? 'WIN' : 'LOSE',
      summary: `${cardLabel(current)} ${direction === 'higher' ? '↑' : '↓'} ${cardLabel(n)}`,
      detail: { from: current, to: n, direction },
      pf: {
        commitment: session.commitment,
        serverSeed: session.serverSeed,
        clientSeed: session.clientSeed,
        nonce: advanced.nonce,
      },
    });
    setLastHandId(record.id);
    setHistory((h) => [{ ...record, from: current, to: n, direction }, ...h].slice(0, 10));

    setTimeout(() => {
      setCurrent(n);
      setNext(null);
    }, 900);
  };

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-green" style={{ marginBottom: 12 }}>Provably fair · SHA-256 commit-reveal</div>
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

            {lastHandId && (
              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12 }}>
                <Link to={`/verify/${lastHandId}`} style={{ color: 'var(--ss-gold)' }}>verify last hand ✓</Link>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ProvablyFairPanel session={session} revealed={revealed} onRotate={rotate} />

            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 12 }}>Recent hands</div>
              {history.length === 0 ? (
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No hands yet.</div>
              ) : (
                history.map((h) => (
                  <div key={h.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px solid var(--ss-border-soft)',
                    fontSize: 13,
                  }}>
                    <span className="ss-mono" style={{ color: 'var(--ss-text-muted)' }}>
                      {cardLabel(h.from)} {h.direction === 'higher' ? '↑' : '↓'} {cardLabel(h.to)}
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
      </div>
    </>
  );
}

export default HiLo;
