import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import FriendTile from '../FriendTile';

import './StartConversationModal.css'


const StartConversationModal = () => {

  const { modal, openModal, closeModal, updateObj, setUpdateObj } = useContext(ModalContext);
  const { socket } = useContext(SocketContext);
  const user = useSelector((state) => state.users.user);
  const friends = useSelector((state) => state.friends);

  const dispatch = useDispatch();
  const formRef = useRef()

  const [friendList, setFriendList] = useState({})

  const [chatName, setChatName] = useState('');
  const [chatNameText, setChatNameText] = useState({});
  
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidationError, setShowValidationError] = useState(false);

  const [disabledButton, setDisabledButton] = useState(false);
  const [buttonClass, setButtonClass] = useState('startconversation-submit-button');

  const chatNameRef = useRef()

  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setButtonClass('startconversation-submit-button disabled');
    } else {
      setButtonClass('startconversation-submit-button');
    }
  }, [validationErrors]);



  useEffect(() => {
    const errors = {};
    if (!chatName.length) errors['chatName'] = 'Please enter at least one character';
    if (!chatName.trim().length) errors['trimmed-error'] = 'Please enter at least one character';
    if (chatName.length > 30) errors['length'] = 'Must be 30 characters or less';
    setValidationErrors(errors);
  }, [chatName]);



  useEffect(() => {

    chatNameRef.current.focus();


    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleList = (friend, option) =>{
    let newFriendList = {...friendList}

    if(option === 'add'){
      newFriendList[friend.id] = friend
    }

    if(newFriendList[friend.id] && option === 'remove'){
      delete newFriendList[friend.id]
    }

    setFriendList(newFriendList)

  }


  const startGroupConversation = () =>{


    console.log(friendList);


    if(validationErrors['length'] || validationErrors['trimmed-error']){
      if(!showValidationError){
        setShowValidationError(true)
        setTimeout(() => {
          setShowValidationError(false)
        }, 3000);
      }
      return
    }

    if(Object.values(validationErrors).length){
      return
    }

    console.log(friendList);
    let friendListNames = Object.values(friendList).map(friend=>friend.friend.username)
    let friendListIds = Object.values(friendList).map(friend=>friend.friend.id)

    console.log(friendListNames);

    let convoObj = {
      chatName,
      friendList,
      friendListNames,
      friendListIds
    }



    socket.emit('start_conversation', convoObj)
    closeModal()







    return
  }







  return (
    <div className="startconversation-container flex between" ref={formRef}>
    <div className="startconversation-header">Start Conversation</div>


    {showValidationError && (
      <div className={`friendspage-name flex center validation-handling`}>

        {validationErrors['trimmed-error'] && validationErrors['trimmed-error']}
        {showValidationError && validationErrors['length'] && validationErrors['length']}
      </div>
    )}

    <form onSubmit={(e)=>{
      e.preventDefault()
      startGroupConversation()
      }} 
      className="startconversation-form flex between"
      >

    <label className="startconversation-label flex center">Chat Name</label>
        <input
          ref={chatNameRef}
          className="startconversation-chatname"
          type="text"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          required
          placeholder={validationErrors['chatName'] || ''}
        />

        {/* <button 
          type="submit" 
          className={buttonClass}
          disabled={Object.keys(validationErrors).length > 0 || disabledButton}>
            Start Conversation
        </button> */}

        <button 
          type="submit" 
          style={{display:'none'}}
          className={buttonClass}
          disabled={Object.keys(validationErrors).length > 0 || disabledButton}>
            Start Conversation
        </button>




    </form>


    <div className="startconversation-friendinvite-container">

    {friends &&
      Object.entries(friends.friends).map(([key, friend], index) => {
        return (
          <FriendTile key={index} friend={friend} type={'invite-to-conversation'} cb={handleList} isInvited={friendList[friend?.id]} />
        );
      })}

    </div>


    <div onClick={startGroupConversation} className={buttonClass}>

      Start Conversation

    </div>


  </div>
);
  
}
export default StartConversationModal