// frontend/src/components/Navigation/index.js
import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Route, Router, Switch, NavLink } from 'react-router-dom';
import './Navigation.css';


import socialstakesCards from '../../images/socialstakes-logo-cards.svg'
import socialstakesCards2 from '../../images/socialstakes-logo-cards2.svg'
// import logo from "./logo.svg";

import * as sessionActions from '../../redux/middleware/users';
import * as gameActions from '../../redux/actions/gameActions';

import { ModalContext } from '../../context/ModalContext';

function Navigation(){
  const history = useHistory()
  const dispatch = useDispatch();
  const { modal, openModal, closeModal, needsRerender, setNeedsRerender } = useContext(ModalContext);
  const [loaded, isLoaded] = useState(false);

  const user = useSelector(state=> state.users.user)



  const navHost = () => {
    history.push('/host')
  }

  const logout = () => {
    if(!user) return 
    dispatch(sessionActions.logout());
    history.push('/');
  };



  const handleLogoClick = () => {
    dispatch(gameActions.showGamesAction())
    history.push('/');
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
            <div className='nav-user-button'>Games</div>
            <div className='nav-user-button'>Balance</div>
            <div className='nav-user-button'>ProfBtn Modal</div>
          </div>
          )}
          {!user && (
          <div className='nav-user-buttons-container'>
            <div className='nav-user-button'>Login</div>
            <div className='nav-user-button'>Signin</div>
            <div className='nav-user-button'>ProfBtn Modal</div>
          </div>
          )}


        </div>

      </nav>

    

    </>
  );
}

export default Navigation;
