import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './FriendsNavBar.css'

import SearchBar from '../SearchBar';

const FriendsNavBar = () => {
  const history = useHistory()
  const dispatch = useDispatch();
  const [hasCurrentTables, setHasCurrentTables] = useState(false);
  const currentTables = useSelector(state => state.games.currentTables);



  useEffect(()=>{
    setHasCurrentTables(Object.entries(currentTables).length > 0)
  },[currentTables])


  return (
    <div className={`friendsnavbar-wrapper flex ${hasCurrentTables ? ' expanded' : ''}`}>
      <div className="friendsnavbar-container flex ">


      <div className="friendsnavbar-main-header flex center">
            <SearchBar/>
      </div>



        <div className='friendsnavbar-container'>

          <div className="friendsnavbar-nav-header flex center">
            <div>Friends</div>
          </div>

        </div>

        <div className='friendsnavbar-container'>
          <div className="friendsnavbar-nav-header flex center">
            <div>Invites</div>
          </div>

        </div>

        <div className='friendsnavbar-container'>

          <div className="friendsnavbar-nav-header flex center">
            <div>Conversations</div>
          </div>

        </div>






      </div>
  </div>
  )
}
export default FriendsNavBar