import React, { useState } from 'react';
import './Login.css';
import logo from '../assets/logo.jpeg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here
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