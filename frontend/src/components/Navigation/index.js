// frontend/src/components/Navigation/index.js
import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Route, Router, Switch, NavLink } from 'react-router-dom';
import './Navigation.css';
import ProfileButtonModal from '../ProfileButtonModal'
import ActiveGameBar from '../ActiveGameBar'

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

  const [hasCurrentTables, setHasCurrentTables] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);

  
  const user = useSelector(state=> state.users.user)
  const balance = useSelector(state=> state.users.balance)
  const currentTables = useSelector(state => state.games.currentTables);

 





  useEffect(()=>{

    windowWidth > 600 ? setIsWideScreen(true) : setIsWideScreen(false)

    windowWidth < 600 ? setIsMobileScreen(true) : setIsMobileScreen(false)





    setHasCurrentTables(Object.entries(currentTables).length > 0)


  },[windowWidth])





  useEffect(()=>{
    setHasCurrentTables(Object.entries(currentTables).length > 0)
  },[currentTables])



  const handleFriendsClick = () => {
    dispatch(gameActions.showGamesAction())
    history.push('/friends');
  };
  const handleGameClick = () => {
    dispatch(showGamesAction())
    history.push('/');

  };



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

  const demoUserOne = async (e) => {
    dispatch(sessionActions.login({ credential:'bigtree', password:'password' }));
  };
  const demoUserTwo = async (e) => {
    dispatch(sessionActions.login({ credential:'Pine', password:'password2' }));
  };
  const demoUserThree = async (e) => {
    dispatch(sessionActions.login({ credential:'Spruce', password:'password' }));
  };


  return (
    <>
        <div className={`nav-active-games ${hasCurrentTables ? 'gametabs-expanded' : ' gametabs-shrunk'}`}>
            <ActiveGameBar/>
        </div>

        
      <nav className="nav-bar" aria-label="Primary">
        <div className='nav-buttons'>
          <div className='logo-container flex center'>
            <div className='logo-image-container flex center'>
              <img src={socialstakesCards2} alt="Social Stakes home" onClick={handleLogoClick}></img>
            </div>
              <div className='logo-name' role='link' tabIndex={0} aria-label='Social Stakes — Home' onClick={handleLogoClick} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleLogoClick();}}}>Social <span className='ss-accent'>Stakes</span></div>
          </div>


          {user && !isMobileScreen && (
          <div className='nav-user-buttons-container'>

            {isWideScreen && <div className='nav-user-button' role='link' tabIndex={0} aria-label='Lobby' onClick={handleGameClick} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleGameClick();}}}>Lobby</div>}
            {isWideScreen && <div className='nav-user-button' role='link' tabIndex={0} aria-label='Friends' onClick={handleFriendsClick} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleFriendsClick();}}}>Friends</div>}
            {isWideScreen && <div className='nav-user-button' role='link' tabIndex={0} aria-label='Game history' onClick={()=>history.push('/history')} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();history.push('/history');}}}>History</div>}
            {isWideScreen && <div className='nav-user-button' role='link' tabIndex={0} aria-label='Verify hand' onClick={()=>history.push('/verify')} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();history.push('/verify');}}}>Verify hand</div>}
            <div className='nav-user-button balance' aria-label={`Balance: ${balance} chips`}>{balance}</div>
            <div ref={profileBtnRef} className='nav-user-button profile' role='button' tabIndex={0} aria-label='Open profile menu' aria-expanded={modal === 'profileModal'} onClick={handleProfileButtonClick} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleProfileButtonClick();}}}>
              <div className='profile-icon-container flex center' aria-hidden='true'>
                {modal !== 'profileModal' && <i className="fa-solid fa-bars"></i>}
                {modal === 'profileModal' && <i className="fa-solid fa-x"></i>}
              </div>
            </div>

          </div>
          )}


{user && isMobileScreen && (
          <div className='nav-user-buttons-container'>

            <div ref={profileBtnRef} className='nav-user-button profile' role='button' tabIndex={0} aria-label='Open profile menu' aria-expanded={modal === 'profileModal'} onClick={handleProfileButtonClick} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleProfileButtonClick();}}}>
              <div className='profile-icon-container flex center' aria-hidden='true'>
                {modal !== 'profileModal' && <i className="fa-solid fa-bars"></i>}
                {modal === 'profileModal' && <i className="fa-solid fa-x"></i>}
              </div>
            </div>

          </div>
          )}



          {!user && (
          <div className={`nav-user-buttons-container ${isMobileScreen ? ' mobile' : ''}`}>

            <div className='demousers-container'>

            <div className='nav-user-button flex center' role='button' tabIndex={0} aria-haspopup='true' aria-expanded={showDemoUsers} aria-label='Toggle demo users' onClick={()=>setShowDemoUsers(!showDemoUsers)} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setShowDemoUsers(!showDemoUsers);}}}> Demo</div>

              {showDemoUsers && <div className='nav-user-button demo' role='button' tabIndex={0} aria-label='Log in as demo user 1' onClick={demoUserOne} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();demoUserOne();}}}>Demo 1</div>}
              {showDemoUsers && <div className='nav-user-button demo' role='button' tabIndex={0} aria-label='Log in as demo user 2' onClick={demoUserTwo} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();demoUserTwo();}}}>Demo 2</div>}
              {showDemoUsers && <div className='nav-user-button demo' role='button' tabIndex={0} aria-label='Log in as demo user 3' onClick={demoUserThree} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();demoUserThree();}}}>Demo 3</div>}

            </div>



            {isWideScreen && <div className='nav-user-button' role='button' tabIndex={0} aria-label='Log in' onClick={()=>openModal('login')} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal('login');}}}>Login</div>}
            {isWideScreen && <div className='nav-user-button' role='button' tabIndex={0} aria-label='Sign up' onClick={()=>openModal('signup')} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal('signup');}}}>Sign up</div>}
            <div ref={profileBtnRef} className='nav-user-button profile' role='button' tabIndex={0} aria-label='Open profile menu' aria-expanded={modal === 'profileModal'} onClick={handleProfileButtonClick} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleProfileButtonClick();}}}>
              <div className='profile-icon-container flex center' aria-hidden='true'><i className="fa-regular fa-user"></i></div>
            </div>

          </div>
          )}
        </div>
        

        

      </nav>

    

    </>
  );
}

export default Navigation;
