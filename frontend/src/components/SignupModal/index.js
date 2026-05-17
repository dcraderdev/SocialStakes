import React, { useEffect, useRef, useState, useContext } from 'react';
import * as sessionActions from '../../redux/middleware/users';

import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { ModalContext } from '../../context/ModalContext';

import "./SignupModal.css";


function SignupModal() {

  const { modal, openModal, closeModal, updateObj, setUpdateObj } = useContext(ModalContext);
  const user = useSelector((state) => state.users.user);
  const dispatch = useDispatch();
  const history = useHistory()
  const formRef = useRef()
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [signupErrors, setSignupErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState('');


  const [disabledButton, setDisabledButton] = useState(false);
  const [buttonClass, setButtonClass] = useState('signupDiv-button button button2');
  const [buttonText, setButtonText] = useState('Sign Up');

  const handleSignin = () => {
    closeModal();
    openModal('login');
  };

  useEffect(() => {
    const errors = {};
    const signupErrors = {};

    if (!email.length) errors['email'] = 'Please enter an email';
    if (!username.length) errors['username'] = 'Please enter a username';
    if (!firstName.length) errors['firstName'] = 'Please enter a first name';
    if (!lastName.length) errors['lastName'] = 'Please enter a last name';
    if (!password.length) errors['password'] = 'Please enter a password';
    if (!confirmPassword.length) errors['confirmPassword'] = 'Please confirm password';

    if (username.length && username.length < 4) {
      signupErrors['username'] = 'Username must be at least 4 characters';
    }
    if (password.length && password.length < 6) {
      signupErrors['password'] = 'Password must be at least 6 characters';
    }
    if (confirmPassword.length && confirmPassword !== password) {
      signupErrors['confirmPassword'] = "Passwords don't match";
    }
    if (email.length && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      signupErrors['email'] = 'Please enter a valid email';
    }

    setValidationErrors(errors);
    setSignupErrors(signupErrors);
  }, [email, username, firstName, lastName, password, confirmPassword]);

  useEffect(() => {
    if (Object.keys(signupErrors).length > 0) {
      setButtonClass('signupDiv-button disabled disabled2');
    } else {
      setButtonClass('signupDiv-button button button2');
    }
  }, [signupErrors]);


  const clearServerErrorFor = (field) => {
    if (serverErrors[field]) {
      const next = { ...serverErrors };
      delete next[field];
      setServerErrors(next);
    }
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});
    setFormError('');
    setDisabledButton(true);

    try {
      const { response } = await dispatch(
        sessionActions.signup({ username, firstName, lastName, email, password })
      );

      if (response && response.ok) {
        setDisabledButton(false);
        closeModal();
        return;
      }
    } catch (error) {
      setDisabledButton(false);

      if (error && error.status === 403 && error.data && error.data.errors) {
        setServerErrors(error.data.errors);
        return;
      }

      if (error && error.status === 400 && error.data && error.data.errors) {
        setServerErrors(error.data.errors);
        return;
      }

      if (error && typeof error.status === 'number') {
        setFormError("Something went wrong. Please try again.");
        return;
      }

      setFormError("Can't reach the server. Check your connection and try again.");
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

  const emailInputClass = serverErrors.email ? 'emailField-invalid' : 'emailField';
  const usernameInputClass = serverErrors.username ? 'usernameField-invalid' : 'usernameField';

  return (
      <div className="signup-form-page-container" ref={formRef}>
        <form onSubmit={handleSubmit} className="signupDiv">

        <label>
            <div className='flex center'>First Name</div>
            <input
              className="firstnameField"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder={validationErrors['firstName'] || ''}
            />
          </label>
          <label>
            <div className='flex center'>Last Name</div>
            <input
              className="lastnameField"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder={validationErrors['lastName'] || ''}
            />
          </label>

          <label className="emailLabel">
            <div className='flex center'>Email</div>
            <input
              className={emailInputClass}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearServerErrorFor('email');
              }}
              required
              placeholder={validationErrors['email'] || ''}
            />
            {(serverErrors.email || signupErrors.email) && (
              <div className="signup-field-error">{serverErrors.email || signupErrors.email}</div>
            )}
          </label>

          <label>
            <div className='flex center'>Username</div>
            <input
              className={usernameInputClass}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearServerErrorFor('username');
              }}
              required
              placeholder={validationErrors['username'] || ''}
            />
            {(serverErrors.username || signupErrors.username) && (
              <div className="signup-field-error">{serverErrors.username || signupErrors.username}</div>
            )}
          </label>

          <label>
            <div className='flex center'>Password</div>
            <input
              className="passwordField"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={validationErrors['password'] || ''}
            />
            {signupErrors.password && (
              <div className="signup-field-error">{signupErrors.password}</div>
            )}
          </label>
          <label>
            <div className='flex center'>Confirm Password</div>
            <input
              className="confirmPasswordField"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder={validationErrors['confirmPassword'] || ''}
            />
            {signupErrors.confirmPassword && (
              <div className="signup-field-error">{signupErrors.confirmPassword}</div>
            )}
          </label>
          {formError && (
            <div className="signup-form-error">{formError}</div>
          )}
          <button
          type="submit"
          className={buttonClass}
          disabled={Object.keys(signupErrors).length > 0 || disabledButton}>
            {buttonText}
          </button>
        </form>
        <div className="altLinks">
          <div className="signup-login-link link" onClick={handleSignin}>
            Log In
          </div>
      </div>
      </div>
  );
}

export default SignupModal;
