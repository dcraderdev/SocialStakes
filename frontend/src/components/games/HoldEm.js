import React, { useState, useRef, useMemo } from 'react';
import { Hand } from 'pokersolver';
import Navigation from '../Navigation';
import GameBottomCTA from '../GameBottomCTA';

// ── deck primitives ──────────────────────────────────────────────
const SUITS  = ['h', 'd', 'c', 's'];
const RANKS  = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const SUIT_SYM  = { h:'♥', d:'♦', c:'♣', s:'♠' };
const RANK_DISP = { T:'10' };

function makeDeck() {
  const d = [];
  for (const r of RANKS) for (const s of SUITS) d.push(r + s);
  return d;
}
function shuffle(d) {
  const a = [...d];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function rankIdx(c) { return RANKS.indexOf(c[0]); }

// ── hand-strength helpers ─────────────────────────────────────────
function preflopStrength(cards) {
  const r1 = rankIdx(cards[0]), r2 = rankIdx(cards[1]);
  const suited = cards[0][1] === cards[1][1];
  const paired = cards[0][0] === cards[1][0];
  if (paired) return 0.5 + (Math.max(r1, r2) / 12) * 0.5;
  let s = (r1 + r2) / 24;
  if (suited) s += 0.08;
  return Math.min(1, Math.max(0, s));
}
function postflopStrength(hole, community) {
  if (community.length < 3) return preflopStrength(hole);
  try { return (10 - Hand.solve([...hole, ...community]).rank) / 9; }
  catch { return 0.3; }
}
function botDecide(strength) {
  if (Math.random() < 0.12) return 'call'; // bluff
  if (strength >= 0.65) return Math.random() < 0.93 ? 'call' : 'fold';
  if (strength >= 0.40) return Math.random() < 0.60 ? 'call' : 'fold';
  if (strength >= 0.25) return Math.random() < 0.32 ? 'call' : 'fold';
  return Math.random() < 0.10 ? 'call' : 'fold';
}

// ── card visuals ─────────────────────────────────────────────────
// sm = 60×86, md = 72×104
const CARD_DIMS = { sm: [60, 86, 11, 24], md: [72, 104, 13, 28] };

function CardFace({ card, size = 'sm' }) {
  const [w, h, fs, cs] = CARD_DIMS[size];
  const isRed = card[1] === 'h' || card[1] === 'd';
  const rank   = RANK_DISP[card[0]] || card[0];
  const suit   = SUIT_SYM[card[1]];
  return (
    <div style={{
      width: w, height: h, borderRadius: 8, background: '#fafaf6',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      border: '1px solid rgba(0,0,0,0.08)',
      position: 'relative', padding: 6, flexShrink: 0,
      color: isRed ? '#d63a3a' : '#111', fontWeight: 800,
      transition: 'transform 0.15s',
    }}>
      <div style={{ fontSize: fs, lineHeight: 1 }}>{rank}{suit}</div>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', fontSize: cs,
      }}>{suit}</div>
      <div style={{
        position: 'absolute', bottom: 6, right: 6,
        fontSize: fs, transform: 'rotate(180deg)', lineHeight: 1,
      }}>{rank}{suit}</div>
    </div>
  );
}

function CardBack({ size = 'sm' }) {
  const [w, h] = CARD_DIMS[size];
  return (
    <div style={{
      width: w, height: h, borderRadius: 8,
      background: 'repeating-linear-gradient(45deg,#2e63b8 0 4px,#224b8c 4px 8px)',
      border: '1px solid rgba(0,0,0,0.18)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)', flexShrink: 0,
    }} />
  );
}

function CardSlot({ size = 'sm' }) {
  const [w, h] = CARD_DIMS[size];
  return (
    <div style={{
      width: w, height: h, borderRadius: 8,
      border: '1.5px dashed var(--ss-border)', opacity: 0.3, flexShrink: 0,
    }} />
  );
}

// ── phase sequence ───────────────────────────────────────────────
const PHASES   = ['preflop', 'flop', 'turn', 'river'];
const PHASE_LBL = { preflop:'Pre-Flop', flop:'Flop', turn:'Turn', river:'River', end:'Showdown' };
function nextPhase(p) {
  const i = PHASES.indexOf(p);
  return i < PHASES.length - 1 ? PHASES[i + 1] : 'showdown';
}

// ── component ────────────────────────────────────────────────────
export default function HoldEm() {
  const [bankroll,  setBankroll]  = useState(1000);
  const [ante,      setAnte]      = useState(25);
  const [streetBet, setStreetBet] = useState(25);
  const [phase,     setPhase]     = useState('idle');
  const [deck,      setDeck]      = useState([]);
  const [playerHole,setPlayerHole]= useState([]);
  const [botHole,   setBotHole]   = useState([]);
  const [community, setCommunity] = useState([]);
  const [pot,       setPot]       = useState(0);
  const [result,    setResult]    = useState(null);   // { winner, delta, playerHand, botHand }
  const [message,   setMessage]   = useState('Set your ante and deal a hand.');
  const [botMsg,    setBotMsg]    = useState('');
  const [revealBot, setRevealBot] = useState(false);
  const [history,   setHistory]   = useState([]);

  const investedRef = useRef(0);

  // live hand hint for player after flop
  const playerHandHint = useMemo(() => {
    if (community.length >= 3 && playerHole.length === 2) {
      try { return Hand.solve([...playerHole, ...community]).name; }
      catch { return null; }
    }
    return null;
  }, [community, playerHole]);

  // ── game logic ─────────────────────────────────────────────────
  const deal = () => {
    if (ante <= 0 || ante > bankroll) return;
    const d = shuffle(makeDeck());
    investedRef.current = ante;
    setBankroll(b => b - ante);
    setPot(ante * 2);
    setDeck(d.slice(4));
    setPlayerHole([d[0], d[1]]);
    setBotHole([d[2], d[3]]);
    setCommunity([]);
    setRevealBot(false);
    setResult(null);
    setBotMsg('');
    setPhase('preflop');
    setMessage('Pre-flop — see the flop free, or raise.');
  };

  const endHand = (winner, finalPot, phName, bhName) => {
    setRevealBot(true);
    const invested = investedRef.current;
    let delta, msg;
    if (winner === 'tie') {
      delta = Math.floor(finalPot / 2) - invested;
      msg = `Split pot — ${phName} ties ${bhName}.`;
      setBankroll(b => b + Math.floor(finalPot / 2));
    } else if (winner === 'player') {
      delta = finalPot - invested;
      msg = phName ? `You win $${finalPot}! ${phName} beats ${bhName}.`
                   : `Bot folds — you win $${finalPot}!`;
      setBankroll(b => b + finalPot);
    } else {
      delta = -invested;
      msg = bhName ? `Bot wins with ${bhName}${phName ? ` vs your ${phName}` : ''}.`
                   : 'You folded.';
    }
    setResult({ winner, delta, playerHand: phName, botHand: bhName });
    setHistory(h => [{ winner, delta, playerHand: phName, botHand: bhName }, ...h].slice(0, 10));
    setMessage(msg);
    setPhase('end');
  };

  const doShowdown = (finalPot, comm) => {
    const usePot  = finalPot ?? pot;
    const useComm = comm ?? community;
    const ph = Hand.solve([...playerHole, ...useComm]);
    const bh = Hand.solve([...botHole,   ...useComm]);
    const winners   = Hand.winners([ph, bh]);
    const tie       = winners.length > 1;
    const playerWins = !tie && winners[0] === ph;
    endHand(tie ? 'tie' : playerWins ? 'player' : 'bot', usePot, ph.name, bh.name);
  };

  const advanceTo = (next, currentPot, comm) => {
    const usePot = currentPot ?? pot;
    if (next === 'flop') {
      const newComm = [deck[0], deck[1], deck[2]];
      setCommunity(newComm);
      setPhase('flop');
      setMessage('Flop — check or raise.');
      setBotMsg('');
    } else if (next === 'turn') {
      const newComm = [...(comm ?? community), deck[3]];
      setCommunity(newComm);
      setPhase('turn');
      setMessage('Turn — check or raise.');
      setBotMsg('');
    } else if (next === 'river') {
      const newComm = [...(comm ?? community), deck[4]];
      setCommunity(newComm);
      setPhase('river');
      setMessage('River — last chance to raise.');
      setBotMsg('');
    } else if (next === 'showdown') {
      doShowdown(usePot, comm ?? community);
    }
  };

  const playerFold = () => endHand('bot', pot, null, null);

  const playerCheck = () => {
    const next = nextPhase(phase);
    setBotMsg('Bot checks.');
    if (next === 'showdown') {
      setTimeout(() => doShowdown(pot, community), 350);
    } else {
      setTimeout(() => advanceTo(next, pot, community), 350);
    }
  };

  const playerBet = () => {
    if (streetBet <= 0 || streetBet > bankroll) return;
    const betAmt  = Math.min(streetBet, bankroll);
    investedRef.current += betAmt;
    setBankroll(b => b - betAmt);
    const newPot  = pot + betAmt;

    const strength = phase === 'preflop'
      ? preflopStrength(botHole) : postflopStrength(botHole, community);
    const decision = botDecide(strength);

    if (decision === 'fold') {
      setPot(newPot);
      setBotMsg('Bot folds!');
      setTimeout(() => endHand('player', newPot, null, null), 400);
    } else {
      const finalPot = newPot + betAmt;
      setPot(finalPot);
      setBotMsg('Bot calls.');
      const next = nextPhase(phase);
      if (next === 'showdown') {
        setTimeout(() => doShowdown(finalPot, community), 500);
      } else {
        setTimeout(() => advanceTo(next, finalPot, community), 500);
      }
    }
  };

  // ── derived state ───────────────────────────────────────────────
  const canAct    = phase !== 'idle' && phase !== 'end' && phase !== 'showdown';
  const showComm  = community.length > 0;
  const commSlots = Array.from({ length: 5 }, (_, i) => community[i] ?? null);

  const resultColor = result?.winner === 'player' ? 'var(--ss-green)'
    : result?.winner === 'bot' ? 'var(--ss-red)' : 'var(--ss-text-dim)';

  // ── render ──────────────────────────────────────────────────────
  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 10 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Texas Hold'em</h1>
        <p className="ss-sub">Heads-up vs the bot. Both ante in — best 5-of-7 at showdown wins.</p>

        <div className="ss-side-grid">
          {/* ── main game card ── */}
          <div className="ss-card" style={{ padding: 20 }}>

            {/* stats bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10,
            }}>
              <div>
                <div className="ss-stat-label">Bankroll</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>${bankroll.toLocaleString()}</div>
              </div>
              <div>
                <div className="ss-stat-label">Pot</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ss-gold)' }}>
                  ${pot.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="ss-stat-label" style={{ margin: 0 }}>Ante</span>
                  <input type="number" value={ante}
                    onChange={e => setAnte(Math.max(1, parseInt(e.target.value) || 0))}
                    disabled={phase !== 'idle'}
                    className="ss-mono"
                    style={{ width: 72, padding: '5px 8px', borderRadius: 8, background: 'var(--ss-bg-soft)', border: '1px solid var(--ss-border)', color: 'var(--ss-text)', fontSize: 14 }} />
                </div>
                {canAct && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="ss-stat-label" style={{ margin: 0 }}>Raise</span>
                    <input type="number" value={streetBet}
                      onChange={e => setStreetBet(Math.max(1, parseInt(e.target.value) || 0))}
                      className="ss-mono"
                      style={{ width: 72, padding: '5px 8px', borderRadius: 8, background: 'var(--ss-bg-soft)', border: '1px solid var(--ss-border)', color: 'var(--ss-text)', fontSize: 14 }} />
                  </div>
                )}
              </div>
            </div>

            {/* phase badge */}
            {phase !== 'idle' && (
              <div style={{
                textAlign: 'center', marginBottom: 10,
                fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'var(--ss-gold)', fontWeight: 700,
              }}>
                {PHASE_LBL[phase] || phase}
              </div>
            )}

            {/* community */}
            {showComm ? (
              <div style={{ marginBottom: 12 }}>
                <div className="ss-stat-label" style={{ marginBottom: 6, textAlign: 'center' }}>Community</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {commSlots.map((card, i) =>
                    card ? <CardFace key={i} card={card} size="sm" />
                         : <CardSlot  key={i} size="sm" />
                  )}
                </div>
              </div>
            ) : phase !== 'idle' ? (
              <div style={{
                textAlign: 'center', marginBottom: 12,
                padding: '8px 0', borderTop: '1px solid var(--ss-border-soft)',
                borderBottom: '1px solid var(--ss-border-soft)',
                fontSize: 11, color: 'var(--ss-text-muted)', letterSpacing: '0.12em',
              }}>
                FLOP &nbsp;·&nbsp; TURN &nbsp;·&nbsp; RIVER
              </div>
            ) : null}

            {/* hole cards */}
            <div style={{
              display: 'flex', justifyContent: 'space-around',
              marginBottom: 12, gap: 12,
            }}>
              {/* player */}
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 6 }}>You</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {playerHole.length
                    ? playerHole.map((c, i) => <CardFace key={i} card={c} size="sm" />)
                    : [<CardSlot key={0} size="sm" />, <CardSlot key={1} size="sm" />]}
                </div>
                {playerHandHint && (
                  <div style={{
                    marginTop: 5, fontSize: 11, fontWeight: 700,
                    color: 'var(--ss-green)',
                    background: 'rgba(74,222,128,0.08)',
                    border: '1px solid rgba(74,222,128,0.25)',
                    borderRadius: 6, padding: '2px 8px', display: 'inline-block',
                  }}>
                    {playerHandHint}
                  </div>
                )}
                {result?.playerHand && !playerHandHint && (
                  <div style={{ marginTop: 5, fontSize: 11, color: resultColor, fontWeight: 600 }}>
                    {result.playerHand}
                  </div>
                )}
              </div>

              {/* bot */}
              <div style={{ textAlign: 'center' }}>
                <div className="ss-stat-label" style={{ marginBottom: 6 }}>Bot</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {botHole.length
                    ? revealBot
                      ? botHole.map((c, i) => <CardFace key={i} card={c} size="sm" />)
                      : [<CardBack key={0} size="sm" />, <CardBack key={1} size="sm" />]
                    : [<CardSlot key={0} size="sm" />, <CardSlot key={1} size="sm" />]}
                </div>
                {result?.botHand && (
                  <div style={{ marginTop: 5, fontSize: 11, color: 'var(--ss-text-muted)', fontWeight: 500 }}>
                    {result.botHand}
                  </div>
                )}
              </div>
            </div>

            {/* bot action feedback */}
            {botMsg && !result && (
              <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 12, color: 'var(--ss-text-muted)', fontStyle: 'italic' }}>
                {botMsg}
              </div>
            )}

            {/* result / prompt */}
            <div style={{
              textAlign: 'center', marginBottom: 14,
              color: result ? resultColor : 'var(--ss-text-dim)',
              fontWeight: result ? 700 : 400, fontSize: 14, minHeight: 20,
            }}>
              {message}
            </div>

            {/* action buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {phase === 'idle' && (
                <button className="ss-btn ss-btn-primary"
                  onClick={deal} disabled={ante > bankroll || ante <= 0}
                  style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Deal Hand
                </button>
              )}

              {canAct && (
                <>
                  <button onClick={playerFold} style={{
                    minWidth: 80, height: 44, fontSize: 14,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    borderRadius: 999, border: '1px solid rgba(239,93,93,0.4)',
                    background: 'rgba(239,93,93,0.07)', color: 'var(--ss-red)',
                    cursor: 'pointer', fontFamily: 'var(--ss-font)', fontWeight: 600,
                  }}>
                    Fold
                  </button>
                  <button className="ss-btn" onClick={playerCheck}
                    style={{ minWidth: 110, height: 44, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {phase === 'preflop' ? 'See Flop' : 'Check'}
                  </button>
                  <button className="ss-btn ss-btn-primary" onClick={playerBet}
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
                  style={{ minWidth: 160, height: 44, fontSize: 13, textTransform: 'uppercase' }}>
                  Reload $1,000
                </button>
              )}
            </div>
          </div>

          {/* ── sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* history */}
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 10 }}>Recent hands</div>
              {history.length === 0 ? (
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No hands yet.</div>
              ) : history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '7px 0', borderBottom: '1px solid var(--ss-border-soft)', fontSize: 13,
                }}>
                  <div>
                    <div style={{
                      fontWeight: 600,
                      color: h.winner === 'player' ? 'var(--ss-green)'
                           : h.winner === 'bot'    ? 'var(--ss-red)'
                           : 'var(--ss-text-dim)',
                    }}>
                      {h.winner === 'player' ? '✓ Win' : h.winner === 'bot' ? '✗ Loss' : '⇌ Tie'}
                    </div>
                    {h.playerHand && <div style={{ fontSize: 11, color: 'var(--ss-text-muted)', marginTop: 2 }}>{h.playerHand}</div>}
                  </div>
                  <span className="ss-mono" style={{
                    color: h.delta > 0 ? 'var(--ss-green)' : h.delta < 0 ? 'var(--ss-red)' : 'var(--ss-text-muted)',
                    fontWeight: 600,
                  }}>
                    {h.delta > 0 ? '+' : h.delta === 0 ? '±' : '-'}${Math.abs(h.delta)}
                  </span>
                </div>
              ))}
            </div>

            {/* hand rankings */}
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 8 }}>Hand rankings</div>
              {[
                ['Royal Flush',     '10-J-Q-K-A suited'],
                ['Straight Flush',  '5 in a row, suited'],
                ['Four of a Kind',  '4 same rank'],
                ['Full House',      '3+2 of a kind'],
                ['Flush',           '5 same suit'],
                ['Straight',        '5 in a row'],
                ['Three of a Kind', '3 same rank'],
                ['Two Pair',        '2 pairs'],
                ['One Pair',        '2 same rank'],
                ['High Card',       'No match'],
              ].map(([name, desc]) => (
                <div key={name} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '3px 0', fontSize: 11,
                  borderBottom: '1px solid var(--ss-border-soft)',
                }}>
                  <span style={{ color: 'var(--ss-text-dim)', fontWeight: 600 }}>{name}</span>
                  <span style={{ color: 'var(--ss-text-muted)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <GameBottomCTA currentPath="/play/holdem" />
    </>
  );
}
