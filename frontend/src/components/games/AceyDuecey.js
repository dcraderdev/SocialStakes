import React, { useState, useEffect } from 'react';
import Navigation from '../Navigation';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const rankLabel = r => RANK_LABELS[r] || String(r);

const STYLES = `
@keyframes ad-card-reveal {
  0%   { opacity: 0; transform: translateY(-30px) scale(0.82) rotate(-4deg); }
  60%  { opacity: 1; transform: translateY(5px) scale(1.04) rotate(1deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
}
@keyframes ad-post-hit {
  0%, 100% { transform: translateX(0); }
  15%  { transform: translateX(-10px) rotate(-3deg); }
  35%  { transform: translateX(10px) rotate(3deg); }
  55%  { transform: translateX(-8px) rotate(-2deg); }
  75%  { transform: translateX(7px) rotate(2deg); }
}
@keyframes ad-win-bounce {
  0%   { transform: translateY(0) scale(1); }
  30%  { transform: translateY(-12px) scale(1.06); }
  60%  { transform: translateY(4px) scale(0.98); }
  80%  { transform: translateY(-4px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes ad-result-in {
  0%   { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes ad-posts-in {
  0%   { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

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

function CardArt({ card, animKey, shake }) {
  const placeholder = (
    <div style={{
      width: 90, height: 130, borderRadius: 10,
      border: '1.5px dashed var(--ss-border)', opacity: 0.38,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--ss-text-muted)', fontSize: 13,
    }}>
      ?
    </div>
  );
  if (!card) return placeholder;
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div
      key={animKey || undefined}
      style={{
        width: 90, height: 130, borderRadius: 10, background: '#fafaf6',
        boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
        position: 'relative', padding: 10,
        color: isRed ? '#d63a3a' : '#111', fontWeight: 800,
        flexShrink: 0,
        animation: shake
          ? 'ad-post-hit 0.45s ease forwards'
          : animKey
          ? 'ad-card-reveal 0.42s cubic-bezier(.22,.61,.36,1) forwards'
          : 'none',
      }}
    >
      <div style={{ fontSize: 16 }}>{rankLabel(card.rank)}{card.suit}</div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 34 }}>
        {card.suit}
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 16, transform: 'rotate(180deg)' }}>
        {rankLabel(card.rank)}{card.suit}
      </div>
    </div>
  );
}

function spreadInfo(spread) {
  if (spread <= 0) return { label: 'No gap — pass to redeal', color: 'var(--ss-text-muted)', winPct: 0 };
  const winPct = Math.round((spread / 13) * 100);
  if (spread === 1) return { label: 'One-card gap — feeling brave?', color: 'var(--ss-red)', winPct };
  if (spread <= 3) return { label: 'Tight spread', color: 'var(--ss-text-muted)', winPct };
  if (spread <= 6) return { label: 'Playable spread', color: 'var(--ss-text-dim)', winPct };
  if (spread <= 9) return { label: 'Wide open — solid shot!', color: 'var(--ss-green)', winPct };
  return { label: 'Massive gap — take it!', color: 'var(--ss-gold)', winPct };
}

function AceyDuecey() {
  const [bankroll, setBankroll] = useSessionState('ad_bankroll', 1000);
  const [history, setHistory] = useSessionState('ad_history', []);
  const [bet, setBet] = useState(25);
  const [cards, setCards] = useState(() => [drawCard(), drawCard()]);
  const [middle, setMiddle] = useState(null);
  const [result, setResult] = useState(null);
  const [midKey, setMidKey] = useState(0);
  const [postShake, setPostShake] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  const [low, high] = (() => {
    const a = cards[0].rank, b = cards[1].rank;
    return a < b ? [a, b] : [b, a];
  })();
  const spread = high - low - 1;
  const info = spreadInfo(spread);

  const isBroke = bankroll <= 0;
  const effectiveBet = Math.max(1, Math.min(Math.floor(bet), bankroll));
  const betOverflow = bet > bankroll && !isBroke;

  const resetBankroll = () => {
    setBankroll(1000);
    setHistory([]);
    setResult(null);
    setMiddle(null);
    setCards([drawCard(), drawCard()]);
    setRoundKey(k => k + 1);
  };

  const newRound = () => {
    setMiddle(null);
    setResult(null);
    setPostShake(false);
    const newCards = [drawCard(), drawCard()];
    setCards(newCards);
    setRoundKey(k => k + 1);
  };

  const deal = () => {
    if (isBroke || spread <= 0) return;
    const m = drawCard();
    setMidKey(k => k + 1);
    setMiddle(m);

    let type, delta, phrase;
    if (m.rank === cards[0].rank || m.rank === cards[1].rank) {
      const penalty = Math.min(2 * effectiveBet, bankroll);
      delta = -penalty;
      type = 'post';
      phrase = 'Hit the post — double penalty!';
      setPostShake(true);
      setTimeout(() => setPostShake(false), 500);
    } else if (m.rank > low && m.rank < high) {
      delta = effectiveBet;
      type = 'between';
      phrase = ['In between — you win!', 'Nailed it!', 'Smooth read!', 'Right through the gap!'][
        Math.floor(Math.random() * 4)
      ];
    } else {
      delta = -effectiveBet;
      type = 'outside';
      phrase = ['Outside the posts.', 'Too far out.', 'Just missed.', 'Outside — try again.'][
        Math.floor(Math.random() * 4)
      ];
    }

    setBankroll(b => b + delta);
    setResult({ type, delta, phrase });
    setHistory(h => [{ left: cards[0], mid: m, right: cards[1], type, delta }, ...h].slice(0, 10));
  };

  const resultColor = result
    ? (result.type === 'between' ? 'var(--ss-green)'
      : result.type === 'post' ? 'var(--ss-red)'
      : 'var(--ss-red)')
    : 'var(--ss-text)';

  const resultAnim = result
    ? (result.type === 'between' ? 'ad-win-bounce 0.5s ease forwards' : 'none')
    : 'none';

  return (
    <>
      <style>{STYLES}</style>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Acey-Duecey</h1>
        <p className="ss-sub">
          Bet the middle card falls strictly between the two posts.
          Hit a post and pay double. Choose your spots.
        </p>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 28 }}>

            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="ss-stat-label">Bankroll</div>
                <div className="ss-stat-value" style={{ color: isBroke ? 'var(--ss-red)' : 'var(--ss-text)' }}>
                  ${bankroll.toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label">Spread</div>
                <div className="ss-stat-value" key={roundKey} style={{
                  color: spread <= 0 ? 'var(--ss-text-muted)' : info.color,
                  animation: 'ad-posts-in 0.3s ease',
                }}>
                  {spread > 0 ? spread : '—'}
                </div>
                <div style={{ fontSize: 11, color: info.color, marginTop: 3, letterSpacing: '0.02em', maxWidth: 140, lineHeight: 1.3 }}>
                  {info.label}
                </div>
                {spread > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--ss-text-muted)', marginTop: 2 }}>
                    ~{info.winPct}% to hit
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="ss-stat-label" style={{ color: betOverflow ? 'var(--ss-red)' : undefined }}>
                  {betOverflow ? `Bet (capped $${bankroll})` : 'Bet'}
                </div>
                <input
                  type="number"
                  value={bet}
                  min={1}
                  onChange={e => setBet(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isBroke || !!middle}
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
            {!isBroke && !middle && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {[10, 25, 50, 100].filter(v => v <= bankroll).map(v => (
                  <button key={v} onClick={() => setBet(v)}
                    className="ss-btn" style={{ height: 30, fontSize: 12, padding: '0 10px' }}>
                    ${v}
                  </button>
                ))}
                <button onClick={() => setBet(Math.max(1, Math.floor(bankroll / 2)))}
                  className="ss-btn" style={{ height: 30, fontSize: 12, padding: '0 10px' }}>
                  Half
                </button>
                <button onClick={() => setBet(bankroll)}
                  className="ss-btn"
                  style={{ height: 30, fontSize: 12, padding: '0 10px', borderColor: 'var(--ss-gold-line)', color: 'var(--ss-gold)' }}>
                  All-in
                </button>
              </div>
            )}

            {/* Cards */}
            <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 20, minHeight: 155, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Post</div>
                <CardArt card={cards[0]} key={`left-${roundKey}`} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Middle</div>
                <CardArt
                  card={middle}
                  animKey={middle ? midKey : null}
                  shake={postShake}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Post</div>
                <CardArt card={cards[1]} key={`right-${roundKey}`} />
              </div>
            </div>

            {/* Result banner */}
            {result && (
              <div
                key={result.type + result.delta}
                style={{ textAlign: 'center', marginBottom: 18, animation: 'ad-result-in 0.3s ease forwards' }}
              >
                <div style={{ fontSize: 19, fontWeight: 800, color: resultColor, animation: resultAnim }}>
                  {result.type === 'between' ? 'BETWEEN' : result.type === 'post' ? 'POST HIT' : 'OUTSIDE'}
                  &nbsp;&nbsp;{result.delta > 0 ? `+$${result.delta}` : `-$${-result.delta}`}
                  {result.type === 'post' && <span style={{ fontSize: 13, marginLeft: 8 }}>x2 penalty</span>}
                </div>
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13, marginTop: 4 }}>{result.phrase}</div>
              </div>
            )}

            {/* Action buttons */}
            {isBroke ? (
              <div style={{ textAlign: 'center', paddingTop: 4 }}>
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 14, marginBottom: 16 }}>
                  Busted. The posts got you.
                </div>
                <button className="ss-btn ss-btn-primary" onClick={resetBankroll}
                  style={{ minWidth: 220, height: 48, fontSize: 14 }}>
                  Reset bankroll to $1,000
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {!middle ? (
                  <>
                    <button className="ss-btn ss-btn-primary" onClick={deal}
                      disabled={spread <= 0}
                      style={{ flex: 1, maxWidth: 160, height: 52, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Deal middle
                    </button>
                    <button className="ss-btn" onClick={newRound}
                      style={{ flex: 1, maxWidth: 160, height: 52, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {spread <= 0 ? 'Redeal' : 'Pass'}
                    </button>
                  </>
                ) : (
                  <button className="ss-btn ss-btn-primary" onClick={newRound}
                    style={{ minWidth: 200, height: 52, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Next round
                  </button>
                )}
              </div>
            )}
          </div>

          {/* History */}
          <div className="ss-card">
            <div className="ss-stat-label" style={{ marginBottom: 12 }}>Hand history</div>
            {history.length === 0 ? (
              <div style={{ color: 'var(--ss-text-muted)', fontSize: 13, padding: '32px 0', textAlign: 'center', lineHeight: 1.7 }}>
                No hands played yet.<br />
                <span style={{ color: 'var(--ss-text-dim)', fontWeight: 600 }}>Deal the middle card to begin.</span>
              </div>
            ) : (
              history.map((h, i) => {
                const typeColor = h.type === 'between' ? 'var(--ss-green)' : 'var(--ss-red)';
                const typeLabel = h.type === 'between' ? 'HIT' : h.type === 'post' ? 'POST' : 'OUT';
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px solid var(--ss-border-soft)', fontSize: 12,
                    gap: 8,
                  }}>
                    <span className="ss-mono" style={{ color: 'var(--ss-text-muted)', flexShrink: 0 }}>
                      {rankLabel(h.left.rank)}{h.left.suit}
                      <span style={{ color: 'var(--ss-border)', margin: '0 3px' }}>|</span>
                      <span style={{ color: typeColor }}>{rankLabel(h.mid.rank)}{h.mid.suit}</span>
                      <span style={{ color: 'var(--ss-border)', margin: '0 3px' }}>|</span>
                      {rankLabel(h.right.rank)}{h.right.suit}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: typeColor, flexShrink: 0 }}>
                      {typeLabel}
                    </span>
                    <span className="ss-mono" style={{ color: h.delta > 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600, flexShrink: 0 }}>
                      {h.delta > 0 ? '+' : ''}${h.delta}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AceyDuecey;
