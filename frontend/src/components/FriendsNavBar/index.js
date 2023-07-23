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
  const currentTables = useSelector(state => state.games.currentTables);
  const [hasCurrentTables, setHasCurrentTables] = useState(false);


  //sets hieght for our sidemenu in case we have currentGames
  useEffect(()=>{
    setHasCurrentTables(Object.entries(currentTables).length > 0)
  },[currentTables])


  const viewFriends = 'view-friends'
  const viewConversations = 'view-conversations'
  const viewInvites = 'view-invites'

  const testFriends = {};

  for (let i = 0; i < 40; i++) {
    let name = "Friend" + i;
    let id = Math.floor(Math.random() * 1000000); // Generate a random number for ID, just for testing
    testFriends[name] = { 
      id: id.toString(), 
      friend: { username: name, rank: i },
      status: 'accepted' 
    };
  }
  

  //select which submenu is focused(opened)
  const toggleFocus = (focus) => {
    if(focus === currentFocus){
      setCurrentFocus(null)
      return
    }
    setCurrentFocus(focus)
  }
 

  const getViewHeight = () => {
    if(currentFocus === viewFriends){
      return hasCurrentTables ? 'friends-extra-extended' : 'friends-extended'
    }

    if(currentFocus === viewConversations){
      return hasCurrentTables ? 'friends-extra-extended' : 'friends-extended'
    }

    if(currentFocus === viewInvites){
      return hasCurrentTables ? 'invites-extra-extended' : 'invites-extended'
    }


  }



  return (
    <div className={`friendsnavbar-wrapper flex`}>
      <div className="friendsnavbar-container flex ">


        <div className="friendsnavbar-main-header flex center">
          <SearchBar/>
        </div>




        <div className={`friendsnavbar-option ${currentFocus === viewFriends ? getViewHeight() : ''}`}>

          <div onClick={()=>toggleFocus(viewFriends)} className={`friendsnavbar-nav-header flex center ${currentFocus === viewFriends ? ' active-nav' : ''}`}>
            <div>Friends</div>
          </div>

    <div className='friendsnavbar-content'>

          {/* {friends && Object.entries(friends.friends).map(([key,friend],index) => { */}
          {friends && Object.entries(testFriends).map(([key,friend],index) => {
            return (
            <FriendTile key={index} friend={friend} type={'submenu'}/>
            )
          })}
    </div>


        </div>



        <div  className={`friendsnavbar-option ${currentFocus === viewConversations ? getViewHeight() : ''}`}>

          <div onClick={()=>toggleFocus(viewConversations)} className={`friendsnavbar-nav-header flex center ${currentFocus === viewConversations ? ' active-nav' : ''}`}>
            <div>Conversations</div>
          </div>

          { [1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,1,2,3,4,].map((friend,index) => {
            return (<div key={index}>{friend}</div>)
          })}

        </div>

        <div className={`friendsnavbar-option invites ${currentFocus === viewInvites ? getViewHeight() : ''}`}>

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