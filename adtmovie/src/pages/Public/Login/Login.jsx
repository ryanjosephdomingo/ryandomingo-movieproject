import { useState, useRef, useCallback, useEffect, useContext } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../utils/hooks/useDebounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/context';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFieldsDirty, setIsFieldsDirty] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const userInputDebounce = useDebounce({ email, password }, 2000);
  const [debounceState, setDebounceState] = useState(false);
  const [status, setStatus] = useState('idle');
  const { setAuthData } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleShowPassword = useCallback(() => {
    setIsShowPassword((value) => !value);
  }, [isShowPassword]);

  const handleOnChange = (event, type) => {
    setDebounceState(false);
    setIsFieldsDirty(true);

    switch (type) {
      case 'email':
        setEmail(event.target.value);

        break;

      case 'password':
        setPassword(event.target.value);
        break;

      default:
        break;
    }
  };

  const handleLogin = async () => {
    const data = { email, password };
    setStatus('loading');
    console.log(data);

    await axios({
      method: 'post',
      url: '/admin/login',
      data,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
      .then((res) => {
        console.log(res);
        localStorage.setItem('accessToken', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setAuthData({
          accessToken: res.data.access_token,
          user: res.data.user,
        });
        navigate('/main/movies');
        setStatus('idle');
      })
      .catch((e) => {
        console.log(e);
        setStatus('idle');
        alert(e.response.data.message);
      });
  };

  useEffect(() => {
    setDebounceState(true);
  }, [userInputDebounce]);

  return (
    <div className='Login'>
      <div className='login-main-container'>
        <h3 className='CineMatik-title'>CineMatik</h3>
        <form>
          <div className='login-form-container'>
            <h3 className='login-text'>Login</h3>  
            <div>
              <div className='login-form-group'>
                <label>E-mail:</label>
                <input
                  type='text'
                  name='email'
                  ref={emailRef}
                  onChange={(e) => handleOnChange(e, 'email')}
                  className='login-form-textbox'
                />
              </div>
              {debounceState && isFieldsDirty && email === '' && (
                <span className='login-errors'>This field is required</span>
              )}
            </div>
            <div>
              <div className='login-form-group'>
                <label>Password:</label>
                <div className='password-input-container'>
                  <input
                    type={isShowPassword ? 'text' : 'password'}
                    name='password'
                    ref={passwordRef}
                    onChange={(e) => handleOnChange(e, 'password')}
                    className='login-form-textbox'
                  />
                  <div className='login-show-password' onClick={handleShowPassword}>
                    <FontAwesomeIcon icon={isShowPassword ? faEyeSlash : faEye} />
                  </div>
                </div>
              </div>
              {debounceState && isFieldsDirty && password === '' && (
                <span className='login-errors'>This field is required</span>
              )}
            </div>

            <div className='login-submit-container'>
              <button
                className='login-button'
                type='button'
                disabled={status === 'loading'}
                onClick={() => {
                  if (status === 'loading') {
                    return;
                  }
                  if (email && password) {
                    handleLogin({
                      type: 'login',
                      user: { email, password },
                    });
                  } else {
                    setIsFieldsDirty(true);
                    if (email === '') {
                      emailRef.current.focus();
                    }
                    if (password === '') {
                      passwordRef.current.focus();
                    }
                  }
                }}
              >
                {status === 'idle' ? 'Login' : 'Loading'}
              </button>
            </div>
            <div className='register-container'>
              <div>
                <span><small>Don't have an account? </small></span>
              </div>
              <span><small><a href='/register'>Register</a></small></span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
