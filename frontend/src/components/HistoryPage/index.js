import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Navigation from '../Navigation';
import { loadHistoryStats, loadHandHistory, loadFriendsLeaderboard } from '../../redux/middleware/stats';

const AVATAR_COLORS = ['purple', 'yellow', 'blue', 'green', 'pink', 'red', 'orange'];

function HistoryPage() {
  const dispatch = useDispatch();
  const routerHistory = useHistory();
  const user = useSelector((state) => state.users.user);
  const historyStats = useSelector((state) => state.stats.historyStats);
  const handHistory = useSelector((state) => state.stats.handHistory);
  const friendsLeaderboard = useSelector((state) => state.stats.friendsLeaderboard);
  const loading = useSelector((state) => state.stats.historyLoading);

  const [range, setRange] = useState('30d');

  useEffect(() => {
    if (!user) return;
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    dispatch(loadHistoryStats(days));
  }, [dispatch, user, range]);

  useEffect(() => {
    if (!user) return;
    dispatch(loadHandHistory(50));
    dispatch(loadFriendsLeaderboard());
  }, [dispatch, user]);

  const stats = historyStats || {};
  const curve = stats.curve || [];
  const hands = handHistory || [];
  const leaderboard = friendsLeaderboard || [];

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <h1 className="ss-h1">Your last {range === 'All' ? 'all time' : range}</h1>
        <p className="ss-sub">All hands cryptographically logged. Click any row to replay or verify.</p>

        {loading && <div style={{ color: 'var(--ss-text-dim)', marginBottom: 16, fontSize: 13 }}>Loading…</div>}

        <div className="ss-grid-stats">
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Hands played</div>
            <div className="ss-stat-value">{(stats.handsPlayed ?? 0).toLocaleString()}</div>
            <div className="ss-stat-sub">in selected range</div>
          </div>
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Net P&amp;L</div>
            <div className="ss-stat-value" style={{ color: (stats.netPL ?? 0) >= 0 ? 'var(--ss-green)' : 'var(--ss-red)' }}>
              {(stats.netPL ?? 0) >= 0 ? '+ ' : '− '}$ {Math.abs(stats.netPL ?? 0).toLocaleString()}
            </div>
            <div className="ss-stat-sub">in selected range</div>
          </div>
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Win rate</div>
            <div className="ss-stat-value">{(stats.winRate ?? 0).toFixed(1)}%</div>
            <div className="ss-stat-sub">House edge 0.5%</div>
          </div>
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Biggest win</div>
            <div className="ss-stat-value" style={{ color: 'var(--ss-green)' }}>+ $ {(stats.biggestWin ?? 0).toLocaleString()}</div>
            <div className="ss-stat-sub">single hand</div>
          </div>
          <div className="ss-card ss-stat-card">
            <div className="ss-stat-label">Biggest loss</div>
            <div className="ss-stat-value" style={{ color: 'var(--ss-red)' }}>− $ {Math.abs(stats.biggestLoss ?? 0).toLocaleString()}</div>
            <div className="ss-stat-sub">single hand</div>
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
            {curve.length > 1
              ? <BankrollChart points={curve} />
              : <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ss-text-muted)', fontSize: 13 }}>
                  No data yet
                </div>
            }
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 14 }}>
                Friends leaderboard · this week
              </div>
              {leaderboard.length === 0
                ? <div style={{ fontSize: 13, color: 'var(--ss-text-dim)' }}>No friends data yet.</div>
                : leaderboard.map((row, i) => (
                  <div key={row.id || i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0', borderBottom: i < leaderboard.length - 1 ? '1px solid var(--ss-border-soft)' : 'none',
                    fontSize: 13,
                  }}>
                    <span className={`ss-avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`} style={{ width: 22, height: 22, fontSize: 11 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontWeight: row.isMe ? 600 : 400 }}>
                      {row.isMe ? 'You' : row.name}
                    </span>
                    <span className="ss-mono" style={{ color: row.delta >= 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600 }}>
                      {row.delta >= 0 ? '+' : '−'} $ {Math.abs(row.delta).toLocaleString()}
                    </span>
                  </div>
                ))
              }
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
              {hands.length === 0
                ? (
                  <tr>
                    <td colSpan={7} style={{ ...td, color: 'var(--ss-text-dim)', textAlign: 'center' }}>
                      {loading ? 'Loading…' : 'No hands yet.'}
                    </td>
                  </tr>
                )
                : hands.map((h) => (
                  <tr key={h.id} style={{ cursor: 'pointer' }}
                    onClick={() => routerHistory.push(`/verify?hand=${h.id}`)}>
                    <td style={td}><span className="ss-mono">#{typeof h.id === 'string' ? h.id.slice(0, 8) : h.id}</span></td>
                    <td style={{ ...td, color: 'var(--ss-text-dim)' }}>{h.time}</td>
                    <td style={td}>{h.table}</td>
                    <td style={{ ...td, fontFamily: 'var(--ss-mono)' }}>{h.cards || '—'}</td>
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
                ))
              }
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
  if (!result) return '';
  if (result === 'Blackjack' || result === 'Win' || result.startsWith('Win')) return 'ss-pill-green';
  if (result === 'Bust' || result === 'Lose') return 'ss-pill-red';
  return '';
}

function BankrollChart({ points }) {
  const W = 720, H = 260, padding = 18;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = (W - padding * 2) / Math.max(points.length - 1, 1);
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

export default HistoryPage;
