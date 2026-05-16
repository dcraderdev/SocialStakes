import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers } from '../../redux/middleware/friendSearch';
import { optimisticAddSuggestion } from '../../redux/middleware/friendSearch';
import { clearUserSearchResultsAction } from '../../redux/actions/friendActions';
import { SocketContext } from '../../context/SocketContext';
import './FriendSearchBar.css';

const RECENT_KEY = 'friendRecentSearches';
const MAX_RECENT = 5;

function getRecentSearches() {
  try {
    return JSON.parse(sessionStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(term) {
  try {
    const existing = getRecentSearches().filter((t) => t !== term);
    const updated = [term, ...existing].slice(0, MAX_RECENT);
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // sessionStorage not available — silently skip
  }
}

const FriendSearchBar = () => {
  const dispatch = useDispatch();
  const { socket } = useContext(SocketContext);
  const user = useSelector((state) => state.users.user);
  const searchResults = useSelector((state) => state.friends.userSearchResults);
  const pendingSuggestions = useSelector((state) => state.friends.pendingSuggestions);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      dispatch(clearUserSearchResultsAction());
      return;
    }

    debounceRef.current = setTimeout(() => {
      dispatch(searchUsers(query));
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      saveRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
      dispatch(searchUsers(query));
    }
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    dispatch(searchUsers(term));
  };

  const handleAddFriend = (resultUser) => {
    if (!user || !socket) return;
    dispatch(optimisticAddSuggestion(resultUser.id));
    socket.emit('send_friend_request', {
      recipientId: resultUser.id,
      recipientUsername: resultUser.username,
    });
  };

  const showDropdown = isFocused && (query.trim().length >= 2 || recentSearches.length > 0);
  const showResults = query.trim().length >= 2;
  const showRecent = !showResults && recentSearches.length > 0;

  return (
    <div className="fsb-wrapper" ref={wrapperRef}>
      <form className="fsb-form" onSubmit={handleSubmit}>
        <div className="fsb-input-row">
          <i className="fa-solid fa-magnifying-glass fsb-icon" />
          <input
            className="fsb-input"
            type="text"
            placeholder="Search by username or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            autoComplete="off"
          />
          {query.length > 0 && (
            <button
              type="button"
              className="fsb-clear-btn"
              onClick={() => {
                setQuery('');
                dispatch(clearUserSearchResultsAction());
              }}
            >
              <i className="fa-solid fa-x" />
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="fsb-dropdown">
          {showRecent && (
            <>
              <div className="fsb-section-label">Recent searches</div>
              {recentSearches.map((term, i) => (
                <div
                  key={i}
                  className="fsb-recent-item"
                  onClick={() => handleRecentClick(term)}
                >
                  <i className="fa-solid fa-clock-rotate-left fsb-recent-icon" />
                  <span>{term}</span>
                </div>
              ))}
            </>
          )}

          {showResults && searchResults.length === 0 && (
            <div className="fsb-no-results">No users found for &ldquo;{query}&rdquo;</div>
          )}

          {showResults &&
            searchResults.map((result) => {
              const isPending = pendingSuggestions[result.id];
              return (
                <div key={result.id} className="fsb-result-item">
                  <div className="fsb-result-avatar flex center">{`:)`}</div>
                  <div className="fsb-result-info">
                    <div className="fsb-result-username">{result.username}</div>
                    {result.rank != null && (
                      <div className="fsb-result-rank">Rank {result.rank}</div>
                    )}
                  </div>
                  <button
                    className={`fsb-add-btn ${isPending ? 'pending' : ''}`}
                    onClick={() => handleAddFriend(result)}
                    disabled={isPending}
                  >
                    {isPending ? 'Sent!' : 'Add'}
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default FriendSearchBar;
