import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Chatbox.css';

import { SocketContext } from '../../context/SocketContext';

import { addMessage} from '../../redux/actions/userActions';
import { toggleShowMessages } from '../../redux/actions/gameActions';
import ChatInputArea from '../ChatInputArea';

const Chatbox = ({conversation}) => {
  const dispatch = useDispatch()
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const user = useSelector(state => state.users.user);
  const friends = useSelector(state => state.friends);
  const activeTable = useSelector(state => state.games.activeTable);
  const currentTables = useSelector(state => state.games.currentTables);
  const conversations = useSelector(state => state.chats.conversations);
  const showMessages = useSelector((state) => state.games.showMessages);
  
  const { socket } = useContext(SocketContext);
  const bottomRef = useRef(null);

  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)
  const [editedMessageId, setEditedMessageId] = useState(null)
  const [editedMessageContent, setEditedMessageContent] = useState('')
  const [invitedFriends, setInvitedFriends] = useState({});
  const [showInviteFriendButton, setShowFriendInviteButton] = useState(false);


    // // Handle Sending Messages
    // const handleSubmit = (e) => {
    //   if (e) e.preventDefault();
    //   if (!user) return;
    //   const newMessageObj = {}
    //   newMessageObj.content = newMessage
    //   newMessageObj.tableId = activeTable.id
    //   newMessageObj.user = user

    //   socket.emit('message', newMessageObj);
    //   setNewMessage('');
    // }
  

    // useEffect(()=>{
    //   if(conversations && conversations[activeTable.id]){
    //     setMessages(conversations[activeTable.id].messages)
    //   }
    //   if (bottomRef.current && showMessages) {
    //     bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    //   }
    // },[conversations, activeTable])




    // useEffect(()=>{
    //   const shouldShowFriendInviteButton = () => {
    //     // Check if the user exists
    //     if (!user) return false;
  
    //     // Check if there is no selected message
    //     if (!selectedMessage) return false;
  
    //     // Check if the selected message is from the current user
    //     if (selectedMessage.user.id === user.id) return false;
  
    //     // Check if the selected message is from the default user
    //     if (selectedMessage.user.id === 1) return false;
  
    //     // Check if the selected message's user is already a friend or has a pending request
    //     const currentFriends = friends.friends;
    //     const outgoingRequests = friends.outgoingRequests;
    //     const selectedMessageUserId = selectedMessage.user.id;


    //   console.log(outgoingRequests);




    //     if (currentFriends[selectedMessageUserId] || outgoingRequests[selectedMessageUserId]) {
    //       return false;
    //     }
  
    //     // If none of the conditions above are met, show the invite button
    //     return true;
    //   }
  
    //   setShowFriendInviteButton(shouldShowFriendInviteButton());
    // }, [selectedMessage, user, friends]);
  
 
    // const sendFriendRequest = () => {
    //   console.log('clik');
    //   if (!user) return;
  
    //   const recipientId = selectedMessage.user.id;
    //   const recipientUsername = selectedMessage.user.username;
  
    //   let friendRequestObj = {
    //     recipientId,
    //     recipientUsername,
    //   };
  
    //   //  cant request self, friends does not exist, recipientUsername is already in the pending list, recipientUsername is already in the accepted list.
    //   if (
    //     user.username === recipientUsername ||
    //     !friends ||
    //     (friends.outgoingRequests &&
    //       friends.outgoingRequests[recipientUsername]) ||
    //     (friends.friends && friends.friends[recipientUsername])
    //   )
    //     return;
    //   socket.emit('send_friend_request', friendRequestObj);
    // };


    
    // const confirmDeleteMessage = () => {
    //   if (!user) return;
    //   if(user.id !== selectedMessage.user.id) return
    //   setIsDeletingMessage(true)
    //   setEditedMessageId(selectedMessage.message.id)
    //   setEditedMessageContent(' Delete message?')
    // };


    // const deleteMessage = () => {
    //   if (!user) return;
    //   if(user.id !== selectedMessage.user.id) return

    //   let editMessageObj = {
    //     tableId: activeTable?.id,
    //     userId: user.id,
    //     messageId : editedMessageId,
    //     newContent: editedMessageContent
    //   };
    //   socket.emit('delete_message', editMessageObj);

    //   setIsDeletingMessage(false)
    //   setEditedMessageId(null)
    //   setEditedMessageContent('')
    // };


    // const cancelDeleteMessage = () => {
    //   if (!user) return;
    //   if(user.id !== selectedMessage.user.id) return
    //   setIsDeletingMessage(false)
    //   setEditedMessageId(null)
    //   setEditedMessageContent('')
    // };




    // const editMessage = () => {
    //   if (!user) return;
    //   if(user.id !== selectedMessage.user.id) return
    //   setIsEditingMessage(true)
    //   setEditedMessageId(selectedMessage.message.id)
    //   setEditedMessageContent(selectedMessage.message.content)
    // };



    // const saveMessage = (e) => {
    //   e.preventDefault()
    //   if (!user) return;
    //   if(user.id !== selectedMessage.user.id) return

  
    //   let editMessageObj = {
    //     tableId: activeTable?.id,
    //     userId: user.id,
    //     messageId : editedMessageId,
    //     newContent: editedMessageContent
    //   };

    //   socket.emit('edit_message', editMessageObj);
    //   setIsEditingMessage(false)
    //   setEditedMessageId(null)
    //   setEditedMessageContent('')
    // };

    // const cancelEdit = () => {
    //   if (!user) return;
    //   if(user.id !== selectedMessage.user.id) return

    //   setIsEditingMessage(false)
    //   setEditedMessageId(null)
    //   setEditedMessageContent('')
    // };


  return(

  <div className='chatbox-wrapper'> 
    <div className={`chatbox-container`}>
    <div className="message-container">
              {/* {messages.map((message, index) => (
                <div
                  key={index}
                  className="chat-message"
                  onClick={() => setSelectedMessage(message)}
                  onMouseOver={() => setSelectedMessage(message)}
                  onMouseLeave={() => setSelectedMessage(null)}
                >


                  {
                  selectedMessage === message &&
                  showInviteFriendButton &&
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
                            <i className="fa-solid fa-check"></i>
                          </div>

                          <div
                          className="chat-message-option"
                          onClick={cancelEdit}
                          >
                          <i className="fa-solid fa-x"></i>
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
                          <i className="fa-solid fa-check"></i>
                        </div>

                        <div
                        className="chat-message-option"
                        onClick={cancelDeleteMessage}
                        >
                        <i className="fa-solid fa-x"></i>
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
              ))} */}
              <div className="chat-bottom-ref" ref={bottomRef}></div>
            </div>

              <div className='chatbox-chatinput-container'>
                <ChatInputArea />
              </div>


            {/* <div className="new-message-container">
        
        
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



    </div>  */}
    </div> 
  </div>
  )
 

};
export default Chatbox;
