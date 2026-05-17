import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './WelcomeBanner.css';

function WelcomeBanner() {
  const [visible, setVisible] = useState(false);
  const user = useSelector(state => state.users.user);

  useEffect(() => {
    if (user && sessionStorage.getItem('ss_new_user') === '1') {
      setVisible(true);
    }
  }, [user]);

  const dismiss = () => {
    sessionStorage.removeItem('ss_new_user');
    setVisible(false);
  };

  if (!visible || !user) return null;

  return (
    <div className="welcome-banner">
      <div className="welcome-banner-inner">
        <span className="welcome-banner-icon">🎉</span>
        <div className="welcome-banner-text">
          <strong>Welcome, {user.username}!</strong>
          {' '}You have <strong>$1,000 demo chips</strong> — pick a game below to start playing. No real money, no risk.
        </div>
        <button className="welcome-banner-dismiss" onClick={dismiss} aria-label="Dismiss">
          ×
        </button>
      </div>
    </div>
  );
}

export default WelcomeBanner;
