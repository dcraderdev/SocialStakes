import Navigation from './components/Navigation';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import GameFloor from './components/GameFloor';
import Game from './components/Game';
import Table from './components/Table';
import BalanceModal from './components/BalanceModal';
import LeaveModal from './components/LeaveModal';

import { useDispatch, useSelector } from 'react-redux';
import { React, useState, useEffect, useContext } from 'react';
import { Route, Router, Switch, NavLink, useLocation } from 'react-router-dom';


import { ModalContext } from './context/ModalContext';
import { SocketContext } from './context/SocketContext';
import * as sessionActions from './redux/middleware/users';
import * as friendActions from './redux/middleware/friends';
import InsuranceModal from './components/InsuranceModal';
import JoinPrivateGameModal from './components/JoinPrivateGameModal';
import SettingsModal from './components/SettingsModal';
import CloseTableModal from './components/CloseTableModal';
import TableClosedModal from './components/TableClosedModal';
import FriendsPage from './components/FriendsPage';
import UnknownRoutePage from './components/UnknownRoutePage';
import StatPage from './components/StatPage';
import RemoveFriendModal from './components/RemoveFriendModal';

function App() {

  const location = useLocation();
  const dispatch = useDispatch();
  const [loaded, isLoaded] = useState(false);
  const { modal, openModal, closeModal, setUpdateObj } = useContext(ModalContext);
  // const {  } = useContext(SocketContext);
  const user = useSelector((state) => state.users.user);


  


  // if no user than we force open login modal
  useEffect(() => {
    isLoaded(false);
    dispatch(sessionActions.loadThemes())
    dispatch(sessionActions.restoreUser())
      .then(() => {
        isLoaded(true);
        dispatch(friendActions.getUserFriends())

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


      {modal === 'login' && (
        <div className='modal-container'>
          {modal === 'login' && <LoginModal />}
        </div>
      )}
      {modal  === 'signup' && (
        <div className='modal-container'>
          {modal === 'signup' && <SignupModal />}
        </div>
      )}
      {modal  === 'balanceModal' && (
        <div className='modal-container'>
          {modal === 'balanceModal' && <BalanceModal />}
        </div>
      )}
      {modal  === 'leaveModal' && (
        <div className='modal-container'>
          {modal === 'leaveModal' && <LeaveModal />}
        </div>
      )}
      {modal  === 'insuranceModal' && (
        <div className='modal-container'>
          {modal === 'insuranceModal' && <InsuranceModal />}
        </div>
      )}

      {modal  === 'joinPrivateGame' && (
        <div className='modal-container'>
          {modal === 'joinPrivateGame' && <JoinPrivateGameModal />}
        </div>
      )}


      {modal  === 'tableSettings' && (
        <div className='modal-container'>
          {modal === 'tableSettings' && <SettingsModal />}
        </div>
      )}

      {modal  === 'closeTable' && (
        <div className='modal-container'>
          {modal === 'closeTable' && <CloseTableModal />}
        </div>
      )}

      {modal  === 'tableClosedModal' && (
        <div className='modal-container'>
          {modal === 'tableClosedModal' && <TableClosedModal />}
        </div>
      )}

{modal  === 'RemoveFriendModal' && (
        <div className='modal-container'>
          {modal === 'RemoveFriendModal' && <RemoveFriendModal />}
        </div>
      )}

      <div>


        <Switch>

          <Route path="/" exact>
            <GameFloor />
          </Route>

          <Route path="/friends" exact>
            {!user && <GameFloor/>}
            <FriendsPage />
          </Route>


          <Route path="/stats" exact>
            {!user && <GameFloor/>}
            <StatPage />
          </Route>

          
          <Route>
            <h1>404:Unknown Route</h1>
            <UnknownRoutePage/>
          </Route>
        </Switch>

      </div>
    </>
  );
}

export default App;
