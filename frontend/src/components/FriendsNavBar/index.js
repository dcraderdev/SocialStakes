import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './FriendsNavBar.css'


import SearchBar from '../SearchBar';
import FriendTile from '../FriendTile';


import { showFriendInvitesAction, showTableInvitesAction } from '../../redux/actions/friendActions';

const FriendsNavBar = () => {
  const history = useHistory()
  const dispatch = useDispatch();

  const [currentFocus, setCurrentFocus] = useState(null);

  const friends = useSelector(state => state.friends);

  const viewFriends = 'view-friends'
  const viewInvites = 'view-invites'
  const viewConversations = 'view-conversations'





  //select which submenu is focused(opened)
  const toggleFocus = (focus) => {
    if(focus === currentFocus){
      setCurrentFocus(null)
      return
    }
    setCurrentFocus(focus)
  }




  return (
    <div className={`friendsnavbar-wrapper flex`}>
      <div className="friendsnavbar-container flex ">


        <div className="friendsnavbar-main-header flex center">
          <SearchBar/>
        </div>




        <div className={`friendsnavbar-option ${currentFocus === viewFriends ? 'friends-extended' : ''}`}>

          <div onClick={()=>toggleFocus(viewFriends)} className={`friendsnavbar-nav-header flex center ${currentFocus === viewFriends ? ' active-nav' : ''}`}>
            <div>Friends</div>
          </div>


          {friends && Object.entries(friends.friends).map(([key,friend],index) => {
            return (
            <FriendTile key={index} friend={friend} type={'submenu'}/>
            )
          })}


        </div>



        <div  className={`friendsnavbar-option ${currentFocus === viewConversations ? 'friends-extended' : ''}`}>

          <div onClick={()=>toggleFocus(viewConversations)} className={`friendsnavbar-nav-header flex center ${currentFocus === viewConversations ? ' active-nav' : ''}`}>
            <div>Conversations</div>
          </div>

          { [1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,].map((friend,index) => {
            return (<div key={index}>{friend}</div>)
          })}

        </div>

        <div className={`friendsnavbar-option invites ${currentFocus === viewInvites ? 'invites-extended' : ''}`}>

          <div onClick={()=>toggleFocus(viewInvites)} className={`friendsnavbar-nav-header flex center  ${currentFocus === viewInvites ? ' active-nav' : ''}`}>
            <div>Invites</div>
          </div>
          <div className="friendsnavbar-nav flex center" onClick={()=>dispatch(showTableInvitesAction())}>Tables</div>
          <div className="friendsnavbar-nav flex center" onClick={()=>dispatch(showFriendInvitesAction())}>Friends</div>




        </div>




      </div>
  </div>
  )
}
export default FriendsNavBar