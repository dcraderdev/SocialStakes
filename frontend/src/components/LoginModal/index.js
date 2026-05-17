import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { ModalContext } from '../../context/ModalContext';
import * as sessionActions from '../../redux/middleware/users';
import './LoginModal.css';

function LoginModal() {
  const { openModal, closeModal, setUpdateObj } = useContext(ModalContext);
  const dispatch = useDispatch();
  const formRef = useRef(null);

  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleSignUp = () => { closeModal(); openModal('signup'); };
  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));

  const validate = () => {
    const e = {};
    if (!credential.length) e.credential = 'Username required';
    else if (credential.length < 4) e.credential = 'At least 4 characters';
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
      const { response } = await dispatch(sessionActions.login({ credential, password }));
      if (response.ok) {
        setUpdateObj(null);
        closeModal();
      }
    } catch {
      setServerError('Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async (e) => {
    e.preventDefault();
    setDemoLoading(true);
    try {
      const { response } = await dispatch(
        sessionActions.login({ credential: 'bigtree', password: 'password' })
      );
      if (response.ok) {
        setUpdateObj(null);
        closeModal();
      }
    } catch {
      setServerError('Demo login failed — try signing up instead.');
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) closeModal();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="signin-form-page-container" ref={formRef}>
      <div className="signin-title">Sign in</div>

      <button
        className="signin-demo-btn"
        onClick={handleDemo}
        disabled={demoLoading}
        type="button"
      >
        {demoLoading ? 'Loading demo…' : 'Play Demo — No Account Needed'}
      </button>

      <div className="signin-divider">
        <span className="signin-divider-line" />
        <span className="signin-divider-text">or sign in</span>
        <span className="signin-divider-line" />
      </div>

      <form onSubmit={handleSubmit} className="signinDiv">
        <label>
          <div className="signin-field-label">Username</div>
          <input
            type="text"
            value={credential}
            onChange={e => setCredential(e.target.value)}
            onBlur={() => touch('credential')}
            placeholder="Your username"
            autoComplete="username"
            autoFocus
          />
          {touched.credential && errors.credential && (
            <div className="signin-field-error">{errors.credential}</div>
          )}
        </label>

        <label>
          <div className="signin-field-label">Password</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => touch('password')}
            placeholder="Your password"
            autoComplete="current-password"
          />
          {touched.password && errors.password && (
            <div className="signin-field-error">{errors.password}</div>
          )}
        </label>

        {serverError && <div className="signin-server-error">{serverError}</div>}

        <button
          type="submit"
          className={`signinDiv-button${!isValid || submitting ? ' disabled' : ''}`}
          disabled={!isValid || submitting}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="altLinks">
        <span style={{ color: 'var(--ss-text-muted)', fontSize: 13 }}>No account?</span>
        <div className="login-signup-link" onClick={handleSignUp}>Create one free</div>
      </div>
    </div>
  );
}

export default LoginModal;
