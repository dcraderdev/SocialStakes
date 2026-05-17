import React, { useState, useEffect } from 'react';
import Navigation from '../Navigation';
import GameBottomCTA from '../GameBottomCTA';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const rankLabel = r => RANK_LABELS[r] || String(r);

const STYLES = `
@keyframes hl-card-reveal {
  0%   { opacity: 0; transform: translateY(-28px) scale(0.85); }
  65%  { opacity: 1; transform: translateY(5px) scale(1.03); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes hl-streak-pop {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.35); }
  65%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
@keyframes hl-result-in {
  0%   { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes hl-bankroll-win {
  0%   { color: var(--ss-text); }
  45%  { color: var(--ss-green); }
  100% { color: var(--ss-text); }
}
@keyframes hl-bankroll-lose {
  0%   { color: var(--ss-text); }
  45%  { color: var(--ss-red); }
  100% { color: var(--ss-text); }
}
@keyframes hl-arrow-pulse {
  0%, 100% { opacity: 0.3; transform: scaleX(1); }
  50%       { opacity: 1;   transform: scaleX(1.3); }
}
`;

const WIN_PHRASES = [
  'Nice call!', 'You read it right!', 'Cards are on your side!',
  'Spot on!', 'Trust the gut!', 'Smooth move.', 'The deck bows to you.',
];
const LOSE_PHRASES = [
  'Missed it.', 'Cards had other plans.', 'Next one\'s yours!',
  'So close!', 'Shake it off.', 'The deck remembers nothing.',
];
const TIE_PHRASES = [
  'Same rank — tie always loses. Rough.', 'Tie goes to the house.',
  'Matching ranks — bad timing.', 'Tied — house rule: you lose.',
];

function drawCard() {
  return { rank: 1 + Math.floor(Math.random() * 13), suit: SUITS[Math.floor(Math.random() * 4)] };
}

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

// Probability context for a given current-card rank (1–13)
function oddsFor(rank) {
  const higher = 13 - rank; // ranks strictly above
  const lower  = rank - 1;  // ranks strictly below
  // tie = 1 rank (always loses)
  return { higher, lower };
}

function CardArt({ card, big, animKey }) {
  if (!card) {
    return (
      <div style={{
        width: big ? 110 : 72, height: big ? 160 : 104,
        borderRadius: 10, border: '1.5px dashed var(--ss-border)',
        opacity: 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ss-text-muted)', fontSize: 12,
      }}>
        ?
      </div>
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  const w = big ? 110 : 72;
  const h = big ? 160 : 104;
  const fontSize = big ? 18 : 13;
  const suitSize = big ? 42 : 28;

  return (
    <div
      style={{
        width: w, height: h, borderRadius: 10, background: '#fafaf6',
        boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
        position: 'relative', padding: 10,
        color: isRed ? '#d63a3a' : '#111', fontWeight: 800,
        animation: animKey ? 'hl-card-reveal 0.38s cubic-bezier(.22,.61,.36,1) forwards' : 'none',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize }}>{rankLabel(card.rank)}{card.suit}</div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: suitSize }}>
        {card.suit}
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize, transform: 'rotate(180deg)' }}>
        {rankLabel(card.rank)}{card.suit}
      </div>
    </div>
  );
}

function streakLabel(s) {
  if (s >= 8) return 'LEGENDARY';
  if (s >= 6) return 'UNSTOPPABLE';
  if (s >= 4) return 'ON FIRE';
  if (s >= 2) return 'STREAK';
  return null;
}
const streakColor = s =>
  s >= 6 ? 'var(--ss-gold)' : s >= 4 ? 'var(--ss-green)' : s >= 2 ? 'var(--ss-blue)' : 'var(--ss-text)';

function HiLo() {
  const [bankroll, setBankroll] = useSessionState('hl_bankroll', 1000);
  const [history, setHistory]   = useSessionState('hl_history', []);
  const [streak, setStreak]     = useSessionState('hl_streak', 0);
  const [bet, setBet]           = useState(25);
  const [current, setCurrent]   = useState(drawCard);
  const [currentKey, setCurrentKey] = useState(0); // for current-card swap animation
  const [next, setNext]         = useState(null);
  const [result, setResult]     = useState(null);
  const [waiting, setWaiting]   = useState(false);
  const [cardRevealKey, setCardRevealKey] = useState(0);
  const [bankrollAnimKey, setBankrollAnimKey] = useState(0);
  const [bankrollAnimType, setBankrollAnimType] = useState('');

  const isBroke      = bankroll <= 0;
  const effectiveBet = Math.max(1, Math.min(Math.floor(bet), bankroll));
  const betOverflow  = bet > bankroll && !isBroke;
  const netPL        = bankroll - 1000;
  const label        = streakLabel(streak);
  const sColor       = streakColor(streak);
  const odds         = oddsFor(current.rank);

  const resetBankroll = () => {
    setBankroll(1000); setHistory([]); setStreak(0); setResult(null);
    const nc = drawCard();
    setCurrent(nc); setCurrentKey(k => k + 1); setNext(null);
  };

  const guess = (direction) => {
    if (waiting || isBroke) return;
    const n    = drawCard();
    const tied = n.rank === current.rank;
    let won;
    if (tied)                        won = false;
    else if (direction === 'higher') won = n.rank > current.rank;
    else                             won = n.rank < current.rank;

    const delta     = won ? effectiveBet : -effectiveBet;
    const newStreak = won ? streak + 1 : 0;

    let phrase;
    if (tied) {
      phrase = TIE_PHRASES[Math.floor(Math.random() * TIE_PHRASES.length)];
    } else {
      const pool = won ? WIN_PHRASES : LOSE_PHRASES;
      phrase = pool[Math.floor(Math.random() * pool.length)];
    }

    setBankroll(b => b + delta);
    setStreak(newStreak);
    setNext(n);
    setResult({ won, delta, phrase, newStreak, tied });
    setHistory(h => [{ from: current, to: n, direction, delta }, ...h].slice(0, 10));
    setCardRevealKey(k => k + 1);
    setWaiting(true);

    setBankrollAnimKey(k => k + 1);
    setBankrollAnimType(won ? 'win' : 'lose');

    setTimeout(() => {
      setCurrent(n);
      setCurrentKey(k => k + 1);
      setNext(null);
      setResult(null);
      setWaiting(false);
    }, 1100);
  };

  return (
    <>
      <style>{STYLES}</style>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Hi-Lo</h1>
        <p className="ss-sub">Will the next card be higher or lower? Ties lose. Build a streak, press your luck.</p>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 28 }}>

            {/* Stats row: bankroll / streak / bet */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="ss-stat-label">Bankroll</div>
                <div
                  key={bankrollAnimKey}
                  className="ss-stat-value"
                  style={{
                    color: isBroke ? 'var(--ss-red)' : 'var(--ss-text)',
                    animation: bankrollAnimType ? `hl-bankroll-${bankrollAnimType} 0.65s ease` : 'none',
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

              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label">Streak</div>
                <div
                  key={streak}
                  style={{
                    fontSize: streak >= 4 ? 32 : 26, fontWeight: 700, letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums', color: sColor, lineHeight: 1,
                    animation: streak > 0 ? 'hl-streak-pop 0.42s cubic-bezier(.22,.61,.36,1)' : 'none',
                  }}
                >
                  {streak}
                </div>
                {label && (
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: sColor, marginTop: 3 }}>
                    {label}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="ss-stat-label" style={{ color: betOverflow ? 'var(--ss-red)' : undefined }}>
                  {betOverflow ? `Capped $${bankroll}` : 'Bet'}
                </div>
                <input
                  type="number"
                  value={bet}
                  min={1}
                  onChange={e => setBet(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isBroke || waiting}
                  className="ss-mono"
                  style={{
                    width: 86, padding: '6px 10px', borderRadius: 8,
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
                  <button key={v} onClick={() => setBet(v)} disabled={waiting}
                    className="ss-btn" style={{ height: 30, fontSize: 12, padding: '0 10px' }}>
                    ${v}
                  </button>
                ))}
                <button onClick={() => setBet(Math.max(1, Math.floor(bankroll / 2)))} disabled={waiting}
                  className="ss-btn" style={{ height: 30, fontSize: 12, padding: '0 10px' }}>
                  Half
                </button>
                <button onClick={() => setBet(bankroll)} disabled={waiting}
                  className="ss-btn"
                  style={{ height: 30, fontSize: 12, padding: '0 10px', borderColor: 'var(--ss-gold-line)', color: 'var(--ss-gold)' }}>
                  All-in
                </button>
              </div>
            )}

            {/* Cards — current → (animated arrow) → next */}
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16, minHeight: 180 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Current</div>
                {/* key at call site forces remount on each card swap → restarts CSS animation */}
                <CardArt key={`cur-${currentKey}`} card={current} big animKey={currentKey > 0 ? `cur-${currentKey}` : null} />
              </div>
              <div style={{
                fontSize: 26, color: 'var(--ss-text-muted)', userSelect: 'none', flexShrink: 0,
                animation: waiting ? 'hl-arrow-pulse 0.7s ease-in-out infinite' : 'none',
              }}>
                →
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Next</div>
                <CardArt key={`next-${cardRevealKey}`} card={next} big animKey={next ? cardRevealKey : null} />
              </div>
            </div>

            {/* Odds hint — based on current card rank */}
            {!isBroke && (
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center', fontSize: 12, color: 'var(--ss-text-muted)', background: 'var(--ss-bg-soft)', borderRadius: 8, padding: '5px 12px', border: '1px solid var(--ss-border-soft)' }}>
                  <span style={{ color: odds.higher >= odds.lower ? 'var(--ss-green)' : 'var(--ss-text-muted)', fontWeight: odds.higher >= odds.lower ? 700 : 400 }}>
                    ↑ {odds.higher}/13
                  </span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ fontSize: 11, opacity: 0.55 }}>tie = loss</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ color: odds.lower >= odds.higher ? 'var(--ss-green)' : 'var(--ss-text-muted)', fontWeight: odds.lower >= odds.higher ? 700 : 400 }}>
                    ↓ {odds.lower}/13
                  </span>
                </div>
              </div>
            )}

            {/* Result banner */}
            {result && (
              <div
                key={result.delta + (result.won ? 'w' : 'l') + (result.tied ? 't' : '')}
                style={{ textAlign: 'center', marginBottom: 16, animation: 'hl-result-in 0.3s ease forwards' }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: result.won ? 'var(--ss-green)' : 'var(--ss-red)' }}>
                  {result.won ? `Won $${result.delta}` : `Lost $${-result.delta}`}
                  {result.won && result.newStreak >= 2 && (
                    <span style={{ fontSize: 13, marginLeft: 10, color: streakColor(result.newStreak), fontWeight: 700 }}>
                      Streak x{result.newStreak}!
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13, marginTop: 4 }}>{result.phrase}</div>
              </div>
            )}

            {/* Action buttons */}
            {isBroke ? (
              <div style={{ textAlign: 'center', paddingTop: 4 }}>
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 14, marginBottom: 16 }}>
                  Cleaned out. The cards took everything.
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
                  onClick={() => guess('higher')}
                  disabled={waiting}
                  style={{ flex: 1, maxWidth: 160, height: 52, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  ↑ Higher
                </button>
                <button
                  className="ss-btn"
                  onClick={() => guess('lower')}
                  disabled={waiting}
                  style={{ flex: 1, maxWidth: 160, height: 52, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  ↓ Lower
                </button>
              </div>
            )}
          </div>

          {/* History panel */}
          <div className="ss-card">
            <div className="ss-stat-label" style={{ marginBottom: 12 }}>Recent hands</div>
            {history.length === 0 ? (
              <div style={{ color: 'var(--ss-text-muted)', fontSize: 13, padding: '36px 0', textAlign: 'center', lineHeight: 1.75 }}>
                No hands yet.<br />
                <span style={{ color: 'var(--ss-text-dim)', fontWeight: 600 }}>Higher or lower — your call.</span>
              </div>
            ) : (
              history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid var(--ss-border-soft)', fontSize: 13,
                }}>
                  <span className="ss-mono" style={{ color: 'var(--ss-text-muted)' }}>
                    {rankLabel(h.from.rank)}{h.from.suit}
                    <span style={{ margin: '0 5px' }}>{h.direction === 'higher' ? '↑' : '↓'}</span>
                    <span style={{ color: h.delta > 0 ? 'var(--ss-green)' : 'var(--ss-text-dim)' }}>
                      {rankLabel(h.to.rank)}{h.to.suit}
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
      <GameBottomCTA currentPath="/play/hilo" />
    </>
  );
}

export default HiLo;
