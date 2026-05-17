import React, { useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFriendSuggestions, optimisticAddSuggestion } from '../../redux/middleware/friendSearch';
import { SocketContext } from '../../context/SocketContext';
import './SuggestedFriends.css';

const REASON_LABEL = {
  mutual: 'Mutual friends',
  table: 'Played together',
  recent: 'Recently joined',
};

const SuggestedFriendCard = ({ suggestion, isPending, onAdd }) => (
  <div className="suf-card">
    <div className="suf-avatar flex center">{`:)`}</div>
    <div className="suf-info">
      <div className="suf-username">{suggestion.username}</div>
      {suggestion.mutualCount > 0 && (
        <div className="suf-mutual">
          {suggestion.mutualCount} mutual friend{suggestion.mutualCount !== 1 ? 's' : ''}
        </div>
      )}
      {suggestion.mutualCount === 0 && suggestion.reason && (
        <div className="suf-mutual">{REASON_LABEL[suggestion.reason] || ''}</div>
      )}
    </div>
    <button
      className={`suf-add-btn ${isPending ? 'pending' : ''}`}
      onClick={() => onAdd(suggestion)}
      disabled={isPending}
    >
      {isPending ? 'Sent!' : 'Add'}
    </button>
  </div>
);

const SuggestedFriends = () => {
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);
  const user = useSelector((state) => state.users.user);
  const suggestions = useSelector((state) => state.friends.suggestions);
  const pendingSuggestions = useSelector((state) => state.friends.pendingSuggestions);
  const friends = useSelector((state) => state.friends.friends);
  const hasFriends = Object.keys(friends).length > 0;

  useEffect(() => {
    if (user) {
      dispatch(getFriendSuggestions());
    }
  }, [user, dispatch]);

  const handleAdd = (suggestion) => {
    if (!user || !socket) return;
    dispatch(optimisticAddSuggestion(suggestion.id));
    socket.emit('send_friend_request', {
      recipientId: suggestion.id,
      recipientUsername: suggestion.username,
    });
  };

  if (!suggestions || suggestions.length === 0) return null;

  // Empty state: no friends yet — show first 6 suggestions prominently
  if (!hasFriends) {
    const emptySuggestions = suggestions.slice(0, 6);
    return (
      <div className="suf-wrapper">
        <div className="suf-empty-state">
          <div className="suf-empty-headline">No friends yet. Here are some suggestions&hellip;</div>
          <div className="suf-rail">
            {emptySuggestions.map((s) => (
              <SuggestedFriendCard
                key={s.id}
                suggestion={s}
                isPending={!!pendingSuggestions[s.id]}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="suf-wrapper">
      <div className="suf-header">People you may know</div>
      <div className="suf-rail">
        {suggestions.map((s) => (
          <SuggestedFriendCard
            key={s.id}
            suggestion={s}
            isPending={!!pendingSuggestions[s.id]}
            onAdd={handleAdd}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestedFriends;
