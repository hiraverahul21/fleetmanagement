import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import VehicleList from './components/vehicles/VehicleList';
import AddVehicle from './components/vehicles/AddVehicle';
import Overview from './components/Overview';
import PartnerList from './components/partners/PartnerList';
import AddPartner from './components/partners/AddPartner';
import PackageList from './components/packages/PackageList';
import RouteList from './components/routes/RouteList';
import AddRoute from './components/routes/AddRoute';
import CompaniesList from './components/companies/CompaniesList';
import Navigation from './components/Navigation';
import DieselVendor from './components/diesel/DieselVendor';
import DieselReceipts from './components/diesel/DieselReceipts';
import DieselAllotment from './components/diesel/DieselAllotment';
import DieselEditAllotment from './components/diesel/DieselEditAllotment';
import React, { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleMenuSelect = (menuItem, isSubmenu) => {
    // Handle menu selection if needed
    console.log('Menu selected:', menuItem);
  };

  return (
    <Router>
      <div className="app">
        {window.location.pathname !== '/' && <Navigation onMenuSelect={handleMenuSelect} />}
        <Routes>
          <Route path="/" element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="vehicles/add" element={<AddVehicle />} />
            <Route path="vehicles/list" element={<VehicleList />} />
            <Route path="partners/add" element={<AddPartner />} />
            <Route path="partners/list" element={<PartnerList />} />
            <Route path="packages/list" element={<PackageList />} />
            <Route path="routes/list" element={<RouteList />} />
            <Route path="routes/add" element={<AddRoute />} />
            <Route path="companies/list" element={<CompaniesList />} />
            {/* Add diesel routes under dashboard */}
            <Route path="diesel/vendors" element={<DieselVendor />} />
            <Route path="diesel/receipts" element={<DieselReceipts />} />
            <Route path="diesel/allotment" element={<DieselAllotment />} />
            <Route path="diesel/edit-allotment" element={<DieselEditAllotment />} /> {/* Fixed path */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
