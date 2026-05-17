import React, { useEffect, useRef, useState, useContext } from 'react';
import * as sessionActions from '../../redux/middleware/users';
import { useDispatch } from 'react-redux';
import { ModalContext } from '../../context/ModalContext';
import "./SignupModal.css";

function SignupModal() {
  const { openModal, closeModal } = useContext(ModalContext);
  const dispatch = useDispatch();
  const formRef = useRef();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validate = (fields = { email, username, password }) => {
    const errs = {};
    if (!fields.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(fields.email)) errs.email = 'Enter a valid email';
    if (!fields.username) errs.username = 'Username is required';
    else if (fields.username.length < 4) errs.username = 'At least 4 characters';
    if (!fields.password) errs.password = 'Password is required';
    else if (fields.password.length < 6) errs.password = 'At least 6 characters';
    return errs;
  };

  const fieldErrs = validate();
  const canSubmit = Object.keys(fieldErrs).length === 0 && !loading;
  const touch = (field) => setTouched(t => ({ ...t, [field]: true }));
  const fieldError = (field) => touched[field] && (errors[field] || fieldErrs[field]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, username: true, password: true });
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { response } = await dispatch(
        sessionActions.signup({ email, username, password, firstName: username, lastName: username })
      );
      if (response.ok) closeModal();
    } catch (error) {
      if (error?.data?.errors) {
        const serverErrs = {};
        const e = error.data.errors;
        if (e.email) serverErrs.email = 'Email already in use';
        if (e.username) serverErrs.username = 'Username already taken';
        setErrors(serverErrs);
        setTouched({ email: true, username: true, password: true });
      } else {
        setErrors({ password: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
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
    <div className="su-card" ref={formRef}>
      <h2 className="su-heading">Sign up to play free</h2>
      <form onSubmit={handleSubmit} noValidate className="su-form">
        <div className="su-field">
          <label className="su-label" htmlFor="su-email">Email</label>
          <input
            id="su-email"
            className={`su-input${fieldError('email') ? ' su-input--error' : ''}`}
            type="email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            onChange={(e) => { setEmail(e.target.value); if (touched.email) setErrors(v => ({ ...v, email: '' })); }}
            onBlur={() => touch('email')}
          />
          {fieldError('email') && <span className="su-error" role="alert">{fieldError('email')}</span>}
        </div>

        <div className="su-field">
          <label className="su-label" htmlFor="su-username">Username</label>
          <input
            id="su-username"
            className={`su-input${fieldError('username') ? ' su-input--error' : ''}`}
            type="text"
            value={username}
            autoComplete="username"
            placeholder="coolplayer99"
            onChange={(e) => { setUsername(e.target.value); if (touched.username) setErrors(v => ({ ...v, username: '' })); }}
            onBlur={() => touch('username')}
          />
          {fieldError('username') && <span className="su-error" role="alert">{fieldError('username')}</span>}
        </div>

        <div className="su-field">
          <label className="su-label" htmlFor="su-password">Password</label>
          <input
            id="su-password"
            className={`su-input${fieldError('password') ? ' su-input--error' : ''}`}
            type="password"
            value={password}
            autoComplete="new-password"
            placeholder="6+ characters"
            onChange={(e) => { setPassword(e.target.value); if (touched.password) setErrors(v => ({ ...v, password: '' })); }}
            onBlur={() => touch('password')}
          />
          {fieldError('password') && <span className="su-error" role="alert">{fieldError('password')}</span>}
        </div>

        <button
          type="submit"
          className={`su-btn${loading ? ' su-btn--loading' : ''}`}
          disabled={!canSubmit}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="su-footer">
        Already have an account?{' '}
        <button
          className="su-link"
          type="button"
          onClick={() => { closeModal(); openModal('login'); }}
        >
          Log in
        </button>
      </p>
    </div>
  );
}

export default SignupModal;
