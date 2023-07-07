import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './InsuranceModal.css';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import * as sessionActions from '../../redux/middleware/users';
import { showGamesAction } from '../../redux/actions/gameActions';

function InsuranceModal() {
  const dispatch = useDispatch();
  const history = useHistory();
  const formRef = useRef(null);
  
  const [amount, setAmount] = useState('');
  
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  
  const user = useSelector((state) => state.users.user);
  const table = useSelector((state) => state.games.activeTable);
  
  
  

   

  const accept = () => {
    const {tableId, seatNumber} = updateObj
    // dispatch(gameActions.leaveSeat(table.id, seatNumber))
    
    // socket emit the seat taken, tableID, seat number, player info
    const seatObj = {
      seat:seatNumber,
      tableId
    }
    


    socket.emit('accept_insurance', seatObj)
    closeModal()
    setUpdateObj(null)
    return
  }



  const decline = () => {
    closeModal()
    setUpdateObj(null)
  }


 
  return (
    <div className="insurancemodal-wrapper">

        
        <div className="insurancemodal-container flex center">
          <div className="insurancemodal-header white flex center">
            Insurance?
          </div>

          <div className="insurancemodal-user-buttons flex between">
            <div className="insurancemodal-decline flex center" onClick={decline}>
            Decline
            </div>
            <div className={`insurancemodal-accept flex center`}onClick={accept}>
            Accept
            </div>
          </div>
        </div>

    </div>
  );
}

export default InsuranceModal;
