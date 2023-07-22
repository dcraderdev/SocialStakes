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
  },[user])

  return (
    <div>
      <FriendsNavBar/>

    </div>
    
  )
}
export default FriendsPage