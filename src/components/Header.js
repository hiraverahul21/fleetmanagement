import React from 'react';
import './Header.css';

const Header = ({ pageTitle }) => {
  return (
    <header className="main-header">
      <h1>{pageTitle}</h1>
      <div className="user-info">
        <span>Welcome, Rahul</span>
      </div>
    </header>
  );
};

export default Header;