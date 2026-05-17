import React, { useState, useRef, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import './ChatInputArea.css';
import { SocketContext } from '../../context/SocketContext';

const EMOJIS = [
  '😀','😂','😍','🥰','😎','🤔','😅','😭','🤣','😊',
  '😜','🤩','😇','🥹','😤','🤯','🫡','🫶','👍','👎',
  '❤️','🔥','🎉','👏','💪','🙏','✌️','👋','🤝','💯',
  '🎮','🃏','♠️','♥️','💰','🏆','⚡','✨','🌟','🎯',
];

const ChatInputArea = () => {
  const user = useSelector((state) => state.users.user);
  const currentConversation = useSelector((state) => state.chats.currentConversation);
  const { socket } = useContext(SocketContext);

  const [newMessage, setNewMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const inputRef = useRef(null);
  const emojiRef = useRef(null);
  const typingTimer = useRef(null);

  // Close emoji picker on outside click
  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojis(false);
      }
    };
    if (showEmojis) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojis]);

  const emitTypingStop = () => {
    if (isTyping && socket && currentConversation) {
      socket.emit('typing_stop', { conversationId: currentConversation });
      setIsTyping(false);
    }
  };

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !currentConversation) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', { conversationId: currentConversation });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      emitTypingStop();
    }, 2000);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!user || !currentConversation || !newMessage.trim()) return;
    socket.emit('message', { content: newMessage.trim(), conversationId: currentConversation });
    setNewMessage('');
    clearTimeout(typingTimer.current);
    emitTypingStop();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') setShowEmojis(false);
  };

  const insertEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };

  return (
    <div className="chatinput-wrapper">
      {showEmojis && (
        <div className="chatinput-emoji-picker" ref={emojiRef}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              className="emoji-btn"
              type="button"
              onClick={() => insertEmoji(e)}
              aria-label={e}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <form className="chatinput-form" onSubmit={handleSubmit} noValidate>
        <button
          type="button"
          className="chatinput-icon-btn emoji"
          onClick={() => setShowEmojis((v) => !v)}
          aria-label="Emoji picker"
          title="Emoji"
        >
          😊
        </button>

        <input
          ref={inputRef}
          className="chatinput-input"
          type="text"
          value={newMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          autoComplete="off"
          maxLength={500}
        />

        <button
          type="submit"
          className="chatinput-icon-btn send"
          disabled={!newMessage.trim()}
          aria-label="Send message"
          title="Send"
        >
          <i className="fa-solid fa-paper-plane" />
        </button>
      </form>
    </div>
  );
};

export default ChatInputArea;
