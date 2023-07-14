import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Chatbox.css';

import { SocketContext } from '../../context/SocketContext';

import { addMessage} from '../../redux/actions/userActions';
import { toggleShowMessages } from '../../redux/actions/gameActions';

const Chatbox = ({showMessages}) => {
  const dispatch = useDispatch()
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const user = useSelector(state => state.users.user);
  const friends = useSelector(state => state.users.friends);
  const activeTable = useSelector(state => state.games.activeTable);
  const currentTables = useSelector(state => state.games.currentTables);
  const { socket } = useContext(SocketContext);
  const bottomRef = useRef(null);


    // Handle Sending Messages
    const handleSubmit = (e) => {
      if (e) e.preventDefault();
      if (!user) return;
      const newMessageObj = {}
      newMessageObj.content = newMessage
      newMessageObj.tableId = activeTable.id
      newMessageObj.user = user

      socket.emit('message', newMessageObj);
      setNewMessage('');
    }
  




    useEffect(()=>{
      if(currentTables && currentTables[activeTable.id]){
        setMessages(currentTables[activeTable.id].messages)
      }
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },[currentTables])
 
   


    const sendFriendRequest = () => {
      if (!user) return;
  
      const userId = user.id;
      const userRank = user.rank;
      const newFriendId = selectedMessage.sender.id;
      const newFriendUsername = selectedMessage.sender.username;
      const newFriendRoom = selectedMessage.sender.userRoom;
      const newFriendRank = selectedMessage.sender.rank;
  
      let friendRequestObj = {
        userId,
        userRank,
        newFriendId,
        newFriendUsername,
        newFriendRoom,
        newFriendRank,
      };
  
      //  cant request self, friends does not exist, newFriendUsername is already in the pending list, newFriendUsername is already in the accepted list.
      if (
        user.username === newFriendUsername ||
        !friends ||
        (friends.outgoingRequests &&
          friends.outgoingRequests[newFriendUsername]) ||
        (friends.friends && friends.friends[newFriendUsername])
      )
        return;
      socket.emit('send_friend_request', friendRequestObj);
    };

  return(

  <div className='chatbox-wrapper'> 
    <div className={`chatbox-container ${showMessages ? 'open' : 'minimize'}`}>
    <div className="message-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="chat-message"
                  // onClick={() => setSelectedMessage(message)}
                  // onMouseOver={() => setSelectedMessage(message)}
                  // onMouseLeave={() => setSelectedMessage(null)}
                >


                  {selectedMessage === message && (
                      <div
                        className="chat-message-add-friend"
                        onClick={sendFriendRequest}
                      >
                        <i className="fa-solid fa-user-plus"></i>
                      </div>
                    )}

                  <div className="username-container">
                    <div className="chat-message-username">
                      {message?.user?.username + ':'}
                    </div>
                  </div>

                  <div className="chat-message-content">{message?.content}</div>
                </div>
              ))}
              <div className="chat-bottom-ref" ref={bottomRef}></div>
            </div>
            <div className="new-message-container">
        
        
        <div className="new-message-controls">
          <form onSubmit={handleSubmit}>
            <label>
              <input
                className="new-message-input"
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder=' Type chat message here'
              />
            </label>
            <button className="send-new-message-button" onClick={handleSubmit}>
              Send
            </button>
          </form>
        </div>



    </div> 
    </div> 
  </div>
  )
 

};
export default Chatbox;
