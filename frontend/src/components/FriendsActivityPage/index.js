import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getFriendActivity } from '../../redux/middleware/activity';
import { setActivityFilter } from '../../redux/actions/activityActions';
import './FriendsActivityPage.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'wins', label: 'Wins' },
  { key: 'streaks', label: 'Streaks' },
  { key: 'social', label: 'Social' },
  { key: 'table', label: 'Table Activity' },
];

const EVENT_FILTER_MAP = {
  all: null,
  wins: ['hand_won', 'hand_blackjack'],
  streaks: ['streak_hit'],
  social: ['friend_added'],
  table: ['table_joined'],
};

const EVENT_LABELS = {
  hand_won: (p) => `won $${p.amount || '?'} at ${p.gameType || 'Blackjack'}`,
  hand_blackjack: (p) => `hit blackjack (+$${p.amount || '?'}) at ${p.gameType || 'Blackjack'}`,
  friend_added: (p) => `added ${p.friendUsername || 'a friend'} as a friend`,
  table_joined: (p) => `sat down at a ${p.gameType || 'Blackjack'} table`,
  streak_hit: (p) => `is on a ${p.streak || '?'}-win streak`,
  bankroll_high: (p) => `hit a new bankroll high of $${p.amount || '?'}`,
};

const EVENT_TYPE_CLASS = {
  hand_won: 'event-win',
  hand_blackjack: 'event-blackjack',
  friend_added: 'event-social',
  table_joined: 'event-table',
  streak_hit: 'event-streak',
  bankroll_high: 'event-high',
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function avatarColor(username) {
  const palette = ['#4f86c6', '#7c5cbf', '#c6546f', '#5cad7c', '#c6904f', '#5cb8c6'];
  let h = 0;
  for (let i = 0; i < (username || '').length; i++) {
    h = username.charCodeAt(i) + ((h << 5) - h);
  }
  return palette[Math.abs(h) % palette.length];
}

const FriendsActivityPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const events = useSelector((s) => s.activity.events);
  const filter = useSelector((s) => s.activity.filter);
  const friends = useSelector((s) => s.friends.friends);
  const user = useSelector((s) => s.users.user);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    await dispatch(getFriendActivity(50));
    setIsLoading(false);
  }, [dispatch]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const filterTypes = EVENT_FILTER_MAP[filter];
  const visible = filterTypes
    ? events.filter((e) => filterTypes.includes(e.type))
    : events;

  const hasFriends = Object.keys(friends || {}).length > 0;

  if (!user) {
    history.push('/');
    return null;
  }

  return (
    <div className="activity-page">
      <div className="activity-header">
        <h2 className="activity-title">Friends Activity</h2>
        <div className="activity-filter-bar">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={`activity-filter-btn${filter === key ? ' active' : ''}`}
              onClick={() => dispatch(setActivityFilter(key))}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="activity-feed styled-scrollbar">
        {isLoading && (
          <div className="activity-empty">Loading activity...</div>
        )}

        {!isLoading && !hasFriends && (
          <div className="activity-empty">
            Add friends to see their activity here.
          </div>
        )}

        {!isLoading && hasFriends && !visible.length && (
          <div className="activity-empty">
            No {filter !== 'all' ? filter + ' ' : ''}activity yet.
          </div>
        )}

        {!isLoading && visible.map((event) => {
          const u = event.user || {};
          const label = EVENT_LABELS[event.type];
          const actionText = label ? label(event.payload || {}) : event.type;
          const typeClass = EVENT_TYPE_CLASS[event.type] || '';
          const color = avatarColor(u.username);
          const hasTableLink = event.payload?.tableId;

          return (
            <div key={event.id} className={`activity-card ${typeClass}`}>
              <div
                className="activity-avatar"
                style={{ backgroundColor: color }}
              >
                {u.username ? u.username[0].toUpperCase() : '?'}
              </div>
              <div className="activity-card-body">
                <span className="activity-username">{u.username || 'Unknown'}</span>
                <span className="activity-action"> {actionText}</span>
                {hasTableLink && (
                  <a
                    className="activity-table-link"
                    href={`/?table=${event.payload.tableId}`}
                  >
                    · View table
                  </a>
                )}
              </div>
              <div className="activity-timestamp">{timeAgo(event.createdAt)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendsActivityPage;
