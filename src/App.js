import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import VehicleList from './components/vehicles/VehicleList';
import AddVehicle from './components/vehicles/AddVehicle';
import Overview from './components/Overview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Overview />} />
          <Route path="vehicles/add" element={<AddVehicle />} />
          <Route path="vehicles/list" element={<VehicleList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
