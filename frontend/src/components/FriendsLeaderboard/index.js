import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { csrfFetch } from '../../redux/middleware/csrf';
import Navigation from '../Navigation';
import './FriendsLeaderboard.css';

const AVATAR_COLORS = [
  '#f4a8c6', '#f6c553', '#74d5a0', '#b58cf2', '#7fb6ff', '#ee7878',
];

function avatarColor(username) {
  if (!username) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = username.charCodeAt(i) + ((h << 5) - h);
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function fmtPL(v) {
  const sign = v >= 0 ? '+' : '-';
  const abs = Math.abs(v);
  const str = abs >= 10000
    ? `${(abs / 1000).toFixed(1)}k`
    : abs.toLocaleString();
  return `${sign}${str}`;
}

const PERIODS = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

const CHAMPION_LABEL = {
  week: 'Weekly Champion',
  month: 'Monthly Champion',
  all: 'All-Time Champion',
};

const FriendsLeaderboard = () => {
  const user = useSelector((state) => state.users.user);
  const history = useHistory();

  const [period, setPeriod] = useState('week');
  const [leaderboard, setLeaderboard] = useState([]);
  const [friendCount, setFriendCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    csrfFetch(`/api/friends/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        setFriendCount(data.friendCount ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period, user]);

  if (!user) return null;

  const tooFewFriends = friendCount !== null && friendCount < 3;
  const champion = leaderboard[0] || null;

  return (
    <>
      <Navigation />
      <div className="fl-page">
        <div className="fl-header">
          <div className="fl-title">Friends Leaderboard</div>
        </div>

        {loading && (
          <div className="fl-loading">
            <div className="fl-spinner" />
          </div>
        )}

        {!loading && tooFewFriends && (
          <div className="fl-empty">
            <div className="fl-empty-icon">
              <i className="fa-solid fa-trophy" />
            </div>
            <div className="fl-empty-title">Not enough friends yet</div>
            <div className="fl-empty-sub">
              Add at least <strong>3 friends</strong> to unlock the leaderboard.
              You currently have <strong>{friendCount}</strong>.
            </div>
            <button
              className="fl-empty-btn"
              onClick={() => history.push('/friends')}
            >
              Go to Friends
            </button>
          </div>
        )}

        {!loading && !tooFewFriends && (
          <>
            {champion && (
              <div className="fl-champion-card">
                <div className="fl-champion-badge">
                  <i className="fa-solid fa-crown fl-crown" />
                  <span className="fl-champion-label">
                    {CHAMPION_LABEL[period]}
                  </span>
                </div>
                <div className="fl-champion-body">
                  <div
                    className="fl-avatar fl-avatar-lg"
                    style={{ background: avatarColor(champion.username) }}
                  >
                    {champion.username[0].toUpperCase()}
                  </div>
                  <div className="fl-champion-info">
                    <div className="fl-champion-name">
                      {champion.username}
                      {champion.isCurrentUser && (
                        <span className="fl-you-badge">YOU</span>
                      )}
                    </div>
                    <div className="fl-champion-stats">
                      <span>{champion.handsPlayed} hands</span>
                      <span className="fl-dot">·</span>
                      <span>{champion.winRate}% win rate</span>
                    </div>
                  </div>
                  <div
                    className={`fl-champion-pl ${
                      champion.netPL >= 0 ? 'fl-pos' : 'fl-neg'
                    }`}
                  >
                    {fmtPL(champion.netPL)}
                  </div>
                </div>
              </div>
            )}

            <div className="fl-period-tabs">
              {PERIODS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`fl-tab ${period === key ? 'fl-tab-active' : ''}`}
                  onClick={() => setPeriod(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="fl-table-wrap">
              <table className="fl-table">
                <thead>
                  <tr>
                    <th className="fl-th fl-th-rank">#</th>
                    <th className="fl-th fl-th-player">Player</th>
                    <th className="fl-th fl-th-num">Hands</th>
                    <th className="fl-th fl-th-num">Win Rate</th>
                    <th className="fl-th fl-th-num">Net P&amp;L</th>
                    <th className="fl-th fl-th-num">Best Win</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => (
                    <tr
                      key={row.userId}
                      className={`fl-row ${row.isCurrentUser ? 'fl-row-me' : ''}`}
                    >
                      <td className="fl-td fl-td-rank">
                        {row.rank === 1 ? (
                          <i className="fa-solid fa-crown fl-rank-crown" />
                        ) : (
                          row.rank
                        )}
                      </td>
                      <td className="fl-td fl-td-player">
                        <div
                          className="fl-avatar fl-avatar-sm"
                          style={{ background: avatarColor(row.username) }}
                        >
                          {row.username[0].toUpperCase()}
                        </div>
                        <span className="fl-username">{row.username}</span>
                        {row.isCurrentUser && (
                          <span className="fl-you-badge">YOU</span>
                        )}
                      </td>
                      <td className="fl-td fl-td-num">{row.handsPlayed}</td>
                      <td className="fl-td fl-td-num">{row.winRate}%</td>
                      <td
                        className={`fl-td fl-td-num fl-pl ${
                          row.netPL >= 0 ? 'fl-pos' : 'fl-neg'
                        }`}
                      >
                        {fmtPL(row.netPL)}
                      </td>
                      <td className="fl-td fl-td-num fl-pos">
                        {row.biggestWin > 0 ? `+${row.biggestWin.toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FriendsLeaderboard;
