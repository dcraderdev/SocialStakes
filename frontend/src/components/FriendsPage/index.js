import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SocketContext } from '../../context/SocketContext';

import { getUserFriends } from '../../redux/middleware/friends';

import FriendsNavBar from '../FriendsNavBar'


import './FriendsPage.css'

const FriendsPage = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.users.user);
  const friends = useSelector(state => state.friends);
  const showFriendInvites = useSelector(state => state.friends.showFriendInvites);
  const showTableInvites = useSelector(state => state.friends.showTableInvites);

  console.log(showFriendInvites);
  console.log(showTableInvites);


  const getHeader = () => {
    if(showFriendInvites){
      return <div>Friend Invites</div>      
    }

    if(showTableInvites){
      return <div>Table Invites</div>      
    }


  }

  useEffect(()=>{
    if(!user)return
    dispatch(getUserFriends(user.id))
  },[user])

  return (
    <div className='friendspage-wrapper flex'>

      <div className='friendspage-friendsnavbar-wrapper'>
        <FriendsNavBar/>
      </div>
      
      <div className='friendspage-content-wrapper flex'>

<div className='friendspage-header flex center'>
        {getHeader()}
</div>

            


        {showFriendInvites && (
          <div>


          </div>
        )}

      </div>



    </div>
    
  )
}
export default FriendsPage