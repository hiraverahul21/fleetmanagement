import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Diesel Management section */}
      <div className="menu-section">
        <h3>Diesel Management</h3>
        <ul>
          <li>
            <Link to="/diesel-allotment">Diesel Allotment</Link>
          </li>
          <li>
            <Link to="/diesel-edit-allotment">Edit Diesel Allotment</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;