import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../Navigation';

// ── symbols ──────────────────────────────────────────────────────
const SYMBOLS = [
  { emoji: '🍒', label: 'Cherry',  mult: 2  },
  { emoji: '🍋', label: 'Lemon',   mult: 3  },
  { emoji: '🔔', label: 'Bell',    mult: 5  },
  { emoji: '⭐', label: 'Star',    mult: 10 },
  { emoji: '7️⃣', label: 'Seven',   mult: 50 },
];

// weighted pick — lower-value symbols appear more often
const WEIGHTS = [35, 30, 20, 12, 3]; // cherry most common, 7 rarest
const TOTAL_WEIGHT = WEIGHTS.reduce((a, b) => a + b, 0);

function pickSymbol() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[0];
}

function randSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

// ── payout ───────────────────────────────────────────────────────
function evaluate(reels) {
  const [a, b, c] = reels;
  if (a.emoji === b.emoji && b.emoji === c.emoji) {
    return { type: 'jackpot', mult: a.mult, label: `${a.label}s! ×${a.mult}` };
  }
  if (a.emoji === b.emoji || b.emoji === c.emoji || a.emoji === c.emoji) {
    return { type: 'pair', mult: 0, label: 'So close…' };
  }
  return null;
}

// ── Reel visual ───────────────────────────────────────────────────
function Reel({ symbol, spinning, locked }) {
  return (
    <div style={{
      width: 100, height: 110,
      borderRadius: 12,
      background: locked
        ? 'linear-gradient(180deg,#1a2e1a,#0e1f0e)'
        : 'var(--ss-bg-soft)',
      border: locked
        ? '2px solid var(--ss-green)'
        : '1px solid var(--ss-border)',
      boxShadow: locked
        ? '0 0 18px rgba(74,222,128,0.25)'
        : '0 4px 12px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 52,
      transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
      userSelect: 'none',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* shimmer line at top + bottom to suggest a slot window */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg,transparent,rgba(229,179,76,0.4),transparent)',
      }} />
      <span style={{
        display: 'inline-block',
        animation: spinning ? 'slot-spin 0.12s steps(1) infinite' : 'none',
        filter: spinning ? 'blur(1px)' : 'none',
        transition: spinning ? 'none' : 'filter 0.15s',
      }}>
        {symbol.emoji}
      </span>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg,transparent,rgba(229,179,76,0.4),transparent)',
      }} />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────
function Slots() {
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(25);
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]]);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [locked, setLocked] = useState([false, false, false]);
  const [spinResult, setSpinResult] = useState(null);
  const [celebration, setCelebration] = useState('');
  const [history, setHistory] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);

  // rapid symbol cycling during spin
  const intervalRef = useRef(null);

  const spin = () => {
    if (isSpinning || bet <= 0 || bet > bankroll) return;

    setBankroll(b => b - bet);
    setIsSpinning(true);
    setSpinResult(null);
    setCelebration('');
    setLocked([false, false, false]);

    // pick final results up front
    const finals = [pickSymbol(), pickSymbol(), pickSymbol()];

    // start all reels spinning
    setSpinning([true, true, true]);
    setReels([randSymbol(), randSymbol(), randSymbol()]);

    // rapid visual symbol changes while spinning
    intervalRef.current = setInterval(() => {
      setReels(r => r.map((sym, i) => spinning[i] !== false ? randSymbol() : sym));
    }, 80);

    // reel 1 locks at t=800ms
    setTimeout(() => {
      setReels(r => [finals[0], r[1], r[2]]);
      setSpinning([false, true, true]);
      setLocked([true, false, false]);
    }, 800);

    // reel 2 locks at t=1200ms
    setTimeout(() => {
      setReels(r => [finals[0], finals[1], r[2]]);
      setSpinning([false, false, true]);
      setLocked([true, true, false]);
    }, 1200);

    // reel 3 locks at t=1700ms, evaluate result
    setTimeout(() => {
      clearInterval(intervalRef.current);
      setReels(finals);
      setSpinning([false, false, false]);
      setLocked([true, true, true]);

      const result = evaluate(finals);
      let delta = -bet;
      let winMsg = '';

      if (result && result.type === 'jackpot') {
        const winAmount = bet * result.mult;
        delta = winAmount - bet;
        setBankroll(b => b + winAmount);
        setSpinResult({ mult: result.mult, label: result.label, win: winAmount, delta });
        winMsg = result.mult >= 50 ? '🎰 JACKPOT!' : result.mult >= 10 ? '⭐ BIG WIN!' : '🔔 Winner!';
        setCelebration(winMsg);
        setHistory(h => [{ reels: finals, delta, label: result.label, win: winAmount }, ...h].slice(0, 12));
      } else {
        setBankroll(b => b); // already deducted
        setSpinResult({ mult: 0, delta });
        setHistory(h => [{ reels: finals, delta, label: result?.label ?? 'No match' }, ...h].slice(0, 12));
      }

      setIsSpinning(false);

      // clear lock glow after 1.5s
      setTimeout(() => setLocked([false, false, false]), 1500);
    }, 1700);
  };

  // clean up interval on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // spinning animation keyframes injected once
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slot-spin {
        0%   { transform: translateY(0); }
        50%  { transform: translateY(-4px); }
        100% { transform: translateY(4px); }
      }
      @keyframes celebrate-pulse {
        0%,100% { transform: scale(1); opacity: 1; }
        50%      { transform: scale(1.12); opacity: 0.85; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const winMultColor = (mult) => {
    if (mult >= 50) return 'var(--ss-gold)';
    if (mult >= 10) return 'var(--ss-green)';
    return 'var(--ss-text)';
  };

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Slots</h1>
        <p className="ss-sub">Match 3 symbols to win. Three 7s pay 50× your bet.</p>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 28 }}>

            {/* ── stats row ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <div className="ss-stat-label">Bankroll</div>
                <div className="ss-stat-value">${bankroll.toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="ss-stat-label" style={{ margin: 0 }}>Bet $</span>
                <input
                  type="number" value={bet}
                  onChange={e => setBet(Math.max(1, parseInt(e.target.value) || 0))}
                  disabled={isSpinning}
                  className="ss-mono"
                  style={{
                    width: 90, padding: '6px 10px', borderRadius: 8,
                    background: 'var(--ss-bg-soft)', border: '1px solid var(--ss-border)',
                    color: 'var(--ss-text)', fontSize: 14,
                  }}
                />
              </div>
            </div>

            {/* ── machine frame ── */}
            <div style={{
              background: 'linear-gradient(180deg,var(--ss-bg-elev-2) 0%,var(--ss-bg-soft) 100%)',
              border: '1px solid var(--ss-border)',
              borderRadius: 20,
              padding: '28px 20px 24px',
              marginBottom: 24,
              position: 'relative',
            }}>
              {/* top accent strip */}
              <div style={{
                position: 'absolute', top: 0, left: '10%', right: '10%', height: 3,
                background: 'linear-gradient(90deg,transparent,var(--ss-gold),transparent)',
                borderRadius: 999,
              }} />

              {/* reels */}
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 20 }}>
                {reels.map((sym, i) => (
                  <Reel key={i} symbol={sym} spinning={spinning[i]} locked={locked[i]} />
                ))}
              </div>

              {/* result / celebration */}
              <div style={{ textAlign: 'center', minHeight: 36 }}>
                {celebration ? (
                  <div style={{
                    fontSize: 22, fontWeight: 800, color: 'var(--ss-gold)',
                    animation: 'celebrate-pulse 0.6s ease-in-out infinite',
                    letterSpacing: '0.04em',
                  }}>
                    {celebration}
                  </div>
                ) : spinResult && !isSpinning ? (
                  <div style={{
                    fontSize: 14, fontWeight: 600,
                    color: spinResult.delta > 0 ? 'var(--ss-green)' : 'var(--ss-text-muted)',
                  }}>
                    {spinResult.delta > 0
                      ? `+$${spinResult.delta} — ${spinResult.label}`
                      : spinResult.mult === 0 && !celebration
                        ? 'No match. Try again.'
                        : spinResult.label}
                  </div>
                ) : isSpinning ? (
                  <div style={{ fontSize: 13, color: 'var(--ss-text-muted)', letterSpacing: '0.1em' }}>SPINNING…</div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--ss-text-muted)' }}>Press SPIN to play</div>
                )}
              </div>
            </div>

            {/* ── spin button ── */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <button
                className="ss-btn ss-btn-primary"
                onClick={spin}
                disabled={isSpinning || bet > bankroll || bet <= 0}
                style={{
                  minWidth: 180, height: 52, fontSize: 16,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  borderRadius: 999,
                  boxShadow: isSpinning ? 'none' : '0 4px 20px rgba(229,179,76,0.3)',
                  transition: 'all 0.15s',
                }}>
                {isSpinning ? 'Spinning…' : '🎰 Spin'}
              </button>
            </div>

            {/* quick-bet row */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[10, 25, 50, 100].map(v => (
                <button key={v} className="ss-btn"
                  onClick={() => setBet(v)}
                  disabled={isSpinning}
                  style={{ minWidth: 56, height: 36, fontSize: 13 }}>
                  ${v}
                </button>
              ))}
              <button className="ss-btn"
                onClick={() => setBet(Math.floor(bankroll / 2))}
                disabled={isSpinning || bankroll <= 0}
                style={{ minWidth: 56, height: 36, fontSize: 13 }}>
                ½
              </button>
              <button className="ss-btn"
                onClick={() => setBet(bankroll)}
                disabled={isSpinning || bankroll <= 0}
                style={{ minWidth: 56, height: 36, fontSize: 13, color: 'var(--ss-gold)', borderColor: 'var(--ss-gold-line)' }}>
                Max
              </button>
            </div>

            {bankroll <= 0 && !isSpinning && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button className="ss-btn"
                  onClick={() => { setBankroll(1000); setSpinResult(null); setCelebration(''); }}
                  style={{ minWidth: 160, height: 44, fontSize: 13 }}>
                  Reload $1,000
                </button>
              </div>
            )}
          </div>

          {/* ── sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* paytable */}
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 12 }}>Paytable · 3 of a kind</div>
              {SYMBOLS.slice().reverse().map(sym => (
                <div key={sym.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 0', borderBottom: '1px solid var(--ss-border-soft)',
                  fontSize: 14,
                }}>
                  <span style={{ fontSize: 20 }}>{sym.emoji}{sym.emoji}{sym.emoji}</span>
                  <span style={{
                    fontWeight: 700, color: winMultColor(sym.mult), fontSize: 15,
                  }} className="ss-mono">
                    ×{sym.mult}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ss-text-muted)' }}>
                2-of-a-kind: no payout. All others: no payout.
              </div>
            </div>

            {/* spin history */}
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 12 }}>Recent spins</div>
              {history.length === 0 ? (
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No spins yet.</div>
              ) : (
                history.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0', borderBottom: '1px solid var(--ss-border-soft)', fontSize: 12,
                  }}>
                    <span style={{ fontSize: 16, letterSpacing: 2 }}>
                      {h.reels.map(r => r.emoji).join('')}
                    </span>
                    <span className="ss-mono" style={{
                      color: h.delta > 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600,
                    }}>
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

export default Slots;
