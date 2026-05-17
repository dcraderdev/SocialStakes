import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Navigation';
import {
  loadHands, filterHands, aggregateHands, downloadCsv,
  clearHistory, GAME_LABELS,
} from '../../utils/historyStore';

const RANGES = {
  '7d':  7 * 24 * 3600 * 1000,
  '30d': 30 * 24 * 3600 * 1000,
  '90d': 90 * 24 * 3600 * 1000,
  'All': Infinity,
};

function HistoryPage() {
  const [, forceTick] = useState(0);
  const [range, setRange]   = useState('All');
  const [game, setGame]     = useState('all');
  const [outcome, setOutcome] = useState('all');

  const all = useMemo(loadHands, []);
  const now = Date.now();
  const fromTs = RANGES[range] === Infinity ? 0 : now - RANGES[range];
  const filtered = useMemo(
    () => filterHands(all, { game, outcome, fromTs }),
    [all, game, outcome, fromTs]
  );
  const stats = useMemo(() => aggregateHands(filtered), [filtered]);

  const curve = useMemo(() => buildCurve(filtered), [filtered]);

  const onClear = () => {
    if (window.confirm('Clear all local hand history?')) {
      clearHistory();
      forceTick((t) => t + 1);
    }
  };

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <h1 className="ss-h1">Your hand history</h1>
        <p className="ss-sub">Every flip, draw, and showdown is cryptographically logged. Click any row to verify.</p>

        {/* Stats grid */}
        <div className="ss-stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 22 }}>
          <Stat label="Hands played" value={stats.handsPlayed} />
          <Stat label="Total wagered" value={`$${stats.wagered.toLocaleString()}`} />
          <Stat label="Net P/L" value={`${stats.netPL >= 0 ? '+' : '−'}$${Math.abs(stats.netPL).toLocaleString()}`} color={stats.netPL >= 0 ? 'var(--ss-green)' : 'var(--ss-red)'} />
          <Stat label="Win rate" value={`${stats.winRate.toFixed(1)}%`} />
          <Stat label="Biggest win" value={`+$${stats.biggestWin.toLocaleString()}`} color="var(--ss-green)" />
          <Stat label="Biggest loss" value={`-$${Math.abs(stats.biggestLoss).toLocaleString()}`} color="var(--ss-red)" />
        </div>

        {/* Chart + Export */}
        <div className="ss-side-grid">
          <div className="ss-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600 }}>Cumulative P/L</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Object.keys(RANGES).map((r) => (
                  <button key={r} onClick={() => setRange(r)} className="ss-btn"
                    style={{
                      height: 26, padding: '0 12px', fontSize: 11,
                      background: range === r ? 'var(--ss-gold-faint)' : 'transparent',
                      border: '1px solid ' + (range === r ? 'var(--ss-gold-line)' : 'var(--ss-border)'),
                      color: range === r ? 'var(--ss-gold)' : 'var(--ss-text-dim)',
                    }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <BankrollChart points={curve} />
          </div>

          <div className="ss-card" style={{ padding: 18 }}>
            <div className="ss-stat-label" style={{ marginBottom: 8 }}>Export</div>
            <div style={{ fontSize: 13, color: 'var(--ss-text-dim)', lineHeight: 1.5, marginBottom: 14 }}>
              Download a CSV of every filtered hand, including commitment hash, seeds and nonce.
              Anyone can re-derive the outcomes independently.
            </div>
            <button
              className="ss-btn ss-btn-primary"
              style={{ width: '100%', height: 38 }}
              disabled={!filtered.length}
              onClick={() => downloadCsv(filtered)}
              data-testid="history-export-csv"
            >
              Download CSV
            </button>
            <button
              className="ss-btn"
              style={{ width: '100%', height: 32, marginTop: 8, fontSize: 12 }}
              onClick={onClear}
              disabled={!all.length}
            >
              Clear local history
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="ss-card" style={{ marginTop: 22, padding: '12px 16px', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter label="Game" value={game} setValue={setGame} options={[
            ['all', 'All games'],
            ['coinflip', 'Coin Flip'],
            ['hilo', 'Hi-Lo'],
            ['acey', 'Acey-Duecey'],
            ['holdem', "Hold'em"],
          ]} />
          <Filter label="Outcome" value={outcome} setValue={setOutcome} options={[
            ['all', 'All'],
            ['wins', 'Wins'],
            ['losses', 'Losses'],
            ['pushes', 'Pushes'],
          ]} />
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ss-text-muted)' }}>
            {filtered.length} of {all.length} hands
          </div>
        </div>

        {/* Table */}
        <div className="ss-card" style={{ marginTop: 14, padding: '8px 0', overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--ss-text-muted)' }}>
              No hands recorded yet. Play <Link to="/play/coinflip" style={{ color: 'var(--ss-gold)' }}>Coin Flip</Link>,
              {' '}<Link to="/play/hilo" style={{ color: 'var(--ss-gold)' }}>Hi-Lo</Link>,
              {' '}<Link to="/play/acey" style={{ color: 'var(--ss-gold)' }}>Acey-Duecey</Link>,
              {' '}or <Link to="/play/holdem" style={{ color: 'var(--ss-gold)' }}>Hold'em</Link> — every hand lands here automatically.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Hand', 'Time', 'Game', 'Result', 'Bet', 'Δ', 'Summary', ''].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => (
                  <tr key={h.id} data-testid="history-row">
                    <td style={td}><span className="ss-mono">#{h.id}</span></td>
                    <td style={{ ...td, color: 'var(--ss-text-dim)' }}>
                      {new Date(h.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={td}>{GAME_LABELS[h.game] || h.game}</td>
                    <td style={td}>
                      <span className={`ss-pill ${resultPill(h.delta)}`}>{h.result}</span>
                    </td>
                    <td style={{ ...td, fontFamily: 'var(--ss-mono)', color: 'var(--ss-text-dim)' }}>
                      ${h.stake}
                    </td>
                    <td style={{ ...td, color: h.delta > 0 ? 'var(--ss-green)' : h.delta < 0 ? 'var(--ss-red)' : 'var(--ss-text-dim)', fontWeight: 600 }} className="ss-mono">
                      {h.delta > 0 ? '+' : h.delta < 0 ? '−' : '±'}${Math.abs(h.delta)}
                    </td>
                    <td style={{ ...td, color: 'var(--ss-text-dim)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.summary}
                    </td>
                    <td style={td}>
                      <Link to={`/verify/${h.id}`} className="ss-pill" style={{ color: 'var(--ss-gold)', fontSize: 11 }}>
                        verify ✓
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="ss-card" style={{ padding: 14 }}>
      <div className="ss-stat-label">{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || 'var(--ss-text)' }}>{value}</div>
    </div>
  );
}

function Filter({ label, value, setValue, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="ss-stat-label" style={{ margin: 0 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          padding: '6px 10px', borderRadius: 8,
          background: 'var(--ss-bg-soft)', border: '1px solid var(--ss-border)',
          color: 'var(--ss-text)', fontSize: 13, fontFamily: 'inherit',
        }}
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

const th = {
  textAlign: 'left', padding: '12px 18px',
  color: 'var(--ss-text-muted)', fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11,
  borderBottom: '1px solid var(--ss-border)',
};
const td = {
  padding: '12px 18px',
  borderBottom: '1px solid var(--ss-border-soft)',
};

function resultPill(delta) {
  if (delta > 0) return 'ss-pill-green';
  if (delta < 0) return 'ss-pill-red';
  return '';
}

function buildCurve(hands) {
  if (!hands.length) return [0, 0];
  const sorted = [...hands].sort((a, b) => a.ts - b.ts);
  let running = 0;
  const out = [0];
  for (const h of sorted) {
    running += h.delta || 0;
    out.push(running);
  }
  return out;
}

function BankrollChart({ points }) {
  const W = 720, H = 220, padding = 18;
  if (!points || points.length < 2) {
    return (
      <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ss-text-muted)', fontSize: 13 }}>
        Play a hand to see the bankroll curve.
      </div>
    );
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = (max - min) || 1;
  const stepX = (W - padding * 2) / (points.length - 1);
  const toY = (v) => padding + (H - padding * 2) * (1 - (v - min) / range);
  const pathD = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${padding + i * stepX} ${toY(v)}`).join(' ');
  const areaD = pathD + ` L ${padding + (points.length - 1) * stepX} ${H - padding} L ${padding} ${H - padding} Z`;
  const endColor = points[points.length - 1] >= 0 ? 'var(--ss-green)' : 'var(--ss-red)';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="ss-history-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ss-gold)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--ss-gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((t, i) => (
        <line key={i} x1={padding} x2={W - padding}
          y1={padding + (H - padding * 2) * t} y2={padding + (H - padding * 2) * t}
          stroke="var(--ss-border-soft)" strokeWidth="1" />
      ))}
      <path d={areaD} fill="url(#ss-history-grad)" />
      <path d={pathD} fill="none" stroke="var(--ss-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={padding + (points.length - 1) * stepX} cy={toY(points[points.length - 1])} r="4" fill={endColor} />
    </svg>
  );
}

export default HistoryPage;
