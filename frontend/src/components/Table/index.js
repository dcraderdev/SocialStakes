import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import feltGreen from '../../images/felt-green.jpeg'
// import feltGreen2 from '../../images/felt-green2.jpeg'
// import feltGreen3 from '../../images/felt-green3.jpeg'
import feltGreen4 from '../../images/felt-green4.jpeg'
// // import feltRed from '../../images/felt-red.svg'
// import feltRed from '../../images/felt-red-comp.png'

import './Table.css'

import PlayerBetOptions from '../PlayerBetOptions';

const Table = ({seats, takeSeat}) => {
  const {id} = useParams()
  const game = 'blackjack'
  const url = 'https://social-stakes.s3.us-west-1.amazonaws.com/AdobeStock_271559753.jpeg'

  return (
    <div className='table-wrapper'>
    <div className='table-container '>
      <div className='table-content flex center'>
        {/* <img src={feltGreen4} alt='table'></img> */}
        <img src={url} alt='table'></img>
      </div>


    {seats === 6 && (
      <div className='seats-container'>
          <div className='top-seats flex between'>
            <div className='seat-container six-ring seat1' onClick={()=>takeSeat(1)}></div>
            <div className='seat-container six-ring seat6' onClick={()=>takeSeat(6)}></div>
          </div>
          <div className='mid-seats flex between'>
            <div className='seat-container six-ring seat2' onClick={()=>takeSeat(2)}></div>
            <div className='seat-container six-ring seat5' onClick={()=>takeSeat(5)}></div>
          </div>
          <div className='bot-seats flex between'>
            <div className='seat-container six-ring seat3' onClick={()=>takeSeat(3)}></div>
            <div className='seat-container six-ring seat4' onClick={()=>takeSeat(4)}></div>
          </div>
      </div>
    )}


    </div>
    </div>
  )
}
export default Table