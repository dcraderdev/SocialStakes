import React, { useState } from 'react';
import Navigation from '../Navigation';

/**
 * Single-player coin flip. Demo grade — uses Math.random(), not the
 * provably-fair Bitcoin-hash RNG that the blackjack server uses.
 * Tracked locally in component state; balance does not persist.
 */
function CoinFlip() {
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(25);
  const [picked, setPicked] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [flipping, setFlipping] = useState(false);

  const flip = (call) => {
    if (flipping || bet <= 0 || bet > bankroll) return;
    setPicked(call);
    setResult(null);
    setFlipping(true);
    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = outcome === call;
      const delta = won ? bet : -bet;
      setBankroll(b => b + delta);
      setResult({ outcome, won, delta });
      setHistory(h => [{ call, outcome, delta }, ...h].slice(0, 12));
      setFlipping(false);
    }, 800);
  };

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
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
              </div>
            )}
          </div>

          <div className="ss-card">
            <div className="ss-stat-label" style={{ marginBottom: 12 }}>Recent flips</div>
            {history.length === 0 ? (
              <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No flips yet.</div>
            ) : (
              history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid var(--ss-border-soft)',
                  fontSize: 13,
                }}>
                  <span style={{ color: 'var(--ss-text-muted)' }}>{h.call} → <span style={{ color: 'var(--ss-text)' }}>{h.outcome}</span></span>
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

export default CoinFlip;
