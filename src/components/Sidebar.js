import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
    { path: '/dashboard/vehicles', icon: 'car', label: 'Vehicles', hasSubmenu: true },
    { path: '/dashboard/partners', icon: 'handshake', label: 'Partners', hasSubmenu: true }, // Added Partners menu
    { path: '/equipment', icon: 'tools', label: 'Equipment' },
    { path: '/inspections', icon: 'clipboard-check', label: 'Inspections', hasSubmenu: true },
    { path: '/issues', icon: 'exclamation-triangle', label: 'Issues', hasSubmenu: true },
    { path: '/reminders', icon: 'bell', label: 'Reminders', hasSubmenu: true },
    { path: '/service', icon: 'wrench', label: 'Service', hasSubmenu: true },
    { path: '/contacts', icon: 'users', label: 'Contacts' },
    { path: '/vendors', icon: 'store', label: 'Vendors' },
    { path: '/inventory', icon: 'box', label: 'Parts & Inventory', hasSubmenu: true },
    { path: '/fuel-history', icon: 'gas-pump', label: 'Fuel History' },
    { path: '/places', icon: 'map-marker-alt', label: 'Places' },
    { path: '/documents', icon: 'file-alt', label: 'Documents' },
    { path: '/reports', icon: 'chart-bar', label: 'Reports' }
  ];

  const handleMenuClick = (path) => {
    if (path.includes('/dashboard/partners') || path.includes('/dashboard/vehicles')) {
      // Don't collapse sidebar for items with submenus
      navigate(path);
    } else {
      setIsOpen(false);
      document.querySelector('.sidebar').classList.add('collapsed');
      setTimeout(() => {
        navigate(path);
      }, 300);
    }
  };
  const toggleNav = () => {
    setIsOpen(!isOpen);
    document.querySelector('.sidebar').classList.toggle('collapsed');
  };
  const toggleSubmenu = (label) => {
    setActiveSubmenu(activeSubmenu === label ? null : label);
  };

  const handleLogout = () => {
    navigate('/');
  };
  return (
    <>
      <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={toggleNav}>
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>

        <nav className="nav-links">
          {menuItems.map((item, index) => (
            <div key={index} className="nav-item-container">
              <div 
                className="nav-item"
                onClick={() => handleMenuClick(item.path)}
              >
                <i className={`fas fa-${item.icon}`}></i>
                <span className={!isOpen ? 'hidden' : ''}>{item.label}</span>
                {item.hasSubmenu && (
                  <i 
                    className={`fas fa-chevron-right submenu-arrow ${activeSubmenu === item.label ? 'rotated' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSubmenu(item.label);
                    }}
                  />
                )}
              </div>
              {item.hasSubmenu && activeSubmenu === item.label && (
                <div className="submenu">
                  <div onClick={() => handleMenuClick(`${item.path}/add`)}>Add New</div>
                  <div onClick={() => handleMenuClick(`${item.path}/list`)}>View All</div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span className={!isOpen ? 'hidden' : ''}>Logout</span>
          </button>
        </div>
      </div>
      {!isOpen && (
        <div className="mini-sidebar">
          <button className="toggle-btn" onClick={() => setIsOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;