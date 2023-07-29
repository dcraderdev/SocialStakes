import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './FriendTile.css';
import { showFriendsAction } from '../../redux/actions/friendActions';
import { SocketContext } from '../../context/SocketContext';
import { ModalContext } from '../../context/ModalContext';
const FriendTile = ({ friend, type }) => {
  const dispatch = useDispatch();
  const {socket} = useContext(SocketContext)

  const currentFriendView = useSelector((state) => state.friends.currentFriendView);
  const [status, setStatus] = useState('online');
  const [isActive, setIsActive ] = useState(false);
  const user = useSelector((state) => state.users.user);

  useEffect(()=> {
    setIsActive(false)

    if(!currentFriendView || !friend) return
    if(currentFriendView?.friend?.username === friend?.friend?.username){
      setIsActive(true)
    }

  },[friend, currentFriendView])


  useEffect(() => {
    if (friend && friend?.status?.online) {
      setStatus('online');
    } else {
      setStatus('offline');
    }
  }, [friend]);

  const acceptRequest = () =>{
    if(!user || !friend) return
    console.log(friend);
    let friendObj = {
      recipientId:friend.friend.id,
      recipientUsername:friend.friend.username
    }


    socket.emit('accept_friend_request', friendObj);

  }
  const declineRequest = () =>{
    if(!user || !friend) return

    let friendObj = {
      recipientId:friend.friend.id,
      recipientUsername:friend.friend.username
    }
    socket.emit('decline_friend_request', friendObj);

  }




  // sub menu tile
  if (type === 'submenu') {
    return (
      <div
        onClick={() => {
        dispatch(showFriendsAction(friend))
        console.log(friend);
        
        }}
        className={`friendtile-submenu-wrapper flex`}
      >
        <div className={`friendtile-container flex`}>
          <div className="flex">
            <div className={`friendtile-profile-image-container flex center ${isActive ? ' active-friend' : ''}`}>
              <div className={`friendtile-profile-image flex center`}>
                {`:)`}
              </div>
            </div>

            <div className={`friendtile-name-container flex center`}>
{friend &&              <div className={`friendtile-name flex center ${isActive ? ' active-name' : ''}`}>
                {friend?.friend?.username || ''}
              </div>}
            </div>
          </div>

          <div className={`friendtile-online-container flex center`}>
            <div className={`friendtile-online flex center`}>
              <div className={`friend-status ${status}`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //main friend tile below

  if (type === 'invite') {
    return (
      <div
        className={`friendtile-submenu-wrapper flex`}
      >
        <div className={`friendtile-container flex`}>
          <div className="flex">
            <div className={`friendtile-profile-image-container flex center ${isActive ? ' active-friend' : ''}`}>
              <div className={`friendtile-profile-image flex center`}>
                {`:)`}
              </div>
            </div>

            <div className={`friendtile-name-container flex center`}>
  {friend &&            <div className={`friendtile-name flex center`}>
                {friend?.friend?.username}
              </div>}
            </div>
          </div>

          <div className={`friendtile-request-option-container flex center`}>
            <div
                          className="friendtile-request-option"
                          onClick={acceptRequest}
                        >
                          <i className="delete-check fa-solid fa-check"></i>
                        </div>

                        <div
                        className="friendtile-request-option"
                        onClick={declineRequest}
                        >
                        <i className="delete-x fa-solid fa-x"></i>
                        </div>

          </div>
        </div>
      </div>
    );
  }
};
export default FriendTile;
