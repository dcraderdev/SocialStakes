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


const Table = () => {
  
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



  return (
    <div className='table-wrapper'>
      <div className={`table-content ${neonTheme}`}>
        {themes[tableTheme] && 
        <div className='table-image-container'>
          <img src={themes[tableTheme].url} alt='table'></img>
        </div>
        
        }
      </div>
      <div className='table-countdown'>{countdown > 0 ? `Dealing in: ${countdown}`: ''}</div>

      <div className='dealer-cards flex center'>
        {cards && cards.map((card, index) => <Card key={index} card={card} />)}
        {cards && cards.length === 1 && (
          <Card card={'hidden'} />
          )}
      </div>


<div className='seats-container'>
          <div className='top-seats flex between'>
            <TableSeat seatNumber={1} />
            <TableSeat seatNumber={6} />
          </div>
          <div className='mid-seats flex between'>
            <TableSeat seatNumber={2} />
            <TableSeat seatNumber={5} />
          </div>
          <div className='bot-seats flex between'>
            <TableSeat seatNumber={3} />
            <TableSeat seatNumber={4} />
          </div>
        </div>

          



    </div>
  )
}
export default Table