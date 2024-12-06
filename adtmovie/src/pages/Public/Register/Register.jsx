import React, { useState, useRef, useCallback, useEffect } from 'react'; 
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../utils/hooks/useDebounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [isFieldsDirty, setIsFieldsDirty] = useState(false);
  
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const contactNoRef = useRef();
  
  const [isShowPassword, setIsShowPassword] = useState(false);
  const userInputDebounce = useDebounce({ firstName, middleName, lastName, email, password, contactNo }, 2000);
  const [debounceState, setDebounceState] = useState(false);
  const [status, setStatus] = useState('idle');

  const navigate = useNavigate();

  const handleShowPassword = useCallback(() => {
    setIsShowPassword((value) => !value);
  }, []);

  const handleOnChange = (event, type) => {
    setDebounceState(false);
    setIsFieldsDirty(true);

    switch (type) {
      case 'firstName':
        setFirstName(event.target.value);
        break;
      case 'middleName':
        setMiddleName(event.target.value);
        break;
      case 'lastName':
        setLastName(event.target.value);
        break;
      case 'email':
        setEmail(event.target.value);
        break;
      case 'password':
        setPassword(event.target.value);
        break;
      case 'contactNo':
        setContactNo(event.target.value);
        break;
      default:
        break;
    }
  };

  const handleRegister = async () => {

    const data = { firstName, middleName, lastName, email, password, contactNo, role: 'user' }; 
    setStatus('loading');
    console.log(data);

    await axios({
      method: 'post',
      url: '/user/register',
      data,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
      .then((res) => {
        console.log(res);

        navigate('/'); 
        setStatus('idle');
      })
      .catch((e) => {
        console.log(e);
        setStatus('idle');
      });
  };

  useEffect(() => {
    setDebounceState(true);
  }, [userInputDebounce]);

  return (
    <div className='Register'>
      <div className='register-main-container'>
        <form className='register-form-container'>
          <h3 className='register-text'>Register</h3>
          <div className='register-form-group'>
            <label>First Name:</label>
            <input
              type='text'
              name='firstName'
              ref={firstNameRef}
              onChange={(e) => handleOnChange(e, 'firstName')}
              className='register-form-textbox'
            />
          </div>
          {debounceState && isFieldsDirty && firstName === '' && (
            <span className='register-errors'>This field is required</span>
          )}

          <div className='register-form-group'>
            <label>Middle Name:</label>
            <input
              type='text'
              name='middleName'
              ref={middleNameRef}
              onChange={(e) => handleOnChange(e, 'middleName')}
              className='register-form-textbox'
            />
          </div>
          {debounceState && isFieldsDirty && middleName === '' && (
            <span className='register-errors'>This field is required</span>
          )}

          <div className='register-form-group'>
            <label>Last Name:</label>
            <input
              type='text'
              name='lastName'
              ref={lastNameRef}
              onChange={(e) => handleOnChange(e, 'lastName')}
              className='register-form-textbox'
            />
          </div>
          {debounceState && isFieldsDirty && lastName === '' && (
            <span className='register-errors'>This field is required</span>
          )}

          <div className='register-form-group'>
            <label>E-mail:</label>
            <input
              type='text'
              name='email'
              ref={emailRef}
              onChange={(e) => handleOnChange(e, 'email')}
              className='register-form-textbox'
            />
          </div>
          {debounceState && isFieldsDirty && email === '' && (
            <span className='register-errors'>This field is required</span>
          )}
          <div className='register-form-group'>
            <label>Contact Number:</label>
            <input
              type='text'
              name='contactNo'
              ref={contactNoRef}
              onChange={(e) => handleOnChange(e, 'contactNo')}
              className='register-form-textbox'
            />
          </div>
          {debounceState && isFieldsDirty && contactNo === '' && (
            <span className='register-errors'>This field is required</span>
          )}
          <div className='register-form-group'>
            <label>Password:</label>
            <div className='regpass-input-container'>
            <input
              type={isShowPassword ? 'text' : 'password'}
              name='password'
              ref={passwordRef}
              onChange={(e) => handleOnChange(e, 'password')}
              className='register-form-textbox'
            />
            <div className='register-show-password' onClick={handleShowPassword}>
                    <FontAwesomeIcon icon={isShowPassword ? faEyeSlash : faEye} />
                  </div>
          </div>
          {debounceState && isFieldsDirty && password === '' && (
            <span className='register-errors'>This field is required</span>
          )}

          <div className='register-submit-container'>
            <button
              type='button'
              disabled={status === 'loading'}
              onClick={() => {
                if (status === 'loading') {
                  return;
                }
                if (firstName && middleName && lastName && email && contactNo && password) {
                  handleRegister();
                } else {
                  setIsFieldsDirty(true);
                  if (firstName === '') {
                    firstNameRef.current.focus();
                  }
                  if (middleName === '') {
                    middleNameRef.current.focus();
                  }
                  if (lastName === '') {
                    lastNameRef.current.focus();
                  }
                  if (email === '') {
                    emailRef.current.focus();
                  }
                  if (password === '') {
                    passwordRef.current.focus();
                  }
                  if (contactNo === '') {
                    contactNoRef.current.focus();
                  }
                }
              }}
            >
              {status === 'loading' ? 'Registering...' : 'Register'}
            </button>
          </div>

          <div className='register-container'>
            <div>
              <span><small> Already a member? </small></span>
            </div>
            <span><small><a href='/'>Login Here</a></small></span>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
