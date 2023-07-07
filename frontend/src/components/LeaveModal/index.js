import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './LeaveModal.css';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import * as sessionActions from '../../redux/middleware/users';
import { showGamesAction } from '../../redux/actions/gameActions';

function LeaveModal() {
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
  
  

  const leaveSeat = () => {
    const {seatNumber, tableBalance} = updateObj
    // dispatch(gameActions.leaveSeat(table.id, seatNumber))
    
    // socket emit the seat taken, tableID, seat number, player info
    const seatObj = {
      room: table.id,
      seat:seatNumber,
      user: user,
      tableBalance
    }
    
    socket.emit('leave_seat', seatObj)
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
            Leave Seat?
          </div>

          <div className="leavemodal-user-buttons flex between">
            <div className="leavemodal-cancel flex center" onClick={cancel}>
            Cancel
            </div>
            <div className={`leavemodal-addbalance flex center`}onClick={leaveSeat}>
            Leave
            </div>
          </div>
        </div>

    </div>
  );
}

export default LeaveModal;
