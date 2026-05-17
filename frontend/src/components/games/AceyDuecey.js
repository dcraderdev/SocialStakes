import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Navigation';
import ProvablyFairPanel, { useProvablyFairSession } from '../ProvablyFairPanel';
import { deriveCards, consumeNonce } from '../../utils/provablyFair';
import { recordHand } from '../../utils/historyStore';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const rankLabel = (r) => RANK_LABELS[r] || String(r);

function randomCard() {
  return { rank: 1 + Math.floor(Math.random() * 13), suit: Math.floor(Math.random() * 4) };
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
  const suitSym = SUITS[card.suit];
  const isRed = suitSym === '♥' || suitSym === '♦';
  return (
    <div style={{
      width: 90, height: 130, borderRadius: 10, background: '#fafaf6',
      boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
      position: 'relative', padding: 10,
      color: isRed ? '#d63a3a' : '#111', fontWeight: 800,
    }}>
      <div style={{ fontSize: 16 }}>{rankLabel(card.rank)}{suitSym}</div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 34 }}>{suitSym}</div>
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 16, transform: 'rotate(180deg)' }}>{rankLabel(card.rank)}{suitSym}</div>
    </div>
  );
}

function cardLabel(c) {
  return `${rankLabel(c.rank)}${SUITS[c.suit]}`;
}

/**
 * Acey-Duecey (also called "In Between"): two posts are dealt face up.
 * Player bets that a third card's rank will fall strictly between them.
 * Hitting one of the posts pays -2x. The two post cards are random
 * preview state; only the third (middle) card is derived from the seed.
 */
function AceyDuecey() {
  const { session, revealed, refresh, rotate } = useProvablyFairSession();
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(25);
  const [cards, setCards] = useState(() => [randomCard(), randomCard()]);
  const [middle, setMiddle] = useState(null);
  const [result, setResult] = useState(null);
  const [lastHandId, setLastHandId] = useState(null);

  const [low, high] = (() => {
    const a = cards[0].rank, b = cards[1].rank;
    return a < b ? [a, b] : [b, a];
  })();
  const spread = high - low - 1;

  const newRound = () => {
    setMiddle(null);
    setResult(null);
    setCards([randomCard(), randomCard()]);
  };

  const play = async (action) => {
    if (action === 'pass') { newRound(); return; }
    if (!session || bet > bankroll || bet <= 0) return;

    const advanced = consumeNonce();
    const [m] = await deriveCards(session.serverSeed, session.clientSeed, advanced.nonce, 1);
    refresh(advanced);
    setMiddle(m);

    let delta;
    let outcome;
    let resultCode;
    if (m.rank === cards[0].rank || m.rank === cards[1].rank) {
      delta = -2 * bet;
      outcome = 'Post! Penalty.';
      resultCode = 'LOSE';
    } else if (m.rank > low && m.rank < high) {
      delta = bet;
      outcome = 'Between — you win.';
      resultCode = 'WIN';
    } else {
      delta = -bet;
      outcome = 'Outside — you lose.';
      resultCode = 'LOSE';
    }
    setBankroll((b) => b + delta);
    setResult({ outcome, delta });

    const record = recordHand({
      game: 'acey',
      stake: bet,
      delta,
      result: resultCode,
      summary: `${cardLabel(cards[0])} _ ${cardLabel(cards[1])} → ${cardLabel(m)}`,
      detail: { posts: cards, middle: m, outcome },
      pf: {
        commitment: session.commitment,
        serverSeed: session.serverSeed,
        clientSeed: session.clientSeed,
        nonce: advanced.nonce,
      },
    });
    setLastHandId(record.id);
  };

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-green" style={{ marginBottom: 12 }}>Provably fair · SHA-256 commit-reveal</div>
        <h1 className="ss-h1">Acey-Duecey</h1>
        <p className="ss-sub">Bet that the third card falls strictly between the two posts. Match a post and pay double.</p>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 28 }}>
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
                {lastHandId && (
                  <>
                    {' · '}
                    <Link to={`/verify/${lastHandId}`} style={{ color: 'var(--ss-gold)', fontSize: 12 }}>verify ✓</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <ProvablyFairPanel session={session} revealed={revealed} onRotate={rotate} />
        </div>
      </div>
    </>
  );
}

export default AceyDuecey;
