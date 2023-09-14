import React, { useContext } from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {sortTablesAction} from '../../redux/actions/gameActions';
import './TableSortBar.css'

import { WindowContext } from '../../context/WindowContext';



const TableSortBar = () => {
  const dispatch = useDispatch()
  const {windowWidth} = useContext(WindowContext)


  const sortTables = (sortBy, direction) =>{
    dispatch(sortTablesAction(sortBy, direction))

  }


  return (
    <div className="tablesortbar-wrapper flex">
    <div className="tablesortbar-container flex center">

{windowWidth > 500 &&   <div className="tablesortbar-header-container flex center">
        <div className="tablesort-text">Private</div>
        <div className="arrow-container flex">
          <i className="sort-arrow fa-solid fa-angle-up" onClick={()=>sortTables('private', 'high')}></i>
          <i className="sort-arrow fa-solid fa-angle-down" onClick={()=>sortTables('private', 'low')}></i>
        </div>
      </div>}
      <div className="tablesortbar-header-container flex center">
        <div className="tablesort-text">Players</div>
        <div className="arrow-container flex">
          <i className="sort-arrow fa-solid fa-angle-up" onClick={()=>sortTables('players', 'high')}></i>
          <i className="sort-arrow fa-solid fa-angle-down" onClick={()=>sortTables('players', 'low')}></i>
        </div>
      </div>
      <div className="tablesortbar-header-container flex center">
        <div className="tablesort-text">Table Name</div>
        <div className="arrow-container flex">
          <i className="sort-arrow fa-solid fa-angle-up" onClick={()=>sortTables('tableName', 'high')}></i>
          <i className="sort-arrow fa-solid fa-angle-down" onClick={()=>sortTables('tableName', 'low')}></i>
        </div>
      </div>

      <div className="tablesortbar-header-container flex center">
        <div className="tablesort-text">Deck Size</div>
        <div className="arrow-container flex">
          <i className="sort-arrow fa-solid fa-angle-up" onClick={()=>sortTables('deckSize', 'high')}></i>
          <i className="sort-arrow fa-solid fa-angle-down" onClick={()=>sortTables('deckSize', 'low')}></i>
        </div>
      </div>

      <div className="tablesortbar-header-container flex center">
        <div className="tablesort-text">Min/Max</div>
        <div className="arrow-container flex">
          <i className="sort-arrow fa-solid fa-angle-up" onClick={()=>sortTables('minMax', 'high')}></i>
          <i className="sort-arrow fa-solid fa-angle-down" onClick={()=>sortTables('minMax', 'low')}></i>
        </div>
      </div>
      
    </div>
  </div>
  )
}
export default TableSortBar