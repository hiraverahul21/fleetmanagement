import React, { useState } from 'react';
import './Login.css';
import logo from '../assets/logo.jpeg';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Server error. Please try again later.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Medimaze Solutions</h1>
        <p></p>
        <button className="read-more">Read More</button>
      </div>
      <div className="login-right">
        <div className="login-form">
          <img src={logo} alt="Company Logo" className="company-logo" />
          <h2>Hello Again!</h2>
          <p>Welcome Back</p>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="login-button">Login</button>
            <div className="forgot-password">
              <a href="/forgot-password">Forgot Password</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;