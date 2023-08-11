import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Table.css'

import {changeNeonThemeAction, changeTableThemeAction} from '../../redux/actions/userActions';

import TableSeat from '../TableSeat';
import Card from '../Card';

import { ModalContext } from '../../context/ModalContext';
import { SocketContext } from '../../context/SocketContext';

import {
  showGamesAction,
  leaveTableAction,
  toggleShowMessages,
  addBetAction,
  changeActiveTablesAction
 } from '../../redux/actions/gameActions';
import Chatbox from '../Chatbox';
import ChatInputArea from '../ChatInputArea';



const Table = () => {
  const { modal, openModal, closeModal, setUpdateObj } = useContext(ModalContext);
  
  const dispatch = useDispatch()
  const user = useSelector((state) => state.users.user);
  const themes = useSelector(state=>state.users.themes)
  const neonTheme = useSelector(state=>state.users.neonTheme)
  const tableTheme = useSelector(state=>state.users.tableTheme)
  const activeTable = useSelector(state=>state.games.activeTable)
  const currentTables = useSelector(state=>state.games.currentTables)
  const showMessages = useSelector((state) => state.games.showMessages);
  const conversations = useSelector((state) => state.chats.conversations);




  console.log(conversations);

  
  const [countdown, setCountdown] = useState(null);
  const [cards, setCards] = useState([]);
  const [isHandInProgress, setIsHandInProgress] = useState(false);
  const [isActionSeat, setIsActionSeat] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  const [currentSeat, setCurrentSeat] = useState(false);


  const [tableConversation, setTableConversation] = useState(false);
  const [tableName, setTableName] = useState('');
  const [tableConversationId, setTableConversationId] = useState(false);



  
  const profileBtnRef = useRef()
  const chatBoxRef = useRef()
 
  useEffect(()=>{

    let countdownInterval = null;
    let currTable = currentTables?.[activeTable?.id]
    if(!currTable) return


    let countdownRemaining = Math.ceil((currTable.countdownEnd - Date.now()) / 1000);
    let dealerCards = currTable.dealerCards

    if(currTable.handInProgress){
      setIsHandInProgress(currTable.handInProgress)
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

    if(currTable.tableUsers){
      Object.values(currTable.tableUsers).map(seat=>{
        if(seat.userId === user.id){
          setIsSitting(true)
          setCurrentSeat(seat.seat)
        }
      })
    }

    console.log(currTable);
    setTableName(currTable.tableName)
    console.log(currTable.Conversation.id);

    console.log();
    let tableConvoId = currTable?.Conversation?.id

    console.log(tableConvoId);

    console.log(conversations);
    console.log(conversations[tableConvoId]);

    if(tableConvoId && conversations && conversations[tableConvoId]){
      console.log(conversations[tableConvoId]);
      setTableConversation(conversations[tableConvoId])
    }


    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };


  },[currentTables, activeTable]);



  const handleProfileButtonClick = () => {
    if(modal === 'profileModal'){
      closeModal()
      return
    } else {
      openModal('profileModal')
    }
  };

  const addBalance = () => {
    if(!user) return
    if(!isSitting || !currentSeat) return

    if(currentTables && activeTable){
      let currMinBet = currentTables[activeTable.id].Game.minBet
      setUpdateObj({minBet:currMinBet, seatNumber:currentSeat, type:'addDeposit'})
      openModal('balanceModal')
    }
    // setUpdateObj({minBet:activeTable.Game.minBet, seatNumber:currentSeat, type:'addDeposit'})
    // openModal('balanceModal')
};



// useEffect(() => {

//   if(showMessages){
//     const handleClickOutside = (event) => {
    
  
//       if (chatBoxRef.current && !chatBoxRef.current.contains(event.target)) {
//         dispatch(toggleShowMessages())
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }


// }, [showMessages]);




  return (
    <div className='table-wrapper'>



      <div ref={chatBoxRef} className={`table-chatbox-wrapper ${showMessages ? ' visible' : ' hidden'}`}>

        <div className='table-chatbox-header-container flex'>


        
          

          <div className='table-chatbox-header'>
            {tableName}
          </div >
          


        </div>

        <div className={`table-chatbox-container styled-scrollbar`}>
          <Chatbox conversation={tableConversation}/>
        </div>

        <div className="table-chatinput-container">
          <ChatInputArea />
        </div>


      </div>









        <div  ref={profileBtnRef} onClick={handleProfileButtonClick} className='table-button-container menu flex center'>
          <div className='table-button-subcontainer flex center'>
            {modal !== 'profileModal' && <i className="fa-solid fa-bars"></i>}
            {modal === 'profileModal' && <i className="fa-solid fa-x"></i>}
          </div>
        </div>


{/* home button */}
        <div onClick={()=>dispatch(showGamesAction())} className='table-button-container home flex center'>
          <div className='table-button-subcontainer flex center'>
            <i className="fa-solid fa-house"></i>
          </div>
        </div>


        <div onClick={() => dispatch(toggleShowMessages())} className='table-button-container chat flex center'>
          <div className='table-button-subcontainer flex center'>
              {showMessages ? (
                <i className="fa-solid fa-comment-slash"></i>
                ) : (
                  <i className="fa-solid fa-comment"></i>
              )}
          </div>
        </div>



        <div onClick={()=>openModal('tableSettings')} className='table-button-container settings flex center'>
          <div className='table-button-subcontainer flex center'>
            <i className="fa-solid fa-gears"></i>
          </div>
        </div>


        <div onClick={addBalance} className='table-button-container money flex center'>
          <div className='table-button-subcontainer flex center'>
            <i className="fa-solid fa-dollar-sign"></i>
          </div>
        </div>


        <div onClick={()=>dispatch(showGamesAction())} className='table-button-container leave flex center'>
          <div className='table-button-subcontainer flex center'>
            <i className="fa-solid fa-right-to-bracket"></i>
          </div>
        </div>


        <div onClick={()=>dispatch(showGamesAction())} className='table-button-container theme flex center'>
          <div className='table-button-subcontainer flex center'>
            <i className="fa-solid fa-brush"></i>
          </div>
        </div>





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