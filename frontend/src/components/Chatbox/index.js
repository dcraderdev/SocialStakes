import React, { useState, useRef, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import './Chatbox.css';
import { SocketContext } from '../../context/SocketContext';
import MessageTile from '../MessageTile';

const Chatbox = () => {
  const user = useSelector((state) => state.users.user);
  const conversations = useSelector((state) => state.chats.conversations);
  const currentConversationId = useSelector((state) => state.chats.currentConversation);
  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // { userId: { username, timer } }
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimers = useRef({});

  useEffect(() => {
    if (currentConversationId && conversations) {
      setMessages(conversations[currentConversationId]?.messages || []);
    }
  }, [currentConversationId, conversations]);

  // Smooth scroll-to-bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentConversationId]);

  // Typing indicator socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userId, username }) => {
      if (userId === user?.id) return;
      clearTimeout(typingTimers.current[userId]);
      setTypingUsers((prev) => ({ ...prev, [userId]: username }));
      typingTimers.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }, 3500);
    };

    const handleStopTyping = ({ userId }) => {
      clearTimeout(typingTimers.current[userId]);
      delete typingTimers.current[userId];
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopTyping);

    return () => {
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
    };
  }, [socket, user?.id]);

  const typers = Object.values(typingUsers);

  // Check if two messages should show a date separator between them
  const needsDateSeparator = (msg, prevMsg) => {
    if (!prevMsg) return true;
    const a = new Date(prevMsg.createdAt);
    const b = new Date(msg.createdAt);
    return a.toDateString() !== b.toDateString();
  };

  return (
    <div className="chatbox-wrapper">
      <div className="chatbox-message-container styled-scrollbar" ref={containerRef}>
        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const next = messages[index + 1];
          const isFirst = !prev || prev.userId !== message.userId || needsDateSeparator(message, prev);
          const isLast = !next || next.userId !== message.userId;
          const showDate = needsDateSeparator(message, prev);

          return (
            <MessageTile
              key={message.id || index}
              message={message}
              isFirst={isFirst}
              isLast={isLast}
              showDateSeparator={showDate}
            />
          );
        })}

        {/* Typing indicator */}
        {typers.length > 0 && (
          <div className="chatbox-typing-row">
            <div className="chatbox-typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            <span className="chatbox-typing-label">
              {typers.length === 1
                ? `${typers[0]} is typing…`
                : `${typers.slice(0, -1).join(', ')} and ${typers[typers.length - 1]} are typing…`}
            </span>
          </div>
        )}

        <div className="chat-bottom-ref" ref={bottomRef} />
      </div>
    </div>
  );
};

export default Chatbox;
