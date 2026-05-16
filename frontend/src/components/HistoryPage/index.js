import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Navigation from '../Navigation';

/**
 * "Your last 30 days" history dashboard. Mirrors 04-history.jpg in the
 * portfolio reference. For now this uses synthesized data — the underlying
 * Hands / Rounds tables are populated in the database, but the API for
 * surfacing them client-side isn't wired up. Real wiring is tracked as a
 * follow-up.
 */
function HistoryPage() {
  const user = useSelector((state) => state.users.user);
  const [range, setRange] = useState('30d');

  const data = useMemo(() => generateMockHistory(), []);
  const stats = useMemo(() => deriveStats(data), [data]);

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <h1 className="ss-h1">Your last 30 days</h1>
        <p className="ss-sub">All hands cryptographically logged. Click any row to replay or verify.</p>

        <div className="ss-grid-stats">
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Hands played</div>
            <div className="ss-stat-value">{stats.handsPlayed.toLocaleString()}</div>
            <div className="ss-stat-sub">+{stats.handsDelta} from prior month</div>
          </div>
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Net P&amp;L</div>
            <div className="ss-stat-value" style={{ color: stats.netPL >= 0 ? 'var(--ss-green)' : 'var(--ss-red)' }}>
              {stats.netPL >= 0 ? '+ ' : '- '}$ {Math.abs(stats.netPL).toLocaleString()}
            </div>
            <div className="ss-stat-sub">All-time + $4,820</div>
          </div>
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Win rate</div>
            <div className="ss-stat-value">{stats.winRate.toFixed(1)}%</div>
            <div className="ss-stat-sub">House edge 0.5%</div>
          </div>
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Best session</div>
            <div className="ss-stat-value" style={{ color: 'var(--ss-green)' }}>+ $ {stats.bestSession.amount}</div>
            <div className="ss-stat-sub">{stats.bestSession.table}</div>
          </div>
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Worst session</div>
            <div className="ss-stat-value" style={{ color: 'var(--ss-red)' }}>− $ {stats.worstSession.amount}</div>
            <div className="ss-stat-sub">{stats.worstSession.table}</div>
          </div>
        </div>

        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 600 }}>Bankroll curve</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['7d', '30d', '90d', 'All'].map(r => (
                  <button key={r} onClick={() => setRange(r)}
                    style={{
                      padding: '4px 10px', borderRadius: 999, fontSize: 12,
                      background: range === r ? 'var(--ss-gold-faint)' : 'transparent',
                      border: '1px solid ' + (range === r ? 'var(--ss-gold-line)' : 'var(--ss-border)'),
                      color: range === r ? 'var(--ss-gold)' : 'var(--ss-text-dim)',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <BankrollChart points={data.curve} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 14 }}>Friends leaderboard · May</div>
              {data.leaderboard.map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: i < data.leaderboard.length - 1 ? '1px solid var(--ss-border-soft)' : 'none',
                  fontSize: 13,
                }}>
                  <span className={`ss-avatar ${row.color}`} style={{ width: 22, height: 22, fontSize: 11 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{row.name}</span>
                  <span className="ss-mono" style={{ color: row.delta >= 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600 }}>
                    {row.delta >= 0 ? '+' : '−'} $ {Math.abs(row.delta).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 8 }}>Export</div>
              <div style={{ fontSize: 13, color: 'var(--ss-text-dim)', lineHeight: 1.5, marginBottom: 14 }}>
                Download a signed CSV of every hand. Verifiable against the public seed log.
              </div>
              <button className="ss-btn ss-btn-primary" style={{ width: '100%', height: 40 }} disabled>
                Download CSV (signed)
              </button>
            </div>
          </div>
        </div>

        <div className="ss-card" style={{ marginTop: 22, padding: '8px 0', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Hand', 'Time', 'Table', 'Cards', 'Result', 'Δ', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px 20px',
                    color: 'var(--ss-text-muted)', fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11,
                    borderBottom: '1px solid var(--ss-border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.hands.map((h) => (
                <tr key={h.id}>
                  <td style={td}><span className="ss-mono">#{h.id}</span></td>
                  <td style={{ ...td, color: 'var(--ss-text-dim)' }}>{h.time}</td>
                  <td style={td}>{h.table}</td>
                  <td style={{ ...td, fontFamily: 'var(--ss-mono)' }}>{h.cards}</td>
                  <td style={td}>
                    <span className={`ss-pill ${resultPill(h.result)}`}>{h.result}</span>
                  </td>
                  <td style={{ ...td, color: h.delta >= 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600 }} className="ss-mono">
                    {h.delta >= 0 ? '+' : '−'} {Math.abs(h.delta)}
                  </td>
                  <td style={td}>
                    <span className="ss-pill" style={{ color: 'var(--ss-text-muted)', fontSize: 11 }}>verify ✓</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const td = {
  padding: '12px 20px',
  borderBottom: '1px solid var(--ss-border-soft)',
};

function resultPill(result) {
  if (result === 'Blackjack' || result === 'Win' || result.startsWith('Win')) return 'ss-pill-green';
  if (result === 'Bust' || result === 'Lose') return 'ss-pill-red';
  return '';
}

function BankrollChart({ points }) {
  const W = 720, H = 260, padding = 18;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = (W - padding * 2) / (points.length - 1);
  const toY = (v) => padding + (H - padding * 2) * (1 - (v - min) / range);
  const pathD = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${padding + i * stepX} ${toY(v)}`).join(' ');
  const areaD = pathD + ` L ${padding + (points.length - 1) * stepX} ${H - padding} L ${padding} ${H - padding} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="ssgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ss-gold)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--ss-gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {[0, 0.33, 0.66, 1].map((t, i) => (
        <line key={i} x1={padding} x2={W - padding} y1={padding + (H - padding * 2) * t} y2={padding + (H - padding * 2) * t}
          stroke="var(--ss-border-soft)" strokeWidth="1" />
      ))}
      <path d={areaD} fill="url(#ssgrad)" />
      <path d={pathD} fill="none" stroke="var(--ss-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={padding + (points.length - 1) * stepX} cy={toY(points[points.length - 1])} r="4" fill="var(--ss-gold)" />
    </svg>
  );
}

function generateMockHistory() {
  let v = 3000;
  const curve = [];
  for (let i = 0; i < 30; i++) {
    v += Math.round((Math.sin(i / 3) * 80) + (Math.random() - 0.4) * 140);
    curve.push(v);
  }
  const hands = [];
  const tables = ['High Tide', 'Whale Watch', 'Beginners\' Beach', 'Sara\'s table'];
  const results = ['Win', 'Bust', 'Blackjack', 'Push', 'Win × 2', 'Lose'];
  for (let i = 0; i < 14; i++) {
    const r = results[Math.floor(Math.random() * results.length)];
    const delta = r === 'Blackjack' ? 300 : r === 'Win' ? 100 : r === 'Win × 2' ? 400 : r === 'Push' ? 0 : r === 'Bust' ? -200 : -100;
    hands.push({
      id: 142 - i,
      time: `${14 - Math.floor(i / 4)}:${String((33 - i * 2) % 60).padStart(2, '0')}`,
      table: tables[i % tables.length],
      cards: ['Q♦ 5♣ → 8♣', 'A♥ K♣', 'J♠ J♦ split → 21, 18', '9♣ 9♣ → 18', 'K♥ 7♣ → 17', '4♣ 7♣ → 11 dbl → 21'][i % 6],
      result: r,
      delta,
    });
  }
  const leaderboard = [
    { name: 'Marcus', delta: 4210, color: 'purple' },
    { name: 'You', delta: 1820, color: 'yellow' },
    { name: 'Sara', delta: 820, color: 'blue' },
    { name: 'Leo', delta: 312, color: 'green' },
    { name: 'Avery', delta: -94, color: 'pink' },
    { name: 'June', delta: -640, color: 'red' },
  ];
  return { curve, hands, leaderboard };
}

function deriveStats(data) {
  return {
    handsPlayed: 1428,
    handsDelta: 312,
    netPL: 1820,
    winRate: 46.4,
    bestSession: { amount: 640, table: 'High Tide · May 4' },
    worstSession: { amount: 180, table: 'Whale Watch · May 9' },
  };
}

export default HistoryPage;
