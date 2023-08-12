import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './MessageTile.css';

import { SocketContext } from '../../context/SocketContext';
import { WindowContext } from '../../context/WindowContext';

const MessageTile = ({message}) => {

  const dispatch = useDispatch()
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [date, setDate] = useState('');
  const [shortDate, setShortDate] = useState('');

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const user = useSelector(state => state.users.user);
  const friends = useSelector(state => state.friends);
  const activeTable = useSelector(state => state.games.activeTable);
  const currentTables = useSelector(state => state.games.currentTables);

  const conversations = useSelector(state => state.chats.conversations);
  const currentConversation = useSelector(state => state.chats.currentConversation);
  const showMessages = useSelector((state) => state.games.showMessages);
  
  const { socket } = useContext(SocketContext);
  const { windowWidth } = useContext(WindowContext);
  const bottomRef = useRef(null);

  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)
  const [editedMessageId, setEditedMessageId] = useState(null)
  const [editedMessageContent, setEditedMessageContent] = useState('')
  const [invitedFriends, setInvitedFriends] = useState({});
  const [showInviteFriendButton, setShowFriendInviteButton] = useState(false);



    useEffect(()=>{
      const shouldShowFriendInviteButton = () => {
        // Check if the user exists
        if (!user) return false;
  
        // Check if there is no selected message
        if (!selectedMessage) return false;

        // Check if the selected message is from roomAdmin
        if (selectedMessage.userId === 'e10d8de4-f4c7-0000-0000-000000000000') return false;        
  
        // Check if the selected message is from roomAdmin
        if (selectedMessage.username === 'Room') return false;   

        // Check if the selected message is from the current user
        if (selectedMessage.userId === user.id) return false;
  
        // Check if the selected message is from the default user
        if (selectedMessage.userId === 1) return false;
  
        // Check if the selected message's user is already a friend or has a pending request
        const currentFriends = friends.friends;
        const outgoingRequests = friends.outgoingRequests;
        const rejectedRequests = friends.rejectedRequests;
        const selectedMessageUserId = selectedMessage.userId;

        if (currentFriends[selectedMessageUserId] || outgoingRequests[selectedMessageUserId] || rejectedRequests[selectedMessageUserId] ) {
          return false;
        }
  
        // If none of the conditions above are met, show the invite button
        return true;
      }
  
      setShowFriendInviteButton(shouldShowFriendInviteButton());
    }, [selectedMessage, user, friends]);


    useEffect(()=>{
      if(!message) return
      function convertToReadableFormat(timestamp) {
        const date = new Date(timestamp);
    
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        const readableFormat = date.toLocaleString('en-US', options);
    
        return readableFormat;
    }

    let readableDate = convertToReadableFormat(message.createdAt)

    function convertToReadableFormatShort(timestamp) {
      const date = new Date(timestamp);
  
      const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
      const readableFormat = date.toLocaleString('en-US', options);
  
      return readableFormat;
  }

  let readableDateShort = convertToReadableFormatShort(message.createdAt)

    setDate(readableDate)
    setShortDate(readableDateShort)



      

    }, [ message ]);



 
    const sendFriendRequest = () => {
      if (!user) return;
  
      const recipientId = selectedMessage.userId;
      const recipientUsername = selectedMessage.username;
  
      let friendRequestObj = {
        recipientId,
        recipientUsername,
      };
  
      //  cant request self, friends does not exist, recipientUsername is already in the pending list, recipientUsername is already in the accepted list.
      if (
        user.username === recipientUsername ||
        !friends ||
        (friends.outgoingRequests &&
          friends.outgoingRequests[recipientUsername]) ||
        (friends.friends && friends.friends[recipientUsername])
      )
        return;
      socket.emit('send_friend_request', friendRequestObj);
    };


    
    const confirmDeleteMessagePrompt = () => {
      if (!user) return;
      if(user.id !== selectedMessage.userId) return
      setIsDeletingMessage(true)
      setEditedMessageId(selectedMessage.id)
      setEditedMessageContent(' Delete message?')
    };


    const deleteMessage = () => {
      if (!user) return;
      if(user.id !== selectedMessage.userId) return

      let editMessageObj = {
        conversationId: currentConversation,
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
      if(user.id !== selectedMessage.userId) return
      setIsDeletingMessage(false)
      setEditedMessageId(null)
      setEditedMessageContent('')
    };




    const editMessage = () => {
      if (!user) return;
      if(user.id !== selectedMessage.userId) return
      setIsEditingMessage(true)
      setEditedMessageId(selectedMessage.id)
      setEditedMessageContent(selectedMessage.content)
    };



    const saveMessage = (e) => {
      e.preventDefault()
      if (!user) return;
      if(user.id !== selectedMessage.userId) return

  
      let editMessageObj = {
        conversationId: currentConversation,
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
      if(user.id !== selectedMessage.userId) return

      setIsEditingMessage(false)
      setEditedMessageId(null)
      setEditedMessageContent('')
    };





  return (

    <div className="chatmessage-wrapper flex"> 


<div className="chatmessage-image-wrapper flex"> 
  <div className="chatmessage-image-container flex center"> 
            <div className={`friendtile-profile-image-container flex center`}>
              <div className={`friendtile-profile-image flex center`}>
                {`:)`}
              </div>
            </div>

  </div>

</div>

    <div
    className="chatmessage-container flex"
    onClick={() => setSelectedMessage(message)}
    onMouseOver={() => setSelectedMessage(message)}
    onMouseLeave={() => setSelectedMessage(null)}
  >

    <div className="chatmessage-username-date-container flex">

      <div className="chatmessage-username"> {message?.username} </div>
      {
     selectedMessage !== message &&
      <div className="chatmessage-date flex"> {windowWidth > 600 ? date : shortDate} </div>
      }

      {
     selectedMessage === message &&
     showInviteFriendButton &&
     (
      <div className='flex center chat-message-buttons-container'>

         <div
           className="chat-message-option"
           onClick={sendFriendRequest}
         >
           <i className="fa-solid fa-user-plus"></i>
         </div>
         </div>
       )}


{user && selectedMessage === message &&
    user.id === selectedMessage.userId &&
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
        onClick={confirmDeleteMessagePrompt}
        >
        <i className="delete-x fa-solid fa-x"></i>
        </div>
      </div>
      )}





{user && selectedMessage === message &&
      user.id === selectedMessage.userId &&
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
    user.id === selectedMessage.userId &&
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







        
    </div>

    {message.id === editedMessageId && isEditingMessage &&  (

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


    {message.id !== editedMessageId && (<div className="chat-message-content">{message?.content}</div>)}

    {message.id === editedMessageId && isDeletingMessage &&  (

      <div className="chat-message-content">{editedMessageContent}</div>

    )}





</div>

</div>
)
}
export default MessageTile



  //   {/* {



  //   selectedMessage === message &&
  //   showInviteFriendButton &&
  //   (
  //       <div
  //         className="chat-message-add-friend"
  //         onClick={sendFriendRequest}
  //       >
  //         <i className="fa-solid fa-user-plus"></i>
  //       </div>
  //     )}



    // {user && selectedMessage === message &&
    // user.id === selectedMessage.userId &&
    // !isDeletingMessage && !isEditingMessage &&
    // (
    //   <div className='flex center chat-message-buttons-container'>
    //     <div
    //       className="chat-message-option"
    //       onClick={editMessage}
    //     >
    //       <i className="fa-regular fa-pen-to-square"></i>
    //     </div>

    //     <div
    //     className="chat-message-option"
    //     onClick={confirmDeleteMessagePrompt}
    //     >
    //     <i className="delete-x fa-solid fa-x"></i>
    //     </div>
    //   </div>
    //   )}





  //   {user && selectedMessage === message &&
  //     user.id === selectedMessage.userId &&
  //     isEditingMessage &&
  //     (
  //       <div className='flex center chat-message-buttons-container'>

  //           <div
  //             className="chat-message-option"
  //             onClick={(e)=>saveMessage(e)}
  //           >
  //             <i className="fa-solid fa-check"></i>
  //           </div>

  //           <div
  //           className="chat-message-option"
  //           onClick={cancelEdit}
  //           >
  //           <i className="fa-solid fa-x"></i>
  //           </div>
  //         </div>
  //   )}



  //   {user && selectedMessage === message &&
  //   user.id === selectedMessage.userId &&
  //   isDeletingMessage &&
  //   (
  //     <div className='flex center chat-message-buttons-container'>

  //         <div
  //           className="chat-message-option"
  //           onClick={deleteMessage}
  //         >
  //           <i className="fa-solid fa-check"></i>
  //         </div>

  //         <div
  //         className="chat-message-option"
  //         onClick={cancelDeleteMessage}
  //         >
  //         <i className="fa-solid fa-x"></i>
  //         </div>
  //       </div>
  // )}







  //   <div className="username-date-container">
  //     <div className="chat-message-username">
  //       {message?.username + ':'}{date}
  //     </div>
  //   </div>


  //     {message.id !== editedMessageId && (<div className="chat-message-content">{message?.content}</div>)}

  //     {message.id === editedMessageId && isEditingMessage &&  (

  //       // <div className="chat-message-content">asdasdfgasdgfasdgasdgasdg</div>
  //       <form 
  //       onSubmit={(e)=>saveMessage(e)}
        
  //       >
  //         <input
  //           className='editmessage-input'
  //           type="text"
  //           value={editedMessageContent} 
  //           onInput={(e)=> setEditedMessageContent(e.target.value)}
            
  //           placeholder={editedMessageContent}

  //           />

  //           <button type='submit' style={{display:'none'}}></button>
  //       </form>

  //     )}

  //     {message.id === editedMessageId && isDeletingMessage &&  (

  //     <div className="chat-message-content">{editedMessageContent}</div>

  //     )}
  //    */}





