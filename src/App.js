import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import VehicleList from './components/vehicles/VehicleList';
import AddVehicle from './components/vehicles/AddVehicle';
import Overview from './components/Overview';
import PartnerList from './components/partners/PartnerList';
import AddPartner from './components/partners/AddPartner';
import PackageList from './components/packages/PackageList';
import RouteList from './components/routes/RouteList';
import AddRoute from './components/routes/AddRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Overview />} />
          <Route path="vehicles/add" element={<AddVehicle />} />
          <Route path="vehicles/list" element={<VehicleList />} />
          <Route path="partners/add" element={<AddPartner />} />
          <Route path="partners/list" element={<PartnerList />} />
          <Route path="packages/list" element={<PackageList />} />
          <Route path="routes/list" element={<RouteList />} />
          <Route path="routes/add" element={<AddRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
