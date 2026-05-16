import React, { useState, useRef } from 'react';
import { Hand } from 'pokersolver';
import Navigation from '../Navigation';

// ── card primitives ──────────────────────────────────────────────
const SUITS = ['h', 'd', 'c', 's'];
const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const SUIT_SYM = { h:'♥', d:'♦', c:'♣', s:'♠' };
const RANK_DIS = { T:'10' };

function makeDeck() {
  const d = [];
  for (const r of RANKS) for (const s of SUITS) d.push(r + s);
  return d;
}

function shuffle(deck) {
  const d = [...deck];
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

function rankValue(card) { return RANKS.indexOf(card[0]); }

function preflopStrength(cards) {
  const r1 = rankValue(cards[0]);
  const r2 = rankValue(cards[1]);
  const suited = cards[0][1] === cards[1][1];
  const paired = cards[0][0] === cards[1][0];
  if (paired) return 0.5 + (Math.max(r1, r2) / 12) * 0.5;
  let s = (r1 + r2) / 24;
  if (suited) s += 0.08;
  return Math.min(1, Math.max(0, s));
}

function postflopStrength(holeCards, communityCards) {
  if (communityCards.length < 3) return preflopStrength(holeCards);
  try {
    const h = Hand.solve([...holeCards, ...communityCards]);
    return (10 - h.rank) / 9;
  } catch {
    return 0.3;
  }
}

function botDecide(strength) {
  if (Math.random() < 0.12) return 'call'; // bluff-call
  if (strength >= 0.65) return Math.random() < 0.93 ? 'call' : 'fold';
  if (strength >= 0.40) return Math.random() < 0.60 ? 'call' : 'fold';
  if (strength >= 0.25) return Math.random() < 0.32 ? 'call' : 'fold';
  return Math.random() < 0.10 ? 'call' : 'fold';
}

// ── card art ────────────────────────────────────────────────────
function CardFace({ card, size = 'md' }) {
  const dims = { sm: [60, 86], md: [72, 104], lg: [88, 126] }[size];
  const [w, h] = dims;
  const fs = size === 'lg' ? 15 : size === 'sm' ? 11 : 13;
  const cs = size === 'lg' ? 32 : size === 'sm' ? 22 : 26;
  const isRed = card[1] === 'h' || card[1] === 'd';
  const rank = RANK_DIS[card[0]] || card[0];
  const suit = SUIT_SYM[card[1]];
  return (
    <div style={{
      width: w, height: h, borderRadius: 10, background: '#fafaf6',
      boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
      border: '1px solid rgba(0,0,0,0.08)',
      position: 'relative', padding: 7, flexShrink: 0,
      color: isRed ? '#d63a3a' : '#111', fontWeight: 800,
    }}>
      <div style={{ fontSize: fs, lineHeight: 1 }}>{rank}{suit}</div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: cs }}>{suit}</div>
      <div style={{ position: 'absolute', bottom: 7, right: 7, fontSize: fs, transform: 'rotate(180deg)', lineHeight: 1 }}>{rank}{suit}</div>
    </div>
  );
}

function CardBack({ size = 'md' }) {
  const dims = { sm: [60, 86], md: [72, 104], lg: [88, 126] }[size];
  const [w, h] = dims;
  return (
    <div style={{
      width: w, height: h, borderRadius: 10,
      background: 'repeating-linear-gradient(45deg,#2e63b8 0 5px,#224b8c 5px 10px)',
      border: '1px solid rgba(0,0,0,0.18)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.45)', flexShrink: 0,
    }} />
  );
}

function CardSlot({ size = 'md' }) {
  const dims = { sm: [60, 86], md: [72, 104], lg: [88, 126] }[size];
  const [w, h] = dims;
  return (
    <div style={{
      width: w, height: h, borderRadius: 10,
      border: '1.5px dashed var(--ss-border)', opacity: 0.35, flexShrink: 0,
    }} />
  );
}

// ── phase label ──────────────────────────────────────────────────
const PHASE_LABELS = {
  idle: '', preflop: 'Pre-Flop', flop: 'Flop',
  turn: 'Turn', river: 'River', end: 'Showdown',
};

// ── main component ───────────────────────────────────────────────
function HoldEm() {
  const [bankroll, setBankroll] = useState(1000);
  const [ante, setAnte] = useState(25);
  const [streetBet, setStreetBet] = useState(25);
  const [phase, setPhase] = useState('idle');
  const [deck, setDeck] = useState([]);
  const [playerHole, setPlayerHole] = useState([]);
  const [botHole, setBotHole] = useState([]);
  const [community, setCommunity] = useState([]);
  const [pot, setPot] = useState(0);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('Set your ante and deal a hand.');
  const [revealBot, setRevealBot] = useState(false);
  const [history, setHistory] = useState([]);
  const [botMsg, setBotMsg] = useState('');

  // mutable ref to track total player investment without stale closures
  const investedRef = useRef(0);

  const nextPhase = (p) => {
    const seq = ['preflop', 'flop', 'turn', 'river'];
    const idx = seq.indexOf(p);
    return idx < seq.length - 1 ? seq[idx + 1] : 'showdown';
  };

  const deal = () => {
    if (ante <= 0 || ante > bankroll) return;
    const d = shuffle(makeDeck());
    const ph = [d[0], d[1]];
    const bh = [d[2], d[3]];
    const rest = d.slice(4);

    investedRef.current = ante;
    setBankroll(b => b - ante);
    setPot(ante * 2);
    setDeck(rest);
    setPlayerHole(ph);
    setBotHole(bh);
    setCommunity([]);
    setRevealBot(false);
    setResult(null);
    setBotMsg('');
    setPhase('preflop');
    setMessage('Pre-flop — check or raise the pot.');
  };

  const endHand = (winner, finalPot, phName, bhName, currentInvested) => {
    setRevealBot(true);
    let delta, msg;
    if (winner === 'tie') {
      delta = Math.floor(finalPot / 2) - currentInvested;
      msg = `Split pot — ${phName} ties ${bhName}.`;
      setBankroll(b => b + Math.floor(finalPot / 2));
    } else if (winner === 'player') {
      delta = finalPot - currentInvested;
      msg = `You win $${finalPot}! ${phName} beats ${bhName}.`;
      setBankroll(b => b + finalPot);
    } else {
      delta = -currentInvested;
      msg = `Bot wins with ${bhName}${phName ? ` vs your ${phName}` : ''}.`;
    }
    setResult({ winner, delta, playerHand: phName, botHand: bhName });
    setHistory(h => [{ winner, delta, playerHand: phName, botHand: bhName }, ...h].slice(0, 10));
    setMessage(msg);
    setPhase('end');
  };

  const doShowdown = (finalPot, comm) => {
    const usePot = finalPot ?? pot;
    const useCommunity = comm ?? community;
    const ph = Hand.solve([...playerHole, ...useCommunity]);
    const bh = Hand.solve([...botHole, ...useCommunity]);
    const winners = Hand.winners([ph, bh]);
    const tie = winners.length > 1;
    const playerWins = !tie && winners[0] === ph;
    const winner = tie ? 'tie' : playerWins ? 'player' : 'bot';
    endHand(winner, usePot, ph.name, bh.name, investedRef.current);
  };

  // reveal community cards step by step
  const advanceTo = (next, currentPot, comm) => {
    const usePot = currentPot ?? pot;
    if (next === 'flop') {
      const newComm = [deck[0], deck[1], deck[2]];
      setCommunity(newComm);
      setPhase('flop');
      setMessage('Flop — check or bet.');
      setBotMsg('');
    } else if (next === 'turn') {
      const newComm = [...(comm ?? community), deck[3]];
      setCommunity(newComm);
      setPhase('turn');
      setMessage('Turn — check or bet.');
      setBotMsg('');
    } else if (next === 'river') {
      const newComm = [...(comm ?? community), deck[4]];
      setCommunity(newComm);
      setPhase('river');
      setMessage('River — final bet or check.');
      setBotMsg('');
    } else if (next === 'showdown') {
      // comm must already have 5 cards
      doShowdown(usePot, comm ?? community);
    }
  };

  const playerFold = () => {
    endHand('bot', pot, null, null, investedRef.current);
    setMessage('You folded.');
  };

  const playerCheck = () => {
    // Player checks — bot also checks, advance street
    const next = nextPhase(phase);
    setBotMsg('Bot checks.');
    if (next === 'showdown') {
      // build full community first
      const fullComm = phase === 'river'
        ? community
        : [...community, ...deck.slice(community.length, 5)];
      setTimeout(() => doShowdown(pot, fullComm), 350);
    } else {
      setTimeout(() => advanceTo(next, pot, community), 350);
    }
  };

  const playerBet = () => {
    if (streetBet <= 0 || streetBet > bankroll) return;
    const betAmt = Math.min(streetBet, bankroll);
    investedRef.current += betAmt;
    setBankroll(b => b - betAmt);
    const newPot = pot + betAmt;

    const strength = phase === 'preflop'
      ? preflopStrength(botHole)
      : postflopStrength(botHole, community);
    const decision = botDecide(strength);

    if (decision === 'fold') {
      setPot(newPot);
      setBotMsg('Bot folds!');
      setTimeout(() => {
        endHand('player', newPot, null, null, investedRef.current);
      }, 400);
    } else {
      const finalPot = newPot + betAmt; // bot calls equal amount
      setPot(finalPot);
      setBotMsg('Bot calls.');
      const next = nextPhase(phase);
      if (next === 'showdown') {
        const fullComm = phase === 'river'
          ? community
          : [...community, ...deck.slice(community.length, 5)];
        setTimeout(() => doShowdown(finalPot, fullComm), 500);
      } else {
        setTimeout(() => advanceTo(next, finalPot, community), 500);
      }
    }
  };

  const canAct = phase !== 'idle' && phase !== 'end' && phase !== 'showdown';

  const communitySlots = Array.from({ length: 5 }, (_, i) => community[i] ?? null);

  const resultColor = result?.winner === 'player'
    ? 'var(--ss-green)'
    : result?.winner === 'bot'
    ? 'var(--ss-red)'
    : 'var(--ss-text-dim)';

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Texas Hold'em</h1>
        <p className="ss-sub">Heads-up vs the bot. Both ante in. Best 5-of-7 wins at showdown.</p>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 28 }}>

            {/* ── top stats ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="ss-stat-label">Bankroll</div>
                <div className="ss-stat-value">${bankroll.toLocaleString()}</div>
              </div>
              <div>
                <div className="ss-stat-label">Pot</div>
                <div className="ss-stat-value" style={{ color: 'var(--ss-gold)' }}>${pot.toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="ss-stat-label" style={{ margin: 0 }}>Ante $</span>
                  <input
                    type="number" value={ante}
                    onChange={e => setAnte(Math.max(1, parseInt(e.target.value) || 0))}
                    disabled={phase !== 'idle'}
                    className="ss-mono"
                    style={{ width: 80, padding: '6px 10px', borderRadius: 8, background: 'var(--ss-bg-soft)', border: '1px solid var(--ss-border)', color: 'var(--ss-text)', fontSize: 14 }}
                  />
                </div>
                {canAct && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="ss-stat-label" style={{ margin: 0 }}>Bet $</span>
                    <input
                      type="number" value={streetBet}
                      onChange={e => setStreetBet(Math.max(1, parseInt(e.target.value) || 0))}
                      className="ss-mono"
                      style={{ width: 80, padding: '6px 10px', borderRadius: 8, background: 'var(--ss-bg-soft)', border: '1px solid var(--ss-border)', color: 'var(--ss-text)', fontSize: 14 }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── phase badge ── */}
            {phase !== 'idle' && (
              <div style={{
                textAlign: 'center', marginBottom: 14,
                fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--ss-gold)', fontWeight: 700,
              }}>
                {PHASE_LABELS[phase] || phase}
              </div>
            )}

            {/* ── community cards ── */}
            <div style={{ marginBottom: 24 }}>
              <div className="ss-stat-label" style={{ marginBottom: 10, textAlign: 'center' }}>Community</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {communitySlots.map((card, i) =>
                  card ? <CardFace key={i} card={card} size="md" /> : <CardSlot key={i} size="md" />
                )}
              </div>
            </div>

            {/* ── hole cards ── */}
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24, gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>You</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {playerHole.length
                    ? playerHole.map((c, i) => <CardFace key={i} card={c} size="md" />)
                    : [<CardSlot key={0} size="md" />, <CardSlot key={1} size="md" />]}
                </div>
                {result?.playerHand && (
                  <div style={{ marginTop: 6, fontSize: 11, color: resultColor, fontWeight: 600 }}>{result.playerHand}</div>
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 8 }}>Bot</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {botHole.length
                    ? revealBot
                      ? botHole.map((c, i) => <CardFace key={i} card={c} size="md" />)
                      : [<CardBack key={0} size="md" />, <CardBack key={1} size="md" />]
                    : [<CardSlot key={0} size="md" />, <CardSlot key={1} size="md" />]}
                </div>
                {result?.botHand && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ss-text-muted)', fontWeight: 500 }}>{result.botHand}</div>
                )}
              </div>
            </div>

            {/* ── bot action feedback ── */}
            {botMsg && !result && (
              <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 13, color: 'var(--ss-text-muted)', fontStyle: 'italic' }}>
                {botMsg}
              </div>
            )}

            {/* ── result message ── */}
            <div style={{
              textAlign: 'center', marginBottom: 20,
              color: result ? resultColor : 'var(--ss-text-dim)',
              fontWeight: result ? 700 : 400, fontSize: 14,
              minHeight: 20,
            }}>
              {message}
            </div>

            {/* ── action buttons ── */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {phase === 'idle' && (
                <button className="ss-btn ss-btn-primary"
                  onClick={deal}
                  disabled={ante > bankroll || ante <= 0}
                  style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Deal Hand
                </button>
              )}

              {canAct && (
                <>
                  <button
                    onClick={playerFold}
                    style={{
                      minWidth: 90, height: 44, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase',
                      borderRadius: 999, border: '1px solid rgba(239,93,93,0.4)', background: 'rgba(239,93,93,0.06)',
                      color: 'var(--ss-red)', cursor: 'pointer', fontFamily: 'var(--ss-font)', fontWeight: 600,
                    }}>
                    Fold
                  </button>
                  <button className="ss-btn"
                    onClick={playerCheck}
                    style={{ minWidth: 110, height: 44, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Check
                  </button>
                  <button className="ss-btn ss-btn-primary"
                    onClick={playerBet}
                    disabled={streetBet > bankroll || streetBet <= 0}
                    style={{ minWidth: 130, height: 44, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Raise ${streetBet}
                  </button>
                </>
              )}

              {phase === 'end' && bankroll > 0 && (
                <button className="ss-btn ss-btn-primary"
                  onClick={() => { setPhase('idle'); setMessage('Set your ante and deal a hand.'); }}
                  style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  New Hand
                </button>
              )}

              {phase === 'end' && bankroll <= 0 && (
                <button className="ss-btn"
                  onClick={() => { setBankroll(1000); setPhase('idle'); setMessage('Reloaded $1,000. Good luck!'); }}
                  style={{ minWidth: 140, height: 44, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Reload $1,000
                </button>
              )}
            </div>
          </div>

          {/* ── history sidebar ── */}
          <div className="ss-card">
            <div className="ss-stat-label" style={{ marginBottom: 12 }}>Recent hands</div>
            {history.length === 0 ? (
              <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No hands yet.</div>
            ) : (
              history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '8px 0', borderBottom: '1px solid var(--ss-border-soft)', fontSize: 13,
                }}>
                  <div>
                    <div style={{
                      fontWeight: 600,
                      color: h.winner === 'player' ? 'var(--ss-green)' : h.winner === 'bot' ? 'var(--ss-red)' : 'var(--ss-text-dim)',
                    }}>
                      {h.winner === 'player' ? '✓ Win' : h.winner === 'bot' ? '✗ Loss' : '⇌ Tie'}
                    </div>
                    {h.playerHand && (
                      <div style={{ fontSize: 11, color: 'var(--ss-text-muted)', marginTop: 2 }}>{h.playerHand}</div>
                    )}
                  </div>
                  <span className="ss-mono" style={{
                    color: h.delta > 0 ? 'var(--ss-green)' : h.delta < 0 ? 'var(--ss-red)' : 'var(--ss-text-muted)',
                    fontWeight: 600,
                  }}>
                    {h.delta > 0 ? '+' : h.delta === 0 ? '±' : '-'}${Math.abs(h.delta)}
                  </span>
                </div>
              ))
            )}

            {/* ── hand guide ── */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--ss-border-soft)' }}>
              <div className="ss-stat-label" style={{ marginBottom: 8 }}>Hand rankings</div>
              {[
                ['Royal Flush','10-J-Q-K-A suited'],
                ['Straight Flush','5 in sequence, suited'],
                ['Four of a Kind','4 same rank'],
                ['Full House','3+2 of same ranks'],
                ['Flush','5 suited'],
                ['Straight','5 in sequence'],
                ['Three of a Kind','3 same rank'],
                ['Two Pair','2 pairs'],
                ['One Pair','2 same rank'],
              ].map(([name, desc]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11 }}>
                  <span style={{ color: 'var(--ss-text-dim)', fontWeight: 600 }}>{name}</span>
                  <span style={{ color: 'var(--ss-text-muted)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HoldEm;
