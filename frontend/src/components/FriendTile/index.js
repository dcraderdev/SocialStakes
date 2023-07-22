import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './FriendTile.css'

const FriendTile = ({friend, type}) => {

  const [status, setStatus] = useState('online');

  console.log(friend);

  let online = false

  useEffect(()=>{
    if(friend && friend.status.online){
      setStatus('online')
    } else{
      setStatus('offline')
    }
  },[friend])

  if(type==='submenu'){
    return(


      <div className={`friendtile-submenu-wrapper flex`}>
        <div className={`friendtile-container flex`}>


      <div className='flex'>

          <div className={`friendtile-profile-image-container flex center`}>
            <div className={`friendtile-profile-image flex center`}>
            {`:)`}
            </div>
          </div>


          <div className={`friendtile-name-container flex center`}>
            <div className={`friendtile-name flex center`}>
            {friend.friend.username}
            </div>
          </div>
      </div>




          <div className={`friendtile-online-container flex center`}>
            <div className={`friendtile-online flex center`}>
              <div className={`friend-status ${status}`}></div>

            </div>
          </div>



        
        </div>
      </div>

    )
  }






















  if(type==='main'){
    return(
      <div className={`friendtile-main-wrapper`}>FriendTile</div>

    )
  }



}
export default FriendTile