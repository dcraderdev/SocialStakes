import React, { useState, useEffect } from 'react';
import Navigation from '../Navigation';
import GameBottomCTA from '../GameBottomCTA';

// ── American wheel ────────────────────────────────────────────────
function spinWheel() { return Math.floor(Math.random() * 38); }
const displayNum = (n) => (n === 37 ? '00' : String(n));
const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function numColor(n) {
  if (n === 0 || n === 37) return 'green';
  return RED_NUMS.has(n) ? 'red' : 'black';
}

const COLOR_MAP   = { green: '#22863a', red: '#a82020', black: '#1a1a1a' };
const BORDER_MAP  = { green: 'rgba(74,222,128,0.5)', red: 'rgba(180,40,40,0.6)', black: 'rgba(255,255,255,0.18)' };

// ── payout math ───────────────────────────────────────────────────
function checkBet(betKey, result) {
  const color = numColor(result);
  const num = result === 37 ? -1 : result;
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
  return 1;
}

// ── number cell style ─────────────────────────────────────────────
function numCellStyle(n, selected, hit) {
  const c = numColor(n);
  return {
    width: 26, height: 26, borderRadius: 4,
    background: hit ? 'var(--ss-gold)' : COLOR_MAP[c],
    border: selected ? '2px solid var(--ss-gold)' : `1px solid ${BORDER_MAP[c]}`,
    color: hit ? '#1a1408' : '#f0f0f0',
    fontSize: 10, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
    transition: 'all 0.12s',
    boxShadow: selected ? '0 0 0 1px var(--ss-gold)' : 'none',
    position: 'relative',
  };
}

// ── compact wheel display ─────────────────────────────────────────
function WheelDisplay({ spinning, result, cycleNum }) {
  const showN = spinning ? cycleNum : result;
  const color = showN !== null ? numColor(showN) : null;
  return (
    <div style={{
      width: 96, height: 96, borderRadius: '50%', flexShrink: 0,
      background: 'conic-gradient(from 0deg,#1a0a0a 0 10%,#0a1a0a 10% 20%,#1a1a0a 20% 30%,#1a0a0a 30% 40%,#0a1a0a 40% 50%,#1a1a0a 50% 60%,#1a0a0a 60% 70%,#0a1a0a 70% 80%,#1a1a0a 80% 90%,#1a0a0a 90% 100%)',
      border: '3px solid var(--ss-border)',
      boxShadow: '0 0 0 1px rgba(229,179,76,0.2), 0 8px 24px rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: spinning ? 'roulette-spin 0.35s linear infinite' : 'none',
    }}>
      <div style={{
        width: 58, height: 58, borderRadius: '50%',
        background: spinning ? 'var(--ss-bg-elev)' : (color ? COLOR_MAP[color] : 'var(--ss-bg-elev)'),
        border: '2px solid rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.5)',
        transition: 'background 0.4s',
      }}>
        {showN !== null ? (
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {displayNum(showN)}
          </div>
        ) : (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>SPIN</div>
        )}
      </div>
    </div>
  );
}

// ── chip button ───────────────────────────────────────────────────
function ChipBtn({ value, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
      background: active ? 'var(--ss-gold)' : 'var(--ss-bg-soft)',
      border: `2px solid ${active ? 'var(--ss-gold)' : 'var(--ss-border)'}`,
      color: active ? '#1a1408' : 'var(--ss-text-dim)',
      fontWeight: 700, fontSize: 10, fontFamily: 'var(--ss-font)',
      transition: 'all 0.12s', flexShrink: 0,
    }}>
      ${value}
    </button>
  );
}

// ── outside bet button ────────────────────────────────────────────
function OutsideBet({ label, betKey, bets, onAdd, hitBets }) {
  const active = !!bets[betKey];
  const isHit = !!hitBets[betKey];
  return (
    <button onClick={() => onAdd(betKey)} style={{
      flex: 1, height: 38,
      borderRadius: 6, cursor: 'pointer',
      background: isHit ? 'var(--ss-gold)' : active ? 'rgba(229,179,76,0.15)' : 'var(--ss-bg-soft)',
      border: `1px solid ${active || isHit ? 'var(--ss-gold-line)' : 'var(--ss-border)'}`,
      color: isHit ? '#1a1408' : active ? 'var(--ss-gold)' : 'var(--ss-text-dim)',
      fontWeight: 700, fontSize: 12, fontFamily: 'var(--ss-font)',
      transition: 'all 0.12s', position: 'relative', whiteSpace: 'nowrap',
    }}>
      {label}
      {active && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          background: 'var(--ss-gold)', color: '#1a1408',
          borderRadius: 999, fontSize: 9, fontWeight: 800,
          padding: '1px 4px', lineHeight: 1.6,
        }}>${bets[betKey]}</span>
      )}
    </button>
  );
}

// ── main component ────────────────────────────────────────────────
function Roulette() {
  const [bankroll, setBankroll]   = useState(1000);
  const [chipSize, setChipSize]   = useState(25);
  const [bets, setBets]           = useState({});
  const [spinning, setSpinning]   = useState(false);
  const [result, setResult]       = useState(null);
  const [hitBets, setHitBets]     = useState({});
  const [cycleNum, setCycleNum]   = useState(0);
  const [history, setHistory]     = useState([]);
  const [winMsg, setWinMsg]       = useState('');
  const [loseMsg, setLoseMsg]     = useState('');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes roulette-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes result-pop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.06);opacity:1} 100%{transform:scale(1)} }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const addChip = (betKey) => {
    if (spinning) return;
    setBets(prev => ({ ...prev, [betKey]: (prev[betKey] ?? 0) + chipSize }));
  };

  const clearBets = () => {
    if (spinning) return;
    setBets({});
    setWinMsg('');
    setLoseMsg('');
  };

  const betLabel = (key) => {
    const labels = { red:'Red', black:'Black', odd:'Odd', even:'Even', low:'1–18', high:'19–36', dozen1:'1st 12', dozen2:'2nd 12', dozen3:'3rd 12' };
    if (labels[key]) return labels[key];
    return key.startsWith('num_') ? (key === 'num_00' ? '00' : key.slice(4)) : key;
  };

  const doSpin = () => {
    if (spinning || totalBet === 0 || totalBet > bankroll) return;
    setBankroll(b => b - totalBet);
    setSpinning(true);
    setResult(null);
    setHitBets({});
    setWinMsg('');
    setLoseMsg('');

    const cycleInterval = setInterval(() => setCycleNum(Math.floor(Math.random() * 38)), 90);
    const spinResult = spinWheel();

    setTimeout(() => {
      clearInterval(cycleInterval);
      setSpinning(false);
      setResult(spinResult);

      let totalWin = 0;
      const won = {};
      for (const [key, amount] of Object.entries(bets)) {
        if (checkBet(key, spinResult)) {
          totalWin += amount * (payoutMultiplier(key) + 1);
          won[key] = true;
        }
      }

      setHitBets(won);

      if (totalWin > 0) {
        setBankroll(b => b + totalWin);
        const profit = totalWin - totalBet;
        setWinMsg(`+$${profit} — ${Object.keys(won).map(betLabel).join(', ')} hit!`);
        setHistory(h => [{ n: spinResult, delta: profit }, ...h].slice(0, 14));
      } else {
        setLoseMsg(`${displayNum(spinResult)} — no winning bets.`);
        setHistory(h => [{ n: spinResult, delta: -totalBet }, ...h].slice(0, 14));
      }
    }, 2400);
  };

  // roulette grid: 3 rows (top=3, mid=2, bot=1), 12 cols
  const gridNums = [];
  for (let row = 3; row >= 1; row--) {
    const rowNums = [];
    for (let col = 0; col < 12; col++) rowNums.push(col * 3 + row);
    gridNums.push(rowNums);
  }

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div className="ss-pill ss-pill-gold" style={{ marginBottom: 10 }}>Demo grade · Math.random()</div>
        <h1 className="ss-h1" style={{ marginBottom: 4 }}>Roulette</h1>
        <p className="ss-sub" style={{ marginBottom: 14 }}>American wheel — 0, 00, and 1–36. Place chips, then spin.</p>

        <div className="ss-side-grid">
          {/* ── main card: wheel + controls + table ── */}
          <div className="ss-card" style={{ padding: 18 }}>

            {/* top row: wheel | controls */}
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 14 }}>

              {/* wheel + result */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <WheelDisplay spinning={spinning} result={result} cycleNum={cycleNum} />
                <div style={{ textAlign: 'center', minHeight: 20, width: 96 }}>
                  {winMsg && (
                    <div style={{ color: 'var(--ss-green)', fontWeight: 700, fontSize: 12, animation: 'result-pop 0.4s ease', lineHeight: 1.3 }}>{winMsg}</div>
                  )}
                  {loseMsg && !winMsg && (
                    <div style={{ color: 'var(--ss-text-muted)', fontSize: 11 }}>{loseMsg}</div>
                  )}
                  {spinning && (
                    <div style={{ color: 'var(--ss-text-muted)', fontSize: 11, letterSpacing: '0.1em' }}>SPINNING…</div>
                  )}
                </div>
              </div>

              {/* controls */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div className="ss-stat-label">Bankroll</div>
                    <div className="ss-stat-value">${bankroll.toLocaleString()}</div>
                  </div>
                  {totalBet > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div className="ss-stat-label">Total bet</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ss-gold)', fontFamily: 'var(--ss-mono)' }}>${totalBet}</div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div className="ss-stat-label" style={{ marginBottom: 5 }}>Chip size</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {[5, 10, 25, 50, 100].map(v => (
                      <ChipBtn key={v} value={v} active={chipSize === v} onClick={() => setChipSize(v)} />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="ss-btn ss-btn-primary"
                    onClick={doSpin}
                    disabled={spinning || totalBet === 0 || totalBet > bankroll}
                    style={{ flex: 1, height: 42, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {spinning ? 'Spinning…' : 'Spin'}
                  </button>
                  <button className="ss-btn"
                    onClick={clearBets}
                    disabled={spinning}
                    style={{ height: 42, fontSize: 13 }}>
                    Clear
                  </button>
                </div>

                {bankroll <= 0 && !spinning && (
                  <button className="ss-btn" onClick={() => { setBankroll(1000); setBets({}); }}
                    style={{ marginTop: 8, width: '100%', height: 38, fontSize: 13 }}>
                    Reload $1,000
                  </button>
                )}
              </div>
            </div>

            {/* divider */}
            <div style={{ borderTop: '1px solid var(--ss-border)', paddingTop: 12, marginBottom: 8 }}>
              <div className="ss-stat-label">Betting table — click to place chip</div>
            </div>

            {/* 0 and 00 */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
              {[{ n: 0, key: 'num_0' }, { n: 37, key: 'num_00' }].map(({ n, key }) => (
                <div key={key} onClick={() => addChip(key)}
                  style={{ ...numCellStyle(n, !!bets[key], hitBets[key]), width: 38, fontSize: 11 }}>
                  {displayNum(n)}
                  {bets[key] && (
                    <span style={{
                      position: 'absolute', top: -5, right: -5,
                      background: 'var(--ss-gold)', color: '#1a1408',
                      borderRadius: 999, fontSize: 8, fontWeight: 800,
                      padding: '1px 3px', lineHeight: 1.5,
                    }}>${bets[key]}</span>
                  )}
                </div>
              ))}
              <span style={{ alignSelf: 'center', marginLeft: 6, fontSize: 10, color: 'var(--ss-text-muted)' }}>pay 35:1</span>
            </div>

            {/* number grid: 3 rows × 12 cols */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 7, overflowX: 'auto' }}>
              {gridNums.map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 3 }}>
                  {row.map(n => {
                    const key = `num_${n}`;
                    return (
                      <div key={n} onClick={() => addChip(key)} style={{ ...numCellStyle(n, !!bets[key], hitBets[key]) }}>
                        {n}
                        {bets[key] && (
                          <span style={{
                            position: 'absolute', top: -4, right: -4,
                            background: 'var(--ss-gold)', color: '#1a1408',
                            borderRadius: 999, fontSize: 7, fontWeight: 800,
                            padding: '1px 2px', lineHeight: 1.5,
                          }}>${bets[key]}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* dozens — 2:1 */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
              {[
                { key: 'dozen1', label: '1st 12' },
                { key: 'dozen2', label: '2nd 12' },
                { key: 'dozen3', label: '3rd 12' },
              ].map(({ key, label }) => (
                <OutsideBet key={key} label={`${label} (2:1)`} betKey={key} bets={bets} onAdd={addChip} hitBets={hitBets} />
              ))}
            </div>

            {/* outside bets — 1:1 in one row */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
              {[
                { key: 'low',   label: '1–18' },
                { key: 'even',  label: 'Even' },
                { key: 'red',   label: '🔴 Red' },
                { key: 'black', label: '⚫ Black' },
                { key: 'odd',   label: 'Odd' },
                { key: 'high',  label: '19–36' },
              ].map(({ key, label }) => (
                <OutsideBet key={key} label={label} betKey={key} bets={bets} onAdd={addChip} hitBets={hitBets} />
              ))}
            </div>

            <div style={{ fontSize: 10, color: 'var(--ss-text-muted)' }}>
              Outside bets pay 1:1 · House edge 5.26% (American)
            </div>
          </div>

          {/* ── sidebar: history + payouts ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 10 }}>Recent spins</div>
              {history.length === 0 ? (
                <div style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No spins yet.</div>
              ) : (
                history.map((h, i) => {
                  const c = numColor(h.n);
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '5px 0', borderBottom: '1px solid var(--ss-border-soft)', fontSize: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: COLOR_MAP[c],
                          border: `1px solid ${BORDER_MAP[c]}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 700, color: '#fff',
                        }}>
                          {displayNum(h.n)}
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--ss-text-muted)', textTransform: 'capitalize' }}>{c}</span>
                      </div>
                      <span className="ss-mono" style={{ color: h.delta > 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600 }}>
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
                ['Dozen (1st/2nd/3rd 12)', '2:1'],
                ['Red / Black', '1:1'],
                ['Odd / Even', '1:1'],
                ['1–18 / 19–36', '1:1'],
              ].map(([label, payout]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, borderBottom: '1px solid var(--ss-border-soft)' }}>
                  <span style={{ color: 'var(--ss-text-dim)' }}>{label}</span>
                  <span className="ss-mono" style={{ color: 'var(--ss-gold)', fontWeight: 700 }}>{payout}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <GameBottomCTA currentPath="/play/roulette" />
    </>
  );
}

export default Roulette;
