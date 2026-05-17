import React, { useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './MessageTile.css';
import { SocketContext } from '../../context/SocketContext';
import GameBarCard from '../GameBarCard';

const AVATAR_COLORS = [
  '#c0392b','#8e44ad','#2980b9','#27ae60','#e67e22','#16a085','#d35400','#2471a3',
];

function avatarColor(username = '') {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Returns "Today", "Yesterday", or "May 12"
function formatDateLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const MessageTile = ({ message, isFirst, isLast, showDateSeparator }) => {
  const user = useSelector((state) => state.users.user);
  const friends = useSelector((state) => state.friends);
  const conversations = useSelector((state) => state.chats.conversations);
  const currentConversation = useSelector((state) => state.chats.currentConversation);
  const { socket } = useContext(SocketContext);

  const [hovered, setHovered] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const isOwn = user && message.userId === user.id;
  const isRoom = message.userId === 'e10d8de4-f4c7-0000-0000-000000000000' || message.username === 'Room';

  const showAvatar = !isOwn && !isRoom && isLast;
  const showSender = !isOwn && !isRoom && isFirst;

  const canEdit = isOwn && !isRoom && hovered && !isDeletingMessage;
  const canDelete = isOwn && !isRoom && hovered && !isEditingMessage;

  const showAddFriend = (() => {
    if (!user || isOwn || isRoom || !hovered) return false;
    const f = friends.friends || {};
    const out = friends.outgoingRequests || {};
    const rej = friends.rejectedRequests || {};
    return !f[message.userId] && !out[message.userId] && !rej[message.userId];
  })();

  const sendFriendRequest = () => {
    if (!user || !socket) return;
    socket.emit('send_friend_request', { recipientId: message.userId, recipientUsername: message.username });
  };

  const startEdit = () => { setIsEditingMessage(true); setEditedContent(message.content); };
  const cancelEdit = () => { setIsEditingMessage(false); setEditedContent(''); };
  const saveEdit = (e) => {
    e.preventDefault();
    if (!user || !socket) return;
    socket.emit('edit_message', { conversationId: currentConversation, userId: user.id, messageId: message.id, newContent: editedContent });
    cancelEdit();
  };

  const startDelete = () => setIsDeletingMessage(true);
  const cancelDelete = () => setIsDeletingMessage(false);
  const confirmDelete = () => {
    if (!user || !socket) return;
    socket.emit('delete_message', { conversationId: currentConversation, userId: user.id, messageId: message.id, newContent: ' Delete message?' });
    setIsDeletingMessage(false);
  };

  const initial = (message.username || '?')[0].toUpperCase();
  const color = avatarColor(message.username);

  // Room/system messages
  if (isRoom) {
    return (
      <div className="msg-system">
        <span>{message.content}</span>
      </div>
    );
  }

  return (
    <>
      {showDateSeparator && (
        <div className="msg-date-separator">
          <span>{formatDateLabel(message.createdAt)}</span>
        </div>
      )}

      <div
        className={`msg-row${isOwn ? ' own' : ' theirs'}${isFirst ? ' first' : ''}${isLast ? ' last' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); }}
      >
        {/* Avatar column — always reserve space for alignment */}
        <div className="msg-avatar-col">
          {showAvatar ? (
            <div className="msg-avatar" style={{ background: color }} title={message.username}>
              {initial}
            </div>
          ) : (
            <div className="msg-avatar-spacer" />
          )}
        </div>

        <div className="msg-body">
          {showSender && (
            <div className="msg-sender">{message.username}</div>
          )}

          {/* Bubble */}
          {isEditingMessage ? (
            <form onSubmit={saveEdit} className="msg-edit-form">
              <input
                className="msg-edit-input"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                autoFocus
              />
              <div className="msg-edit-actions">
                <button type="submit" className="msg-action-btn confirm"><i className="fa-solid fa-check" /></button>
                <button type="button" className="msg-action-btn cancel" onClick={cancelEdit}><i className="fa-solid fa-x" /></button>
              </div>
            </form>
          ) : isDeletingMessage ? (
            <div className="msg-delete-confirm">
              <span>Delete this message?</span>
              <button className="msg-action-btn danger" onClick={confirmDelete}><i className="fa-solid fa-check" /> Delete</button>
              <button className="msg-action-btn cancel" onClick={cancelDelete}>Cancel</button>
            </div>
          ) : (
            <div className={`msg-bubble${isOwn ? ' own' : ' theirs'}`}>
              <div className="msg-content">
                {message.content}
                {message.cards && message.cards.length > 0 && (
                  <div className="msg-cards">
                    {message.cards.map((card, i) => card !== undefined && (
                      <div key={i} className="gamebar-card"><GameBarCard card={card} /></div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover actions */}
              {hovered && (
                <div className={`msg-actions${isOwn ? ' own' : ' theirs'}`}>
                  {showAddFriend && (
                    <button className="msg-action-icon" onClick={sendFriendRequest} title="Add friend">
                      <i className="fa-solid fa-user-plus" />
                    </button>
                  )}
                  {canEdit && (
                    <button className="msg-action-icon" onClick={startEdit} title="Edit">
                      <i className="fa-regular fa-pen-to-square" />
                    </button>
                  )}
                  {canDelete && (
                    <button className="msg-action-icon danger" onClick={startDelete} title="Delete">
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="msg-time">{formatTime(message.createdAt)}</div>
        </div>
      </div>
    </>
  );
};

export default MessageTile;
