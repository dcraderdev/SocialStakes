import React, { useState, useEffect } from 'react';
import Navigation from '../Navigation';

// ── American wheel ────────────────────────────────────────────────
// spin() returns 0–37 where 37 = "00"
function spin() { return Math.floor(Math.random() * 38); }

// convert raw spin value to display string
const displayNum = (n) => (n === 37 ? '00' : String(n));

// red numbers on an American wheel
const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function numColor(n) {
  if (n === 0 || n === 37) return 'green';
  return RED_NUMS.has(n) ? 'red' : 'black';
}

// ── payout math ───────────────────────────────────────────────────
const COLOR_MAP = { green: '#22863a', red: '#d63a3a', black: '#888' };
const BG_MAP    = { green: 'rgba(34,134,58,0.15)', red: 'rgba(214,58,58,0.12)', black: 'rgba(255,255,255,0.05)' };
const BORDER_MAP = { green: 'rgba(74,222,128,0.5)', red: 'rgba(214,58,58,0.5)', black: 'rgba(255,255,255,0.18)' };

function checkBet(betKey, result) {
  const color = numColor(result);
  const num = result === 37 ? -1 : result; // -1 = 00, treat as non-number for odd/even/high/low
  switch (betKey) {
    case 'red':    return color === 'red';
    case 'black':  return color === 'black';
    case 'odd':    return num > 0 && num % 2 === 1;
    case 'even':   return num > 0 && num % 2 === 0;
    case 'low':    return num >= 1 && num <= 18;
    case 'high':   return num >= 19 && num <= 36;
    case 'dozen1': return num >= 1 && num <= 12;
    case 'dozen2': return num >= 13 && num <= 24;
    case 'dozen3': return num >= 25 && num <= 36;
    default:
      if (betKey.startsWith('num_')) {
        const betN = betKey === 'num_00' ? 37 : parseInt(betKey.slice(4));
        return result === betN;
      }
      return false;
  }
}

function payoutMultiplier(betKey) {
  if (betKey.startsWith('num_')) return 35;
  if (['dozen1','dozen2','dozen3'].includes(betKey)) return 2;
  return 1; // red/black/odd/even/low/high
}

// ── helper to style a number cell ────────────────────────────────
function numCellStyle(n, selected, hit) {
  const c = numColor(n);
  return {
    width: 32, height: 32, borderRadius: 6,
    background: hit ? 'var(--ss-gold)' : c === 'green' ? 'rgba(34,134,58,0.85)' : c === 'red' ? '#a82020' : '#1a1a1a',
    border: selected ? '2px solid var(--ss-gold)' : `1px solid ${c === 'green' ? 'rgba(74,222,128,0.5)' : c === 'red' ? 'rgba(180,40,40,0.6)' : 'rgba(255,255,255,0.15)'}`,
    color: hit ? '#1a1408' : '#f0f0f0',
    fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    transition: 'all 0.15s',
    boxShadow: selected ? '0 0 0 1px var(--ss-gold)' : 'none',
  };
}

// ── outside bet button ────────────────────────────────────────────
function OutsideBet({ label, betKey, bets, onAdd, hitKey }) {
  const active = !!bets[betKey];
  const isHit = hitKey === betKey;
  return (
    <button onClick={() => onAdd(betKey)} style={{
      flex: 1, minWidth: 72, height: 44,
      borderRadius: 8, cursor: 'pointer',
      background: isHit ? 'var(--ss-gold)' : active ? 'rgba(229,179,76,0.15)' : 'var(--ss-bg-soft)',
      border: `1px solid ${active || isHit ? 'var(--ss-gold-line)' : 'var(--ss-border)'}`,
      color: isHit ? '#1a1408' : active ? 'var(--ss-gold)' : 'var(--ss-text-dim)',
      fontWeight: 700, fontSize: 13, fontFamily: 'var(--ss-font)',
      transition: 'all 0.15s',
      position: 'relative',
    }}>
      {label}
      {active && (
        <span style={{
          position: 'absolute', top: -7, right: -7,
          background: 'var(--ss-gold)', color: '#1a1408',
          borderRadius: 999, fontSize: 10, fontWeight: 800,
          padding: '1px 5px', lineHeight: 1.6,
        }}>
          ${bets[betKey]}
        </span>
      )}
    </button>
  );
}

// ── wheel animation ───────────────────────────────────────────────
function WheelDisplay({ spinning, result, cycleNum }) {
  const displayResult = result !== null ? result : null;
  const showN = spinning ? cycleNum : displayResult;
  const color = showN !== null ? numColor(showN) : null;

  return (
    <div style={{
      width: 160, height: 160, borderRadius: '50%', margin: '0 auto 24px',
      background: 'conic-gradient(from 0deg, #1a0a0a 0 10%, #0a1a0a 10% 20%, #1a1a0a 20% 30%, #1a0a0a 30% 40%, #0a1a0a 40% 50%, #1a1a0a 50% 60%, #1a0a0a 60% 70%, #0a1a0a 70% 80%, #1a1a0a 80% 90%, #1a0a0a 90% 100%)',
      border: '4px solid var(--ss-wood-2)',
      boxShadow: '0 0 0 2px var(--ss-wood-1), 0 20px 50px rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      animation: spinning ? 'roulette-spin 0.4s linear infinite' : 'none',
      transition: 'animation 0.3s',
    }}>
      {/* center pocket */}
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: spinning ? 'var(--ss-bg-elev)' : (color ? COLOR_MAP[color] : 'var(--ss-bg-elev)'),
        border: '3px solid var(--ss-wood-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.5)',
        transition: 'background 0.4s',
      }}>
        {showN !== null ? (
          <>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {displayNum(showN)}
            </div>
            {!spinning && color && (
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginTop: 2 }}>
                {color}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>SPIN</div>
        )}
      </div>

      {/* ball indicator dot */}
      {!spinning && result !== null && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
        }} />
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────
function Roulette() {
  const [bankroll, setBankroll] = useState(1000);
  const [chipSize, setChipSize] = useState(25);
  const [bets, setBets] = useState({});     // { betKey: amount }
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [hitBets, setHitBets] = useState({});
  const [cycleNum, setCycleNum] = useState(0);
  const [history, setHistory] = useState([]);
  const [winMsg, setWinMsg] = useState('');
  const [loseMsg, setLoseMsg] = useState('');

  // inject keyframes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes roulette-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes result-pop {
        0%   { transform: scale(0.7); opacity: 0; }
        60%  { transform: scale(1.08); opacity: 1; }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const addChip = (betKey) => {
    if (spinning) return;
    setBets(prev => {
      const cur = prev[betKey] ?? 0;
      return { ...prev, [betKey]: cur + chipSize };
    });
  };

  const clearBets = () => { if (!spinning) { setBets({}); setWinMsg(''); setLoseMsg(''); } };

  const doSpin = () => {
    if (spinning || totalBet === 0 || totalBet > bankroll) return;
    setBankroll(b => b - totalBet);
    setSpinning(true);
    setResult(null);
    setHitBets({});
    setWinMsg('');
    setLoseMsg('');

    // rapid number cycling
    const cycleInterval = setInterval(() => {
      setCycleNum(Math.floor(Math.random() * 38));
    }, 100);

    const spinResult = spin();

    setTimeout(() => {
      clearInterval(cycleInterval);
      setSpinning(false);
      setResult(spinResult);

      // evaluate all placed bets
      let totalWin = 0;
      const won = {};
      for (const [key, amount] of Object.entries(bets)) {
        if (checkBet(key, spinResult)) {
          const mult = payoutMultiplier(key);
          totalWin += amount * (mult + 1); // original + winnings
          won[key] = true;
        }
      }

      setHitBets(won);

      if (totalWin > 0) {
        setBankroll(b => b + totalWin);
        const profit = totalWin - totalBet;
        setWinMsg(`+$${profit} — ${Object.keys(won).map(k => betLabel(k)).join(', ')} hit!`);
        setHistory(h => [{ n: spinResult, delta: profit }, ...h].slice(0, 14));
      } else {
        setLoseMsg(`${displayNum(spinResult)} — no winning bets.`);
        setHistory(h => [{ n: spinResult, delta: -totalBet }, ...h].slice(0, 14));
      }
    }, 2600);
  };

  const betLabel = (key) => {
    const labels = {
      red:'Red', black:'Black', odd:'Odd', even:'Even',
      low:'1–18', high:'19–36',
      dozen1:'1st 12', dozen2:'2nd 12', dozen3:'3rd 12',
    };
    if (labels[key]) return labels[key];
    if (key.startsWith('num_')) return key === 'num_00' ? '00' : key.slice(4);
    return key;
  };

  // build 3-column number grid (3 rows × 12 cols, bottom-up: 1,2,3 / 4,5,6...)
  // standard roulette layout: col 1 = [1,2,3], col 2 = [4,5,6], ...
  // displayed as: row1=[3,6,9...36], row2=[2,5,8...35], row3=[1,4,7...34]
  const gridNums = [];
  for (let row = 3; row >= 1; row--) {
    const rowNums = [];
    for (let col = 0; col < 12; col++) {
      rowNums.push(col * 3 + row);
    }
    gridNums.push(rowNums);
  }

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 12 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1">Roulette</h1>
        <p className="ss-sub">American wheel — 0, 00, and 1–36. Place chips, then spin.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18 }}>
          {/* ── left: wheel + table ── */}
          <div>
            {/* wheel */}
            <div className="ss-card" style={{ padding: 28, marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: '0 0 auto' }}>
                  <WheelDisplay spinning={spinning} result={result} cycleNum={cycleNum} />

                  {/* result message */}
                  <div style={{ textAlign: 'center', minHeight: 28, marginBottom: 8 }}>
                    {winMsg && (
                      <div style={{ color: 'var(--ss-green)', fontWeight: 700, fontSize: 14, animation: 'result-pop 0.4s ease' }}>{winMsg}</div>
                    )}
                    {loseMsg && !winMsg && (
                      <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>{loseMsg}</div>
                    )}
                    {spinning && (
                      <div style={{ color: 'var(--ss-text-muted)', fontSize: 13, letterSpacing: '0.1em' }}>SPINNING…</div>
                    )}
                  </div>
                </div>

                {/* bankroll + chip controls */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div className="ss-stat-label">Bankroll</div>
                    <div className="ss-stat-value">${bankroll.toLocaleString()}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div className="ss-stat-label" style={{ marginBottom: 6 }}>Chip size</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[5, 10, 25, 50, 100].map(v => (
                        <button key={v} onClick={() => setChipSize(v)} style={{
                          width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
                          background: chipSize === v ? 'var(--ss-gold)' : 'var(--ss-bg-soft)',
                          border: `2px solid ${chipSize === v ? 'var(--ss-gold)' : 'var(--ss-border)'}`,
                          color: chipSize === v ? '#1a1408' : 'var(--ss-text-dim)',
                          fontWeight: 700, fontSize: 11, fontFamily: 'var(--ss-font)',
                        }}>
                          ${v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {totalBet > 0 && (
                    <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--ss-text-dim)' }}>
                      Total bet: <span style={{ color: 'var(--ss-gold)', fontWeight: 700 }}>${totalBet}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="ss-btn ss-btn-primary"
                      onClick={doSpin}
                      disabled={spinning || totalBet === 0 || totalBet > bankroll}
                      style={{ minWidth: 100, height: 44, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {spinning ? 'Spinning…' : 'Spin'}
                    </button>
                    <button className="ss-btn"
                      onClick={clearBets}
                      disabled={spinning}
                      style={{ height: 44, fontSize: 13 }}>
                      Clear
                    </button>
                  </div>

                  {bankroll <= 0 && !spinning && (
                    <button className="ss-btn" onClick={() => { setBankroll(1000); setBets({}); }}
                      style={{ marginTop: 10, height: 40, fontSize: 13 }}>
                      Reload $1,000
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── betting table ── */}
            <div className="ss-card" style={{ padding: 20 }}>
              <div className="ss-stat-label" style={{ marginBottom: 12 }}>Betting table — click to place chip</div>

              {/* 0 and 00 row */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {[{ n: 0, key: 'num_0' }, { n: 37, key: 'num_00' }].map(({ n, key }) => (
                  <div key={key}
                    onClick={() => addChip(key)}
                    style={{ ...numCellStyle(n, !!bets[key], hitBets[key]), width: 48, position: 'relative' }}>
                    {displayNum(n)}
                    {bets[key] && (
                      <span style={{
                        position: 'absolute', top: -6, right: -6,
                        background: 'var(--ss-gold)', color: '#1a1408',
                        borderRadius: 999, fontSize: 9, fontWeight: 800,
                        padding: '1px 4px', lineHeight: 1.5,
                      }}>${bets[key]}</span>
                    )}
                  </div>
                ))}
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', paddingLeft: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--ss-text-muted)' }}>0 & 00 pay 35:1</span>
                </div>
              </div>

              {/* number grid: 3 rows × 12 cols */}
              <div style={{ overflowX: 'auto', marginBottom: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 430 }}>
                  {gridNums.map((row, ri) => (
                    <div key={ri} style={{ display: 'flex', gap: 4 }}>
                      {row.map(n => {
                        const key = `num_${n}`;
                        const isHit = hitBets[key];
                        return (
                          <div key={n} onClick={() => addChip(key)} style={{ ...numCellStyle(n, !!bets[key], isHit), position: 'relative' }}>
                            {n}
                            {bets[key] && (
                              <span style={{
                                position: 'absolute', top: -5, right: -5,
                                background: 'var(--ss-gold)', color: '#1a1408',
                                borderRadius: 999, fontSize: 8, fontWeight: 800,
                                padding: '1px 3px', lineHeight: 1.5,
                              }}>${bets[key]}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* dozens */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {[
                  { key: 'dozen1', label: '1st 12' },
                  { key: 'dozen2', label: '2nd 12' },
                  { key: 'dozen3', label: '3rd 12' },
                ].map(({ key, label }) => (
                  <OutsideBet key={key} label={label} betKey={key} bets={bets} onAdd={addChip} hitKey={hitBets[key] ? key : null} />
                ))}
                <span style={{ alignSelf: 'center', marginLeft: 4, fontSize: 11, color: 'var(--ss-text-muted)', whiteSpace: 'nowrap' }}>pays 2:1</span>
              </div>

              {/* outside bets */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                {[
                  { key: 'low', label: '1–18' },
                  { key: 'even', label: 'Even' },
                  { key: 'red', label: '🔴 Red' },
                  { key: 'black', label: '⚫ Black' },
                  { key: 'odd', label: 'Odd' },
                  { key: 'high', label: '19–36' },
                ].map(({ key, label }) => (
                  <OutsideBet key={key} label={label} betKey={key} bets={bets} onAdd={addChip} hitKey={hitBets[key] ? key : null} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ss-text-muted)', marginTop: 6 }}>Outside bets pay 1:1</div>
            </div>
          </div>

          {/* ── right: history ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 12 }}>Recent spins</div>
              {history.length === 0 ? (
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No spins yet.</div>
              ) : (
                history.map((h, i) => {
                  const c = numColor(h.n);
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 0', borderBottom: '1px solid var(--ss-border-soft)', fontSize: 13,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: c === 'green' ? '#22863a' : c === 'red' ? '#a82020' : '#1a1a1a',
                          border: `1px solid ${BORDER_MAP[c]}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: '#fff',
                        }}>
                          {displayNum(h.n)}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--ss-text-muted)', textTransform: 'capitalize' }}>{c}</span>
                      </div>
                      <span className="ss-mono" style={{
                        color: h.delta > 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600,
                      }}>
                        {h.delta > 0 ? '+' : ''}${h.delta}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 8 }}>Payouts</div>
              {[
                ['Single number', '35:1'],
                ['Dozen (12 nums)', '2:1'],
                ['Red / Black', '1:1'],
                ['Odd / Even', '1:1'],
                ['1–18 / 19–36', '1:1'],
              ].map(([label, payout]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, borderBottom: '1px solid var(--ss-border-soft)' }}>
                  <span style={{ color: 'var(--ss-text-dim)' }}>{label}</span>
                  <span className="ss-mono" style={{ color: 'var(--ss-gold)', fontWeight: 700 }}>{payout}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ss-text-muted)' }}>
                House edge: 5.26% (American). 0 and 00 are both green and not odd/even/red/black.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Roulette;
