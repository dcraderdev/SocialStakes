import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../Navigation';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const rankLabel = r => RANK_LABELS[r] || String(r);

// History entry effective label: A↑ for Ace-High, A↓ for Ace-Low
function effLabel(rawRank, eff, suit) {
  if (rawRank === 1) return `A${eff === 14 ? '↑' : '↓'}${suit}`;
  return `${rankLabel(rawRank)}${suit}`;
}

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
@keyframes ad-ace-pulse {
  0%, 100% { box-shadow: 0 8px 22px rgba(0,0,0,0.45); }
  50%       { box-shadow: 0 8px 22px rgba(0,0,0,0.45), 0 0 0 3px #e5b34c, 0 0 18px rgba(229,179,76,0.4); }
}
@keyframes ad-countdown {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}
@keyframes ad-ace-prompt-in {
  0%   { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes ad-bankroll-win {
  0%   { color: var(--ss-text); }
  45%  { color: var(--ss-green); }
  100% { color: var(--ss-text); }
}
@keyframes ad-bankroll-lose {
  0%   { color: var(--ss-text); }
  45%  { color: var(--ss-red); }
  100% { color: var(--ss-text); }
}
`;

function drawCard() {
  return { rank: 1 + Math.floor(Math.random() * 13), suit: SUITS[Math.floor(Math.random() * 4)] };
}

// Returns [cards, effectiveRanks] tuple.
// effectiveRanks[i] = null means Ace awaiting High/Low choice.
function freshDeal() {
  const cards = [drawCard(), drawCard()];
  const eff = cards.map(c => c.rank === 1 ? null : c.rank);
  return [cards, eff];
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

function CardArt({ card, animKey, shake, aceGlow }) {
  if (!card) {
    return (
      <div style={{
        width: 90, height: 130, borderRadius: 10,
        border: '1.5px dashed var(--ss-border)', opacity: 0.38,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ss-text-muted)', fontSize: 13,
      }}>
        ?
      </div>
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  const anim = shake
    ? 'ad-post-hit 0.45s ease forwards'
    : aceGlow
    ? 'ad-ace-pulse 1.3s ease-in-out infinite'
    : animKey
    ? 'ad-card-reveal 0.42s cubic-bezier(.22,.61,.36,1) forwards'
    : 'none';

  return (
    <div
      style={{
        width: 90, height: 130, borderRadius: 10, background: '#fafaf6',
        boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
        position: 'relative', padding: 10,
        color: isRed ? '#d63a3a' : '#111', fontWeight: 800,
        flexShrink: 0,
        animation: anim,
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
  if (spread < 0) return { label: 'Same rank — no bet', color: 'var(--ss-text-muted)', winPct: 0 };
  if (spread === 0) return { label: 'Adjacent — nothing fits', color: 'var(--ss-text-muted)', winPct: 0 };
  const winPct = Math.round((spread / 13) * 100);
  if (spread === 1) return { label: 'One-card gap — brave?', color: 'var(--ss-red)', winPct };
  if (spread <= 3) return { label: 'Tight spread', color: 'var(--ss-text-muted)', winPct };
  if (spread <= 6) return { label: 'Playable spread', color: 'var(--ss-text-dim)', winPct };
  if (spread <= 9) return { label: 'Wide open — solid shot!', color: 'var(--ss-green)', winPct };
  return { label: 'Massive gap — take it!', color: 'var(--ss-gold)', winPct };
}

const AUTO_DELAY = 1400; // ms before auto-dealing next hand

function AceyDuecey() {
  const [bankroll, setBankroll] = useSessionState('ad_bankroll', 1000);
  const [history, setHistory] = useSessionState('ad_history', []);
  const [bet, setBet] = useState(25);

  // Tuple: [cards, effectiveRanks] always set together for consistency
  const [[cards, effectiveRanks], setDeal] = useState(freshDeal);

  const [middle, setMiddle] = useState(null);
  const [result, setResult] = useState(null);
  const [midKey, setMidKey] = useState(0);
  const [postShake, setPostShake] = useState(false);
  const [midRevealing, setMidRevealing] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  const autoTimerRef    = useRef(null);
  const autoPassRef     = useRef(null);
  const [autoPassMsg, setAutoPassMsg] = useState(null);
  const [bankrollAnimKey, setBankrollAnimKey] = useState(0);
  const [bankrollAnimType, setBankrollAnimType] = useState('');
  const isBroke = bankroll <= 0;
  const netPL   = bankroll - 1000;

  // Index of first Ace post still needing High/Low choice (-1 if all resolved)
  const pendingAceIdx = effectiveRanks.findIndex(r => r === null);
  const allResolved = pendingAceIdx === -1;

  // Spread uses effective ranks (1 or 14 for Aces, 2-13 for others)
  const r0 = effectiveRanks[0] ?? 0;
  const r1 = effectiveRanks[1] ?? 0;
  const low = Math.min(r0, r1);
  const high = Math.max(r0, r1);
  const spread = allResolved ? high - low - 1 : null;
  const info = spread !== null ? spreadInfo(spread) : { label: 'Choose Ace value first', color: 'var(--ss-gold)', winPct: 0 };

  const effectiveBet = Math.max(1, Math.min(Math.floor(bet), bankroll));
  const betOverflow  = bet > bankroll && !isBroke;

  // Phase flags — declared early so useEffects below can reference them
  const inResult    = !!result;
  const inAcePrompt = !inResult && pendingAceIdx >= 0;
  const inReady     = !inResult && !inAcePrompt && !isBroke;

  // Auto-advance to next hand after result is shown
  useEffect(() => {
    if (!result || isBroke) return;
    autoTimerRef.current = setTimeout(() => {
      const next = freshDeal();
      setDeal(next);
      setMiddle(null);
      setResult(null);
      setPostShake(false);
      setMidRevealing(false);
      setRoundKey(k => k + 1);
    }, AUTO_DELAY);
    return () => clearTimeout(autoTimerRef.current);
  }, [result, isBroke]);

  // Auto-pass when posts leave zero spread (same rank or adjacent)
  useEffect(() => {
    if (!allResolved || spread === null || spread > 0 || isBroke || inResult) return;
    setAutoPassMsg('No gap between posts — redealing…');
    autoPassRef.current = setTimeout(() => {
      setAutoPassMsg(null);
      clearTimeout(autoTimerRef.current);
      const next = freshDeal();
      setDeal(next);
      setMiddle(null);
      setResult(null);
      setPostShake(false);
      setMidRevealing(false);
      setRoundKey(k => k + 1);
    }, 700);
    return () => {
      clearTimeout(autoPassRef.current);
      setAutoPassMsg(null);
    };
  }, [allResolved, spread, isBroke, inResult]);

  const resolveAce = (choice) => {
    if (pendingAceIdx < 0) return;
    const newEff = [...effectiveRanks];
    newEff[pendingAceIdx] = choice === 'high' ? 14 : 1;
    setDeal([cards, newEff]);
  };

  const newRound = () => {
    clearTimeout(autoTimerRef.current);
    clearTimeout(autoPassRef.current);
    setAutoPassMsg(null);
    setMidRevealing(false);
    const next = freshDeal();
    setDeal(next);
    setMiddle(null);
    setResult(null);
    setPostShake(false);
    setRoundKey(k => k + 1);
  };

  const resetBankroll = () => {
    clearTimeout(autoTimerRef.current);
    clearTimeout(autoPassRef.current);
    setAutoPassMsg(null);
    setMidRevealing(false);
    setBankroll(1000);
    setHistory([]);
    setResult(null);
    setMiddle(null);
    setPostShake(false);
    setDeal(freshDeal());
    setRoundKey(k => k + 1);
  };

  const deal = () => {
    if (!allResolved || spread === null || spread <= 0 || isBroke) return;
    const m = drawCard();
    setMidKey(k => k + 1);
    setMiddle(m);

    let type, delta, phrase;
    // Post hit: middle card matches either post's RAW rank (Ace always matches Ace post)
    if (m.rank === cards[0].rank || m.rank === cards[1].rank) {
      const penalty = Math.min(2 * effectiveBet, bankroll);
      delta = -penalty;
      type = 'post';
      phrase = ['Hit the post — double penalty!', 'Ouch! Right on the post.', 'Post hit. That\'ll cost ya.'][
        Math.floor(Math.random() * 3)
      ];
      // Shake immediately; skip reveal so shake doesn't re-trigger it after 500ms
      setPostShake(true);
      setTimeout(() => setPostShake(false), 500);
    } else if (m.rank > low && m.rank < high) {
      delta = effectiveBet;
      type = 'between';
      phrase = ['In between — you win!', 'Nailed it!', 'Smooth read!', 'Right through the gap!'][
        Math.floor(Math.random() * 4)
      ];
      setMidRevealing(true);
      setTimeout(() => setMidRevealing(false), 450);
    } else {
      delta = -effectiveBet;
      type = 'outside';
      phrase = ['Outside the posts.', 'Too far out.', 'Just missed.', 'Outside — try again.'][
        Math.floor(Math.random() * 4)
      ];
      setMidRevealing(true);
      setTimeout(() => setMidRevealing(false), 450);
    }

    setBankroll(b => b + delta);
    setBankrollAnimKey(k => k + 1);
    setBankrollAnimType(type === 'between' ? 'win' : 'lose');
    setResult({ type, delta, phrase });
    setHistory(h => [{
      left: cards[0], right: cards[1], mid: m,
      leftEff: effectiveRanks[0], rightEff: effectiveRanks[1],
      type, delta,
    }, ...h].slice(0, 10));
  };

  const resultColor = result
    ? (result.type === 'between' ? 'var(--ss-green)' : 'var(--ss-red)')
    : 'var(--ss-text)';

  return (
    <>
      <style>{STYLES}</style>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Acey-Duecey</h1>
        <p className="ss-sub">
          Bet the middle card falls strictly between the two posts.
          Hit a post and pay double. Ace plays High or Low — you decide.
        </p>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 28 }}>

            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="ss-stat-label">Bankroll</div>
                <div
                  key={bankrollAnimKey}
                  className="ss-stat-value"
                  style={{
                    color: isBroke ? 'var(--ss-red)' : 'var(--ss-text)',
                    animation: bankrollAnimType ? `ad-bankroll-${bankrollAnimType} 0.65s ease` : 'none',
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
                <div className="ss-stat-label">Spread</div>
                <div className="ss-stat-value" key={roundKey} style={{
                  color: inAcePrompt ? 'var(--ss-gold)' : spread !== null && spread > 0 ? info.color : 'var(--ss-text-muted)',
                  animation: 'ad-posts-in 0.3s ease',
                }}>
                  {inAcePrompt ? '?' : spread !== null && spread > 0 ? spread : '—'}
                </div>
                <div style={{ fontSize: 11, color: info.color, marginTop: 3, letterSpacing: '0.02em', maxWidth: 140, lineHeight: 1.3 }}>
                  {info.label}
                </div>
                {spread !== null && spread > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--ss-text-muted)', marginTop: 2 }}>~{info.winPct}% to hit</div>
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
                  disabled={isBroke || inResult}
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

            {/* Quick-bet chips — hide during result display */}
            {!isBroke && !inResult && (
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

            {/* Ace High/Low prompt */}
            {inAcePrompt && (
              <div style={{
                background: 'var(--ss-bg-soft)', border: '1px solid var(--ss-gold-line)',
                borderRadius: 12, padding: '16px 20px', marginBottom: 18,
                textAlign: 'center', animation: 'ad-ace-prompt-in 0.25s ease forwards',
              }}>
                <div style={{ color: 'var(--ss-gold)', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Ace — High or Low?
                </div>
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 12, marginBottom: 14 }}>
                  High = 14 (above King) · Low = 1 (below 2)
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button className="ss-btn ss-btn-primary" onClick={() => resolveAce('high')}
                    style={{ minWidth: 110, height: 46, fontSize: 14 }}>
                    High (14)
                  </button>
                  <button className="ss-btn" onClick={() => resolveAce('low')}
                    style={{ minWidth: 110, height: 46, fontSize: 14 }}>
                    Low (1)
                  </button>
                </div>
              </div>
            )}

            {/* Post cards + middle card */}
            <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'flex-end', marginBottom: 20, minHeight: 165, flexWrap: 'wrap' }}>
              {/* Left post — key includes roundKey + eff so remount triggers reveal on each new round
                  and again when Ace is resolved (eff flips from null→14/1) */}
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Post</div>
                <CardArt
                  key={`p0-${roundKey}-${effectiveRanks[0] ?? 'x'}`}
                  card={cards[0]}
                  animKey={effectiveRanks[0] !== null ? roundKey : null}
                  aceGlow={effectiveRanks[0] === null}
                />
                {cards[0].rank === 1 && effectiveRanks[0] !== null && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ss-gold)', marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    ACE {effectiveRanks[0] === 14 ? 'HIGH' : 'LOW'}
                  </div>
                )}
              </div>
              {/* Middle card — key on midKey forces remount on each deal;
                  animKey only set while midRevealing so reveal never re-fires after shake */}
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Middle</div>
                <CardArt
                  key={`mid-${midKey}`}
                  card={middle}
                  animKey={middle && midRevealing ? midKey : null}
                  shake={postShake}
                />
              </div>
              {/* Right post */}
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Post</div>
                <CardArt
                  key={`p1-${roundKey}-${effectiveRanks[1] ?? 'x'}`}
                  card={cards[1]}
                  animKey={effectiveRanks[1] !== null ? roundKey : null}
                  aceGlow={effectiveRanks[1] === null}
                />
                {cards[1].rank === 1 && effectiveRanks[1] !== null && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ss-gold)', marginTop: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    ACE {effectiveRanks[1] === 14 ? 'HIGH' : 'LOW'}
                  </div>
                )}
              </div>
            </div>

            {/* Result banner + auto-advance countdown */}
            {inResult && (
              <div
                key={result.type + result.delta}
                style={{ textAlign: 'center', marginBottom: 16, animation: 'ad-result-in 0.3s ease forwards' }}
              >
                <div style={{
                  fontSize: 19, fontWeight: 800, color: resultColor,
                  animation: result.type === 'between' ? 'ad-win-bounce 0.5s ease forwards' : 'none',
                }}>
                  {result.type === 'between' ? 'BETWEEN' : result.type === 'post' ? 'POST HIT' : 'OUTSIDE'}
                  &nbsp;&nbsp;{result.delta > 0 ? `+$${result.delta}` : `-$${-result.delta}`}
                  {result.type === 'post' && <span style={{ fontSize: 13, marginLeft: 8, fontWeight: 600 }}>×2 penalty</span>}
                </div>
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13, marginTop: 4 }}>{result.phrase}</div>
                {/* Countdown bar — depletes over AUTO_DELAY ms then next hand deals */}
                {!isBroke && (
                  <div style={{ height: 2, background: 'var(--ss-border-soft)', borderRadius: 1, marginTop: 14, overflow: 'hidden' }}>
                    <div key={result.type + result.delta + 'bar'} style={{
                      height: '100%', width: '100%',
                      background: resultColor,
                      transformOrigin: 'left',
                      animation: `ad-countdown ${AUTO_DELAY}ms linear forwards`,
                    }} />
                  </div>
                )}
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
            ) : inResult ? (
              /* During auto-advance, show a subtle "next hand coming..." note */
              <div style={{ textAlign: 'center', color: 'var(--ss-text-muted)', fontSize: 12, paddingTop: 4 }}>
                Next hand coming…
              </div>
            ) : autoPassMsg ? (
              <div style={{ textAlign: 'center', color: 'var(--ss-text-muted)', fontSize: 13, paddingTop: 4, fontStyle: 'italic' }}>
                {autoPassMsg}
              </div>
            ) : inReady ? (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="ss-btn ss-btn-primary" onClick={deal}
                  disabled={spread === null || spread <= 0}
                  style={{ flex: 1, maxWidth: 160, height: 52, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Deal middle
                </button>
                <button className="ss-btn" onClick={newRound}
                  style={{ flex: 1, maxWidth: 160, height: 52, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Pass
                </button>
              </div>
            ) : null /* ace-prompt phase: no deal/pass buttons yet */}
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
              <>
                {history.map((h, i) => {
                  const typeColor = h.type === 'between' ? 'var(--ss-green)' : 'var(--ss-red)';
                  const typeLabel = h.type === 'between' ? 'HIT' : h.type === 'post' ? 'POST' : 'OUT';
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: '1px solid var(--ss-border-soft)', fontSize: 12,
                      gap: 8,
                    }}>
                      <span className="ss-mono" style={{ color: 'var(--ss-text-muted)', flexShrink: 0 }}>
                        {effLabel(h.left.rank, h.leftEff, h.left.suit)}
                        <span style={{ color: 'var(--ss-border)', margin: '0 3px' }}>|</span>
                        <span style={{ color: typeColor }}>{rankLabel(h.mid.rank)}{h.mid.suit}</span>
                        <span style={{ color: 'var(--ss-border)', margin: '0 3px' }}>|</span>
                        {effLabel(h.right.rank, h.rightEff, h.right.suit)}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: typeColor, flexShrink: 0 }}>
                        {typeLabel}
                      </span>
                      <span className="ss-mono" style={{ color: h.delta > 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600, flexShrink: 0 }}>
                        {h.delta > 0 ? '+' : ''}${h.delta}
                      </span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--ss-border-soft)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--ss-text-muted)' }}>
                    {history.filter(h => h.delta > 0).length}W — {history.filter(h => h.delta < 0).length}L
                  </span>
                  <span className="ss-mono" style={{ color: netPL >= 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600 }}>
                    {netPL >= 0 ? '+' : ''}${netPL.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AceyDuecey;
