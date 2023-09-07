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

        
      <nav className="nav-bar">
        <div className='nav-buttons'>
          <div className='logo-container flex center'>
            <div className='logo-image-container flex center'>
              <img src={socialstakesCards2} alt="cards" onClick={handleLogoClick}></img>
            </div>
              <div className='logo-name' onClick={handleLogoClick}>SOCIAL STAKES</div> 
          </div>


          {user && !isMobileScreen && (
          <div className='nav-user-buttons-container'>

            {isWideScreen && <div className='nav-user-button' onClick={handleGameClick}>Games</div>}
            {isWideScreen && <div className='nav-user-button' onClick={handleFriendsClick}>Friends</div>}
            <div className='nav-user-button balance'>${balance}</div>
            <div ref={profileBtnRef} className='nav-user-button profile' onClick={handleProfileButtonClick}>
              <div className='profile-icon-container flex center'>
                {/* <i className="fa-regular fa-user"></i> */}
                {modal !== 'profileModal' && <i className="fa-solid fa-bars"></i>}
                {modal === 'profileModal' && <i className="fa-solid fa-x"></i>}
              </div>
            </div>

          </div>
          )}


{user && isMobileScreen && (
          <div className='nav-user-buttons-container'>

            <div ref={profileBtnRef} className='nav-user-button profile' onClick={handleProfileButtonClick}>
              <div className='profile-icon-container flex center'>
                {/* <i className="fa-regular fa-user"></i> */}
                {modal !== 'profileModal' && <i className="fa-solid fa-bars"></i>}
                {modal === 'profileModal' && <i className="fa-solid fa-x"></i>}
              </div>
            </div>

          </div>
          )}



          {!user && (
          <div className={`nav-user-buttons-container ${isMobileScreen ? ' mobile' : ''}`}>

            <div className='demousers-container'>

            <div className='nav-user-button flex center' onClick={()=>setShowDemoUsers(!showDemoUsers)}> Demo</div>

              {showDemoUsers && <div className='nav-user-button demo' onClick={demoUserOne}>Demo 1</div>}
              {showDemoUsers && <div className='nav-user-button demo' onClick={demoUserTwo}>Demo 2</div>}
              {showDemoUsers && <div className='nav-user-button demo' onClick={demoUserThree}>Demo 3</div>}

            </div>



            {isWideScreen && <div className='nav-user-button' onClick={()=>openModal('login')}>Login</div>}
            {isWideScreen && <div className='nav-user-button' onClick={()=>openModal('signup')}>Sign up</div>}
            <div ref={profileBtnRef} className='nav-user-button profile' onClick={handleProfileButtonClick}>
              <div className='profile-icon-container flex center'><i className="fa-regular fa-user"></i></div>
            </div>

          </div>
          )}
        </div>
        

        

      </nav>

    

    </>
  );
}

export default Navigation;
