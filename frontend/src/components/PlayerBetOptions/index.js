import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './PlayerBetOptions.css'
import Chatbox from '../Chatbox';
import { leaveTableAction, toggleShowMessages } from '../../redux/actions/gameActions';

import { changeTableThemeAction } from '../../redux/actions/userActions';

const PlayerBetOptions = () => {

  const dispatch = useDispatch()  


  const [sitOutSelected, setSitOutSelected] = useState(false);
  const [sitOutNextHandSelected, setSitOutNextHandSelected] = useState(false);

  const activeTable = useSelector(state=>state.games.activeTable)
  const showMessages = useSelector(state=>state.games.showMessages)

  const handleTableThemeChange = (tableTheme) =>{
    console.log(tableTheme);
    dispatch(changeTableThemeAction(tableTheme))
  }


  const leaveTable = () =>{
    dispatch(leaveTableAction(activeTable.id))
  }


 

  return (
    <>

      
        <div className='bet-wrapper'>
        <div className='bet-container'>
          <div className='bet-content'>
            <div className='bet-user-settings'>
              <div className='gamefloor-leave-button' onClick={leaveTable}>
                <i className="fa-solid fa-right-to-bracket"></i>
              </div>
              <div className='chatbox-minimize-button' onClick={()=>dispatch(toggleShowMessages())}>{showMessages ? <i className="fa-solid fa-comment-slash"></i> : <i className="fa-solid fa-comment"></i>}</div>
            </div>

              <div className={`chatbox-wrapper ${showMessages ? '' : 'minimize'}`}>
                 <Chatbox showMessages={showMessages} />
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


  )
}
export default PlayerBetOptions