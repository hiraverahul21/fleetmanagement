import React, { useState } from 'react';
import Navigation from './Navigation';
import { Outlet } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [currentScreen, setCurrentScreen] = useState('overview');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const handleMenuSelect = (menuItem) => {
    setCurrentScreen(menuItem.id);
  };

  return (
    <div className="dashboard-container">
      <Navigation onMenuSelect={handleMenuSelect} />
      <div className={`dashboard-main ${isNavCollapsed ? 'nav-collapsed' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;