import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './PageLayout.css';

const PageLayout = ({ children, title }) => {
  const [isNavVisible, setIsNavVisible] = useState(true);

  const toggleNav = () => {
    setIsNavVisible(!isNavVisible);
  };

  return (
    <div className="dashboard-container">
      <Sidebar isVisible={isNavVisible} toggleNav={toggleNav} />
      <div className={`main-content ${!isNavVisible ? 'nav-hidden' : ''}`}>
        <Header pageTitle={title} toggleNav={toggleNav} />
        <div className="content-area">
          <h2 className="page-title">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;