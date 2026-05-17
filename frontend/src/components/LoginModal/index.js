import React, { useEffect, useRef, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import './LoginModal.css';
import { ModalContext } from '../../context/ModalContext';
import * as sessionActions from '../../redux/middleware/users';

function LoginModal() {

  const { modal, openModal, closeModal, updateObj, setUpdateObj} = useContext(ModalContext);
  const sessionUser = useSelector((state) => state.users.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const formRef = useRef(null);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [signInErrors, setSignInErrors] = useState({});
  const [serverError, setServerError] = useState('');


  const [disabledButton, setDisabledButton] = useState(false);
  const [buttonClass, setButtonClass] = useState('signinDiv-button button button2 ');
  const [buttonText, setButtonText] = useState('Log In');


  const handleForgotPassword = () => {
    closeModal();
    history.push('/forgotPassword');
  };

  const handleSignUp = () => {
    closeModal();
    openModal('signup');
  };

  useEffect(() => {
    const errors = {};
    const loginErrors = {};

    if (!credential.length) errors['credential'] = 'Please enter a username';
    if (!password.length) errors['password'] = 'Please enter a password';

    if (credential.length && credential.length < 4) {
      loginErrors['credential'] = 'Username must be at least 4 characters';
    }
    if (password.length && password.length < 6) {
      loginErrors['password'] = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    setSignInErrors(loginErrors);
  }, [credential, password]);


  useEffect(() => {
    if (Object.keys(signInErrors).length > 0) {
      setButtonClass('signinDiv-button disabled disabled2');
    } else {
      setButtonClass('signinDiv-button button button2');
    }
  }, [signInErrors]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setDisabledButton(true);
    setButtonText('Signing in…');

    try {
      const { response } = await dispatch(
        sessionActions.login({ credential, password })
      );

      if (response && response.ok) {
        setUpdateObj(null);
        closeModal();
        return;
      }
    } catch (error) {
      setDisabledButton(false);
      setButtonText('Log In');

      if (error && error.status === 401) {
        setServerError('Incorrect username or password.');
        return;
      }
      if (error && error.status === 400) {
        setServerError('Please check your username and password.');
        return;
      }
      if (error && typeof error.status === 'number') {
        setServerError('Something went wrong. Please try again.');
        return;
      }
      setServerError("Can't reach the server. Check your connection and try again.");
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="signin-form-page-container" ref={formRef}>

      <form onSubmit={handleSubmit} className="signinDiv">
        <label className="user">
        <div className='flex center'>Username</div>
          <input
            className="userField"
            type="text"
            value={credential}
            onChange={(e) => {
              setCredential(e.target.value);
              if (serverError) setServerError('');
            }}
            required
            placeholder={validationErrors['credential'] || ''}
          />
        </label>
        <label className="pass">
            <div className='flex center'>Password</div>
          <input
            className="passwordField"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (serverError) setServerError('');
            }}
            required
            placeholder={validationErrors['password'] || ''}
          />
        </label>
        {serverError && (
          <div className="signin-form-error">{serverError}</div>
        )}
        <button
          type="submit"
          className={buttonClass}
          disabled={Object.keys(signInErrors).length > 0 || disabledButton}
        >
          {buttonText}
        </button>
      </form>
      <div className="altLinks">

        <div className="login-signup-link link" onClick={handleSignUp}>
          Sign Up
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
