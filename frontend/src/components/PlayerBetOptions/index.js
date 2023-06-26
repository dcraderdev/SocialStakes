import React, { useState, useRef, useEffect, useContext } from 'react';
import {Route,Router,Switch,NavLink,Link,useHistory,useParams,} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './PlayerBetOptions.css';
import Chatbox from '../Chatbox';
import {
  leaveTableAction,
  toggleShowMessages,
  addBetAction,
  removeBetAction,
  changeActiveTablesAction
} from '../../redux/actions/gameActions';

import { changeTableThemeAction } from '../../redux/actions/userActions';

const PlayerBetOptions = () => {
  const dispatch = useDispatch();

  const [sitOutSelected, setSitOutSelected] = useState(false);
  const [sitOutNextHandSelected, setSitOutNextHandSelected] = useState(false);

  const activeTable = useSelector((state) => state.games.activeTable);
  const showMessages = useSelector((state) => state.games.showMessages);
  const user = useSelector((state) => state.users.user);

  const handleTableThemeChange = (tableTheme) => {
    console.log(tableTheme);
    dispatch(changeTableThemeAction(tableTheme));
  };

  const leaveTable = () => {
    dispatch(leaveTableAction(activeTable.id));
  };

  const rebet = (multiplier) => {
    if(multiplier){

      return
    }

  };
  const undoBet = (multiplier) => {
    if(multiplier){
      dispatch(addBetAction(bet));

      return
    }
  };


  const addBet = (bet) => {
    if(!user) return
    const betObj={
      bet,
      tableId: activeTable.id,
      user,
      seat: activeTable.currentSeat
    }
    dispatch(addBetAction(betObj));
  };



  const handleAction = (action) => {
    dispatch(leaveTableAction(activeTable.id));
  };




  return (
    <>
      <div className="bet-wrapper">
        <div className="bet-container">
          <div className="bet-content">


            <div className="section left">
              <div className="bet-user-settings">
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

            

            <div className="section right flex center">
                <div className="rebet-option-container">
                  <div className="rebet regular" onClick={()=>rebet(true)}>Rebet</div>
                  <div className="rebet double" onClick={()=>rebet(false)}>Rebet x2</div>
                </div>
                <div className="undo-bet-container">
                  <div className="undo one" onClick={()=>undoBet(true)}>Undo</div>
                  <div className="undo all" onClick={()=>undoBet(false)}>Undo all</div>
                </div>
                <div className="chips-option-container">
                  <div className="chip" onClick={()=>addBet(1)}>1</div>
                  <div className="chip" onClick={()=>addBet(5)}>5</div>
                  <div className="chip" onClick={()=>addBet(25)}>25</div>
                  <div className="chip" onClick={()=>addBet(100)}>100</div>
                  <div className="chip" onClick={()=>addBet(500)}>500</div>
                </div>
                <div className="decision-option-container">
                  <div className="action" onClick={()=>handleAction('hit')}>Hit</div>
                  <div className="action" onClick={()=>handleAction('stay')}>Stay</div>
                  <div className="action" onClick={()=>handleAction('double')}>Double</div>
                  <div className="action" onClick={()=>handleAction('split')}>Split</div>
              </div>
            </div>



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
