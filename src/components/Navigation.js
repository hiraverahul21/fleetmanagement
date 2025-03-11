import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navigation.css';

// Temporarily use an online placeholder until you add your image
const Navigation = ({ onMenuSelect }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'overview', icon: 'tachometer-alt', label: 'Overview' },
    { 
      id: 'vehicles', 
      icon: 'car', 
      label: 'Vehicles',
      submenu: [
        { id: 'add-vehicle', label: 'Add Vehicle', icon: 'plus' },
        { id: 'vehicle-list', label: 'Vehicle List', icon: 'list' },
        { id: 'vehicle-types', label: 'Vehicle Types', icon: 'tags' },
        { id: 'vehicle-status', label: 'Vehicle Status', icon: 'info-circle' }
      ]
    },
    { 
      id: 'partners', 
      icon: 'handshake', 
      label: 'Partners',
      submenu: [
        { id: 'add-partner', label: 'Add Partner', icon: 'plus' },
        { id: 'partner-list', label: 'Partner List', icon: 'list' }
      ]
    },
    { 
      id: 'packages', 
      icon: 'box', 
      label: 'Packages',
      submenu: [
        { id: 'add-package', label: 'Add Package', icon: 'plus' },
        { id: 'package-list', label: 'Package List', icon: 'list' }
      ]
    },
    { id: 'equipment', icon: 'tools', label: 'Equipment' },
  ];
  
  // Update handleSubmenuClick to handle partner routes
  const handleSubmenuClick = (parentItem, submenuItem, e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (parentItem.id === 'vehicles') {
      if (submenuItem.id === 'add-vehicle') {
        navigate('/dashboard/vehicles/add');
      } else if (submenuItem.id === 'vehicle-list') {
        navigate('/dashboard/vehicles/list');
      } else {
        navigate(`/dashboard/vehicles/${submenuItem.id}`);
      }
    } else if (parentItem.id === 'partners') {
      if (submenuItem.id === 'add-partner') {
        navigate('/dashboard/partners/add');
      } else if (submenuItem.id === 'partner-list') {
        navigate('/dashboard/partners/list');
      }
    } else if (parentItem.id === 'packages') {
      if (submenuItem.id === 'add-package') {
        navigate('/dashboard/packages/add');
      } else if (submenuItem.id === 'package-list') {
        navigate('/dashboard/packages/list');
      }
    }
    onMenuSelect({ ...submenuItem, parentId: parentItem.id }, true);
  };
  
  // Update handleMenuClick to handle partner menu
  const handleMenuClick = (menuItem) => {
    setIsOpen(false);
    if (menuItem.id === 'overview') {
      navigate('/dashboard');
    } else if (menuItem.id === 'vehicles') {
      navigate('/dashboard/vehicles/list');
    } else if (menuItem.id === 'partners') {
      navigate('/dashboard/partners/list');
    } else if (menuItem.id === 'packages') {
      navigate('/dashboard/packages/list');
    }
    onMenuSelect(menuItem, true);
  };
  
  const handleLogout = () => {
    navigate('/');
  };
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Trigger layout adjustment
    document.body.style.paddingLeft = !isOpen ? '250px' : '60px';
  };
  
  return (
    <>
      <div className={`nav-sidebar ${!isOpen ? 'collapsed' : ''}`}>
        <div className="nav-header">
          <div className="logo-container">
            <img src="/logo.jpeg" alt="Company Logo" className="company-logo" />
            <h3 className={!isOpen ? 'hidden' : ''}>Fleet Management</h3>
          </div>
          <button className="toggle-btn" onClick={handleToggle}>
            <i className={`fas ${isOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
        <div className="profile-section">
          <div className="profile-image">
            <img 
              src="https://via.placeholder.com/50" 
              alt="Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
              }}
            />
          </div>
          <div className={`profile-info ${!isOpen ? 'hidden' : ''}`}>
            <span className="profile-name">John Doe</span>
            <span className="profile-role">Fleet Manager</span>
          </div>
        </div>
        <div className="nav-menu">
          {menuItems.map((item) => (
            <div key={item.id} className="nav-item-container">
              <div 
                className="nav-item"
                onClick={() => handleMenuClick(item)}
              >
                <i className={`fas fa-${item.icon}`}></i>
                <span className={!isOpen ? 'hidden' : ''}>{item.label}</span>
                {item.submenu && (
                  <i 
                    className={`fas fa-chevron-right submenu-arrow ${activeSubmenu === item.id ? 'rotated' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
                    }}
                  />
                )}
              </div>
              {item.submenu && activeSubmenu === item.id && (
                <div className="submenu">
                  {item.submenu.map(subItem => (
                    <div
                      key={subItem.id}
                      className="submenu-item"
                      onClick={(e) => handleSubmenuClick(item, subItem, e)}
                    >
                      <i className={`fas fa-${subItem.icon}`}></i>
                      <span>{subItem.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="nav-footer">
          <button className="nav-logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span className={!isOpen ? 'hidden' : ''}>Logout</span>
          </button>
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