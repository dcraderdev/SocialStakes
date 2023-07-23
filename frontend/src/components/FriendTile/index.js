import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './FriendTile.css';
import { showFriendsAction } from '../../redux/actions/friendActions';

const FriendTile = ({ friend, type }) => {
  const dispatch = useDispatch();

  const currentFriendView = useSelector(
    (state) => state.friends.currentFriendView
  );
  const [status, setStatus] = useState('online');
  const [isActive, setIsActive ] = useState(false);
  let online = false;

  useEffect(()=> {
    setIsActive(false)

    if(!currentFriendView || !friend) return
    if(currentFriendView?.friend?.username === friend?.friend?.username){
      setIsActive(true)
    }

  },[friend, currentFriendView])


  useEffect(() => {
    if (friend && friend.status.online) {
      setStatus('online');
    } else {
      setStatus('offline');
    }
  }, [friend]);

  // sub menu tile
  if (type === 'submenu') {
    return (
      <div
        onClick={() => dispatch(showFriendsAction(friend))}
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
              <div className={`friendtile-name flex center ${isActive ? ' active-name' : ''}`}>
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
    );
  }

  //main friend tile below

  if (type === 'main') {
    return <div className={`friendtile-main-wrapper`}>FriendTile</div>;
  }
};
export default FriendTile;
