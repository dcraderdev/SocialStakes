import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Table.css'

import {changeNeonThemeAction, changeTableThemeAction} from '../../redux/actions/userActions';

import TableSeat from '../TableSeat';
import PlayerBetOptions from '../PlayerBetOptions';
import Card from '../Card';
import cardConverter from '../../utils/cardConverter'

import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';
import { showGamesAction } from '../../redux/actions/gameActions';



const Table = () => {
  const { modal, openModal, closeModal, setUpdateObj } = useContext(ModalContext);
  
  const dispatch = useDispatch()
  const user = useSelector((state) => state.users.user);
  const themes = useSelector(state=>state.users.themes)
  const neonTheme = useSelector(state=>state.users.neonTheme)
  const tableTheme = useSelector(state=>state.users.tableTheme)
  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  
  const [countdown, setCountdown] = useState(null);
  const [cards, setCards] = useState([]);
  const [isHandInProgress, setIsHandInProgress] = useState(false);

  const profileBtnRef = useRef()
 
  useEffect(()=>{

    if (!activeTable || !currentTables || !currentTables[activeTable.id]) {
      return;
    }

    let countdownInterval = null;
    let countdownRemaining = Math.ceil((currentTables[activeTable.id].countdownEnd - Date.now()) / 1000);
    let currentTable = currentTables[activeTable.id]
    let dealerCards = currentTable.dealerCards

    if(currentTable.handInProgress){
      setIsHandInProgress(true)
    }

    setCards(dealerCards)

    if (countdownRemaining > 0) {
      setCountdown(countdownRemaining);
      countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown && prevCountdown > 1 ? prevCountdown - 1 : null);
      }, 1000);
    } else {
      setCountdown(null);
    }
  
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };


  },[currentTables, activeTable]);


  const handleProfileButtonClick = () => {
    if(modal === 'profileModal'){
      closeModal()
    } else {
      openModal('profileModal')
    }
  };



  return (
    <div className='table-wrapper'>



        <div onClick={()=>dispatch(showGamesAction())} className='table-home-button-container flex center'>
          <div className='table-home-button-subcontainer flex center'>
            <i className="fa-solid fa-house"></i>
          </div>
        </div>


        <div  ref={profileBtnRef} onClick={handleProfileButtonClick} className='table-menu-button-container flex center'>
            {modal !== 'profileModal' && <i className="fa-solid fa-bars"></i>}
            {modal === 'profileModal' && <i className="fa-solid fa-x"></i>}
        </div>

<div></div>



      <div className={`table-content ${neonTheme}`}>
        {themes[tableTheme] && 
        <div className='table-image-container'>
          <img src={themes[tableTheme].url} alt='table'></img>
        </div>
        
        }
      </div>
      <div className='table-countdown'>{countdown > 0 ? `Dealing in: ${countdown}`: ''}</div>

      <div className='dealer-cards flex center'>
        {cards && cards.map((card, index) => 

        <div className={`cardarea-card-container`} key={index}>
          <Card card={card} />
        </div>
        )}
        {cards && cards.length === 1 && (
            <div className={`cardarea-card-container`}>
                <Card card={'hidden'} />
            </div>
          )}
      </div>




<div className='seats-container flex center'>
            <TableSeat seatNumber={1} />
            <TableSeat seatNumber={2} />
            <TableSeat seatNumber={3} />
            <TableSeat seatNumber={4} />
            <TableSeat seatNumber={5} />
            <TableSeat seatNumber={6} />
        </div>     



    </div>
  )
}
export default Table