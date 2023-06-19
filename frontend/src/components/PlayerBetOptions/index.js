import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './PlayerBetOptions.css'

const PlayerBetOptions = ({game}) => {

  return (
    <>

      {game === 'blackjack' && (

      <div className='bet-wrapper'>
        <div className='bet-container'>
          <div className='bet-content'>
          
          </div>
        </div>
      </div>
      )}

    </>


  )
}
export default PlayerBetOptions