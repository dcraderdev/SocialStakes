import React, { useEffect, useRef, useState, useContext } from 'react';
import * as sessionActions from '../../redux/middleware/users';

import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';
import { ModalContext } from '../../context/ModalContext';

import "./SignupModal.css";


function SignupModal() {

  const { modal, openModal, closeModal, updateObj, setUpdateObj } = useContext(ModalContext);
  const sessionUser = useSelector((state) => state.users.user);
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
  const [errors, setErrors] = useState({});
  const [errorStatus, setErrorStatus] = useState(false);


  const [disabledButton, setDisabledButton] = useState(false);
  const [buttonClass, setButtonClass] = useState('signupDiv-button button button2');
  const [buttonText, setButtonText] = useState('Sign Up');
  const [emailText, setEmailText] = useState('Please enter an email');
  const [emailClass, setEmailClass] = useState('emailField');
  const [usernameText, setUsernameText] = useState('Please enter an username');
  const [usernameClass, setUsernameClass] = useState('usernameField');

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
    if (!lastName.length) errors['lastName'] = 'Please enter a lasts name';
    if (!password.length) errors['password'] = 'Please enter a password';
    if (!confirmPassword.length) errors['confirmPassword'] = 'Please confirm password';

    if (username.length < 4) {
      errors['username'] = 'Please enter a username';
      signupErrors['username'] = 'Username must be at least 4 characters';
    }
    if (password.length < 6) {
      errors['password'] = 'Please enter a password';
      signupErrors['password'] = 'Password must be at least 6 characters';
    }

    if(confirmPassword !== password){
      signupErrors['password'] = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    setSignupErrors(signupErrors);
  }, [email, username, firstName, lastName, password, confirmPassword]);

  useEffect(() => {
    if (Object.keys(signupErrors).length > 0 || errorStatus) {
      setButtonClass('signupDiv-button disabled disabled2');
    } else {
      setButtonClass('signupDiv-button button button2');
    }
  }, [signupErrors, errorStatus]);


  const handleSubmit = async (e) => {
    setErrors({})
    setErrorStatus(false)
    e.preventDefault();

    try {
      const { data, response } = await dispatch(
       sessionActions.signup({ username, firstName, lastName, email, password })
      );

      if (response.ok) closeModal();
    } catch (error) {
      setDisabledButton(true);
      setButtonClass('signinDiv-button disabled disabled2');
      setErrorStatus(true);


      if (error.status === 500) {
        if (error.data.errors && error.data.errors.email) {
          setEmail('The provided email is invalid');
          setEmailClass('emailField-invalid');
        }
      }

      if (error.status === 403) {
        if (error.data.errors && error.data.errors.email) {
          setUsername('Username must be unique');
          setUsernameClass('usernameField-invalid');
        }
        if (error.data.errors && error.data.errors.username) {
          setEmail('Email must be unique');
          setEmailClass('emailField-invalid');
        }
      }

      setTimeout(() => {
        setErrorStatus(false)
        setDisabledButton(false);
        setButtonClass('signupDiv-button button button2');
        setEmail(emailText)
        setEmailClass('emailField');
        setUsername(usernameText)
        setUsernameClass('usernameField');
      }, 3000);
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
              className={emailClass}
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailText(e.target.value)
              }}
              required
              placeholder={validationErrors['email'] || ''}
            />
          </label>



          <label>
            
            <div className='flex center'>Username</div>
            <input
              className={usernameClass}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setUsernameText(e.target.value)
              }}
              required
              placeholder={validationErrors['username'] || ''}
            />
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
          </label>
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


