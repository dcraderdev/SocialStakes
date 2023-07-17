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
  
  import cardConverter from '../../utils/cardConverter';  


  const PlayerBetOptions = () => {
    const {socket} = useContext(SocketContext)
    const {openModal, closeModal, setUpdateObj} = useContext(ModalContext)

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
    const [actionHand, setActionHand] = useState(null);

    const [isInsuranceOffered, setIsInsuranceOffered] = useState(null);

    const [canSplit, setCanSplit] = useState(null);
    const [canDouble, setCanDouble] = useState(null);
    const [chipSizes, setChipSizes] = useState([1,5,25,100])
    
    const [hasBet, setHasBet] = useState(false);





    const currentTables = useSelector((state) => state.games.currentTables);
    const activeTable = useSelector((state) => state.games.activeTable);
    const showMessages = useSelector((state) => state.games.showMessages);
    const user = useSelector((state) => state.users.user);


  useEffect(()=>{
      setCurrentSeat(null)
      setIsSitting(false)
      setTableBalance(0)
      if(activeTable && user && currentTables && currentTables?.[activeTable.id]?.tableUsers){
      Object.values(currentTables?.[activeTable.id]?.tableUsers).map(seat=>{
        if(seat.userId === user.id){
          setIsSitting(true)
          setCurrentSeat(seat.seat)
          setTableBalance(seat.tableBalance)
        }
      })
    }
  }, [currentTables, activeTable])


  useEffect(() => {
    if(currentTables && activeTable){

      let userInActiveSeat = currentTables[activeTable.id]?.actionSeat === currentSeat && currentSeat !== null;
      let handInProgress = currentTables[activeTable.id]?.handInProgress;
      let currActionHand = currentTables[activeTable.id]?.actionHand;
      let insuranceOffered = currentTables[activeTable.id]?.insuranceOffered;
      let minBet = currentTables[activeTable.id].Game.minBet
      let maxBet = currentTables[activeTable.id].Game.maxBet

      let chip1, chip2, chip3, chip4

      
      chip1 = minBet
      chip2 = minBet * 2
      chip3 = minBet * 4
      chip4 = minBet * 20
      
      if(minBet === 1){
        chip1 = minBet
        chip2 = minBet * 5
        chip3 = minBet * 25
        chip4 = minBet * 100
      }

      if(minBet === 100){
        chip1 = minBet
        chip2 = minBet * 5
        chip3 = minBet * 10
        chip4 = minBet * 50
      }
  
      setChipSizes([chip1,chip2,chip3,chip4])
      setActionHand(currActionHand)
      setIsActiveSeat(userInActiveSeat)
      setIsHandInProgress(handInProgress)
      setIsInsuranceOffered(insuranceOffered);

    }
  }, [currentTables, activeTable, currentSeat]);





  useEffect(() => {
    setCanSplit(false)
    setCanDouble(false)
    let hasHand = currentTables?.[activeTable.id]?.tableUsers?.[currentSeat]?.hands?.[actionHand]
    if(hasHand){
      let cards = hasHand.cards
      let bet = hasHand.bet

      if(cards.length === 2 && tableBalance >= bet){
        let convertedCardOne = cardConverter[cards[0]]
        let convertedCardTwo = cardConverter[cards[1]]
        if(convertedCardOne.value === convertedCardTwo.value){
          setCanSplit(true)
        }
        setCanDouble(true)
      }
    }

  }, [actionHand, currentSeat, currentTables, activeTable, tableBalance]);  





  //If had has started, add up the bets made and store them for rebet options
  useEffect(() => {
    if(isHandInProgress){
      setLastTotalBet(lastBets.reduce((acc,add)=> acc += add, 0))
      setLastBets([])
    }

    if(!isHandInProgress){
      setHasBet(false)
    }


  }, [isHandInProgress]);




  // const leaveTable = () => {

  //   dispatch(leaveTableAction(activeTable.id));
  // };

  const leaveTable = (e,tableId) => {
    e.preventDefault()
    e.stopPropagation()

    let seatNumber = checkForSeat(tableId)
    if(seatNumber){
      setUpdateObj({seat:seatNumber, tableId:activeTable.id, type:'leaveTableViaTab'})
      openModal('leaveModal')
    }
    else {
      dispatch(leaveTableAction(tableId))
    }

  }
  
  const checkForSeat=(tableId)=>{
    let seat
    let hasSeat = Object.entries(currentTables[tableId].tableUsers).some(([seatId, seatData], index) => {
      if(seatData.userId === user.id){
        seat = seatId
        return true
      }
    })
    if(hasSeat){
      return seat
    }
    return false
  }






const rebet = (multiplier) => {
  
  if(!user) return
  if(!isSitting) return
  if(lastTotalBet === 0) return
  
  setHasBet(true)

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
    let currPendingBet = currentTables[activeTable.id].tableUsers[currentSeat].pendingBet
    let lastBet = lastBets.pop()

    // if(currPendingBet === 0){
    //   setHasBet(false)
    //   return
    // }
    const betObj={
      tableId: activeTable.id,
      seat: currentSeat,
      lastBet
    }

    if(multiplier){
      setHasBet(false)

      socket.emit('remove_all_bet', betObj)
      return
    }
    socket.emit('remove_last_bet', betObj)

    if(currPendingBet === 0 || lastBets.length === 0){
      setHasBet(false)
      return
    }
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
    setHasBet(true)

    // dispatch(addBetAction(betObj));
  };




  const acceptInsurance = () => {
    if(!user) return
    if(!isSitting) return

    let bet = lastTotalBet
    let insuranceCost = Math.ceil(bet/2)

    if(insuranceCost >= tableBalance){
      setUpdateObj({insuranceCost, type:'insufficientInsurance'})
      openModal('balanceModal')
      return
    }


    const betObj={
      bet,
      insuranceCost,
      tableId: activeTable.id,
      seat: currentSeat,
    }
    socket.emit('accept_insurance', betObj)
    setIsInsuranceOffered(false)

  };

  const declineInsurance = () => {
    if(!user) return
    if(!isSitting) return

    setIsInsuranceOffered(false)

  };

  const handleAction = (action) => {
    if(!user) return
    if(!isSitting) return
    if(!isActiveSeat) return

    let actionObj = {
      action,
      tableId: activeTable.id,
      seat: currentSeat,
      handId: actionHand
    }
    socket.emit('player_action', actionObj)
  };



  const addBalance = () => {
      if(!user) return
      if(!currentSeat) return

      if(currentTables && activeTable){
        let currMinBet = currentTables[activeTable.id].Game.minBet
        setUpdateObj({minBet:currMinBet, seatNumber:currentSeat, type:'addDeposit'})
        openModal('balanceModal')
      }
      // setUpdateObj({minBet:activeTable.Game.minBet, seatNumber:currentSeat, type:'addDeposit'})
      // openModal('balanceModal')
  };

  const openSettings = () => {
    
    openModal('tableSettings')

  }




  return (
    <>
      <div className="bet-wrapper">
        <div className="bet-container">
          <div className="bet-content">


            <div className="section left">
              <div className="bet-user-settings">
                <div className="bet-setting-button" onClick={addBalance}>
                 <i className="fa-solid fa-dollar-sign"></i>+
                </div>
                <div className="bet-setting-button" onClick={(e)=>leaveTable(e,activeTable?.id)}>
                  <i className="fa-solid fa-right-to-bracket"></i>
                </div>

                <div className="bet-setting-button" onClick={openSettings}>
                  {/* <i className="fa-solid fa-right-to-bracket"></i> */}
                  <i className="fa-solid fa-gears"></i>
                </div>
                <div
                  className="bet-setting-button"
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
                onClick={showMessages ? null : () => dispatch(toggleShowMessages())}
              >
                <Chatbox showMessages={showMessages} />
              </div>
            </div>


{isSitting && (

            <div className="flex center">

              {!isHandInProgress && (
                <div className="section right flex center">

                  {!hasBet &&(
                    <div className="rebet-option-container flex between">
                      <div className="rebet regular" onClick={()=>rebet(false)}>Rebet</div>
                      <div className="rebet double" onClick={()=>rebet(true)}>Rebet x2</div>
                    </div>
                  )}
                  {hasBet &&(
                  <div className="undo-bet-container flex">
                    <div className="undo one flex center" onClick={()=>undoBet(false)}>Undo</div>
                    <div className="undo all flex center" onClick={()=>undoBet(true)}>Undo all</div>
                  </div>
                  )}

                  <div className="chips-option-container">
                    <div className="chip one" onClick={()=>addBet(chipSizes[0])}>{chipSizes[0]}</div>
                    <div className="chip two" onClick={()=>addBet(chipSizes[1])}>{chipSizes[1]}</div>
                    <div className="chip three" onClick={()=>addBet(chipSizes[2])}>{chipSizes[2]}</div>
                    <div className="chip four" onClick={()=>addBet(chipSizes[3])}>{chipSizes[3]}</div>
                  </div>
                </div>
              )}

              {isActiveSeat && !isInsuranceOffered &&(
                <div className="section right flex center">
                  <div className="action-option-container flex">
                    <div className="action" onClick={()=>handleAction('hit')}>Hit</div>
                    <div className="action" onClick={()=>handleAction('stay')}>Stay</div>
                    {canDouble && <div className="action" onClick={()=>handleAction('double')}>Double</div>}
                    {canSplit && <div className="action" onClick={()=>handleAction('split')}>Split</div>}
                  </div>

                </div>
              )}


              {isInsuranceOffered &&(
                <div className="section right flex center">
                  <div className="decision-option-container">
                    <div className="action" onClick={acceptInsurance}>Accept</div>
                    <div className="action" onClick={declineInsurance}>Decline</div>
                  </div>

                </div>
              )}


            </div>
)}
            

          </div>
        </div>
      </div>
    </>
  );
};
export default PlayerBetOptions;
