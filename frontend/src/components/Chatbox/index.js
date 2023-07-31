import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Chatbox.css';

import { SocketContext } from '../../context/SocketContext';

import { addMessage } from '../../redux/actions/userActions';
import { toggleShowMessages } from '../../redux/actions/gameActions';
import ChatInputArea from '../ChatInputArea';
import MessageTile from '../MessageTile';

const Chatbox = () => {
  const dispatch = useDispatch();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const user = useSelector((state) => state.users.user);
  const friends = useSelector((state) => state.friends);
  const activeTable = useSelector((state) => state.games.activeTable);
  const currentTables = useSelector((state) => state.games.currentTables);

  const conversations = useSelector((state) => state.chats.conversations);
  const currentConversationId = useSelector((state) => state.chats.currentConversation);

  const showMessages = useSelector((state) => state.games.showMessages);

  const { socket } = useContext(SocketContext);
  const bottomRef = useRef(null);





  useEffect(() => {
    if (currentConversationId && conversations) {
      let currentMessages = conversations[currentConversationId].messages;
      setMessages(currentMessages);
    }
  }, [currentConversationId, conversations]);








  // useEffect(() => {
  //   if (bottomRef.current) {
  //     bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [currentConversationId, conversations, messages]);
  //${currentFocus === viewConversations ? getViewHeight() : ''}


  return (
    <div className="chatbox-wrapper">

        <div className={`chatbox-message-container`}>

          {messages.map((message, index) => (
            <MessageTile key={index} message={message} />
          ))}

          {/* <div className="chat-bottom-ref" ref={bottomRef}></div> */}
        </div>

    </div>
  );
};
export default Chatbox;
