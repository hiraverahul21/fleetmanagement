import React from 'react';
import './DashboardContent.css';

const DashboardContent = () => {
  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <i className="fas fa-car"></i>
        <div className="stat-info">
          <h3>Total Vehicles</h3>
          <p>25</p>
        </div>
      </div>
      <div className="stat-card">
        <i className="fas fa-tools"></i>
        <div className="stat-info">
          <h3>Equipment</h3>
          <p>42</p>
        </div>
      </div>
      <div className="stat-card">
        <i className="fas fa-exclamation-circle"></i>
        <div className="stat-info">
          <h3>Active Issues</h3>
          <p>5</p>
        </div>
      </div>
      <div className="stat-card">
        <i className="fas fa-clock"></i>
        <div className="stat-info">
          <h3>Pending Services</h3>
          <p>3</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;