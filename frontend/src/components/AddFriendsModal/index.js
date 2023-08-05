import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import FriendTile from '../FriendTile';

import './AddFriendsModal.css'


const AddFriendsModal = () => {

  const { modal, openModal, closeModal, updateObj, setUpdateObj } = useContext(ModalContext);
  const { socket } = useContext(SocketContext);
  const user = useSelector((state) => state.users.user);
  const friends = useSelector((state) => state.friends);
  const conversations = useSelector((state) => state.chats.conversations);

  const dispatch = useDispatch();
  const formRef = useRef()

  const [friendList, setFriendList] = useState({})

  const [chatName, setChatName] = useState('');
  
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidationError, setShowValidationError] = useState(false);

  const [disabledButton, setDisabledButton] = useState(false);
  const [buttonClass, setButtonClass] = useState('startconversation-submit-button');


  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setButtonClass('startconversation-submit-button disabled');
    } else {
      setButtonClass('startconversation-submit-button');
    }
  }, [validationErrors]);




  useEffect(() => {
    const errors = {};
    if (!Object.values(friendList).length) errors['none-added'] = 'Please add at least one friend';
    setValidationErrors(errors);
  }, [friendList]);



  useEffect(() => {
    if(updateObj.currentConversationId && conversations){
      console.log(updateObj.currentConversationId);
      console.log(conversations);
      console.log();
      setChatName(conversations[updateObj.currentConversationId].chatName)
    }


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
    if(validationErrors['none-added']){
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
      conversationId: updateObj.currentConversationId,
      friendList,
      friendListNames,
      friendListIds
    }

    socket.emit('add_friends_to_conversation', convoObj)
    closeModal()

    return
  }







  return (
    <div className="addfriends-container flex between" ref={formRef}>
    <div className="addfriends-header">Add friends</div>

    <div className="addfriends-chatname flex center">{chatName}</div>


    {showValidationError && (
      <div className={`friendspage-name flex center validation-handling`}>

        {validationErrors['trimmed-error'] && validationErrors['trimmed-error']}
        {showValidationError && validationErrors['length'] && validationErrors['length']}
      </div>
    )}



    <div className="addfriends-friendinvite-container">

    {friends &&
      Object.entries(friends.friends).map(([key, friend], index) => {
        return (
          <FriendTile key={index} friend={friend} type={'invite-to-conversation'} cb={handleList} isInvited={friendList[friend?.id]} />
        );
      })}

    </div>


    <div onClick={startGroupConversation} className={buttonClass}>

      Add friends

    </div>


  </div>
);
  
}
export default AddFriendsModal