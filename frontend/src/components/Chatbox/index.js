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
  const conversations = useSelector(state => state.chats.conversations);
  const { socket } = useContext(SocketContext);
  const bottomRef = useRef(null);

  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)
  const [editedMessageId, setEditedMessageId] = useState(null)
  const [editedMessageContent, setEditedMessageContent] = useState('')


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
      if(conversations && conversations[activeTable.id]){
        setMessages(conversations[activeTable.id].messages)
      }
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    },[conversations, activeTable])


    // useEffect(()=>{
    //   if(currentTables && currentTables[activeTable.id]){
    //     setMessages(currentTables[activeTable.id].messages)
    //   }
    //   if (bottomRef.current) {
    //     bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    //   }
    // },[currentTables])
 
    const sendFriendRequest = () => {
      return
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


    
    const confirmDeleteMessage = () => {
      if (!user) return;
      if(user.id !== selectedMessage.user.id) return
      setIsDeletingMessage(true)
      setEditedMessageId(selectedMessage.message.id)
      setEditedMessageContent(' Delete message?')
    };


    const deleteMessage = () => {
      if (!user) return;
      if(user.id !== selectedMessage.user.id) return

      let editMessageObj = {
        tableId: activeTable?.id,
        userId: user.id,
        messageId : editedMessageId,
        newContent: editedMessageContent
      };
      socket.emit('delete_message', editMessageObj);

      setIsDeletingMessage(false)
      setEditedMessageId(null)
      setEditedMessageContent('')
    };


    const cancelDeleteMessage = () => {
      if (!user) return;
      if(user.id !== selectedMessage.user.id) return
      setIsDeletingMessage(false)
      setEditedMessageId(null)
      setEditedMessageContent('')
    };




    const editMessage = () => {
      if (!user) return;
      if(user.id !== selectedMessage.user.id) return
      setIsEditingMessage(true)
      setEditedMessageId(selectedMessage.message.id)
      setEditedMessageContent(selectedMessage.message.content)
    };



    const saveMessage = (e) => {
      e.preventDefault()
      if (!user) return;
      if(user.id !== selectedMessage.user.id) return

  
      let editMessageObj = {
        tableId: activeTable?.id,
        userId: user.id,
        messageId : editedMessageId,
        newContent: editedMessageContent
      };

      socket.emit('edit_message', editMessageObj);
      setIsEditingMessage(false)
      setEditedMessageId(null)
      setEditedMessageContent('')
    };

    const cancelEdit = () => {
      if (!user) return;
      if(user.id !== selectedMessage.user.id) return

      setIsEditingMessage(false)
      setEditedMessageId(null)
      setEditedMessageContent('')
    };


  return(

  <div className='chatbox-wrapper'> 
    <div className={`chatbox-container ${showMessages ? 'open' : 'minimize'}`}>
    <div className="message-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="chat-message"
                  onClick={() => setSelectedMessage(message)}
                  onMouseOver={() => setSelectedMessage(message)}
                  onMouseLeave={() => setSelectedMessage(null)}
                >


                  {user && selectedMessage === message &&
                  selectedMessage.user.id !== 1 &&
                  user.id !== selectedMessage.user.id &&
                  !isDeletingMessage && !isEditingMessage &&
                  (
                      <div
                        className="chat-message-add-friend"
                        onClick={sendFriendRequest}
                      >
                        <i className="fa-solid fa-user-plus"></i>
                      </div>
                    )}



                  {user && selectedMessage === message &&
                  user.id === selectedMessage.user.id &&
                  !isDeletingMessage && !isEditingMessage &&
                  (
                    <div className='flex center chat-message-buttons-container'>
                      <div
                        className="chat-message-option"
                        onClick={editMessage}
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </div>

                      <div
                      className="chat-message-option"
                      onClick={confirmDeleteMessage}
                      >
                      <i className="delete-x fa-solid fa-x"></i>
                      </div>
                    </div>
                    )}

                  {user && selectedMessage === message &&
                    user.id === selectedMessage.user.id &&
                    isEditingMessage &&
                    (
                      <div className='flex center chat-message-buttons-container'>

                          <div
                            className="chat-message-option"
                            onClick={(e)=>saveMessage(e)}
                          >
                            <i className="delete-check fa-solid fa-check"></i>
                          </div>

                          <div
                          className="chat-message-option"
                          onClick={cancelEdit}
                          >
                          <i className="delete-x fa-solid fa-x"></i>
                          </div>
                        </div>
                  )}



                  {user && selectedMessage === message &&
                  user.id === selectedMessage.user.id &&
                  isDeletingMessage &&
                  (
                    <div className='flex center chat-message-buttons-container'>

                        <div
                          className="chat-message-option"
                          onClick={deleteMessage}
                        >
                          <i className="delete-check fa-solid fa-check"></i>
                        </div>

                        <div
                        className="chat-message-option"
                        onClick={cancelDeleteMessage}
                        >
                        <i className="delete-x fa-solid fa-x"></i>
                        </div>
                      </div>
                )}







                  <div className="username-container">
                    <div className="chat-message-username">
                      {message?.user?.username + ':'}
                    </div>
                  </div>


                    {message.message.id !== editedMessageId && (<div className="chat-message-content">{message?.message?.content}{message.id}</div>)}

                    {message.message.id === editedMessageId && isEditingMessage &&  (

                      // <div className="chat-message-content">asdasdfgasdgfasdgasdgasdg</div>
                      <form 
                      onSubmit={(e)=>saveMessage(e)}
                      
                      >
                        <input
                          className='editmessage-input'
                          type="text"
                          value={editedMessageContent} 
                          onInput={(e)=> setEditedMessageContent(e.target.value)}
                          
                          placeholder={editedMessageContent}
  
                          />

                          <button type='submit' style={{display:'none'}}></button>
                      </form>

                    )}

                    {message.message.id === editedMessageId && isDeletingMessage &&  (

                    <div className="chat-message-content">{editedMessageContent}</div>

                    )}
                  





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
