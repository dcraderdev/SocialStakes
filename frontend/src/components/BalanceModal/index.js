import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './BalanceModal.css';
import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import * as sessionActions from '../../redux/middleware/users';
import { showGamesAction } from '../../redux/actions/gameActions';

function BalanceModal() {
  const dispatch = useDispatch();
  const history = useHistory();
  const formRef = useRef(null);

  const [amount, setAmount] = useState('');
  const [modalType, setModalType] = useState('');
  
  const {socket} = useContext(SocketContext)
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  
  const user = useSelector((state) => state.users.user);
  const balance = useSelector((state) => state.users.balance);
  const table = useSelector((state) => state.games.activeTable);

  const INIT_DEPOSIT_INSUFFICIENT_FUNDS = 'user/INITIAL_DEPOSIT_INSUFFICIENT_FUNDS'
  const INIT_DEPOSIT_SUFFICIENT_FUNDS = 'user/INITIAL_DEPOSIT_SUFFICIENT'
  const ADD_DEPOSIT = 'user/ADDITIONAL_DEPOSIT'




  const handleSetFunding = (e) => {
    if(e.target.value < 0){
      setAmount(0)
    } else {
      e.target.value > balance ? setAmount(balance): setAmount(e.target.value)
    }

  }


  const fundTable = () => {
    console.log(parseInt(amount));

    if(amount<updateObj.minBet || amount === '' ){
      return
    }

    let roundedAmount = parseInt(amount)
    let seat = updateObj.seatNumber


    // socket emit the seat taken, tableID, seat number, player info
    const seatObj = {
      room: table.id,
      seat,
      user: user,
      amount: roundedAmount
    }
    
    socket.emit('take_seat', seatObj)
    closeModal()
    setUpdateObj(null)
    return

  };

  const addFundsToTable = () => {
    console.log(parseInt(amount));

    if(amount<updateObj.minBet || amount === '' ){
      return
    }

    let roundedAmount = parseInt(amount)
    let seat = updateObj.seatNumber


    // socket emit the seat taken, tableID, seat number, player info
    const seatObj = {
      tableId: table.id,
      seat,
      userId: user.id,
      amount: roundedAmount
    }
    
    socket.emit('add_funds', seatObj)
    closeModal()
    setUpdateObj(null)
    return

  };

  

  //Hanlde what type of modal we are showing
  useEffect(() => {
    if(user && updateObj && updateObj.type ){
      if(updateObj.type === 'initDeposit'){
        if(updateObj.minBet && balance < updateObj.minBet){
          setModalType(INIT_DEPOSIT_INSUFFICIENT_FUNDS)
        }
        if(updateObj.minBet && balance >= updateObj.minBet){
          setModalType(INIT_DEPOSIT_SUFFICIENT_FUNDS)
        }


      }
      if(updateObj.type === 'addDeposit'){setModalType(ADD_DEPOSIT)}
    }
  }, [updateObj]);


//Hanlde clicking outside of modal
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

// Add 1k to user balance
  const addBalance = () => {

    const newBalance = 1000
    dispatch(addBalance(user.id, newBalance))
    setUpdateObj(null)
  }

  
  const cancel = () => {
    closeModal()
    setUpdateObj(null)
  }

  


  return (
    <div className="balancemodal-wrapper" ref={formRef}>


      {/* Not enough Balance */}
      {modalType === INIT_DEPOSIT_INSUFFICIENT_FUNDS && (
        <div className="balancemodal-container flex center">
          <div className="balancemodal-header flex center">
            Insufficient Account Balance!
          </div>
          <div className="balancemodal-subheader flex center">
            {`Minimum buy-in: $${updateObj.minBet}`}
          </div>
          <div className="balancemodal-memo-container flex between">
            <div className="balancemodal-memo">{`Balance:`}</div>
            <div className="balancemodal-balance">{`${balance ? balance : 0 }`}</div>
            
          </div>
          <div className='balancemodal-user-buttons flex between'>        
            <div className='balancemodal-addbalance flex center' onClick={addBalance}>Add Balance(1000)</div>
            <div className='balancemodal-cancel flex center' onClick={cancel}>Cancel</div>
          </div>
        </div>
      )}

      {/* Has enough Balance */}
      {modalType === INIT_DEPOSIT_SUFFICIENT_FUNDS && (
        <div className="balancemodal-container flex center">
          <div className="balancemodal-header white flex center">
            Buy in amount
          </div>
          <div className="balancemodal-subheader flex center">{`Minimum buy-in: $${updateObj.minBet}`}</div>
          <div className="balancemodal-memo-container flex between">
            <div className="balancemodal-memo">Balance:</div>
            <div className={`balancemodal-balance ${balance > updateObj.minBet ? 'green' : 'red'}`}>{`$${balance ? balance : 0}`}</div>
          </div>

        <form 
        onSubmit={fundTable}
        
        >
          <input
            className='balancemodal-funding-input'
            type="number"
            value={amount} 
            onChange={(e)=> handleSetFunding(e)}
            
            placeholder="Enter amount"
            max={balance}
            min={0}
            />
        </form>


          <div className="balancemodal-user-buttons flex between">
            <div className="balancemodal-cancel flex center" onClick={cancel}>
              Cancel
            </div>
            <div
             className={`balancemodal-addbalance flex center ${amount < updateObj.minBet ? ' disabled' : ''}`} 
             onClick={fundTable}
            >
              Submit
            </div>
          </div>
        </div>
      )}





      {/* Adding funding to currentTable */}
      {modalType === ADD_DEPOSIT && (
        <div className="balancemodal-container flex center">
          <div className="balancemodal-header white flex center">
            Add Funds
          </div>
          <div className="balancemodal-subheader flex center">{`Minimum buy-in: $${updateObj.minBet}`}</div>
          <div className="balancemodal-memo-container flex between">
            <div className="balancemodal-memo">Balance:</div>
            <div className={`balancemodal-balance ${balance > updateObj.minBet ? 'green' : 'red'}`}>{`$${balance ? balance : 0}`}</div>
          </div>

        <form 
        onSubmit={addFundsToTable}
        
        >
          <input
            className='balancemodal-funding-input'
            type="number"
            value={amount} 
            onChange={(e)=> handleSetFunding(e)}
            
            placeholder="Enter amount"
            max={balance}
            min={0}
            />
        </form>


          <div className="balancemodal-user-buttons flex between">
            <div className="balancemodal-cancel flex center" onClick={cancel}>
              Cancel
            </div>
            <div
             className={`balancemodal-addbalance flex center ${amount < updateObj.minBet ? ' disabled' : ''}`} 
             onClick={addFundsToTable}
            >
              Submit
            </div>
          </div>
        </div>
      )}









    
    </div>
  );
}

export default BalanceModal;
