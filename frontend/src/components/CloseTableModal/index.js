import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './CloseTableModal.css';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import * as sessionActions from '../../redux/middleware/users';
import { showGamesAction, leaveTableAction } from '../../redux/actions/gameActions';

function CloseTableModal() {
  const dispatch = useDispatch();
  const history = useHistory();
  const formRef = useRef(null);
  
  const [amount, setAmount] = useState('');
  
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  
  const user = useSelector((state) => state.users.user);

  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  
  const [isHandInProgress, setIsHandInProgress] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  
  useEffect(() => {
    if(activeTable && currentTables && currentTables[activeTable.id]){
      let handInProgress = currentTables[activeTable.id]?.handInProgress;
      setIsHandInProgress(handInProgress)
    }
  }, [currentTables, activeTable]);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        closeModal();
        openModal('tableSettings')
        setUpdateObj(null)
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  

  const closeTable = () => {
    if(isHandInProgress){
      setShowValidationError(true)
      setTimeout(() => {
        setShowValidationError(false)
      }, 3000);
      return
    }
    const { tableId } = updateObj
    socket.emit('close_table', tableId)    
    closeModal()
    setUpdateObj(null)
    return
  }



  const cancel = () => {
    closeModal()
    openModal('tableSettings')
    setUpdateObj(null)
  }

 
  return (
    <div className="leavemodal-wrapper" ref={formRef}>

        
        <div className="leavemodal-container flex center">
          <div className="leavemodal-header white flex center">
            Close Table?
          </div>
          {showValidationError && (
            <div style={{color:'red', 'font-size':15}}>Cannot close table while hand is in progress</div>
          )}

          <div className="leavemodal-user-buttons flex between">
            <div className="leavemodal-cancel flex center" onClick={cancel}>
            Cancel
            </div>
            <div className={`leavemodal-addbalance flex center`}onClick={closeTable}>
            Close
            </div>
          </div>
        </div>

    </div>
  );
}

export default CloseTableModal;
