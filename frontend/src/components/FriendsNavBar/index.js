import React from 'react'
import './FriendsNavBar.css'

const FriendsNavBar = () => {
  return (
    <div className="friendsnavbar-wrapper flex">
      <div className="friendsnavbar-container flex ">

        <div className="friendsnavbar-nav-item flex center">
          <div>Friends</div>
        </div>

        <div className="friendsnavbar-nav-item flex center">
          <div>Invites</div>
        </div>

        <div className="friendsnavbar-nav-item flex center">
          <div>Conversations</div>
        </div>

      </div>
  </div>
  )
}
export default FriendsNavBar