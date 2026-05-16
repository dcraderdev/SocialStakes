import React, { useState, useEffect } from 'react';
import Navigation from '../Navigation';

const STYLES = `
@keyframes cf-spin {
  0%   { transform: rotateY(0deg) scale(1); }
  20%  { transform: rotateY(180deg) scale(1.1); }
  50%  { transform: rotateY(540deg) scale(1.15); }
  80%  { transform: rotateY(700deg) scale(1.05); }
  100% { transform: rotateY(720deg) scale(1); }
}
@keyframes cf-win-pulse {
  0%   { box-shadow: 0 0 0 4px rgba(0,0,0,0.4), 0 20px 50px rgba(0,0,0,0.5); transform: scale(1); }
  35%  { box-shadow: 0 0 0 12px rgba(74,222,128,0.45), 0 20px 80px rgba(74,222,128,0.3); transform: scale(1.09); }
  70%  { box-shadow: 0 0 0 6px rgba(74,222,128,0.2), 0 20px 55px rgba(74,222,128,0.12); transform: scale(1.02); }
  100% { box-shadow: 0 0 0 4px rgba(0,0,0,0.4), 0 20px 50px rgba(0,0,0,0.5); transform: scale(1); }
}
@keyframes cf-lose-shake {
  0%, 100% { transform: translateX(0); }
  18%  { transform: translateX(-9px) rotate(-3deg); }
  38%  { transform: translateX(9px) rotate(3deg); }
  57%  { transform: translateX(-6px) rotate(-2deg); }
  76%  { transform: translateX(5px) rotate(1deg); }
}
@keyframes cf-result-in {
  0%   { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes cf-streak-pop {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.35); }
  65%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
@keyframes cf-bankroll-flash-win {
  0%   { color: var(--ss-text); }
  40%  { color: var(--ss-green); }
  100% { color: var(--ss-text); }
}
@keyframes cf-bankroll-flash-lose {
  0%   { color: var(--ss-text); }
  40%  { color: var(--ss-red); }
  100% { color: var(--ss-text); }
}
`;

const WIN_PHRASES = [
  'Lucky flip!', 'Easy money!', 'The coin loves you!',
  'Called it!', 'Right on the money!', 'Clean read!',
  'You were born for this.', 'Heads? More like winner.',
];
const LOSE_PHRASES = [
  'Not this time...', 'The coin has spoken.',
  'Flip again?', 'Oof. That stings.',
  'Better luck next flip!', 'Shaken, not stirred.',
  'The house always wins... wait, there is no house.',
];

const STREAK_LABELS = { 3: 'STREAK!', 5: 'HOT!', 7: 'ON FIRE!', 10: 'LEGENDARY!' };
const streakLabel = n => {
  const thresholds = [10, 7, 5, 3];
  for (const t of thresholds) { if (n >= t) return STREAK_LABELS[t]; }
  return null;
};
const streakColor = n =>
  n >= 7 ? 'var(--ss-gold)' : n >= 5 ? 'var(--ss-green)' : n >= 3 ? 'var(--ss-blue)' : 'var(--ss-text)';

function useSessionState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch { return defaultValue; }
  });
  useEffect(() => {
    try { sessionStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

function CoinFlip() {
  const [bankroll, setBankroll] = useSessionState('cf_bankroll', 1000);
  const [history, setHistory]   = useSessionState('cf_history', []);
  const [winStreak, setWinStreak] = useSessionState('cf_streak', 0);
  const [bet, setBet]           = useState(25);
  const [result, setResult]     = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [flipKey, setFlipKey]   = useState(0);
  const [bankrollAnim, setBankrollAnim] = useState('');

  const isBroke       = bankroll <= 0;
  const effectiveBet  = Math.max(1, Math.min(Math.floor(bet), bankroll));
  const betOverflow   = bet > bankroll && !isBroke;
  const netPL         = bankroll - 1000;
  const label         = streakLabel(winStreak);
  const sColor        = streakColor(winStreak);

  const resetBankroll = () => {
    setBankroll(1000); setHistory([]); setWinStreak(0); setResult(null);
  };

  const flip = (call) => {
    if (flipping || isBroke) return;
    setResult(null);
    setFlipping(true);
    setFlipKey(k => k + 1);
    setTimeout(() => {
      const outcome    = Math.random() < 0.5 ? 'heads' : 'tails';
      const won        = outcome === call;
      const delta      = won ? effectiveBet : -effectiveBet;
      const newStreak  = won ? winStreak + 1 : 0;
      const phrases    = won ? WIN_PHRASES : LOSE_PHRASES;
      const phrase     = phrases[Math.floor(Math.random() * phrases.length)];
      setBankroll(b => b + delta);
      setWinStreak(newStreak);
      setResult({ outcome, won, delta, phrase, newStreak });
      setHistory(h => [{ call, outcome, delta }, ...h].slice(0, 12));
      setFlipping(false);
      setBankrollAnim(won ? 'cf-bankroll-flash-win' : 'cf-bankroll-flash-lose');
      setTimeout(() => setBankrollAnim(''), 700);
    }, 900);
  };

  const coinBg = (result && !flipping)
    ? (result.outcome === 'heads'
        ? 'radial-gradient(circle at 32% 32%, #f5d060, #c88c06 70%)'
        : 'radial-gradient(circle at 32% 32%, #dde0ea, #606474 70%)')
    : 'radial-gradient(circle at 32% 32%, #e5b34c, #c68d10 70%)';

  const coinAnim = flipping
    ? 'cf-spin 0.9s cubic-bezier(.22,.61,.36,1) forwards'
    : result?.won
    ? 'cf-win-pulse 0.6s ease forwards'
    : result
    ? 'cf-lose-shake 0.42s ease forwards'
    : 'none';

  const coinTextColor = result?.outcome === 'tails' && !flipping ? '#1a1a2e' : '#1a1408';

  return (
    <>
      <style>{STYLES}</style>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Coin Flip</h1>
        <p className="ss-sub">Call heads or tails. True 50/50 — no house edge in this demo.</p>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 28 }}>

            {/* Stats row — bankroll / streak / bet */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="ss-stat-label">Bankroll</div>
                <div
                  key={result ? result.delta + result.outcome : 'init'}
                  className="ss-stat-value"
                  style={{
                    color: isBroke ? 'var(--ss-red)' : 'var(--ss-text)',
                    animation: bankrollAnim ? `${bankrollAnim} 0.7s ease` : 'none',
                  }}
                >
                  ${bankroll.toLocaleString()}
                </div>
                {netPL !== 0 && (
                  <div className="ss-mono" style={{ fontSize: 11, color: netPL > 0 ? 'var(--ss-green)' : 'var(--ss-red)', marginTop: 2 }}>
                    {netPL > 0 ? '+' : ''}${netPL.toLocaleString()} session
                  </div>
                )}
              </div>

              {/* Streak column */}
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label">Streak</div>
                <div
                  key={winStreak}
                  style={{
                    fontSize: winStreak >= 5 ? 32 : 26, fontWeight: 700,
                    letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
                    color: sColor,
                    animation: winStreak > 0 ? 'cf-streak-pop 0.42s cubic-bezier(.22,.61,.36,1)' : 'none',
                    lineHeight: 1,
                  }}
                >
                  {winStreak}
                </div>
                {label && (
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: sColor, marginTop: 3 }}>
                    {label}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="ss-stat-label" style={{ color: betOverflow ? 'var(--ss-red)' : undefined }}>
                  {betOverflow ? `Capped at $${bankroll}` : 'Bet'}
                </div>
                <input
                  type="number"
                  value={bet}
                  min={1}
                  onChange={e => setBet(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isBroke || flipping}
                  className="ss-mono"
                  style={{
                    width: 90, padding: '6px 10px', borderRadius: 8,
                    background: 'var(--ss-bg-soft)',
                    border: `1px solid ${betOverflow ? 'var(--ss-red)' : 'var(--ss-border)'}`,
                    color: betOverflow ? 'var(--ss-red)' : 'var(--ss-text)',
                    fontSize: 14, outline: 'none', textAlign: 'right',
                  }}
                />
              </div>
            </div>

            {/* Quick-bet chips */}
            {!isBroke && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {[10, 25, 50, 100].filter(v => v <= bankroll).map(v => (
                  <button key={v} onClick={() => setBet(v)} disabled={flipping}
                    className="ss-btn" style={{ height: 30, fontSize: 12, padding: '0 10px' }}>
                    ${v}
                  </button>
                ))}
                <button onClick={() => setBet(Math.max(1, Math.floor(bankroll / 2)))} disabled={flipping}
                  className="ss-btn" style={{ height: 30, fontSize: 12, padding: '0 10px' }}>
                  Half
                </button>
                <button onClick={() => setBet(bankroll)} disabled={flipping}
                  className="ss-btn"
                  style={{ height: 30, fontSize: 12, padding: '0 10px', borderColor: 'var(--ss-gold-line)', color: 'var(--ss-gold)' }}>
                  All-in
                </button>
              </div>
            )}

            {/* Coin — parent has perspective for 3-D flip effect */}
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '600px', marginBottom: 12 }}>
              <div
                key={flipKey}
                style={{
                  width: 148, height: 148, borderRadius: '50%',
                  background: coinBg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: coinTextColor, fontWeight: 900,
                  fontSize: flipping ? 28 : 48,
                  letterSpacing: '-0.04em',
                  boxShadow: '0 0 0 5px rgba(0,0,0,0.35), 0 0 0 8px rgba(0,0,0,0.15), 0 22px 55px rgba(0,0,0,0.55)',
                  transformStyle: 'preserve-3d',
                  animation: coinAnim,
                  userSelect: 'none',
                }}
              >
                {flipping ? '?' : result ? (result.outcome === 'heads' ? 'H' : 'T') : '$'}
                {!flipping && result && (
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4, opacity: 0.7 }}>
                    {result.outcome}
                  </div>
                )}
              </div>
            </div>

            {/* Result banner */}
            {result && !flipping && (
              <div
                key={result.outcome + result.delta}
                style={{ textAlign: 'center', marginBottom: 16, animation: 'cf-result-in 0.3s ease forwards' }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', color: result.won ? 'var(--ss-green)' : 'var(--ss-red)' }}>
                  {result.outcome.toUpperCase()}!&nbsp;&nbsp;{result.won ? `+$${result.delta}` : `-$${-result.delta}`}
                  {result.won && result.newStreak >= 2 && (
                    <span style={{ fontSize: 14, marginLeft: 12, color: streakColor(result.newStreak), fontWeight: 700 }}>
                      {result.newStreak}x!
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13, marginTop: 4 }}>{result.phrase}</div>
              </div>
            )}

            {/* Action area */}
            {isBroke ? (
              <div style={{ textAlign: 'center', paddingTop: 4 }}>
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                  Tapped out. Happens to the best of us.
                </div>
                <button className="ss-btn ss-btn-primary" onClick={resetBankroll}
                  style={{ minWidth: 220, height: 48, fontSize: 14 }}>
                  Reset bankroll to $1,000
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  className="ss-btn ss-btn-primary"
                  onClick={() => flip('heads')}
                  disabled={flipping}
                  style={{ flex: 1, maxWidth: 160, height: 52, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Heads
                </button>
                <button
                  className="ss-btn"
                  onClick={() => flip('tails')}
                  disabled={flipping}
                  style={{ flex: 1, maxWidth: 160, height: 52, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  Tails
                </button>
              </div>
            )}
          </div>

          {/* History panel */}
          <div className="ss-card">
            <div className="ss-stat-label" style={{ marginBottom: 12 }}>Recent flips</div>
            {history.length === 0 ? (
              <div style={{ color: 'var(--ss-text-muted)', fontSize: 13, padding: '36px 0', textAlign: 'center', lineHeight: 1.75 }}>
                No flips yet.<br />
                <span style={{ color: 'var(--ss-text-dim)', fontWeight: 600 }}>Pick heads or tails to get started!</span>
              </div>
            ) : (
              history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--ss-border-soft)', fontSize: 13,
                }}>
                  <span style={{ color: 'var(--ss-text-muted)' }}>
                    Called {h.call} &rarr;{' '}
                    <span style={{ color: h.delta > 0 ? 'var(--ss-green)' : 'var(--ss-text-dim)', fontWeight: 500 }}>
                      {h.outcome}
                    </span>
                  </span>
                  <span className="ss-mono" style={{ color: h.delta > 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600 }}>
                    {h.delta > 0 ? '+' : ''}${h.delta}
                  </span>
                </div>
              ))
            )}
            {history.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--ss-border-soft)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--ss-text-muted)' }}>
                  {history.filter(h => h.delta > 0).length}W — {history.filter(h => h.delta < 0).length}L
                </span>
                <span className="ss-mono" style={{ color: netPL >= 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600 }}>
                  {netPL >= 0 ? '+' : ''}${netPL.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default CoinFlip;
