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
import * as chatActions from './redux/middleware/chat';
import InsuranceModal from './components/InsuranceModal';
import JoinPrivateGameModal from './components/JoinPrivateGameModal';
import SettingsModal from './components/SettingsModal';
import CloseTableModal from './components/CloseTableModal';
import TableClosedModal from './components/TableClosedModal';
import FriendsPage from './components/FriendsPage';
import UnknownRoutePage from './components/UnknownRoutePage';
import StatPage from './components/StatPage';
import RemoveFriendModal from './components/RemoveFriendModal';
import ProfileButtonModal from './components/ProfileButtonModal';
import StartConversationModal from './components/StartConversationModal';
import LeaveConversationModal from './components/LeaveConversationModal';
import AddFriendsModal from './components/AddFriendsModal';
import ThemesModal from './components/ThemesModal';
import AboutMeModal from './components/AboutMeModal';
import LoadingBar from './components/LoadingBar';
import Logo from './components/Logo';


import gameTileBackground from './images/game-tile-background2.jpeg'
import bluePokerChip from './images/blue-poker-chip.svg'


function App() {

  const location = useLocation();
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [fillBar, setFillBar] = useState(false);
  const { modal, openModal, closeModal, setUpdateObj } = useContext(ModalContext);
  // const {  } = useContext(SocketContext);
  const user = useSelector((state) => state.users.user);


  


  // if no user than we force open login modal
  useEffect(() => {
    setIsLoaded(false);
    const img = new Image();
    const img2 = new Image();
    img.src = gameTileBackground;
    img2.src = bluePokerChip;
    dispatch(sessionActions.loadThemes())
    dispatch(sessionActions.restoreUser())
      .then(() => {
        setFillBar(true)
        setTimeout(() => {
          console.log('here');

          setIsLoaded(true);
          
        }, 2500);
        // setIsLoaded(false);


      })
      .catch(() => {
        setFillBar(true)

        setTimeout(() => {
          setIsLoaded(true);
          setUpdateObj('noUser');
        }, 2500);
        
      });
  }, [dispatch]);




console.log(isLoaded); 



  return (
    <>

        <div className={`loading-wrapper flex center ${isLoaded ? 'fade-out' : ''}`}>
          <Logo />
          <LoadingBar isLoaded={setFillBar} />
        </div>
 

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

{modal  === 'themeSettings' && (
        <div className='modal-container'>
          {modal === 'themeSettings' && <ThemesModal />}
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

{modal  === 'newConversation' && (
        <div className='modal-container'>
          {modal === 'newConversation' && <StartConversationModal />}
        </div>
      )}



{modal  === 'LeaveConversationModal' && (
        <div className='modal-container'>
          {modal === 'LeaveConversationModal' && <LeaveConversationModal />}
        </div>
      )}


{modal  === 'AddFriendsModal' && (
        <div className='modal-container'>
          {modal === 'AddFriendsModal' && <AddFriendsModal />}
        </div>
      )}

{modal  === 'AboutMeModal' && (
        <div className='modal-container'>
          {modal === 'AboutMeModal' && <AboutMeModal />}
        </div>
      )}


        <div className={`profile-modal ${modal === 'profileModal' ? ' visible' : ' hidden'}`} >
          <ProfileButtonModal />
        </div>


      <div>
        <Switch>

          <Route path="/" exact>
            {isLoaded && <GameFloor/>}
          </Route>

          <Route path="/friends" exact>
            {isLoaded && !user && <GameFloor/>}
            {isLoaded && <Navigation />}
            {isLoaded && <FriendsPage />}
          </Route>


          <Route path="/stats" exact>
            {isLoaded && !user && <GameFloor/>}
            {isLoaded && <Navigation />}
            {isLoaded && <StatPage />}
          </Route>

          
          <Route>
            <h1>404:Unknown Route</h1>
            {isLoaded && <Navigation />}
            <UnknownRoutePage/>
          </Route>
        </Switch>

      </div>
    </>
  );
}

export default App;
