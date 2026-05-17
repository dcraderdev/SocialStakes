import React, { useEffect, useRef, useState, useContext } from 'react';
import * as sessionActions from '../../redux/middleware/users';
import { useDispatch, useSelector } from 'react-redux';
import { ModalContext } from '../../context/ModalContext';
import "./SignupModal.css";

function SignupModal() {
  const { openModal, closeModal } = useContext(ModalContext);
  const dispatch = useDispatch();
  const formRef = useRef();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignin = () => { closeModal(); openModal('login'); };

  const validate = () => {
    const e = {};
    if (!username.length) e.username = 'Username required';
    else if (username.length < 4) e.username = 'At least 4 characters';
    if (!email.length) e.email = 'Email required';
    if (!password.length) e.password = 'Password required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    return e;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setServerError('');
    try {
      const pendingInviteCode = localStorage.getItem('pendingInviteCode');
      const { response } = await dispatch(
        sessionActions.signup({
          username,
          firstName: username,
          lastName: 'User',
          email,
          password,
          inviteCode: pendingInviteCode || undefined,
        })
      );
      if (response.ok) {
        if (pendingInviteCode) localStorage.removeItem('pendingInviteCode');
        sessionStorage.setItem('ss_new_user', '1');
        closeModal();
      }
    } catch (err) {
      const msg = err?.data?.errors
        ? Object.values(err.data.errors)[0]
        : 'Something went wrong — try a different email or username.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) closeModal();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [touched, setTouched] = useState({});
  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));

  return (
    <div className="signup-form-page-container" ref={formRef}>
      <div className="signup-title">Create account</div>
      <div className="signup-subtitle">Free demo chips, no credit card needed.</div>

      <form onSubmit={handleSubmit} className="signupDiv">
        <label>
          <div className="signup-field-label">Username</div>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onBlur={() => touch('username')}
            placeholder="At least 4 characters"
            autoComplete="username"
            autoFocus
          />
          {touched.username && errors.username && (
            <div className="signup-field-error">{errors.username}</div>
          )}
        </label>

        <label>
          <div className="signup-field-label">Email</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => touch('email')}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {touched.email && errors.email && (
            <div className="signup-field-error">{errors.email}</div>
          )}
        </label>

        <label>
          <div className="signup-field-label">Password</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => touch('password')}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
          {touched.password && errors.password && (
            <div className="signup-field-error">{errors.password}</div>
          )}
        </label>

        {serverError && <div className="signup-server-error">{serverError}</div>}

        <button
          type="submit"
          className={`signupDiv-button${!isValid || submitting ? ' disabled' : ''}`}
          disabled={!isValid || submitting}
        >
          {submitting ? 'Creating account…' : 'Create account — get $1,000 free chips'}
        </button>
      </form>

      <div className="altLinks">
        <span style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>Already have an account?</span>
        <div className="signup-login-link" onClick={handleSignin}>Sign in</div>
      </div>
    </div>
  );
}

export default SignupModal;
