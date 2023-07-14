import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './TableClosedModal.css';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import * as sessionActions from '../../redux/middleware/users';
import { showGamesAction, leaveTableAction } from '../../redux/actions/gameActions';

function TableClosedModal() {
  const dispatch = useDispatch();
  const history = useHistory();
  const formRef = useRef(null);
  
  const [amount, setAmount] = useState('');
  
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  
  const user = useSelector((state) => state.users.user);
  const table = useSelector((state) => state.games.activeTable);
  
  
  
  
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
  
  

  const cancel = () => {
    closeModal()
    setUpdateObj(null)
  }





 
  return (
    <div className="tableclosed-wrapper" ref={formRef}>

        <div className="tableclosed-container flex center">
          <div className="tableclosed-header white flex center">
            The table has closed.
          </div>

          <div className="tableclosed-user-buttons flex center">
            <div className="tableclosed-confirm flex center" onClick={cancel}>
            Ok
            </div>
          </div>
        </div>

    </div>
  );
}

export default TableClosedModal;
