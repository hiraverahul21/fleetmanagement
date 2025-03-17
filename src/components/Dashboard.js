import React, { useState } from 'react';
import Navigation from './Navigation';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Outlet /> {/* This renders the nested routes */}
    </div>
  );
};

export default Dashboard;