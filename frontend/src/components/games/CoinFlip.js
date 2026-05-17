import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Navigation';
import ProvablyFairPanel, { useProvablyFairSession } from '../ProvablyFairPanel';
import { deriveCoinFlip, consumeNonce } from '../../utils/provablyFair';
import { recordHand } from '../../utils/historyStore';

/**
 * Single-player coin flip. Deterministic outcome derived from a
 * SHA-256 commit-reveal seed chain; each completed flip is logged to
 * /history with full seeds so the user can re-derive it on /verify.
 */
function CoinFlip() {
  const { session, revealed, refresh, rotate } = useProvablyFairSession();
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(25);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [flipping, setFlipping] = useState(false);

  const flip = async (call) => {
    if (flipping || bet <= 0 || bet > bankroll || !session) return;
    setResult(null);
    setFlipping(true);

    const next = consumeNonce();
    const outcome = await deriveCoinFlip(session.serverSeed, session.clientSeed, next.nonce);
    refresh(next);

    setTimeout(() => {
      const won = outcome === call;
      const delta = won ? bet : -bet;
      setBankroll((b) => b + delta);
      const summary = `${call} → ${outcome}`;
      const record = recordHand({
        game: 'coinflip',
        stake: bet,
        delta,
        result: won ? 'WIN' : 'LOSE',
        summary,
        detail: { call, outcome },
        pf: {
          commitment: session.commitment,
          serverSeed: session.serverSeed,
          clientSeed: session.clientSeed,
          nonce: next.nonce,
        },
      });
      setResult({ outcome, won, delta, handId: record.id });
      setHistory((h) => [{ ...record, call, outcome }, ...h].slice(0, 12));
      setFlipping(false);
    }, 800);
  };

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-green" style={{ marginBottom: 12 }}>Provably fair · SHA-256 commit-reveal</div>
        <h1 className="ss-h1">Coin Flip</h1>
        <p className="ss-sub">Call heads or tails. 50/50 odds, no house edge in this demo.</p>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div className="ss-stat-label">Bankroll</div>
                <div className="ss-stat-value">${bankroll.toLocaleString()}</div>
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
                    color: 'var(--ss-text)', fontSize: 14, outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{
              height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', marginBottom: 24,
            }}>
              <div style={{
                width: 140, height: 140, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%,
                  ${result?.outcome === 'tails' ? '#c2c5cd' : 'var(--ss-gold)'},
                  ${result?.outcome === 'tails' ? '#6e727c' : 'var(--ss-gold-soft)'} 75%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1a1408', fontWeight: 800, fontSize: 36, letterSpacing: '-0.04em',
                boxShadow: '0 0 0 4px rgba(0,0,0,0.4), 0 30px 60px rgba(0,0,0,0.5)',
                transition: 'transform 0.8s cubic-bezier(.22,.61,.36,1)',
                transform: flipping ? 'rotateY(720deg) scale(1.05)' : 'rotateY(0) scale(1)',
              }}>
                {flipping ? '?' : (result ? (result.outcome === 'heads' ? 'H' : 'T') : '$')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="ss-btn ss-btn-primary"
                onClick={() => flip('heads')}
                disabled={flipping || bet > bankroll}
                style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Heads
              </button>
              <button
                className="ss-btn"
                onClick={() => flip('tails')}
                disabled={flipping || bet > bankroll}
                style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Tails
              </button>
            </div>

            {result && (
              <div style={{
                marginTop: 20, textAlign: 'center',
                color: result.won ? 'var(--ss-green)' : 'var(--ss-red)',
                fontWeight: 600,
              }}>
                {result.outcome.toUpperCase()} — {result.won ? `Won $${result.delta}` : `Lost $${-result.delta}`}
                {' · '}
                <Link to={`/verify/${result.handId}`} style={{ color: 'var(--ss-gold)', fontSize: 12 }}>verify ✓</Link>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ProvablyFairPanel session={session} revealed={revealed} onRotate={rotate} />

            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 12 }}>Recent flips</div>
              {history.length === 0 ? (
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No flips yet.</div>
              ) : (
                history.map((h, i) => (
                  <div key={h.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px solid var(--ss-border-soft)',
                    fontSize: 13,
                  }}>
                    <span style={{ color: 'var(--ss-text-muted)' }}>
                      {h.call} → <span style={{ color: 'var(--ss-text)' }}>{h.outcome}</span>
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

export default CoinFlip;
