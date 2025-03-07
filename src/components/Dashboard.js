import React, { useState } from 'react';
import Navigation from './Navigation';
import './Dashboard.css';

const Dashboard = () => {
  const [currentScreen, setCurrentScreen] = useState({ id: 'overview', label: 'Overview' });
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const handleMenuSelect = (menuItem, navState) => {
    setCurrentScreen(menuItem);
    setIsNavCollapsed(navState);
  };

  return (
    <div className="dashboard-container">
      <Navigation onMenuSelect={handleMenuSelect} />
      <div className={`dashboard-main ${isNavCollapsed ? 'nav-collapsed' : ''}`}>
        <div className="dashboard-header">
          <h1>{currentScreen.label}</h1>
          <button className="logout-btn" onClick={() => window.location.href = '/'}>
            Logout
          </button>
        </div>
        <div className="dashboard-content">
          <h2>Welcome to {currentScreen.label}</h2>
          {/* Content sections remain the same */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;