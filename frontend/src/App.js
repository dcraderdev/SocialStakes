import Navigation from './components/Navigation';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import GameFloor from './components/GameFloor';
import Game from './components/Game';
import Table from './components/Table';

import { useDispatch, useSelector } from 'react-redux';
import { React, useState, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';

import { io } from 'socket.io-client';

import { ModalContext } from './context/ModalContext';
import { SocketContext } from './context/SocketContext';
import * as sessionActions from './redux/middleware/users';

function App() {

  const location = useLocation();
  const dispatch = useDispatch();
  const [loaded, isLoaded] = useState(false);
  const { modal, openModal, closeModal, setUpdateObj } = useContext(ModalContext);
  // const {  } = useContext(SocketContext);
  const user = useSelector((state) => {
    return state.users.user;
  });


  


  // if no user than we force open login modal
  useEffect(() => {
    isLoaded(false);

    dispatch(sessionActions.restoreUser())
      .then(() => {
        isLoaded(true);
      })
      .catch(() => {
        isLoaded(true);
        openModal('login');
        setUpdateObj('noUser');
      });
  }, [dispatch]);




  return (
    <>

      {loaded && <Navigation />}


{/* 
      {modal && (
        <div
          className={
            modal === 'profileMenu'
              ? 'modal-container-transparent'
              : 'modal-container'
          }
        >
          {modal === 'login' && <LoginModal />}
          {modal === 'signup' && <SignupModal />}
        </div>
      )}
 */}





      <div>


        <Switch>

          <Route path="/" exact>
            <GameFloor />
          </Route>

          <Route path="/table/:tableId" exact>
            <Game />
          </Route>


          <Route>
            <h1>404:Unknown Route</h1>
          </Route>
        </Switch>

      </div>
    </>
  );
}

export default App;
