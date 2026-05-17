import React, { useState, useRef, useEffect, useMemo } from 'react';
import Navigation from '../Navigation';

// ── deck primitives ──────────────────────────────────────────────
const SUITS = ['h', 'd', 'c', 's'];
const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
const SUIT_SYM = { h:'♥', d:'♦', c:'♣', s:'♠' };
const RANK_DISP = { T:'10' };

function makeShoe(decks = 6) {
  const shoe = [];
  for (let n = 0; n < decks; n++) {
    for (const r of RANKS) for (const s of SUITS) shoe.push(r + s);
  }
  return shoe;
}
function shuffle(d) {
  const a = [...d];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function cardRank(c) { return c[0]; }
function cardValue(r) {
  if (r === 'A') return 11;
  if (r === 'T' || r === 'J' || r === 'Q' || r === 'K') return 10;
  return parseInt(r, 10);
}
function handValue(cards) {
  let total = 0, aces = 0;
  for (const c of cards) {
    const r = cardRank(c);
    if (r === 'A') { aces++; total += 11; }
    else total += cardValue(r);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return { total, soft: aces > 0 };
}
function isBlackjack(cards) {
  return cards.length === 2 && handValue(cards).total === 21;
}

// ── card visuals ─────────────────────────────────────────────────
const CARD_DIMS = { sm: [60, 86, 11, 24], md: [72, 104, 13, 28] };

function CardFace({ card, size = 'sm' }) {
  const [w, h, fs, cs] = CARD_DIMS[size];
  const isRed = card[1] === 'h' || card[1] === 'd';
  const rank = RANK_DISP[card[0]] || card[0];
  const suit = SUIT_SYM[card[1]];
  return (
    <div style={{
      width: w, height: h, borderRadius: 8, background: '#fafaf6',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      border: '1px solid rgba(0,0,0,0.08)',
      position: 'relative', padding: 6, flexShrink: 0,
      color: isRed ? '#d63a3a' : '#111', fontWeight: 800,
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

// ── component ────────────────────────────────────────────────────
export default function Blackjack() {
  const [bankroll,  setBankroll]  = useState(1000);
  const [bet,       setBet]       = useState(25);
  const [phase,     setPhase]     = useState('idle'); // idle | player | dealer | insurance | end
  const [shoe,      setShoe]      = useState(() => shuffle(makeShoe()));
  const [hands,     setHands]     = useState([]); // [{cards,bet,doubled,stood,busted,resolved,result,delta,fromSplitAce}]
  const [activeIdx, setActiveIdx] = useState(0);
  const [dealer,    setDealer]    = useState([]);
  const [hideHole,  setHideHole]  = useState(true);
  const [insurance, setInsurance] = useState(0);
  const [message,   setMessage]   = useState('Set your bet and deal.');
  const [history,   setHistory]   = useState([]);

  const shoeRef = useRef(shoe);
  useEffect(() => { shoeRef.current = shoe; }, [shoe]);
  // Guards against double-clicks racing async state transitions.
  const actingRef = useRef(false);
  const phaseRef  = useRef('idle');
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // pull N cards from shoe, returns [drawn, remaining]
  const draw = (n) => {
    const s = shoeRef.current;
    const drawn = s.slice(0, n);
    const rest = s.slice(n);
    shoeRef.current = rest;
    setShoe(rest);
    return drawn;
  };

  // reshuffle if the shoe drops below ~25% capacity
  const ensureShoe = () => {
    if (shoeRef.current.length < 60) {
      const fresh = shuffle(makeShoe());
      shoeRef.current = fresh;
      setShoe(fresh);
    }
  };

  // ── deal ─────────────────────────────────────────────────────────
  const deal = () => {
    if (bet <= 0 || bet > bankroll) return;
    ensureShoe();
    // Deal 4 cards: player, dealer, player, dealer
    const drawn = draw(4);
    const playerCards = [drawn[0], drawn[2]];
    const dealerCards = [drawn[1], drawn[3]];

    setBankroll(b => b - bet);
    setHands([{
      cards: playerCards, bet, doubled: false, stood: false,
      busted: false, resolved: false, result: null, delta: 0, fromSplitAce: false,
    }]);
    setActiveIdx(0);
    setDealer(dealerCards);
    setHideHole(true);
    setInsurance(0);

    const playerBJ = isBlackjack(playerCards);
    const dealerUp = dealerCards[0];
    const dealerBJ = isBlackjack(dealerCards);

    // Offer insurance when dealer up-card is Ace and player does not have BJ
    if (cardRank(dealerUp) === 'A' && !playerBJ && bankroll - bet >= Math.floor(bet / 2)) {
      setPhase('insurance');
      setMessage('Dealer shows an Ace. Insurance?');
      return;
    }

    // Dealer ten-up: peek for blackjack quietly
    if (dealerBJ) {
      setHideHole(false);
      if (playerBJ) {
        // push
        finalizeRound(playerCards, dealerCards, [{
          cards: playerCards, bet, doubled: false, stood: true, busted: false,
          resolved: false, result: null, delta: 0, fromSplitAce: false, blackjack: true,
        }], 0);
        return;
      }
      finalizeRound(playerCards, dealerCards, [{
        cards: playerCards, bet, doubled: false, stood: true, busted: false,
        resolved: false, result: null, delta: 0, fromSplitAce: false,
      }], 0, /*dealerBlackjack*/ true);
      return;
    }

    if (playerBJ) {
      // instant 3:2 win
      finalizeRound(playerCards, dealerCards, [{
        cards: playerCards, bet, doubled: false, stood: true, busted: false,
        resolved: false, result: null, delta: 0, fromSplitAce: false, blackjack: true,
      }], 0);
      return;
    }

    setPhase('player');
    setMessage('Your move.');
  };

  // ── insurance ────────────────────────────────────────────────────
  const takeInsurance = (yes) => {
    const ins = yes ? Math.floor(bet / 2) : 0;
    setInsurance(ins);
    if (ins > 0) setBankroll(b => b - ins);

    const dealerBJ = isBlackjack(dealer);
    if (dealerBJ) {
      setHideHole(false);
      const playerBJ = isBlackjack(hands[0].cards);
      finalizeRound(hands[0].cards, dealer, hands, ins, /*dealerBlackjack*/ true, playerBJ);
      return;
    }

    // Dealer doesn't have BJ — insurance lost (already deducted), continue
    setPhase('player');
    setMessage(ins > 0 ? 'No dealer blackjack. Insurance lost.' : 'Your move.');
  };

  // ── player actions ───────────────────────────────────────────────
  const updateHand = (idx, patch) => {
    setHands(hs => hs.map((h, i) => i === idx ? { ...h, ...patch } : h));
  };

  const advanceAfterAction = (updatedHands, idx) => {
    const h = updatedHands[idx];
    const total = handValue(h.cards).total;
    const finished = h.busted || h.stood || h.doubled || total >= 21;
    if (!finished) return;

    if (idx + 1 < updatedHands.length) {
      setActiveIdx(idx + 1);
      const next = updatedHands[idx + 1];
      if (next.stood || next.busted || handValue(next.cards).total >= 21) {
        setTimeout(() => advanceAfterAction(updatedHands, idx + 1), 200);
      } else {
        setMessage(`Hand ${idx + 2} — your move.`);
      }
    } else {
      runDealer(updatedHands);
    }
  };

  const hit = () => {
    if (phaseRef.current !== 'player' || actingRef.current) return;
    actingRef.current = true;
    const idx = activeIdx;
    const [c] = draw(1);
    const newCards = [...hands[idx].cards, c];
    const v = handValue(newCards).total;
    const busted = v > 21;
    const next = hands.map((h, i) => i === idx ? {
      ...h, cards: newCards, busted, stood: !busted && v === 21,
    } : h);
    setHands(next);
    if (busted) {
      setMessage(`Hand ${idx + 1} busts at ${v}.`);
    } else if (v === 21) {
      setMessage('21!');
    }
    setTimeout(() => {
      advanceAfterAction(next, idx);
      actingRef.current = false;
    }, 250);
  };

  const stand = () => {
    if (phaseRef.current !== 'player' || actingRef.current) return;
    actingRef.current = true;
    const idx = activeIdx;
    const next = hands.map((h, i) => i === idx ? { ...h, stood: true } : h);
    setHands(next);
    setTimeout(() => {
      advanceAfterAction(next, idx);
      actingRef.current = false;
    }, 200);
  };

  const canDouble = () => {
    if (phase !== 'player') return false;
    const h = hands[activeIdx];
    if (!h || h.cards.length !== 2 || h.fromSplitAce) return false;
    return bankroll >= h.bet;
  };

  const doubleDown = () => {
    if (!canDouble() || actingRef.current) return;
    actingRef.current = true;
    const idx = activeIdx;
    const h = hands[idx];
    setBankroll(b => b - h.bet);
    const [c] = draw(1);
    const newCards = [...h.cards, c];
    const v = handValue(newCards).total;
    const next = hands.map((hh, i) => i === idx ? {
      ...hh, cards: newCards, bet: hh.bet * 2, doubled: true,
      busted: v > 21, stood: true,
    } : hh);
    setHands(next);
    setMessage(v > 21 ? `Doubled — busts at ${v}.` : `Doubled — stands at ${v}.`);
    setTimeout(() => {
      advanceAfterAction(next, idx);
      actingRef.current = false;
    }, 350);
  };

  const canSplit = () => {
    if (phase !== 'player') return false;
    const h = hands[activeIdx];
    if (!h || h.cards.length !== 2) return false;
    if (cardRank(h.cards[0]) !== cardRank(h.cards[1])) return false;
    if (hands.length >= 4) return false;
    return bankroll >= h.bet;
  };

  const split = () => {
    if (!canSplit() || actingRef.current) return;
    actingRef.current = true;
    const idx = activeIdx;
    const h = hands[idx];
    setBankroll(b => b - h.bet);

    const isAce = cardRank(h.cards[0]) === 'A';
    // Each split hand gets one fresh card immediately
    const [card1, card2] = draw(2);
    const handA = {
      cards: [h.cards[0], card1],
      bet: h.bet, doubled: false, stood: isAce, busted: false,
      resolved: false, result: null, delta: 0, fromSplitAce: isAce,
    };
    const handB = {
      cards: [h.cards[1], card2],
      bet: h.bet, doubled: false, stood: isAce, busted: false,
      resolved: false, result: null, delta: 0, fromSplitAce: isAce,
    };

    const next = [
      ...hands.slice(0, idx),
      handA,
      handB,
      ...hands.slice(idx + 1),
    ];
    setHands(next);

    if (isAce) {
      setMessage('Split Aces — one card each, auto-stand.');
      setTimeout(() => { runDealer(next); actingRef.current = false; }, 400);
      return;
    }

    setMessage('Hand 1 — your move.');
    if (handValue(handA.cards).total === 21) {
      const auto = next.map((hh, i) => i === idx ? { ...hh, stood: true } : hh);
      setHands(auto);
      setTimeout(() => { advanceAfterAction(auto, idx); actingRef.current = false; }, 250);
    } else {
      actingRef.current = false;
    }
  };

  // ── dealer ───────────────────────────────────────────────────────
  const runDealer = (finalHands) => {
    setPhase('dealer');
    setHideHole(false);

    const allBusted = finalHands.every(h => h.busted || handValue(h.cards).total > 21);
    if (allBusted) {
      finalizeRound(null, dealer, finalHands, insurance);
      return;
    }

    // Dealer hits until total >= 17 (stand on all 17)
    let dCards = [...dealer];
    const dealStep = () => {
      const v = handValue(dCards).total;
      if (v < 17) {
        const [c] = draw(1);
        dCards = [...dCards, c];
        setDealer(dCards);
        setTimeout(dealStep, 450);
      } else {
        finalizeRound(null, dCards, finalHands, insurance);
      }
    };
    setTimeout(dealStep, 500);
  };

  // ── resolve hands ────────────────────────────────────────────────
  const finalizeRound = (_unused, dealerCards, finalHands, insBet, dealerBlackjack = false, playerBlackjack = false) => {
    const dVal = handValue(dealerCards).total;
    const dBJ = dealerBlackjack || isBlackjack(dealerCards);
    let totalDelta = 0;
    let totalReturn = 0;

    const resolved = finalHands.map(h => {
      const pVal = handValue(h.cards).total;
      const pBJ = (h.blackjack || isBlackjack(h.cards)) && !h.fromSplitAce;
      let result, delta;
      // Defensive: any hand over 21 is a loss regardless of stored flag (handles
      // races where stand/bust flags get out of sync with cards).
      if (h.busted || pVal > 21) {
        result = 'loss'; delta = -h.bet;
      } else if (pBJ && !dBJ) {
        // 3:2 payout
        result = 'blackjack';
        delta = Math.floor(h.bet * 1.5);
        totalReturn += h.bet + Math.floor(h.bet * 1.5); // original bet back + 1.5x
      } else if (pBJ && dBJ) {
        result = 'push'; delta = 0; totalReturn += h.bet;
      } else if (dBJ) {
        result = 'loss'; delta = -h.bet;
      } else if (dVal > 21) {
        result = 'win'; delta = h.bet; totalReturn += h.bet * 2;
      } else if (pVal > dVal) {
        result = 'win'; delta = h.bet; totalReturn += h.bet * 2;
      } else if (pVal < dVal) {
        result = 'loss'; delta = -h.bet;
      } else {
        result = 'push'; delta = 0; totalReturn += h.bet;
      }
      totalDelta += delta;
      return { ...h, resolved: true, result, delta };
    });

    // Insurance pays 2:1 if dealer BJ
    let insMsg = '';
    if (insBet > 0) {
      if (dBJ) {
        totalReturn += insBet * 3; // bet back + 2x
        totalDelta += insBet * 2;
        insMsg = ` Insurance pays $${insBet * 2}.`;
      } else {
        totalDelta -= insBet;
        insMsg = ` Insurance lost.`;
      }
    }

    setHands(resolved);
    if (totalReturn > 0) setBankroll(b => b + totalReturn);

    // Build message
    const lines = resolved.map((h, i) => {
      const tag = h.result === 'win' ? '✓ Win'
                : h.result === 'loss' ? '✗ Loss'
                : h.result === 'blackjack' ? '★ Blackjack'
                : '⇌ Push';
      return resolved.length > 1 ? `H${i + 1}: ${tag}` : tag;
    });
    const headline = totalDelta > 0 ? `+$${totalDelta}` : totalDelta < 0 ? `-$${Math.abs(totalDelta)}` : 'Push';
    setMessage(`${headline} · ${lines.join(' · ')}${insMsg}`);

    setHistory(h => [{
      delta: totalDelta,
      hands: resolved.map(r => ({ result: r.result, total: handValue(r.cards).total, bet: r.bet })),
      dealerTotal: dVal,
      dealerBlackjack: dBJ,
    }, ...h].slice(0, 10));

    setPhase('end');
  };

  // ── reset hand ───────────────────────────────────────────────────
  const newHand = () => {
    setHands([]);
    setDealer([]);
    setActiveIdx(0);
    setHideHole(true);
    setInsurance(0);
    setPhase('idle');
    setMessage('Set your bet and deal.');
  };

  const reload = () => {
    setBankroll(1000);
    setHands([]);
    setDealer([]);
    setActiveIdx(0);
    setHideHole(true);
    setInsurance(0);
    setPhase('idle');
    setMessage('Reloaded $1,000. Good luck!');
  };

  // ── derived ──────────────────────────────────────────────────────
  const activeHand = hands[activeIdx];
  const showActions = phase === 'player';

  const dealerDisplayTotal = useMemo(() => {
    if (!dealer.length) return null;
    if (hideHole) {
      const upRank = cardRank(dealer[0]);
      const v = upRank === 'A' ? 11 : cardValue(upRank);
      return v;
    }
    return handValue(dealer).total;
  }, [dealer, hideHole]);

  const resultColor = (r) =>
    r === 'win' || r === 'blackjack' ? 'var(--ss-green)' :
    r === 'loss' ? 'var(--ss-red)' :
    r === 'push' ? 'var(--ss-text-dim)' : 'var(--ss-text-dim)';

  // ── render ──────────────────────────────────────────────────────
  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 10 }}>Demo grade · Local shoe</div>
        <h1 className="ss-h1">Blackjack</h1>
        <p className="ss-sub">Heads-up vs the dealer. Blackjack pays 3:2 · Dealer stands on all 17 · 6-deck shoe.</p>

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
                <div className="ss-stat-label">Bet</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ss-gold)' }}>
                  ${(hands.length > 0 ? hands.reduce((s, h) => s + h.bet, 0) : bet).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="ss-stat-label" style={{ margin: 0 }}>Wager</span>
                  <input type="number" value={bet}
                    onChange={e => setBet(Math.max(1, parseInt(e.target.value) || 0))}
                    disabled={phase !== 'idle'}
                    className="ss-mono"
                    style={{ width: 80, padding: '5px 8px', borderRadius: 8, background: 'var(--ss-bg-soft)', border: '1px solid var(--ss-border)', color: 'var(--ss-text)', fontSize: 14 }} />
                </div>
                {phase === 'idle' && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[10, 25, 100, 500].map(v => (
                      <button key={v} className="ss-btn" onClick={() => setBet(Math.min(v, bankroll))}
                        style={{ minWidth: 38, height: 28, fontSize: 11, padding: '0 6px' }}>
                        ${v}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* dealer */}
            <div style={{ marginBottom: 14 }}>
              <div className="ss-stat-label" style={{ marginBottom: 6, textAlign: 'center' }}>
                Dealer {dealerDisplayTotal != null && `· ${dealerDisplayTotal}${hideHole ? '+' : ''}`}
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', minHeight: 86 }}>
                {dealer.length === 0 ? (
                  <>
                    <CardSlot size="sm" />
                    <CardSlot size="sm" />
                  </>
                ) : dealer.map((c, i) => {
                  if (i === 1 && hideHole) return <CardBack key={i} size="sm" />;
                  return <CardFace key={i} card={c} size="sm" />;
                })}
              </div>
            </div>

            {/* player hands */}
            <div style={{ marginBottom: 14 }}>
              <div className="ss-stat-label" style={{ marginBottom: 6, textAlign: 'center' }}>You</div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                {hands.length === 0 ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <CardSlot size="sm" />
                    <CardSlot size="sm" />
                  </div>
                ) : hands.map((h, i) => {
                  const v = handValue(h.cards);
                  const isActive = i === activeIdx && phase === 'player';
                  return (
                    <div key={i} style={{
                      padding: 8, borderRadius: 10,
                      border: isActive ? '2px solid var(--ss-gold)' : '1px solid var(--ss-border-soft)',
                      background: isActive ? 'rgba(255,200,80,0.06)' : 'transparent',
                    }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {h.cards.map((c, j) => <CardFace key={j} card={c} size="sm" />)}
                      </div>
                      <div style={{
                        marginTop: 5, fontSize: 11, textAlign: 'center', fontWeight: 700,
                        color: h.resolved ? resultColor(h.result)
                             : h.busted ? 'var(--ss-red)'
                             : 'var(--ss-text-dim)',
                      }}>
                        {v.total}{v.soft && v.total <= 21 ? ' soft' : ''}
                        {h.doubled && ' · Doubled'}
                        {h.resolved && h.result === 'blackjack' && ' · BJ'}
                        {h.resolved && ` · ${h.result === 'win' ? '+' : h.result === 'loss' ? '-' : ''}$${Math.abs(h.delta)}`}
                        {' · '}${h.bet}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* message */}
            <div style={{
              textAlign: 'center', marginBottom: 14,
              color: phase === 'end' ? 'var(--ss-text)' : 'var(--ss-text-dim)',
              fontWeight: phase === 'end' ? 700 : 400, fontSize: 14, minHeight: 20,
            }}>
              {message}
            </div>

            {/* action buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {phase === 'idle' && (
                <button className="ss-btn ss-btn-primary"
                  onClick={deal} disabled={bet > bankroll || bet <= 0}
                  style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Deal
                </button>
              )}

              {phase === 'insurance' && (
                <>
                  <button className="ss-btn ss-btn-primary" onClick={() => takeInsurance(true)}
                    style={{ minWidth: 130, height: 44, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Insurance ${Math.floor(bet / 2)}
                  </button>
                  <button className="ss-btn" onClick={() => takeInsurance(false)}
                    style={{ minWidth: 110, height: 44, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    No Insurance
                  </button>
                </>
              )}

              {showActions && (
                <>
                  <button className="ss-btn ss-btn-primary" onClick={hit}
                    style={{ minWidth: 90, height: 44, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Hit
                  </button>
                  <button className="ss-btn" onClick={stand}
                    style={{ minWidth: 90, height: 44, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Stand
                  </button>
                  <button className="ss-btn" onClick={doubleDown} disabled={!canDouble()}
                    style={{ minWidth: 90, height: 44, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: canDouble() ? 1 : 0.4 }}>
                    Double
                  </button>
                  <button className="ss-btn" onClick={split} disabled={!canSplit()}
                    style={{ minWidth: 90, height: 44, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: canSplit() ? 1 : 0.4 }}>
                    Split
                  </button>
                </>
              )}

              {phase === 'dealer' && (
                <div style={{ color: 'var(--ss-text-muted)', fontStyle: 'italic', alignSelf: 'center' }}>
                  Dealer playing…
                </div>
              )}

              {phase === 'end' && bankroll > 0 && (
                <button className="ss-btn ss-btn-primary" onClick={newHand}
                  style={{ minWidth: 140, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  New Hand
                </button>
              )}

              {phase === 'end' && bankroll <= 0 && (
                <button className="ss-btn" onClick={reload}
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
                      color: h.delta > 0 ? 'var(--ss-green)'
                           : h.delta < 0 ? 'var(--ss-red)'
                           : 'var(--ss-text-dim)',
                    }}>
                      {h.delta > 0 ? '✓ Win' : h.delta < 0 ? '✗ Loss' : '⇌ Push'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ss-text-muted)', marginTop: 2 }}>
                      Dealer {h.dealerTotal}{h.dealerBlackjack ? ' · BJ' : ''}
                    </div>
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

            {/* rules */}
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 8 }}>Rules</div>
              {[
                ['Blackjack', 'Pays 3:2'],
                ['Insurance', 'Pays 2:1'],
                ['Dealer', 'Stands on all 17'],
                ['Double', 'Any first 2 cards'],
                ['Split', 'Same rank only'],
                ['Split Aces', 'One card each'],
                ['Shoe', '6 decks'],
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
    </>
  );
}
