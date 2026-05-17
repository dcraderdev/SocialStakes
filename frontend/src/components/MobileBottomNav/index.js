import React, { useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showGamesAction } from '../../redux/actions/gameActions';
import { ModalContext } from '../../context/ModalContext';
import './MobileBottomNav.css';

const TABS = [
  { key: 'lobby',   label: 'Lobby',   icon: 'fa-solid fa-house',      path: '/' },
  { key: 'friends', label: 'Friends', icon: 'fa-solid fa-user-group',  path: '/friends' },
  { key: 'history', label: 'History', icon: 'fa-solid fa-clock',       path: '/history' },
  { key: 'profile', label: 'Profile', icon: 'fa-regular fa-user',      path: null },
];

function MobileBottomNav() {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { openModal } = useContext(ModalContext);

  const activeKey = () => {
    const p = location.pathname;
    if (p === '/') return 'lobby';
    if (p.startsWith('/friends')) return 'friends';
    if (p === '/history' || p === '/stats') return 'history';
    return '';
  };
  const active = activeKey();

  const handleTab = (tab) => {
    if (tab.path === '/') {
      dispatch(showGamesAction());
      history.push('/');
    } else if (tab.path) {
      history.push(tab.path);
    } else if (tab.key === 'profile') {
      openModal('profileModal');
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`mbn-tab${active === tab.key ? ' mbn-tab--active' : ''}`}
          onClick={() => handleTab(tab)}
        >
          <i className={`${tab.icon} mbn-icon`} />
          <span className="mbn-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default MobileBottomNav;
