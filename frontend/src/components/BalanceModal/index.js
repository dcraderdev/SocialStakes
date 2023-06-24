import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './BalanceModal.css';
import { ModalContext } from '../../context/ModalContext';
import * as sessionActions from '../../redux/middleware/users';
import { showGamesAction } from '../../redux/actions/gameActions';

function BalanceModal() {

  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  const user = useSelector((state) => state.users.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const formRef = useRef(null);

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


  const addBalance = () => {
    const newBalance = 1000
    dispatch(addBalance(user.id, newBalance))
    setUpdateObj(null)
  }

  const cancel = () => {
    closeModal()
    dispatch(showGamesAction())
    setUpdateObj(null)
  }

  return (
    <div className="balancemodal-wrapper" ref={formRef}>
      <div className="balancemodal-container flex center">
        <div className="balancemodal-header flex center">
          Insufficient Account Balance!
        </div>
        <div className="balancemodal-subheader flex center">
          {`Minimum buy-in: $${updateObj}`}
        </div>
        <div className="balancemodal-memo-container flex between">
          <div className="balancemodal-memo">{`Balance:`}</div>
          <div className="balancemodal-balance">{`${user?.balance ? user.balance : 0 }`}</div>
          
        </div>
        <div className='balancemodal-user-buttons flex between'>        
          <div className='balancemodal-addbalance flex center' onClick={addBalance}>Add Balance(1000)</div>
          <div className='balancemodal-cancel flex center' onClick={cancel}>Cancel</div>
        </div>

      </div>
    
    </div>
  );
}

export default BalanceModal;
