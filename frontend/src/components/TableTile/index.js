import React, { useState, useRef, useEffect } from 'react';
import { Route, Router, Switch, NavLink, useHistory, useParams } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'

import * as gameActions from '../../redux/middleware/games';
import * as userActions from '../../redux/middleware/users';

import './TableTile.css'

const TableTile = ({table, viewTable}) => {

  const history = useHistory()
  const dispatch = useDispatch()

  console.log(table);

  const [currentPlayers, setCurrentPlayers] = useState(0)

  useEffect(()=>{
    if(table){
      setCurrentPlayers(table.currentPlayers)
    }
  },[table])

  return (
      <div className="tabletile-wrapper" onClick={()=>viewTable(table)}>
        <div className='tabletile-container'>
          <div className='tabletile-content'>
            <div>table.id----------------{table?.id}</div>
            <div>players.length-------{table?.players?.length}</div>
            <div>maxNumPlayers----{table?.Game?.maxNumPlayers}</div>
            <div>minBet-----------------{table?.Game?.minBet}</div>
            <div>maxBet---------------{table?.Game?.maxBet}</div>
          
          
          
          
          

          </div>
        </div>
      </div>
  )
}
export default TableTile