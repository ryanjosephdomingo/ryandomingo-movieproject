import { useState, useCallback } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Register() {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    contactNo: '',
  });

  const handleShowPassword = useCallback(() => {
    setIsShowPassword((value) => !value);
  }, []);

  const [formErrors, setFormErrors] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
    contactNo: false,
  });

  const [status, setStatus] = useState('idle');
  const navigate = useNavigate();

  const handleOnChange = (event, field) => {
    setFormData((prevData) => ({ ...prevData, [field]: event.target.value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [field]: false }));
    if (field === 'email') {
      setEmailError(''); // Reset email error when user types
    }
  };

  const validateForm = () => {
    const errors = {
      email: !formData.email,
      password: !formData.password,
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      contactNo: !formData.contactNo,
    };
    setFormErrors(errors);
    return !Object.values(errors).some((hasError) => hasError);
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setStatus('loading');
    const registerData = {
      ...formData,
      role: 'admin', // Explicitly set the role as admin
    };

    try {
      const res = await axios.post('/admin/register', registerData);
      console.log('Response:', res.data); // Debug server response
      navigate('/');
      alert('Registration successful!');
    } catch (error) {
      console.error(error);
      setStatus('idle');
      if (error.response && error.response.status === 409) {
        setEmailError('Email already exists. Please use a different email.');
      } else {
        setEmailError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="register-main-container">
      <div className="register-form-container">
        <h3 className="register-text">Register</h3>
        <form>
          <div className="form-container-register">
           

            {/* First Name */}
            <div className="register-form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                className="register-form-textbox"
                onChange={(e) => handleOnChange(e, 'firstName')}
              />
              {formErrors.firstName && (
                <span className="register-errors">This field is required</span>
              )}
            </div>

            {/* Middle Name (Optional) */}
            <div className="register-form-group">
              <label>Middle Name:</label>
              <input
                type="text"
                name="middleName"
                className="register-form-textbox"
                onChange={(e) => handleOnChange(e, 'middleName')}
              />
            </div>

            {/* Last Name */}
            <div className="register-form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                className="register-form-textbox"
                onChange={(e) => handleOnChange(e, 'lastName')}
              />
              {formErrors.lastName && (
                <span className="register-errors">This field is required</span>
              )}
            </div>

            {/* Contact No */}
            <div className="register-form-group">
              <label>Contact No:</label>
              <input
                type="text"
                name="contactNo"
                className="register-form-textbox"
                onChange={(e) => handleOnChange(e, 'contactNo')}
              />
              {formErrors.contactNo && (
                <span className="register-errors">This field is required</span>
              )}
            </div> 
            {/* Email */}
            <div className="register-form-group">
              <label>Email:</label>
              <input
                type="text"
                name="email"
                className="register-form-textbox"
                onChange={(e) => handleOnChange(e, 'email')}
              />
              {formErrors.email && (
                <span className="register-errors">This field is required</span>
              )}
              {emailError && <span className="register-errors">{emailError}</span>}
            </div>

            {/* Password */}
            <div className="register-form-group">
              <label>Password:</label>
              <div className="regpass-input-container">
                <input
                  type={isShowPassword ? 'text' : 'password'}
                  name="password"
                  className="register-form-textbox"
                  onChange={(e) => handleOnChange(e, 'password')}
                />
                <div className="register-show-password" onClick={handleShowPassword}>
                  <FontAwesomeIcon icon={isShowPassword ? faEyeSlash : faEye} />
                </div>
              </div>
              {formErrors.password && (
                <span className="register-errors">This field is required</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="register-submit-container">
              <button
                className="register-button"
                type="button"
                disabled={status === 'loading'}
                onClick={handleRegister}
              >
                {status === 'idle' ? 'Register' : 'Loading'}
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