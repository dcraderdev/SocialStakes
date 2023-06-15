// frontend/src/components/Navigation/index.js
import React, { useEffect, useRef, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ModalContext } from '../../context/ModalContext';
import { Route, Router, Switch, NavLink } from 'react-router-dom';
import * as sessionActions from '../../redux/middleware/users'

// import logo from "./logo.svg";
import './Navigation.css';

function Navigation(){
  const history = useHistory()
  const dispatch = useDispatch();
  const { modal, openModal, closeModal, needsRerender, setNeedsRerender } = useContext(ModalContext);
  const [loaded, isLoaded] = useState(true);

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
    history.push('/');
  };


  return (
    <>
      <nav className="nav-bar bgcolor2">
      {/* <img className='logo' src={logo} alt="Logo" onClick={handleLogoClick}/> */}
      <div className='logo' onClick={handleLogoClick}>SOCIAL STAKES</div>

      <div className='nav-buttons'>
        <NavLink className='navLink' to="/">Home | </NavLink>
        <NavLink className='navLink' to="/">GameFloor | </NavLink>
        <div className='nav-signinout-container'>
          <div
            onClick={() => {
              openModal('login');
            }}
          >
            SIGN IN{' '}
           </div>

          <div 
          className='nav-signout-button'
          onClick={logout}
          >
          SIGN OUT
          </div>
        </div>

      </div>

      <div className='nav-user-buttons'>
      user buttons
      </div>
    </nav>
    </>
  );
}

export default Navigation;
