import React, { useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getInviteByCode } from '../../redux/middleware/invites';
import { ModalContext } from '../../context/ModalContext';
import './InviteRedemptionPage.css';

const InviteRedemptionPage = () => {
  const { code } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const { openModal } = useContext(ModalContext);
  const user = useSelector((state) => state.users.user);
  const inviteInfo = useSelector((state) => state.invites.inviteCodeInfo);

  useEffect(() => {
    if (code) {
      localStorage.setItem('pendingInviteCode', code);
      dispatch(getInviteByCode(code));
    }
  }, [code, dispatch]);

  const handleJoin = () => {
    if (user) {
      // Already logged in — nothing to do; they can redeem via /friends
      history.push('/friends');
    } else {
      openModal('signup');
    }
  };

  const handleDecline = () => {
    localStorage.removeItem('pendingInviteCode');
    history.push('/');
  };

  const isExpired = inviteInfo?.status === 'expired';

  return (
    <div className="invite-redemption-wrapper flex center">
      <div className="invite-redemption-card">
        <div className="invite-redemption-icon flex center">
          <i className="fa-solid fa-cards-blank" />
        </div>

        {isExpired ? (
          <>
            <h2 className="invite-redemption-title">Invite Expired</h2>
            <p className="invite-redemption-sub">This invite link is no longer valid.</p>
            <button className="invite-redemption-btn" onClick={() => history.push('/')}>
              Go to Social Stakes
            </button>
          </>
        ) : (
          <>
            <h2 className="invite-redemption-title">You're Invited!</h2>
            {inviteInfo?.senderUsername && (
              <p className="invite-redemption-sub">
                <strong>{inviteInfo.senderUsername}</strong> wants you to join Social Stakes and play together.
              </p>
            )}
            {!inviteInfo?.senderUsername && (
              <p className="invite-redemption-sub">
                You've been invited to join Social Stakes — a social poker & games platform.
              </p>
            )}

            <div className="invite-redemption-actions flex">
              <button className="invite-redemption-btn" onClick={handleJoin}>
                {user ? 'Go to Friends' : 'Create Account & Accept'}
              </button>
              <button className="invite-redemption-btn-secondary" onClick={handleDecline}>
                Maybe later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InviteRedemptionPage;
