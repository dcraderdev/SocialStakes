import React, { useState, useRef, useEffect } from 'react';
import { Route, Router, Switch, NavLink, useHistory, useParams } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'

import * as gameActions from '../../redux/middleware/games';
import * as userActions from '../../redux/middleware/users';

import './TableTile.css'

const TableTile = ({table}) => {

  const history = useHistory()
  const dispatch = useDispatch()

  console.log(table);


  return (
      <div className="tabletile-wrapper" >
        <div className='tabletile-container'>
          <div className='tabletile-content'>

          </div>
        </div>
      </div>
  )
}
export default TableTile