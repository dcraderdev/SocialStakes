import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './RemoveFriendModal.css';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import * as sessionActions from '../../redux/middleware/users';
import { showGamesAction, leaveTableAction } from '../../redux/actions/gameActions';

function RemoveFriendModal() {
  const dispatch = useDispatch();
  const history = useHistory();
  const formRef = useRef(null);
  
  
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        closeModal();
        setUpdateObj(null)
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  

  const removeFriend = () => {
    if(!updateObj) return
    const {friendInfo} = updateObj


    console.log(friendInfo);

    let friendObj = {
      friendshipId: friendInfo.id,
      friendId: friendInfo.friend.id,
      conversationId: friendInfo.conversationId
    }
    socket.emit('remove_friend', friendObj)
    closeModal()
    setUpdateObj(null)
    return
  }




  const cancel = () => {
    closeModal()
    setUpdateObj(null)
  }

  return (
    <div className="leavemodal-wrapper" ref={formRef}>

        
        <div className="leavemodal-container flex center">
          <div className="leavemodal-header white flex center">
            Remove friend?
          </div>

          <div className="leavemodal-user-buttons flex between">
            <div className="leavemodal-cancel flex center" onClick={cancel}>
            Cancel
            </div>
            <div className={`leavemodal-addbalance flex center`}onClick={removeFriend}>
            Remove
            </div>
          </div>
        </div>

    </div>
  );
}

export default RemoveFriendModal;
