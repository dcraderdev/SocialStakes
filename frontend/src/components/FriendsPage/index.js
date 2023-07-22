import React, { useState, useRef, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FriendsNavBar from '../FriendsNavBar'
import { SocketContext } from '../../context/SocketContext';

import { getUserFriends } from '../../redux/middleware/friends';

import './FriendsPage.css'

const FriendsPage = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.users.user);
  const friends = useSelector(state => state.friends);

  useEffect(()=>{
    if(!user)return
    dispatch(getUserFriends(user.id))
  },[])

  return (
    <div>
      <FriendsNavBar/>
      <div className='friends-banner flex center'>Friends coming soon</div>

    </div>
    
  )
}
export default FriendsPage