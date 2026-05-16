import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import * as friendActions from '../../../redux/middleware/friends';
import './FriendsOnline.css';

const AVATAR_COLORS = ['pink', 'yellow', 'green', 'purple', 'blue', 'red'];

const ACTIVITIES = [
  'In hand at Med Stakes',
  'In lobby',
  'Playing Hi Lo',
  'At Hi Stakes table',
  'On a coin flip streak',
  'Watching Poker',
  'In Acey Duecey',
  'Just won big',
];

// Deterministic hash — stable per string so statuses don't flicker on re-render
function stableHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getAvatarColor(username) {
  return AVATAR_COLORS[stableHash(username) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return (name || '?').slice(0, 2).toUpperCase();
}

function isOnline(userId) {
  return stableHash(String(userId) + 'online') % 10 > 2; // ~70 % online
}

function getActivity(userId, online) {
  if (!online) {
    const opts = [2, 5, 12, 28, 60, 90, 120];
    const m = opts[stableHash(String(userId) + 'time') % opts.length];
    return m >= 60 ? `Last seen ${(m / 60) | 0}h ago` : `Last seen ${m}m ago`;
  }
  return ACTIVITIES[stableHash(String(userId) + 'act') % ACTIVITIES.length];
}

const MAX_SHOWN = 8;

export default function FriendsOnline() {
  const dispatch = useDispatch();
  const user     = useSelector((state) => state.users.user);
  const raw      = useSelector((state) => state.friends.friends);

  useEffect(() => {
    if (user) dispatch(friendActions.getUserFriends());
  }, [user, dispatch]);

  const friendList = Object.values(raw || {}).map((entry) => {
    const id       = entry.friend?.id ?? entry.id;
    const username = entry.friend?.username ?? 'User';
    const online   = isOnline(id);
    return { id, username, online, activity: getActivity(id, online) };
  });

  const onlineCount = friendList.filter((f) => f.online).length;
  const shown       = friendList.slice(0, MAX_SHOWN);
  const overflow    = friendList.length - MAX_SHOWN;

  return (
    <div className="fol-card ss-card">

      {/* ── Header ── */}
      <div className="fol-header">
        <span className="fol-title">Friends online</span>
        {/* Only show the badge when at least 1 friend is online */}
        {onlineCount > 0 && (
          <span className="fol-badge">
            <span className="fol-badge-dot" />
            {onlineCount} online
          </span>
        )}
      </div>

      {/* ── Not logged in ── */}
      {!user && (
        <div className="fol-empty">
          <div className="fol-empty-icon">🎮</div>
          <p className="fol-empty-text">Sign in to see who's online</p>
        </div>
      )}

      {/* ── Logged in, no friends yet ── */}
      {user && friendList.length === 0 && (
        <div className="fol-empty">
          {/* Stacked placeholder avatars as a teaser */}
          <div className="fol-ph-row">
            <div className="ss-avatar fol-ph" style={{ zIndex: 3 }} />
            <div className="ss-avatar fol-ph" style={{ zIndex: 2 }} />
            <div className="ss-avatar fol-ph" style={{ zIndex: 1 }} />
          </div>
          <p className="fol-empty-text">No friends added yet</p>
          <p className="fol-empty-sub">
            Invite friends to see who's online and jump into their game.
          </p>
          <NavLink to="/friends" className="ss-btn ss-btn-primary fol-cta">
            + Add friends
          </NavLink>
        </div>
      )}

      {/* ── Friend list ── */}
      {user && friendList.length > 0 && (
        <>
          <ul className="fol-list">
            {shown.map((f, idx) => (
              <li
                key={f.id}
                className="fol-item"
                style={{ animationDelay: `${idx * 55}ms` }}
              >
                <div className="fol-avatar-wrap">
                  <div className={`ss-avatar ${getAvatarColor(f.username)}`}>
                    {getInitials(f.username)}
                  </div>
                  <span
                    className={`fol-dot ${f.online ? 'online' : 'offline'}`}
                    title={f.online ? 'Online' : 'Offline'}
                  />
                </div>
                <div className="fol-info">
                  <span className="fol-name">{f.username}</span>
                  <span className={`fol-activity${f.online ? ' active' : ''}`}>
                    {f.activity}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {overflow > 0 && (
            <NavLink to="/friends" className="fol-more">
              +{overflow} more →
            </NavLink>
          )}
        </>
      )}
    </div>
  );
}
