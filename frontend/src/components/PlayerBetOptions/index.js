import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './PlayerBetOptions.css'
import Chatbox from '../Chatbox';

const PlayerBetOptions = ({game}) => {


  const handleTableThemeChange = (tableTheme) =>{
    console.log(tableTheme);
    dispatch(changeTableThemeAction(tableTheme))
    }

  return (
    <>

      {game === 'blackjack' && (

      <div className='bet-wrapper'>
        <div className='bet-container'>
          <div className='bet-content'>
            <div className='chatbox-wrapper'>
              <Chatbox/>
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
      )}

    </>


  )
}
export default PlayerBetOptions