import { React, useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  useLocation, useHistory } from 'react-router-dom';
import { leaveTableAction } from '../../redux/actions/gameActions';
import GameBarCard from '../GameBarCard';

import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';

import './ActiveGameBarTab.css'



const ActiveGameBarTab = ({tableData}) => {
  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  const { socket } = useContext(SocketContext);

  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  
  const user = useSelector(state => state.users.user);
  const currentTables = useSelector((state) => state.games.currentTables);
  const activeTable = useSelector((state) => state.games.activeTable);

  
  const [minBet, setMinBet] = useState('')
  const [maxBet, setMaxBet] = useState('')
  const [tableId, setTableId] = useState('')
  const [handNeedsAttention, setHandNeedsAttention] = useState('')
  const [userCards, setUserCards] = useState(null)




  useEffect(()=>{

    if(tableData){

      let currGame = tableData?.Game
      if(!currGame) return

      setMinBet(currGame.minBet)
      setMaxBet(currGame.maxBet)
      setTableId(tableData.id)

    }

    let allSeats, getCards 

    if(currentTables && currentTables?.[tableData.id] && currentTables?.[tableData.id]?.tableUsers){

      allSeats = Object.values(currentTables?.[tableData.id]?.tableUsers) || []

      getCards = allSeats.map(seat => {
        if (seat.userId === user.id) {
          return Object.values(seat.hands)[0]?.cards;
        }
        return null;
      }).flat().filter(card => card !== null);
    }

    if(getCards){
      setUserCards(getCards)
    }




  },[tableData, currentTables])








  const viewTable = (tableId) => {
    if(location.pathname !== '/'){
      history.push('/')
    }

    socket.emit('view_room', tableId);
  }


  const closeTable = (e,tableId) => {
    e.preventDefault()
    e.stopPropagation()

    let seatNumber = checkForSeat(tableId)
    if(seatNumber){
      setUpdateObj({seat:seatNumber, tableId, type:'leaveTableViaTab'})
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


      return(
        <div onClick={()=>viewTable(tableId)} className={`gamebartab-container flex center ${handNeedsAttention ? ' active-tab' : ''}`} >
          <div onClick={
            (e)=>{
              e.preventDefault()
              e.stopPropagation()
              closeTable(e,tableId)
            }} 
            className='gamebar-close-button'
            >
            x
          </div>
          <div className='wager-container flex center'>
          <div className='min-wager'>
            {minBet}
          </div>
          <div>
          {maxBet}
          </div>
          </div>
          {userCards &&( 
            <div className='card-container flex center'>
              {userCards.map((card,i)=>{
              return card !== undefined && 
              <div key={i} className='gamebar-card'>
                < GameBarCard card={card}/>
              </div>

              })}
            </div>
          )}

        </div>
      )

}
export default ActiveGameBarTab