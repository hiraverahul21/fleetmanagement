import React, { useState } from 'react';
import './Navigation.css';

const Navigation = ({ onMenuSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { id: 'overview', icon: 'tachometer-alt', label: 'Overview' },
    { id: 'vehicles', icon: 'car', label: 'Vehicles' },
    { id: 'equipment', icon: 'tools', label: 'Equipment' },
    { id: 'inspections', icon: 'clipboard-check', label: 'Inspections' },
    { id: 'issues', icon: 'exclamation-triangle', label: 'Issues' },
    { id: 'reminders', icon: 'bell', label: 'Reminders' },
    { id: 'service', icon: 'wrench', label: 'Service' },
    { id: 'contacts', icon: 'users', label: 'Contacts' },
    { id: 'vendors', icon: 'store', label: 'Vendors' },
    { id: 'inventory', icon: 'box', label: 'Parts & Inventory' },
    { id: 'fuel', icon: 'gas-pump', label: 'Fuel History' },
    { id: 'places', icon: 'map-marker-alt', label: 'Places' },
    { id: 'documents', icon: 'file-alt', label: 'Documents' },
    { id: 'reports', icon: 'chart-bar', label: 'Reports' }
  ];
  const handleMenuClick = (menuItem) => {
    setIsOpen(false);
    onMenuSelect(menuItem, true); // Pass navigation collapsed state
  };
  return (
    <>
      <div className={`nav-sidebar ${!isOpen ? 'collapsed' : ''}`}>
        <div className="nav-header">
          <h3>Fleet Management</h3>
          <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
            <i className={`fas ${isOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
        <div className="nav-menu">
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className="nav-item"
              onClick={() => handleMenuClick(item)}
            >
              <i className={`fas fa-${item.icon}`}></i>
              <span className={!isOpen ? 'hidden' : ''}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      {!isOpen && (
        <div className="mini-nav">
          <button className="toggle-btn" onClick={() => setIsOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
      )}
    </>
  );
};

export default Navigation;