import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import * as friendActions from '../../../redux/middleware/friends';
import './FriendsOnline.css';

const AVATAR_COLORS = ['pink', 'yellow', 'green', 'purple', 'blue', 'red'];

// Simulated activities — used until real-time presence is implemented
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

// Deterministic hash so online status doesn't flicker on re-render
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
  // ~70 % online in demo; stable per user
  return stableHash(String(userId) + 'online') % 10 > 2;
}

function getActivity(userId, online) {
  if (!online) {
    const minsAgo = [2, 5, 12, 28, 60, 90, 120];
    const m = minsAgo[stableHash(String(userId) + 'time') % minsAgo.length];
    return m >= 60 ? `Last seen ${m / 60 | 0}h ago` : `Last seen ${m}m ago`;
  }
  return ACTIVITIES[stableHash(String(userId) + 'act') % ACTIVITIES.length];
}

const MAX_SHOWN = 8;

function FriendsOnline() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  const reduxFriends = useSelector((state) => state.friends.friends);

  useEffect(() => {
    if (user) dispatch(friendActions.getUserFriends());
  }, [user, dispatch]);

  const friendList = Object.values(reduxFriends || {}).map((entry) => {
    const id = entry.friend?.id || entry.id;
    const username = entry.friend?.username || 'User';
    const online = isOnline(id);
    return { id, username, online, activity: getActivity(id, online) };
  });

  const onlineCount = friendList.filter((f) => f.online).length;
  const shown = friendList.slice(0, MAX_SHOWN);
  const overflow = friendList.length - MAX_SHOWN;

  return (
    <div className="fol-card ss-card">
      <div className="fol-header">
        <span className="fol-title">Friends online</span>
        {friendList.length > 0 && (
          <span className="fol-badge">
            <span className="fol-badge-dot" />
            {onlineCount} online
          </span>
        )}
      </div>

      {/* Not logged in */}
      {!user && (
        <div className="fol-empty">
          <div className="fol-empty-icon">🎮</div>
          <p className="fol-empty-text">Sign in to see friends</p>
        </div>
      )}

      {/* Logged in, no friends */}
      {user && friendList.length === 0 && (
        <div className="fol-empty">
          <div className="fol-empty-avatar-row">
            {['?', '?', '?'].map((_, i) => (
              <div key={i} className="ss-avatar fol-placeholder-av" />
            ))}
          </div>
          <p className="fol-empty-text">No friends added yet</p>
          <p className="fol-empty-sub">
            Invite friends to see who's online and jump in their game.
          </p>
          <NavLink to="/friends" className="ss-btn ss-btn-primary fol-cta">
            + Add friends
          </NavLink>
        </div>
      )}

      {/* Friend list */}
      {user && friendList.length > 0 && (
        <>
          <ul className="fol-list">
            {shown.map((f) => (
              <li key={f.id} className="fol-item">
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
                  <span className={`fol-activity ${f.online ? 'active' : ''}`}>
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

export default FriendsOnline;
