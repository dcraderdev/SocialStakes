// frontend/src/components/Navigation/index.js
import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Route, Router, Switch, NavLink } from 'react-router-dom';
import './Navigation.css';
import ProfileButtonModal from '../ProfileButtonModal'

import { showGamesAction } from '../../redux/actions/gameActions';

import socialstakesCards from '../../images/socialstakes-logo-cards.svg'
import socialstakesCards2 from '../../images/socialstakes-logo-cards2.svg'

import * as sessionActions from '../../redux/middleware/users';
import * as gameActions from '../../redux/actions/gameActions';

import { ModalContext } from '../../context/ModalContext';
import { WindowContext } from '../../context/WindowContext';

function Navigation(){
  const history = useHistory()
  const dispatch = useDispatch();

  const { modal, openModal, closeModal, needsRerender, setNeedsRerender } = useContext(ModalContext);
  const { windowWidth, profileBtnRef} = useContext(WindowContext);

  const [loaded, isLoaded] = useState(false);

  const user = useSelector(state=> state.users.user)
 
  const wideScreen = windowWidth > 600



  const handleFriendsClick = () => {
    dispatch(gameActions.showGamesAction())
    history.push('/');
  };
  const handleGameClick = () => {
    dispatch(showGamesAction())
  };

let a = 'e10d8de4-f4c2-4d28-9324-56aa9c920801'
let b = 'e10d8de4-f4c2-4d28-9324-56aa9c920801'


  const handleLogoClick = () => {
    dispatch(gameActions.showGamesAction())
    history.push('/');
  };
  const handleProfileButtonClick = () => {
    if(modal === 'profileModal'){
      closeModal()
    } else {
      openModal('profileModal')
    }
  };

  const demoUser = async (e) => {
    dispatch(sessionActions.login({ credential:'bigtree', password:'password' }));
  };


  return (
    <>
      <nav className="nav-bar style2-color1">
        <div className='nav-buttons'>

          <div className='logo-container flex center'>

            <div className='logo-image-container flex center'>
              <img src={socialstakesCards2} alt="cards" onClick={handleLogoClick}></img>
            </div>
            
              <div className='logo-name' onClick={handleLogoClick}>SOCIAL STAKES</div> 
          </div>


          {user && (
          <div className='nav-user-buttons-container'>

            {wideScreen && <div className='nav-user-button' onClick={handleGameClick}>Games</div>}
            {wideScreen && <div className='nav-user-button' onClick={handleFriendsClick}>Friends</div>}
            <div className='nav-user-button balance'>${user.balance}</div>
            <div ref={profileBtnRef} className='nav-user-button profile' onClick={handleProfileButtonClick}>
              <div className='profile-icon-container flex center'><i className="fa-regular fa-user"></i></div>
            </div>

          </div>
          )}
          {!user && (
          <div className='nav-user-buttons-container'>
            {wideScreen && <div className='nav-user-button' onClick={demoUser}>Demo</div>}
            {wideScreen && <div className='nav-user-button' onClick={()=>openModal('login')}>Login</div>}
            {wideScreen && <div className='nav-user-button' onClick={()=>openModal('signup')}>Sign up</div>}
            <div ref={profileBtnRef} className='nav-user-button profile' onClick={handleProfileButtonClick}>
              <div className='profile-icon-container flex center'><i className="fa-regular fa-user"></i></div>
            </div>

          </div>
          )}
        </div>
        
            <div className='profile-modal'>
              {modal === 'profileModal' && <ProfileButtonModal />}
            </div>
        

      </nav>

    

    </>
  );
}

export default Navigation;
