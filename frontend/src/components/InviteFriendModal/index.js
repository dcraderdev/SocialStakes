import React, { useState, useContext, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ModalContext } from '../../context/ModalContext';
import { sendInviteEmail } from '../../redux/middleware/invites';
import './InviteFriendModal.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InviteFriendModal = () => {
  const dispatch = useDispatch();
  const { closeModal } = useContext(ModalContext);
  const overlayRef = useRef();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [copyStatus, setCopyStatus] = useState('idle'); // idle | copied
  const [errorText, setErrorText] = useState('');

  const inviteUrl = `${window.location.origin}/invite/link`;

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [closeModal]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) closeModal();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setErrorText('Please enter a valid email address.');
      return;
    }
    setStatus('sending');
    setErrorText('');
    try {
      const { response } = await dispatch(sendInviteEmail({ recipientEmail: email, customMessage: message }));
      if (response.ok) {
        setStatus('sent');
      } else {
        setStatus('error');
        setErrorText('Something went wrong. Try again.');
      }
    } catch {
      setStatus('error');
      setErrorText('Something went wrong. Try again.');
    }
  };

  const handleCopyLink = async () => {
    // Build a generic share link — a real code would come from the backend
    // For now we copy the base invite URL so users can share it
    const shareUrl = `${window.location.origin}/invite`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('idle');
    }
  };

  return (
    <div
      ref={overlayRef}
      className="invite-modal-overlay flex center"
      onClick={handleOverlayClick}
    >
      <div className="invite-modal-container">
        <div className="invite-modal-header flex center">
          <span>Invite a Friend</span>
          <button className="invite-modal-close flex center" onClick={closeModal}>
            <i className="fa-solid fa-x" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="invite-modal-success flex center">
            <i className="fa-solid fa-circle-check" />
            <span>Invite sent to <strong>{email}</strong></span>
            <button className="invite-btn invite-btn-secondary" onClick={closeModal}>Close</button>
          </div>
        ) : (
          <form className="invite-modal-body" onSubmit={handleSend}>
            <div className="invite-field">
              <label className="invite-label">Friend's email</label>
              <input
                className="invite-input"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorText(''); }}
                disabled={status === 'sending'}
                autoFocus
              />
            </div>

            <div className="invite-field">
              <label className="invite-label">Personal message <span className="invite-optional">(optional)</span></label>
              <textarea
                className="invite-textarea"
                placeholder="Come play poker with me!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={status === 'sending'}
                rows={3}
              />
            </div>

            {errorText && <div className="invite-error">{errorText}</div>}

            <div className="invite-modal-actions flex">
              <button
                type="button"
                className="invite-btn invite-btn-copy flex center"
                onClick={handleCopyLink}
              >
                {copyStatus === 'copied' ? (
                  <><i className="fa-solid fa-check" /> Copied!</>
                ) : (
                  <><i className="fa-solid fa-link" /> Copy invite link</>
                )}
              </button>

              <button
                type="submit"
                className={`invite-btn invite-btn-send flex center ${status === 'sending' ? 'invite-btn-loading' : ''}`}
                disabled={status === 'sending' || !email}
              >
                {status === 'sending' ? 'Sending…' : 'Send invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteFriendModal;
