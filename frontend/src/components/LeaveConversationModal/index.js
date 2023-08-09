import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './LeaveConversationModal.css';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import * as sessionActions from '../../redux/middleware/users';
import { showGamesAction, leaveTableAction } from '../../redux/actions/gameActions';

function LeaveConversationModal() {
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
  
  

  const leaveConversation = () => {
    if(!updateObj) return
    const {currentConversationId} = updateObj
    let leaveObj = {
      conversationId:currentConversationId
    }
    socket.emit('leave_conversation', leaveObj)
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
            Leave Conversation?
          </div>

          <div className="leavemodal-user-buttons flex between">
            <div className="leavemodal-cancel flex center" onClick={cancel}>
            Cancel
            </div>
            <div className={`leavemodal-addbalance flex center`}onClick={leaveConversation}>
            Leave
            </div>
          </div>
        </div>

    </div>
  );
}

export default LeaveConversationModal;
