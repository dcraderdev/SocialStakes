import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { List } from 'react-window';
import Navigation from '../Navigation';
import './HistoryPage.css';

// ─── constants ────────────────────────────────────────────────────────────────

const GAME_TYPES  = ['All games', 'Blackjack', "Hold'em", 'Hi-Lo', 'Acey-Deucey', 'Coin Flip'];
const RESULT_OPTS = ['All results', 'Wins', 'Losses', 'Blackjacks', 'Streaks'];
const DATE_RANGES = ['7d', '30d', '90d', 'All', 'Custom'];
const ROW_HEIGHT  = 52;
const LIST_HEIGHT = 520;
// col template: hand# | time | table | cards (flex) | result | Δ | verify
const COL_TPL = '76px 86px 148px minmax(0,1fr) 116px 84px 68px';

// ─── main component ───────────────────────────────────────────────────────────

function HistoryPage() {
  useSelector((s) => s.users.user);

  const [range,        setRange]        = useState('30d');
  const [customStart,  setCustomStart]  = useState('');
  const [customEnd,    setCustomEnd]    = useState('');
  const [gameFilter,   setGameFilter]   = useState('All games');
  const [resultFilter, setResultFilter] = useState('All results');
  const [hoveredIdx,   setHoveredIdx]   = useState(null);

  const listRef = useRef(null); // ListImperativeAPI in v2
  const allData = useMemo(() => generateMockHistory(), []);

  // ── filtered hands ──────────────────────────────────────────────────────────
  const filteredHands = useMemo(() => {
    let hands = allData.hands;

    const now = allData.today;
    let after = null, before = null;
    if (range === '7d')  after = new Date(now - 7  * 86400000);
    if (range === '30d') after = new Date(now - 30 * 86400000);
    if (range === '90d') after = new Date(now - 90 * 86400000);
    if (range === 'Custom') {
      if (customStart) after  = new Date(customStart);
      if (customEnd)   before = new Date(customEnd + 'T23:59:59');
    }
    if (after)  hands = hands.filter(h => h.ts >= after);
    if (before) hands = hands.filter(h => h.ts <= before);

    if (gameFilter !== 'All games')    hands = hands.filter(h => h.gameType === gameFilter);
    if (resultFilter === 'Wins')       hands = hands.filter(h => h.delta > 0);
    if (resultFilter === 'Losses')     hands = hands.filter(h => h.delta < 0);
    if (resultFilter === 'Blackjacks') hands = hands.filter(h => h.result === 'Blackjack');
    if (resultFilter === 'Streaks')    hands = hands.filter(h => h.inStreak);

    return hands;
  }, [allData, range, customStart, customEnd, gameFilter, resultFilter]);

  // ── chart slice ─────────────────────────────────────────────────────────────
  const chartSlice = useMemo(() => {
    const c = allData.curve;
    if (range === '7d')  return { points: c.slice(-8),  startDay: c.length - 8  };
    if (range === '90d') return { points: c,              startDay: 0             };
    if (range === 'All') return { points: c,              startDay: 0             };
    return                      { points: c.slice(-31), startDay: c.length - 31 };
  }, [allData.curve, range]);

  // ── derived stats + streaks ─────────────────────────────────────────────────
  const stats   = useMemo(() => deriveStats(filteredHands),   [filteredHands]);
  const streaks = useMemo(() => computeStreaks(filteredHands), [filteredHands]);

  // ── chart click → scroll list to that day ──────────────────────────────────
  const handleChartClick = useCallback((pointIdx) => {
    const targetDay = chartSlice.startDay + pointIdx;
    const idx = filteredHands.findIndex(h => h.dayIndex === targetDay);
    if (idx !== -1 && listRef.current) {
      listRef.current.scrollToRow({ index: idx, align: 'start' });
    }
  }, [chartSlice.startDay, filteredHands]);

  // ── csv export ──────────────────────────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const header = 'Hand,Date,Time,Game,Table,Cards,Result,Delta';
    const rows   = filteredHands.map(h =>
      [h.id, h.dateStr, h.time, h.gameType, h.table, `"${h.cards}"`, h.result, h.delta].join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `social-stakes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredHands]);

  return (
    <>
      <Navigation />
      <div className="ss-page">

        {/* ── page header ───────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: 12, marginBottom: 20,
        }}>
          <div>
            <h1 className="ss-h1">Game History</h1>
            <p className="ss-sub" style={{ margin: 0 }}>
              All hands cryptographically logged · click any row to replay or verify
            </p>
          </div>
          <button
            className="ss-btn ss-btn-primary"
            onClick={handleExportCSV}
            style={{ height: 40, paddingInline: 20, gap: 8, display: 'flex', alignItems: 'center', marginTop: 4 }}
          >
            <i className="fa-solid fa-download" style={{ fontSize: 13 }} />
            Export CSV
          </button>
        </div>

        {/* ── filter bar ────────────────────────────────────────────────────── */}
        <div className="hp-filter-row">
          <div className="hp-range-group">
            {DATE_RANGES.map(r => (
              <button
                key={r}
                className={`hp-range-btn${range === r ? ' hp-range-btn--active' : ''}`}
                onClick={() => setRange(r)}
              >{r}</button>
            ))}
          </div>

          {range === 'Custom' && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="hp-date-input"
              />
              <span style={{ color: 'var(--ss-text-muted)', fontSize: 12 }}>–</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="hp-date-input"
              />
            </div>
          )}

          <select
            value={gameFilter}
            onChange={e => setGameFilter(e.target.value)}
            className="hp-select"
          >
            {GAME_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            value={resultFilter}
            onChange={e => setResultFilter(e.target.value)}
            className="hp-select"
          >
            {RESULT_OPTS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <span style={{
            marginLeft: 'auto', fontSize: 12,
            color: 'var(--ss-text-muted)', alignSelf: 'center', whiteSpace: 'nowrap',
          }}>
            {filteredHands.length.toLocaleString()} hands
          </span>
        </div>

        {/* ── stat cards ────────────────────────────────────────────────────── */}
        <div className="ss-grid-stats" style={{ marginBottom: 22 }}>
          <StatCard
            label="Hands played"
            value={stats.handsPlayed.toLocaleString()}
            sub={`+${stats.handsDelta} from prior month`}
          />
          <StatCard
            label="Net P&L"
            value={`${stats.netPL >= 0 ? '+ ' : '− '}$ ${Math.abs(stats.netPL).toLocaleString()}`}
            color={stats.netPL >= 0 ? 'var(--ss-green)' : 'var(--ss-red)'}
            sub="All-time + $4,820"
          />
          <StatCard
            label="Win rate"
            value={`${stats.winRate.toFixed(1)}%`}
            sub="House edge 0.5%"
          />
          <StatCard
            label="Best session"
            value={`+ $ ${stats.bestSession.amount.toLocaleString()}`}
            color="var(--ss-green)"
            sub={stats.bestSession.label}
          />
          <StatCard
            label="Worst session"
            value={`− $ ${stats.worstSession.amount.toLocaleString()}`}
            color="var(--ss-red)"
            sub={stats.worstSession.label}
          />
        </div>

        {/* ── bankroll chart + friends sidebar ──────────────────────────────── */}
        <div className="ss-side-grid" style={{ marginBottom: 22 }}>
          <div className="ss-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 16 }}>Bankroll curve</div>
            <BankrollChart
              points={chartSlice.points}
              hoveredIdx={hoveredIdx}
              onHover={setHoveredIdx}
              onPointClick={handleChartClick}
            />
            <div style={{
              marginTop: 8, fontSize: 11, color: 'var(--ss-text-muted)',
              textAlign: 'center',
              opacity: hoveredIdx !== null ? 1 : 0,
              transition: 'opacity 0.15s',
            }}>
              Click to jump to that day's hands
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="ss-card">
              <div className="ss-stat-label" style={{ marginBottom: 14 }}>
                Friends leaderboard · May
              </div>
              {allData.leaderboard.map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0',
                  borderBottom: i < allData.leaderboard.length - 1
                    ? '1px solid var(--ss-border-soft)' : 'none',
                  fontSize: 13,
                }}>
                  <span className={`ss-avatar ${row.color}`} style={{ width: 22, height: 22, fontSize: 11 }}>
                    {i + 1}
                  </span>
                  <span style={{ flex: 1 }}>{row.name}</span>
                  <span className="ss-mono" style={{
                    color: row.delta >= 0 ? 'var(--ss-green)' : 'var(--ss-red)',
                    fontWeight: 600,
                  }}>
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
              <button
                className="ss-btn ss-btn-primary"
                style={{ width: '100%', height: 40 }}
                onClick={handleExportCSV}
              >
                Download CSV (signed)
              </button>
            </div>
          </div>
        </div>

        {/* ── streak highlight cards ─────────────────────────────────────────── */}
        <div className="hp-streak-grid">
          <StreakCard type="best"  streak={streaks.best} />
          <StreakCard type="worst" streak={streaks.worst} />
        </div>

        {/* ── virtualized hand log ──────────────────────────────────────────── */}
        <div className="ss-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* column header */}
          <div style={{
            display: 'grid', gridTemplateColumns: COL_TPL,
            padding: '11px 20px', borderBottom: '1px solid var(--ss-border)',
          }}>
            {['Hand', 'Time', 'Table', 'Cards', 'Result', 'Δ', ''].map(h => (
              <div key={h} style={{
                color: 'var(--ss-text-muted)', fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11,
              }}>{h}</div>
            ))}
          </div>

          {/* virtualized body */}
          <div className="hp-log-scroll">
            {filteredHands.length === 0 ? (
              <div style={{
                padding: '64px 20px', textAlign: 'center',
                color: 'var(--ss-text-muted)', fontSize: 14,
              }}>
                No hands match the current filters.
              </div>
            ) : (
              <List
                listRef={listRef}
                style={{ height: LIST_HEIGHT, width: '100%' }}
                rowCount={filteredHands.length}
                rowHeight={ROW_HEIGHT}
                rowComponent={HandRow}
                rowProps={{ hands: filteredHands }}
                overscanCount={8}
              />
            )}
          </div>

          {/* footer */}
          <div style={{
            padding: '10px 20px', borderTop: '1px solid var(--ss-border-soft)',
            fontSize: 12, color: 'var(--ss-text-muted)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>
              Showing {filteredHands.length.toLocaleString()} of {allData.hands.length.toLocaleString()} hands
            </span>
            <span style={{ fontSize: 11 }}>virtualized · react-window</span>
          </div>
        </div>

      </div>
    </>
  );
}

// ─── hand row (outside component to stay stable across renders) ───────────────

const HandRow = React.memo(function HandRow({ index, style, hands }) {
  const h      = hands[index];
  const isEven = index % 2 === 0;

  return (
    <div
      className="hp-hand-row"
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: COL_TPL,
        padding: '0 20px',
        alignItems: 'center',
        borderBottom: '1px solid var(--ss-border-soft)',
        fontSize: 13,
        background: isEven ? 'transparent' : 'rgba(255,255,255,0.015)',
        cursor: 'pointer',
        boxSizing: 'border-box',
      }}
    >
      <span className="ss-mono" style={{ color: 'var(--ss-text-muted)', fontSize: 12 }}>
        #{h.id}
      </span>
      <span style={{ color: 'var(--ss-text-dim)', fontSize: 12 }}>
        {h.time}
      </span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
        {h.table}
      </span>
      <span style={{
        fontFamily: 'var(--ss-mono)', fontSize: 12,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8,
      }}>
        {h.cards}
      </span>
      <span className={`ss-pill ${resultPill(h.result)}`} style={{ width: 'fit-content', fontSize: 11 }}>
        {h.result}
      </span>
      <span className="ss-mono" style={{
        color:      h.delta > 0 ? 'var(--ss-green)' : h.delta < 0 ? 'var(--ss-red)' : 'var(--ss-text-muted)',
        fontWeight: 600,
      }}>
        {h.delta > 0 ? '+' : h.delta < 0 ? '−' : ''} {Math.abs(h.delta)}
      </span>
      <span className="ss-pill" style={{ color: 'var(--ss-text-muted)', fontSize: 11, width: 'fit-content' }}>
        verify ✓
      </span>
    </div>
  );
});

// ─── bankroll chart with hover tooltip + click-to-jump ────────────────────────

function BankrollChart({ points, hoveredIdx, onHover, onPointClick }) {
  const W = 720, H = 220, PAD = 32;
  const min  = Math.min(...points);
  const max  = Math.max(...points);
  const span = (max - min) || 1;
  const toX  = i => PAD + i  * (W - PAD * 2) / Math.max(points.length - 1, 1);
  const toY  = v => PAD + (H - PAD * 2) * (1 - (v - min) / span);

  const pathD = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`)
    .join(' ');
  const areaD = `${pathD} L ${toX(points.length - 1).toFixed(1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const idx  = Math.round(frac * (points.length - 1));
    onHover(Math.max(0, Math.min(points.length - 1, idx)));
  }, [points.length, onHover]);

  const hx           = hoveredIdx !== null ? toX(hoveredIdx) : null;
  const hy           = hoveredIdx !== null ? toY(points[hoveredIdx]) : null;
  const tooltipPct   = hx !== null ? (hx / W * 100) : 0;
  const tooltipRight = hoveredIdx !== null && hoveredIdx > points.length * 0.65;

  const yLabels = [0, 0.5, 1].map(t => ({
    y: PAD + (H - PAD * 2) * t,
    v: Math.round(min + span * (1 - t)),
  }));

  return (
    <div style={{ position: 'relative' }}>
      {hoveredIdx !== null && (
        <div style={{
          position: 'absolute',
          left: `${tooltipPct.toFixed(1)}%`,
          top: 4,
          transform: tooltipRight ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)',
          background: 'var(--ss-bg-elev-2)',
          border: '1px solid var(--ss-border)',
          borderRadius: 8,
          padding: '7px 12px',
          fontSize: 12,
          zIndex: 20,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: 'var(--ss-shadow-sm)',
        }}>
          <div style={{ color: 'var(--ss-text-muted)', fontSize: 11, marginBottom: 3 }}>
            Day {hoveredIdx + 1}
          </div>
          <div style={{
            color: 'var(--ss-gold)', fontWeight: 700, fontSize: 15,
            fontVariantNumeric: 'tabular-nums',
          }}>
            $ {points[hoveredIdx].toLocaleString()}
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', cursor: hoveredIdx !== null ? 'pointer' : 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => onHover(null)}
        onClick={() => hoveredIdx !== null && onPointClick(hoveredIdx)}
      >
        <defs>
          <linearGradient id="hp-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--ss-gold)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--ss-gold)" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {[0, 0.33, 0.66, 1].map((t, i) => (
          <line key={i}
            x1={PAD} x2={W - PAD}
            y1={PAD + (H - PAD * 2) * t} y2={PAD + (H - PAD * 2) * t}
            stroke="var(--ss-border-soft)" strokeWidth="1"
          />
        ))}

        {yLabels.map(({ y, v }, i) => (
          <text key={i}
            x={PAD - 6} y={y + 4}
            textAnchor="end" fontSize="10"
            fill="var(--ss-text-muted)"
            fontFamily="ui-monospace,monospace"
          >
            {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
          </text>
        ))}

        <path d={areaD} fill="url(#hp-grad)" />
        <path
          d={pathD} fill="none"
          stroke="var(--ss-gold)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        />
        <circle
          cx={toX(points.length - 1)} cy={toY(points[points.length - 1])}
          r="4" fill="var(--ss-gold)"
        />

        {hoveredIdx !== null && (
          <>
            <line
              x1={hx} y1={PAD} x2={hx} y2={H - PAD}
              stroke="var(--ss-border)" strokeWidth="1" strokeDasharray="4 3"
            />
            <circle
              cx={hx} cy={hy} r="5.5"
              fill="var(--ss-gold)"
              stroke="var(--ss-bg-elev)" strokeWidth="2.5"
            />
          </>
        )}

        {/* full-area transparent overlay keeps events uniform */}
        <rect x={0} y={0} width={W} height={H} fill="transparent" />
      </svg>
    </div>
  );
}

// ─── streak card ──────────────────────────────────────────────────────────────

function StreakCard({ type, streak }) {
  const isBest = type === 'best';
  const color  = isBest ? 'var(--ss-green)' : 'var(--ss-red)';
  const icon   = isBest ? 'fa-fire-flame-curved' : 'fa-arrow-trend-down';
  const total  = streak.hands.reduce((s, h) => s + Math.abs(h.delta), 0);

  return (
    <div className="ss-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <i className={`fa-solid ${icon}`} style={{ color, fontSize: 13 }} />
        <div className="ss-stat-label" style={{ margin: 0 }}>
          {isBest ? 'Best win streak' : 'Worst loss streak'}
        </div>
      </div>

      {streak.length > 0 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', color, lineHeight: 1 }}>
              {streak.length}
            </span>
            <span style={{ fontSize: 14, color: 'var(--ss-text-dim)', fontWeight: 600, paddingBottom: 4 }}>
              in a row
            </span>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ss-text-muted)' }}>
            {isBest ? '+' : '−'} $ {total.toLocaleString()} total
            {streak.hands[0]?.gameType ? ` · ${streak.hands[0].gameType}` : ''}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--ss-text-muted)', marginTop: 4 }}>
          No streak data in this range.
        </div>
      )}
    </div>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, sub }) {
  return (
    <div className="ss-card ss-stat-card">
      <div className="ss-stat-label">{label}</div>
      <div className="ss-stat-value" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="ss-stat-sub">{sub}</div>}
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function resultPill(result) {
  if (result === 'Blackjack')                              return 'ss-pill-gold';
  if (result === 'Win' || result === 'Win × 2')            return 'ss-pill-green';
  if (['Bust', 'Lose', 'Fold'].includes(result))           return 'ss-pill-red';
  return '';
}

function deriveStats(hands) {
  if (hands.length === 0) {
    return {
      handsPlayed: 0, handsDelta: 0, netPL: 0, winRate: 0,
      bestSession:  { amount: 0, label: '—' },
      worstSession: { amount: 0, label: '—' },
    };
  }

  const netPL   = hands.reduce((s, h) => s + h.delta, 0);
  const wins    = hands.filter(h => h.delta > 0).length;
  const winRate = (wins / hands.length) * 100;

  const sessions = {};
  for (const h of hands) {
    const key = `${h.dateStr}|${h.table}`;
    if (!sessions[key]) sessions[key] = { amount: 0, table: h.table, dateStr: h.dateStr };
    sessions[key].amount += h.delta;
  }

  const list  = Object.values(sessions);
  const best  = list.reduce((a, b) => b.amount > a.amount ? b : a);
  const worst = list.reduce((a, b) => b.amount < a.amount ? b : a);

  return {
    handsPlayed: hands.length,
    handsDelta:  Math.floor(hands.length * 0.22),
    netPL,
    winRate,
    bestSession:  { amount: Math.abs(best.amount),  label: `${best.table} · ${best.dateStr.slice(5)}`   },
    worstSession: { amount: Math.abs(worst.amount), label: `${worst.table} · ${worst.dateStr.slice(5)}` },
  };
}

function computeStreaks(hands) {
  let best  = { length: 0, hands: [] };
  let worst = { length: 0, hands: [] };
  let curW  = [], curL = [];

  for (let i = hands.length - 1; i >= 0; i--) {
    const h = hands[i];
    if      (h.delta > 0) { curW.push(h); curL = []; }
    else if (h.delta < 0) { curL.push(h); curW = []; }
    else                  { curW = [];    curL = []; }
    if (curW.length > best.length)  best  = { length: curW.length, hands: [...curW] };
    if (curL.length > worst.length) worst = { length: curL.length, hands: [...curL] };
  }

  return { best, worst };
}

// ─── mock data generator ──────────────────────────────────────────────────────

function generateMockHistory() {
  const TABLES = [
    'High Tide', 'Whale Watch', "Beginner's Beach", "Sara's Table",
    'Diamond Suite', 'The Rail', 'Low Stakes Lounge', 'VIP Room',
  ];
  const WEIGHTED_GAMES = [
    { type: 'Blackjack',    w: 60 },
    { type: "Hold'em",      w: 20 },
    { type: 'Hi-Lo',        w: 10 },
    { type: 'Acey-Deucey', w:  5  },
    { type: 'Coin Flip',    w:  5  },
  ];
  const BJ_CARDS = [
    'Q♦ 5♣ → 8♣', 'A♥ K♣', 'J♠ J♦ split → 21/18',
    '9♣ 9♣ → 18', 'K♥ 7♣ → 17', '4♣ 7♣ dbl → 21',
    '8♦ 3♥ → 19', '5♠ 6♣ dbl → 20', 'A♦ 5♥ → 18',
    '6♣ 8♦ → 21', '3♣ 3♦ split', 'A♣ 8♠',
  ];
  const HE_CARDS = [
    'A♥ K♠ — top pair', '9♦ 9♣ — set on flop', '7♣ 8♣ — flush',
    'K♦ Q♣ — two pair', '3♥ 3♠ — trip threes', 'A♠ J♦ — straight',
  ];
  const HL_CARDS = ['8 — High', 'K — Low', '5 — Low', 'J — High', '4 — High'];
  const AD_CARDS = ['3–J spread', '5–Q spread', '2–9 spread', '7–K spread'];

  function pickWeighted(arr) {
    const total = arr.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    for (const x of arr) { r -= x.w; if (r <= 0) return x.type; }
    return arr[0].type;
  }

  function getCards(gt) {
    if (gt === 'Blackjack')    return BJ_CARDS[Math.floor(Math.random() * BJ_CARDS.length)];
    if (gt === "Hold'em")      return HE_CARDS[Math.floor(Math.random() * HE_CARDS.length)];
    if (gt === 'Hi-Lo')        return HL_CARDS[Math.floor(Math.random() * HL_CARDS.length)];
    if (gt === 'Acey-Deucey') return AD_CARDS[Math.floor(Math.random() * AD_CARDS.length)];
    return 'H / T';
  }

  function getOutcome(gt) {
    const r = Math.random();
    if (gt === 'Blackjack') {
      if (r < 0.055) return 'Blackjack';
      if (r < 0.44)  return 'Win';
      if (r < 0.82)  return 'Bust';
      if (r < 0.90)  return 'Push';
      return 'Lose';
    }
    if (gt === "Hold'em") {
      if (r < 0.38) return 'Win';
      if (r < 0.75) return 'Lose';
      return 'Fold';
    }
    if (r < 0.44) return 'Win';
    if (r < 0.88) return 'Lose';
    return 'Push';
  }

  function getDelta(result, gt) {
    const stakes = gt === 'Blackjack'  ? [50, 100, 150, 200]
                 : gt === "Hold'em"    ? [100, 200, 500]
                 : [25, 50, 75];
    const stake = stakes[Math.floor(Math.random() * stakes.length)];
    if (result === 'Blackjack') return Math.round(stake * 1.5);
    if (result === 'Win')       return stake;
    if (['Lose', 'Bust', 'Fold'].includes(result)) return -stake;
    return 0;
  }

  const today    = new Date('2026-05-16T12:00:00');
  let   idCtr    = 10001;
  let   bankroll = 3200;
  const curve    = [bankroll];
  const hands    = [];

  for (let day = 89; day >= 0; day--) {
    const d = new Date(today);
    d.setDate(d.getDate() - day);
    const dateStr  = d.toISOString().slice(0, 10);
    const dayIndex = 89 - day;

    const n = Math.floor(Math.random() * 18) + 5;
    let dayPL = 0;

    for (let j = 0; j < n; j++) {
      const hour   = Math.floor(Math.random() * 13) + 9;
      const min    = Math.floor(Math.random() * 60);
      const gt     = pickWeighted(WEIGHTED_GAMES);
      const result = getOutcome(gt);
      const dv     = getDelta(result, gt);
      dayPL += dv;

      hands.push({
        id:       idCtr++,
        ts:       new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, min),
        dateStr,
        dayIndex,
        time:     `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
        gameType: gt,
        table:    TABLES[Math.floor(Math.random() * TABLES.length)],
        cards:    getCards(gt),
        result,
        delta:    dv,
        inStreak: false,
      });
    }

    bankroll = Math.max(0, bankroll + dayPL);
    curve.push(Math.round(bankroll));
  }

  hands.sort((a, b) => b.ts - a.ts);

  // mark hands that belong to a run of 3+ same-direction results
  let winRun = 0, loseRun = 0;
  for (let i = hands.length - 1; i >= 0; i--) {
    const h = hands[i];
    if      (h.delta > 0) { winRun++;  loseRun = 0; }
    else if (h.delta < 0) { loseRun++; winRun  = 0; }
    else                  { winRun = 0; loseRun = 0; }
    if (winRun >= 3 || loseRun >= 3) h.inStreak = true;
  }

  const leaderboard = [
    { name: 'Marcus', delta:  4210, color: 'purple' },
    { name: 'You',    delta:  1820, color: 'yellow' },
    { name: 'Sara',   delta:   820, color: 'blue'   },
    { name: 'Leo',    delta:   312, color: 'green'  },
    { name: 'Avery',  delta:   -94, color: 'pink'   },
    { name: 'June',   delta:  -640, color: 'red'    },
  ];

  return { curve, hands, leaderboard, today };
}

export default HistoryPage;
