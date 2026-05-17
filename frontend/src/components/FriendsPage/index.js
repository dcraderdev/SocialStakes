import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';

import { getUserFriends, getFriendsWithStatus, addFriendByUsername } from '../../redux/middleware/friends';
import { getUserConversations } from '../../redux/middleware/chat';

import FriendsNavBar from '../FriendsNavBar';
import FriendTile from '../FriendTile';
import ConversationTile from '../ConversationTile';
import { ModalContext } from '../../context/ModalContext';
import './FriendsPage.css';
import Chatbox from '../Chatbox';
import { showConversationAction } from '../../redux/actions/chatActions';
import ChatInputArea from '../ChatInputArea';
import FriendsPageHeader from '../FriendsPageHeader';
import { showFriendsAction } from '../../redux/actions/friendActions';

const FriendsPage = () => {
  const currentFriendViewConversations = 'currentFriendViewConversations';
  const currentFriendViewPastGames = 'currentFriendViewPastGames';
  const currentFriendViewStats = 'currentFriendViewStats';

  const dispatch = useDispatch();
  const user = useSelector((state) => state.users.user);
  const friends = useSelector((state) => state.friends);
  const conversations = useSelector((state) => state.chats.conversations);
  const currentFriendView = useSelector((state) => state.friends.currentFriendView);
  const currentConversationId = useSelector((state) => state.chats.currentConversation);
  const showFriends = useSelector((state) => state.friends.showFriends);
  const showConversation = useSelector((state) => state.friends.showConversation);
  const showTableInvites = useSelector((state) => state.friends.showTableInvites);
  const showFriendInvites = useSelector((state) => state.friends.showFriendInvites);

  const { openModal, setUpdateObj, updateObj } = useContext(ModalContext);
  const { socket } = useContext(SocketContext);

  const currentTables = useSelector((state) => state.games.currentTables);
  const [hasCurrentTables, setHasCurrentTables] = useState(false);
  const [currentFriendViewTab, setCurrentFriendViewTab] = useState(currentFriendViewConversations);

  // Friends list state
  const [listSearch, setListSearch] = useState('');
  const [sortMode, setSortMode] = useState('online'); // 'online' | 'name'
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [addFriendInput, setAddFriendInput] = useState('');
  const [addFriendStatus, setAddFriendStatus] = useState(null); // null | 'sending' | 'success' | { error }
  const addFriendRef = useRef();

  useEffect(() => {
    setHasCurrentTables(Object.entries(currentTables).length > 0);
  }, [currentTables]);

  // Fetch friends with online/table status on mount
  useEffect(() => {
    if (user) {
      dispatch(getFriendsWithStatus());
    }
  }, [dispatch, user]);

  // Close add-friend panel on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (addFriendRef.current && !addFriendRef.current.contains(e.target)) {
        setShowAddFriend(false);
        setAddFriendInput('');
        setAddFriendStatus(null);
      }
    };
    if (showAddFriend) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showAddFriend]);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    const val = addFriendInput.trim();
    if (!val) return;
    setAddFriendStatus('sending');
    const result = await dispatch(addFriendByUsername(val));
    if (result && result.error) {
      setAddFriendStatus({ error: result.error });
    } else {
      setAddFriendStatus('success');
      setAddFriendInput('');
      setTimeout(() => {
        setShowAddFriend(false);
        setAddFriendStatus(null);
        dispatch(getFriendsWithStatus());
      }, 1800);
    }
  };

  const handleRemoveFriend = (friend) => {
    setUpdateObj({ friendInfo: friend });
    openModal('RemoveFriendModal');
  };

  const handleMessageFriend = (friend) => {
    dispatch(showFriendsAction(friend));
  };

  const handleInviteToTable = (friend) => {
    if (!socket) return;
    const tableId = Object.keys(currentTables)[0];
    if (!tableId) return;
    socket.emit('invite_to_table', { recipientId: friend.friend.id, tableId });
  };

  const getViewHeight = () => {
    if (showFriends) {
      return hasCurrentTables ? 'friendspage-chatbox-extended lowered' : 'friendspage-chatbox-condensed lowered';
    }
    if (showConversation) {
      return hasCurrentTables ? 'friendspage-chatbox-extended conversations' : 'friendspage-chatbox-condensed conversations';
    }
  };

  // Sorted + filtered friends list
  const friendsList = Object.values(friends.friends || {});
  const filtered = friendsList.filter((f) =>
    f.friend.username.toLowerCase().includes(listSearch.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'online') {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
    }
    return a.friend.username.localeCompare(b.friend.username);
  });

  const showFriendsList = !showFriends && !showConversation && !showFriendInvites && !showTableInvites;

  if (!user) return null;

  return (
    <div className="friendspage-wrapper flex">
      <div
        className={`friendspage-friendsnavbar-wrapper ${hasCurrentTables ? 'expanded' : 'shrunk'}`}
      >
        <FriendsNavBar />
      </div>

      <div
        className={`friendspage-content-wrapper flex ${hasCurrentTables ? 'expanded' : 'shrunk'}`}
      >
        <div className="friendspage-header flex center">
          <FriendsPageHeader />
        </div>

        {/* ── Default friends-list view ── */}
        {showFriendsList && (
          <div className="fl-root">

            {/* top bar */}
            <div className="fl-topbar flex">
              <div className="fl-search-wrap">
                <input
                  className="fl-search"
                  type="text"
                  placeholder="Search friends…"
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  aria-label="Search friends"
                />
              </div>

              <div className="fl-topbar-actions flex">
                <div className="fl-sort-group flex" role="group" aria-label="Sort friends">
                  <button
                    className={`fl-sort-btn${sortMode === 'online' ? ' active' : ''}`}
                    onClick={() => setSortMode('online')}
                    aria-pressed={sortMode === 'online'}
                  >
                    Online first
                  </button>
                  <button
                    className={`fl-sort-btn${sortMode === 'name' ? ' active' : ''}`}
                    onClick={() => setSortMode('name')}
                    aria-pressed={sortMode === 'name'}
                  >
                    A–Z
                  </button>
                </div>

                <div className="fl-add-wrap" ref={addFriendRef}>
                  <button
                    className="fl-add-btn"
                    onClick={() => {
                      setShowAddFriend((v) => !v);
                      setAddFriendStatus(null);
                    }}
                    aria-expanded={showAddFriend}
                  >
                    + Add Friend
                  </button>

                  {showAddFriend && (
                    <div className="fl-add-panel" role="dialog" aria-label="Add friend">
                      <div className="fl-add-title">Add by username</div>
                      <form onSubmit={handleAddFriend} className="fl-add-form flex">
                        <input
                          className="fl-add-input"
                          type="text"
                          placeholder="Username…"
                          value={addFriendInput}
                          onChange={(e) => setAddFriendInput(e.target.value)}
                          autoFocus
                          aria-label="Friend username"
                          disabled={addFriendStatus === 'sending' || addFriendStatus === 'success'}
                        />
                        <button
                          className="fl-add-submit"
                          type="submit"
                          disabled={!addFriendInput.trim() || addFriendStatus === 'sending' || addFriendStatus === 'success'}
                        >
                          {addFriendStatus === 'sending' ? '…' : 'Send'}
                        </button>
                      </form>
                      {addFriendStatus === 'success' && (
                        <div className="fl-add-msg success" role="alert">
                          Friend request sent!
                        </div>
                      )}
                      {addFriendStatus && addFriendStatus.error && (
                        <div className="fl-add-msg error" role="alert">
                          {addFriendStatus.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* column headers */}
            <div className="fl-col-headers" aria-hidden="true">
              <div className="fl-col-status"></div>
              <div className="fl-col-avatar"></div>
              <div className="fl-col-name">Name</div>
              <div className="fl-col-status-text">Status</div>
              <div className="fl-col-activity">Activity</div>
              <div className="fl-col-actions">Actions</div>
            </div>

            {/* friend rows */}
            <div className="fl-list styled-scrollbar" role="list" aria-label="Friends list">
              {sorted.length === 0 && (
                <div className="fl-empty flex center">
                  {listSearch ? 'No friends match your search.' : 'No friends yet — add one above!'}
                </div>
              )}

              {sorted.map((friend) => (
                <FriendListRow
                  key={friend.id}
                  friend={friend}
                  currentTables={currentTables}
                  onMessage={handleMessageFriend}
                  onInvite={handleInviteToTable}
                  onRemove={handleRemoveFriend}
                />
              ))}
            </div>

            {/* Incoming requests banner */}
            {Object.keys(friends.incomingRequests || {}).length > 0 && (
              <div className="fl-requests-banner flex center">
                <span>
                  You have {Object.keys(friends.incomingRequests).length} pending friend request{Object.keys(friends.incomingRequests).length > 1 ? 's' : ''}
                </span>
                <button
                  className="fl-requests-link"
                  onClick={() => dispatch({ type: 'friends/SHOW_FRIEND_INVITES' })}
                >
                  View
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Invites view (unchanged) ── */}
        {showFriendInvites && (
          <div>
            <div className="friendspage-invite-header top flex">
              <div className="friendspage-invite-text flex center">Incoming</div>
            </div>
            <div className="friendspage-requests-container">
              {Object.entries(friends.incomingRequests).map(([key, friend], index) => (
                <div key={index} className="friendtile-wrapper">
                  <FriendTile friend={friend} type="invite-incoming" />
                </div>
              ))}
            </div>
            <div className="friendspage-invite-header flex">
              <div className="friendspage-invite-text flex center">Outgoing</div>
            </div>
            {Object.entries(friends.outgoingRequests).map(([key, friend], index) => (
              <div key={index} className="friendtile-wrapper">
                <FriendTile friend={friend} type="invite-outgoing" />
              </div>
            ))}
          </div>
        )}

        {/* ── Friend detail view ── */}
        {showFriends && (
          <div className="friendspage-friendview-container flex">
            <div className="friendspage-friendview-nav flex">
              <div
                onClick={() => setCurrentFriendViewTab(currentFriendViewConversations)}
                className={`friendview-nav ${currentFriendViewTab === currentFriendViewConversations ? 'nav-text-active' : ''}`}
              >
                <div className="nav-text">Direct Messages</div>
              </div>
              <div
                onClick={() => setCurrentFriendViewTab(currentFriendViewPastGames)}
                className={`friendview-nav ${currentFriendViewTab === currentFriendViewPastGames ? 'nav-text-active' : ''}`}
              >
                <div className="nav-text">Past Games</div>
              </div>
              <div
                onClick={() => setCurrentFriendViewTab(currentFriendViewStats)}
                className={`friendview-nav ${currentFriendViewTab === currentFriendViewStats ? 'nav-text-active' : ''}`}
              >
                <div className="nav-text">Stats</div>
              </div>
            </div>

            {currentFriendViewTab === currentFriendViewConversations && currentFriendView && conversations[currentFriendView?.conversationId] && (
              <div className={`friendspage-chatbox-container ${getViewHeight()}`}>
                <Chatbox conversation={conversations[currentFriendView.conversationId]} />
              </div>
            )}

            {currentFriendViewTab === currentFriendViewConversations && currentFriendView && (
              <div className="chatbox-chatinput-wrapper">
                <div className="chatbox-chatinput-container">
                  <ChatInputArea />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Conversation view ── */}
        {showConversation && (
          <>
            <div className={`friendspage-chatbox-container ${getViewHeight()}`}>
              <Chatbox conversation={conversations[currentConversationId]} />
            </div>
            <div className="chatbox-chatinput-wrapper">
              <div className="chatbox-chatinput-container">
                <ChatInputArea />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


// ── FriendListRow subcomponent ────────────────────────────────────────────────

const FriendListRow = ({ friend, currentTables, onMessage, onInvite, onRemove }) => {
  const [hoverRemove, setHoverRemove] = useState(false);
  const hasTable = Object.keys(currentTables).length > 0;

  const activityText = friend.currentTable
    ? friend.currentTable.tableName || 'At a table'
    : null;

  return (
    <div className="fl-row" role="listitem" aria-label={friend.friend.username}>
      {/* online dot */}
      <div className="fl-col-status flex center">
        <span
          className={`fl-status-dot ${friend.isOnline ? 'online' : 'offline'}`}
          title={friend.isOnline ? 'Online' : 'Offline'}
          aria-label={friend.isOnline ? 'Online' : 'Offline'}
        />
      </div>

      {/* avatar */}
      <div className="fl-col-avatar flex center" aria-hidden="true">
        <div className="fl-avatar">{':)'}</div>
      </div>

      {/* name */}
      <div className="fl-col-name flex center">
        <span className="fl-username">{friend.friend.username}</span>
        {friend.friend.rank != null && (
          <span className="fl-rank" aria-label={`Rank ${friend.friend.rank}`}>
            #{friend.friend.rank}
          </span>
        )}
      </div>

      {/* status text */}
      <div className="fl-col-status-text flex center">
        <span className={`fl-status-text ${friend.isOnline ? 'online' : 'offline'}`}>
          {friend.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* activity */}
      <div className="fl-col-activity flex center">
        {activityText ? (
          <span className="fl-activity">{activityText}</span>
        ) : (
          <span className="fl-activity-none">—</span>
        )}
      </div>

      {/* action buttons */}
      <div className="fl-col-actions flex center">
        <button
          className="fl-action-btn message"
          onClick={() => onMessage(friend)}
          title={`Message ${friend.friend.username}`}
          aria-label={`Message ${friend.friend.username}`}
        >
          <i className="fa-regular fa-comment" aria-hidden="true" />
          <span className="fl-action-label">Message</span>
        </button>

        {hasTable && (
          <button
            className="fl-action-btn invite"
            onClick={() => onInvite(friend)}
            title={`Invite ${friend.friend.username} to table`}
            aria-label={`Invite ${friend.friend.username} to table`}
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
            <span className="fl-action-label">Invite</span>
          </button>
        )}

        <button
          className={`fl-action-btn remove ${hoverRemove ? 'hovered' : ''}`}
          onClick={() => onRemove(friend)}
          onMouseEnter={() => setHoverRemove(true)}
          onMouseLeave={() => setHoverRemove(false)}
          title={`Remove ${friend.friend.username}`}
          aria-label={`Remove ${friend.friend.username}`}
        >
          <i className="fa-regular fa-trash-can" aria-hidden="true" />
          <span className="fl-action-label">{hoverRemove ? 'Remove?' : 'Remove'}</span>
        </button>
      </div>
    </div>
  );
};


export default FriendsPage;
