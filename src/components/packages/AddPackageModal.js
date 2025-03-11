import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddPackageModal.css';

const AddPackageModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    vehicle_no: '',  // Changed from direct input to dropdown selection
    route_id: '',
    route_name: '',
    driver_id: '',
    no_of_days: '',
    monthly_kms: '',
    actual_kms: '',
    company_id: '',
    diesel_status: 'Self',
    supervisor_id: ''
  });

  const [companies, setCompanies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]); // Add vehicles state

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [companiesRes, supervisorsRes, driversRes, vehiclesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/companies'),
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/drivers'),
        axios.get('http://localhost:5000/api/vehicles') // Add vehicles API call
      ]);

      setCompanies(companiesRes.data);
      setSupervisors(supervisorsRes.data);
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/packages', formData);
      onAdd(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding package:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Package</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Vehicle No</label>
              <select
                name="vehicle_no"
                value={formData.vehicle_no}
                onChange={handleChange}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.licensePlate}>
                    {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Route ID</label>
              <input
                type="text"
                name="route_id"
                value={formData.route_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Route Name</label>
              <input
                type="text"
                name="route_name"
                value={formData.route_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Driver</label>
              <select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>No of Days</label>
              <input
                type="number"
                name="no_of_days"
                value={formData.no_of_days}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Monthly Kms</label>
              <input
                type="number"
                name="monthly_kms"
                value={formData.monthly_kms}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Actual Kms</label>
              <input
                type="number"
                name="actual_kms"
                value={formData.actual_kms}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company</label>
              <select
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Diesel Status</label>
              <select
                name="diesel_status"
                value={formData.diesel_status}
                onChange={handleChange}
                required
              >
                <option value="Self">Self</option>
                <option value="Client">Client</option>
              </select>
            </div>

            <div className="form-group">
              <label>Supervisor</label>
              <select
                name="supervisor_id"
                value={formData.supervisor_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Supervisor</option>
                {supervisors.map(supervisor => (
                  <option key={supervisor.id} value={supervisor.id}>{supervisor.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Add Package</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPackageModal;