import React, { useState, useRef, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, Link,useHistory, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './Table.css'

const Table = () => {
  const {id} = useParams()

  return (
    <div className='table-wrapper'>
      <div className='table-container'>
        <div className='table-content'>
    table
        </div>
      </div>
    </div>
  )
}
export default Table