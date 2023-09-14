import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Table.css'
import cardConverter from '../../utils/cardConverter';
import handSummary from '../../utils/handSummary';


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
import Logo from '../Logo';
import LoadingBar from '../LoadingBar';



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

  const [isLoaded, setIsLoaded] = useState(false)
  
  const [countdown, setCountdown] = useState(null);
  const [cards, setCards] = useState([]);
  const [isHandInProgress, setIsHandInProgress] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  const [currentSeat, setCurrentSeat] = useState(false);


  const [tableName, setTableName] = useState('');
  const [minBet, setMinBet] = useState('');
  const [maxBet, setMaxBet] = useState('');


  const [isTableCreator, setIsTableCreator] = useState(false)


  
  const profileBtnRef = useRef()
  const chatBoxRef = useRef()





  const [handValues, setHandValues] = useState(null);





  
  useEffect(() => {
    if(themes && Object.values(themes).length){
      let currThemes = Object.entries(themes)

      currThemes.forEach(([key,src]) => {
        const img = new Image();
        img.src = src.url;
      });
    }
    setTimeout(() => {
      setIsLoaded(true)
    }, 1000);

  }, [themes]);



  useEffect(() => {
    setIsTableCreator(false)
    if(activeTable && currentTables && currentTables[activeTable.id] && user){

      if(user.id === currentTables[activeTable.id].userId){
        setIsTableCreator(true)
      }

    }
  }, [currentTables, activeTable]);


 
  useEffect(()=>{

    let countdownInterval = null;
    let currTable = currentTables?.[activeTable?.id]
    if(!currTable) return

    let countdownRemaining = Math.ceil((currTable.dealCardsTimeStamp - Date.now()) / 1000);
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

    setTableName(currTable.tableName)
    setMinBet(currTable.Game.minBet)
    setMaxBet(currTable.Game.maxBet)


    if(currTable.dealerCards){
       let summary = handSummary(currTable.dealerCards)
      setHandValues(summary.values.join(','))
    }


    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };


  },[currentTables, activeTable]);




const tableImage = useMemo(() => {
  return themes[tableTheme] && tableTheme !== 'None' ? <img src={themes[tableTheme].url} alt='table'></img> : null;
}, [themes, tableTheme]);




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

};






  return (
    <div className='table-wrapper'>

<div className={`loading-wrapper flex center ${isLoaded ? 'fade-out' : ''}`}>
          <div className='main-logo-wrapper fade-in-long'>
            <Logo />
          </div>
          <div className='main-logo-wrapper'>
            <LoadingBar isLoaded={true} />
          </div>
        </div>



      <div ref={chatBoxRef} className={`table-chatbox-wrapper ${showMessages ? ' visible' : ' hidden'}`}>

        <div className='table-chatbox-header-container flex'>

          <div className='table-chatbox-header'>
            {tableName}
          </div >
          


        </div>

        <div className={`table-chatbox-container styled-scrollbar`}>
          <Chatbox />
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



{isTableCreator &&        <div onClick={()=>openModal('tableSettings')} className='table-button-container settings flex center'>
          <div className='table-button-subcontainer flex center'>
            <i className="fa-solid fa-key"></i>
          </div>
        </div>}


{isSitting &&        <div onClick={addBalance} className='table-button-container money flex center'>
          <div className='table-button-subcontainer flex center'>
            <i className="fa-solid fa-dollar-sign"></i>
          </div>
        </div>}


        <div onClick={()=>dispatch(showGamesAction())} className='table-button-container leave flex center'>
          <div className='table-button-subcontainer flex center'>
            <i className="fa-solid fa-right-to-bracket"></i>
          </div>
        </div>


        <div onClick={()=>openModal('themeSettings')} className='table-button-container theme flex center'>
          <div className='table-button-subcontainer flex center'>
            <i className="fa-solid fa-brush"></i>
          </div>
        </div>





      <div className={`table-content ${neonTheme}`}>
        {themes[tableTheme] && 
        // <div className='table-image-container'>
        //  {tableTheme !== 'None' && <img src={themes[tableTheme].url} alt='table'></img>}
        // </div>
        <div className='table-image-container'>
          {tableImage}
        </div>
        }
      </div>



      {handValues && handValues > 0 && <div className={`dealer-card-values ${neonTheme}-text`}> {handValues}</div>}


      <div className='dealer-cards flex center'>
      <div className={`${neonTheme}-text table-countdown`}>{countdown > 0 ? `Dealing in: ${countdown}`: ''}</div>

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
      <div className={`table-description flex center`}>
          <div className={`${neonTheme}-text`}>BLACKJACK</div>
          <div className={`${neonTheme}-text`}>{tableName}</div>
          <div className={`${neonTheme}-text`}>Blackjack pays 3 to 2 - Insurance pays 2 to 1</div>

          
          <div className={`${neonTheme}-text`}>${minBet} Min - ${maxBet} Max</div>
          <div className={`${neonTheme}-text`}></div>


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
// export default Table
export default React.memo(Table);
