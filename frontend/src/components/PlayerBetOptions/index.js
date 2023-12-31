import React, { useState, useRef, useEffect, useContext, isValidElement } from 'react';
import {Route,Router,Switch,NavLink,Link,useHistory,useParams,} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';
import { WindowContext } from '../../context/WindowContext';
 
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
    const {windowWidth, windowHeight} = useContext(WindowContext)

    const dispatch = useDispatch();

    const currentTables = useSelector((state) => state.games.currentTables);
    const activeTable = useSelector((state) => state.games.activeTable);
    const showMessages = useSelector((state) => state.games.showMessages);
    const user = useSelector((state) => state.users.user);
    

    const [lastBets, setLastBets] = useState([]);
    const [lastTotalBet, setLastTotalBet] = useState(0);
    const [isSitting, setIsSitting] = useState(false);
    const [currentSeat, setCurrentSeat] = useState(null);
    const [tableBalance, setTableBalance] = useState(0);

    const [isHandInProgress, setIsHandInProgress] = useState(false);
    const [isActionSeat, setIsActionSeat] = useState(false);
    const [actionHand, setActionHand] = useState(null);

    const [isInsuranceOffered, setIsInsuranceOffered] = useState(null);
    const [hasMadeInsuranceDecision, setHasMadeInsuranceDecision] = useState(false);

    const [canSplit, setCanSplit] = useState(null);
    const [canDouble, setCanDouble] = useState(null);
    const [chipSizes, setChipSizes] = useState([1,5,25,100])
    
    const [hasBet, setHasBet] = useState(false);
    const [maxBet, setMaxBet] = useState(false);
    const [minBet, setMinBet] = useState(false);


    const [isNarrowView, setIsNarrowView] = useState(false);
    const [isWideView, setIsWideView] = useState(false);


  // check window height for player action button layout
  useEffect(()=>{
    if(windowWidth <= 650){
      setIsNarrowView(true)
    } else {
      setIsNarrowView(false)
    }

    if(windowWidth >= 950){
      setIsWideView(true)
    } else {
      setIsWideView(false)
    }




  }, [windowWidth])



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

      let currTable = currentTables?.[activeTable.id]
      if(!currTable) return

      let userInActiveSeat = currTable.actionSeat === currentSeat && currentSeat !== null;
      let handInProgress = currTable.handInProgress;
      let currActionHand = currTable.actionHand;
      let insuranceOffered = currTable.insuranceOffered;
      let minBet = currTable.Game.minBet
      let maxBet = currTable.Game.maxBet

      const chipValues = {
        1: [1, 5, 25, 100],
        25: [25, 50, 100, 500],
        100: [100, 500, 1000, 5000]
      };
      
      let [chip1, chip2, chip3, chip4] = chipValues[minBet] || [1, 5, 25, 100];
    
      setChipSizes([chip1,chip2,chip3,chip4])
      setActionHand(currActionHand)
      setIsActionSeat(userInActiveSeat)
      setIsHandInProgress(handInProgress)
      setIsInsuranceOffered(insuranceOffered);
      setMaxBet(maxBet)
      setMinBet(minBet)

    }
  }, [currentTables, activeTable, currentSeat]);





  useEffect(() => {
    setCanSplit(false)
    setCanDouble(false)
    if(!currentTables || !currentSeat || !currentTables[activeTable.id]?.tableUsers?.[currentSeat]?.hands) return
    let hasHand = currentTables?.[activeTable.id]?.tableUsers?.[currentSeat]?.hands?.[actionHand]
    let numUserHands = Object.entries(currentTables[activeTable.id]?.tableUsers?.[currentSeat]?.hands).length


    if(hasHand){
      let cards = hasHand.cards
      let bet = hasHand.bet

      if(cards?.length === 2 && tableBalance >= bet){
        let convertedCardOne = cardConverter[cards[0]]
        let convertedCardTwo = cardConverter[cards[1]]

        if(numUserHands < 4){
          if(convertedCardOne && convertedCardTwo && convertedCardOne?.value === convertedCardTwo?.value){
            setCanSplit(true)
          }
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
      setHasMadeInsuranceDecision(false)
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

    const totalBets = lastBets.reduce((acc,num)=> acc + num , 0)


    if(bet >= tableBalance){
      bet = parseInt(tableBalance)
    }

    if(totalBets + bet > maxBet){
      bet = maxBet - totalBets  
    }
    
    if(bet <= 0){
      return
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
    setHasMadeInsuranceDecision(true)



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
    setHasMadeInsuranceDecision(true)


    setIsInsuranceOffered(false)

  };

  const handleAction = (action) => {
    if(!user) return
    if(!isSitting) return
    if(!isActionSeat) return

    let actionObj = {
      action,
      tableId: activeTable.id,
      seat: currentSeat,
      handId: actionHand
    }
    socket.emit('player_action', actionObj)
  };



console.log(isHandInProgress);
console.log(isActionSeat);


  return (
  
      <div className="bet-wrapper flex center">
        <div className="bet-container flex center">

<>
          {isActionSeat && isHandInProgress && !isInsuranceOffered &&(
            <div className={`actions-container flex center ${showMessages ? 'shrunk' : ''} ${isWideView || !showMessages ? 'row' : ''}`}>
              <div className="action-button" onClick={()=>handleAction('hit')}>Hit</div>
              <div className="action-button" onClick={()=>handleAction('stay')}>Stay</div>
              {canDouble && <div className="action-button" onClick={()=>handleAction('double')}>Double</div>}
              {canSplit && <div className="action-button" onClick={()=>handleAction('split')}>Split</div>}
            </div>
          )}




{isInsuranceOffered && !hasMadeInsuranceDecision && isSitting && (

<div className={`actions-container flex center ${showMessages ? 'shrunk' : ''}`}>
                <div className='insurance-option'>Insurance?</div>
                <div className="chips-option-container flex center">
                  <div className="action-button" onClick={acceptInsurance}>Accept</div>
                  <div className="action-button" onClick={declineInsurance}>Decline</div>
                </div>
                </div>
              )}



{!isHandInProgress && isSitting && (

<div className={`actions-container flex center ${showMessages ? 'shrunk' : ''}`}>

   {!hasBet &&(
     <div className="rebet-option-container flex center">
       <div className="action-button" onClick={()=>rebet(false)}>Rebet</div>
       <div className="action-button" onClick={()=>rebet(true)}>Rebet x2</div>
     </div>
   )}

    {hasBet &&(
    <div className="rebet-option-container flex center">
      <div className="action-button" onClick={()=>undoBet(false)}>Undo</div>
      <div className="action-button" onClick={()=>undoBet(true)}>Undo all</div>
    </div>
    )}

    <div className="chips-option-container flex center">
      <div className="chip" onClick={()=>addBet(chipSizes[0])}>{chipSizes[0]}</div>
      <div className="chip" onClick={()=>addBet(chipSizes[1])}>{chipSizes[1]}</div>
      <div className="chip" onClick={()=>addBet(chipSizes[2])}>{chipSizes[2]}</div>
      <div className="chip" onClick={()=>addBet(chipSizes[3])}>{chipSizes[3]}</div>
    </div>

</div>

)}


</>

        </div>
      </div>
  );
};
export default PlayerBetOptions;
