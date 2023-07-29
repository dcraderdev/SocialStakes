import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './ChatInputArea.css';

import { SocketContext } from '../../context/SocketContext';

import { addMessage} from '../../redux/actions/userActions';

const ChatInputArea = () => {
  const dispatch = useDispatch()
  
  const user = useSelector(state => state.users.user);
  const activeTable = useSelector(state => state.games.activeTable);
  const currentConversation = useSelector(state => state.chats.currentConversation);
  
  const { socket } = useContext(SocketContext);
  
  const [newMessage, setNewMessage] = useState('');

    // Handle Sending Messages
    const handleSubmit = (e) => {
      if (e) e.preventDefault();
      if (!user) return;
      if (!currentConversation) return


      const newMessageObj = {
        content: newMessage,
        conversationId: currentConversation.conversationId,
      }
      socket.emit('message', newMessageObj);
      setNewMessage('');
    }



  return (
    <div className="chatinput-container flex">
        <form className="chatinput-controls-container flex" onSubmit={handleSubmit}>
            <input
              className="chatinput-input"
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder=" Type chat message here"
            />
          <button className="chatinput-button" onClick={handleSubmit}>
            Send
          </button>
          
        </form>
    </div>
  );
};

export default ChatInputArea;
