import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import feltGreen from '../../images/felt-green.jpeg'
import feltGreen2 from '../../images/felt-green2.jpeg'
import feltGreen3 from '../../images/felt-green3.jpeg'
import feltGreen4 from '../../images/felt-green4.jpeg'
// import feltRed from '../../images/felt-red.svg'
import feltRed from '../../images/felt-red-comp.png'

import './Table.css'

const Table = ({seats}) => {
  const {id} = useParams()
  const seatss = 6

  return (
    <div className='table-wrapper'>
    <div className='table-container '>
      <div className='table-content flex center'>
        <img src={feltGreen4} alt='table'></img>
      </div>


    {seatss === 6 && (
      <div className='seats-container'>
          <div className='top-seats flex between'>
            <div className='seat-container six-ring seat1'></div>
            <div className='seat-container six-ring seat6'></div>
          </div>
          <div className='mid-seats flex between'>
            <div className='seat-container six-ring seat2'></div>
            <div className='seat-container six-ring seat5'></div>
          </div>
          <div className='bot-seats flex between'>
            <div className='seat-container six-ring seat3'></div>
            <div className='seat-container six-ring seat4'></div>
          </div>
      </div>
    )}






    </div>
    </div>
  )
}
export default Table