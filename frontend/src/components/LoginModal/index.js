import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import './LoginModal.css';
import { ModalContext } from '../../context/ModalContext';
import * as sessionActions from '../../redux/middleware/users';

function LoginModal() {
  const { openModal, closeModal, setUpdateObj } = useContext(ModalContext);
  const dispatch = useDispatch();
  const formRef = useRef(null);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validate = (fields = { credential, password }) => {
    const errs = {};
    if (!fields.credential) errs.credential = 'Username or email is required';
    if (!fields.password) errs.password = 'Password is required';
    return errs;
  };

  const fieldErrs = validate();
  const canSubmit = Object.keys(fieldErrs).length === 0 && !loading;
  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));
  const fieldError = (field) => touched[field] && (errors[field] || fieldErrs[field]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ credential: true, password: true });
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { response } = await dispatch(sessionActions.login({ credential, password }));
      if (response.ok) { setUpdateObj(null); closeModal(); }
    } catch (_) {
      setErrors({ password: 'Invalid credentials. Please try again.' });
      setTouched({ credential: true, password: true });
    } finally {
      setLoading(false);
    }
  };

  const demoUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { response } = await dispatch(
        sessionActions.login({ credential: 'bigtree', password: 'password' })
      );
      if (response.ok) { setUpdateObj(null); closeModal(); }
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) closeModal();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="li-card" ref={formRef}>
      <h2 className="li-heading">Welcome back</h2>
      <form onSubmit={handleSubmit} noValidate className="li-form">
        <div className="li-field">
          <label className="li-label" htmlFor="li-credential">Username or Email</label>
          <input
            id="li-credential"
            className={`li-input${fieldError('credential') ? ' li-input--error' : ''}`}
            type="text"
            value={credential}
            autoComplete="username"
            placeholder="username or email"
            onChange={(e) => { setCredential(e.target.value); if (touched.credential) setErrors(v => ({ ...v, credential: '' })); }}
            onBlur={() => touch('credential')}
          />
          {fieldError('credential') && <span className="li-error" role="alert">{fieldError('credential')}</span>}
        </div>

        <div className="li-field">
          <label className="li-label" htmlFor="li-password">Password</label>
          <input
            id="li-password"
            className={`li-input${fieldError('password') ? ' li-input--error' : ''}`}
            type="password"
            value={password}
            autoComplete="current-password"
            placeholder="your password"
            onChange={(e) => { setPassword(e.target.value); if (touched.password) setErrors(v => ({ ...v, password: '' })); }}
            onBlur={() => touch('password')}
          />
          {fieldError('password') && <span className="li-error" role="alert">{fieldError('password')}</span>}
        </div>

        <button
          type="submit"
          className={`li-btn${loading ? ' li-btn--loading' : ''}`}
          disabled={!canSubmit}
        >
          {loading ? 'Logging in…' : 'Log In'}
        </button>

        <button
          type="button"
          className="li-demo-btn"
          onClick={demoUser}
          disabled={loading}
        >
          Try Demo Account
        </button>
      </form>

      <p className="li-footer">
        Don't have an account?{' '}
        <button
          className="li-link"
          type="button"
          onClick={() => { closeModal(); openModal('signup'); }}
        >
          Sign up free
        </button>
      </p>
    </div>
  );
}

export default LoginModal;
