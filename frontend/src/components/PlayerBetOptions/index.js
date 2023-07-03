import React, { useState, useRef, useEffect, useContext, isValidElement } from 'react';
import {Route,Router,Switch,NavLink,Link,useHistory,useParams,} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';
 
 import './PlayerBetOptions.css';
 import Chatbox from '../Chatbox';
 import {
   leaveTableAction,
   toggleShowMessages,
   addBetAction,
   changeActiveTablesAction
  } from '../../redux/actions/gameActions';
  
  import { changeTableThemeAction } from '../../redux/actions/userActions';
  
  const PlayerBetOptions = () => {
    const dispatch = useDispatch();
    
    const [sitOutSelected, setSitOutSelected] = useState(false);
    const [sitOutNextHandSelected, setSitOutNextHandSelected] = useState(false);
    const [lastBets, setLastBets] = useState([]);
    const [lastTotalBet, setLastTotalBet] = useState(0);
    const [isSitting, setIsSitting] = useState(false);
    const [currentSeat, setCurrentSeat] = useState(null);
    const [tableBalance, setTableBalance] = useState(0);

    const [isHandInProgress, setIsHandInProgress] = useState(false);
    const [isActiveSeat, setIsActiveSeat] = useState(false);
  
    
    const {socket} = useContext(SocketContext)
    const {openModal, closeModal, setUpdateObj} = useContext(ModalContext)

    const currentTables = useSelector((state) => state.games.currentTables);
    const activeTable = useSelector((state) => state.games.activeTable);
    const showMessages = useSelector((state) => state.games.showMessages);
    const user = useSelector((state) => state.users.user);


  useEffect(()=>{
      setCurrentSeat(null)
      setIsSitting(false)
      setTableBalance(0)
      if(activeTable && user){
      Object.values(currentTables[activeTable.id].tableUsers).map(seat=>{
        if(seat.userId === user.id){
          setIsSitting(true)
          setCurrentSeat(seat.seat)
          setTableBalance(seat.tableBalance)
        }
      })
    }
  }, [currentTables, activeTable])


  useEffect(() => {
    let userInActiveSeat = currentTables[activeTable.id]?.actionSeat === currentSeat && currentSeat !== null;
    let handInProgress = currentTables[activeTable.id]?.handInProgress;

    setIsActiveSeat(userInActiveSeat)
    setIsHandInProgress(handInProgress)

  }, [currentTables, activeTable.id]);




  useEffect(() => {

    if(isHandInProgress){
      setLastTotalBet(lastBets.reduce((acc,add)=> acc += add, 0))
      setLastBets([])
    }

  }, [isHandInProgress]);



useEffect(() => {

  console.log(lastTotalBet);
  console.log(lastBets);

}, [lastBets, lastTotalBet]);






  const handleTableThemeChange = (tableTheme) => {
    console.log(tableTheme);
    dispatch(changeTableThemeAction(tableTheme));
  };

  const leaveTable = () => {
    dispatch(leaveTableAction(activeTable.id));
  };

const rebet = (multiplier) => {
  console.log('clik');

  if(!user) console.log('!user');
  if(!isSitting) console.log('!isSitting');
  if(lastTotalBet === 0) console.log('lastBets.length === 0');



  if(!user) return
  if(!isSitting) return
  if(lastTotalBet === 0) return


  console.log(multiplier);

  let bet = lastTotalBet;
  // double the bet if multiplier is true
  if(multiplier){
    bet *= 2; 
  }

  if(bet > tableBalance){
    bet = parseInt(tableBalance)
  }
  
  const betObj = {
    bet,
    tableId: activeTable.id,
    seat: currentSeat
  }

  setLastBets([bet])
  socket.emit('place_bet', betObj)
  // dispatch(addBetAction(betObj));
};



  
  const undoBet = (multiplier) => {
    
    
    console.log(lastBets);
    console.log(currentSeat);
    console.log(currentTables[activeTable.id].tableUsers[currentSeat]);

    let currPendingBet = currentTables[activeTable.id].tableUsers[currentSeat].pendingBet
    let lastBet = lastBets.pop()


    if(currPendingBet === 0){
      return
    }
    const betObj={
      tableId: activeTable.id,
      seat: currentSeat,
      lastBet
    }

    if(multiplier){
      socket.emit('remove_all_bet', betObj)

      // dispatch(removeAllBetAction(betObj));
      return
    }
    socket.emit('remove_last_bet', betObj)
    // dispatch(removeBetAction(betObj));
  };


  const addBet = (bet) => {
    if(!user) return
    if(!isSitting) return
    if(bet >= tableBalance){
      bet = parseInt(tableBalance)
    }
    const betObj={
      bet,
      tableId: activeTable.id,
      seat: currentSeat
    }
    if(bet > 0){
      setLastBets([...lastBets, bet])
    }
    socket.emit('place_bet', betObj)
    // dispatch(addBetAction(betObj));
  };



  const handleAction = (action) => {
    console.log(action);
    let actionObj = {
      action,
      tableId: activeTable.id,
      seat: currentSeat
    }
    socket.emit('player_action', actionObj)
  };



  const addBalance = () => {
      if(!user) return
      if(!currentSeat) return
      setUpdateObj({minBet:activeTable.Game.minBet, seatNumber:currentSeat, type:'addDeposit'})
      openModal('balanceModal')
  };


  return (
    <>
      <div className="bet-wrapper">
        <div className="bet-container">
          <div className="bet-content">


            <div className="section left">
              <div className="bet-user-settings">
                <div className="gamefloor-add-balance" onClick={addBalance}>
                  +
                </div>
                <div className="gamefloor-leave-button" onClick={leaveTable}>
                  <i className="fa-solid fa-right-to-bracket"></i>
                </div>
                <div
                  className="chatbox-minimize-button"
                  onClick={() => dispatch(toggleShowMessages())}
                >
                  {showMessages ? (
                    <i className="fa-solid fa-comment-slash"></i>
                  ) : (
                    <i className="fa-solid fa-comment"></i>
                  )}
                </div>
              </div>

              <div
                className={`chatbox-wrapper ${showMessages ? '' : 'minimize'}`}
              >
                <Chatbox showMessages={showMessages} />
              </div>
            </div>


{isSitting && (

            <div className="section right flex center">

              {!isHandInProgress && (
                <div className="section right flex center">
                  <div className="rebet-option-container">
                    <div className="rebet regular" onClick={()=>rebet(false)}>Rebet</div>
                    <div className="rebet double" onClick={()=>rebet(true)}>Rebet x2</div>
                  </div>
                  <div className="undo-bet-container">
                    <div className="undo one" onClick={()=>undoBet(false)}>Undo</div>
                    <div className="undo all" onClick={()=>undoBet(true)}>Undo all</div>
                  </div>
                  <div className="chips-option-container">
                    <div className="chip" onClick={()=>addBet(1)}>1</div>
                    <div className="chip" onClick={()=>addBet(5)}>5</div>
                    <div className="chip" onClick={()=>addBet(25)}>25</div>
                    <div className="chip" onClick={()=>addBet(100)}>100</div>
                    <div className="chip" onClick={()=>addBet(500)}>500</div>
                  </div>
                </div>
              )}

              {isActiveSeat &&(
                <div className="section right flex center">
                  <div className="decision-option-container">
                    <div className="action" onClick={()=>handleAction('hit')}>Hit</div>
                    <div className="action" onClick={()=>handleAction('stay')}>Stay</div>
                    <div className="action" onClick={()=>handleAction('double')}>Double</div>
                    <div className="action" onClick={()=>handleAction('split')}>Split</div>
                  </div>

                </div>
              )}


            </div>
)}
            




            {/* <div className='flex'>
            <div className='theme-button' onClick={()=>handleTableThemeChange('black')}>black</div>
            <div className='theme-button' onClick={()=>handleTableThemeChange('darkgreen')}>darkgreen</div>
            <div className='theme-button' onClick={()=>handleTableThemeChange('lightgreen')}>lightgreen</div>
            <div className='theme-button' onClick={()=>handleTableThemeChange('red')}>red</div>
            <div className='theme-button' onClick={()=>handleTableThemeChange('realfelt')}>realfelt</div>
          </div> */}
          </div>
        </div>
      </div>
    </>
  );
};
export default PlayerBetOptions;
