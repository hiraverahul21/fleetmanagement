import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddPackageModal.css';

const AddPackageModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    partner_id: '',
    vehicle_no: '',
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
  const [vehicles, setVehicles] = useState([]);
  const [partners, setPartners] = useState([]);

  // Move fetchDropdownData inside component, after state declarations
  const fetchDropdownData = async () => {
    try {
      const [companiesRes, supervisorsRes, driversRes, partnersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/companies'),
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/drivers'),
        axios.get('http://localhost:5000/api/partners')
      ]);

      setCompanies(companiesRes.data);
      setSupervisors(supervisorsRes.data);
      setDrivers(driversRes.data);
      setPartners(partnersRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  // Update useEffect to fetch initial data
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Keep only one vehicle fetch useEffect
  // Update vehicle fetch useEffect with the correct API endpoint
  useEffect(() => {
    if (formData.partner_id) {
      axios.get(`http://localhost:5000/api/vehicles?partner_id=${formData.partner_id}`)
        .then(response => {
          console.log('Fetched vehicles for partner:', response.data);
          setVehicles(response.data);
        })
        .catch(error => {
          console.error('Error fetching vehicles:', error);
        });
    } else {
      setVehicles([]);
    }
  }, [formData.partner_id]);

  // Update getFilteredVehicles function to filter by partner_id
    const getFilteredVehicles = () => {
      if (!formData.partner_id) return [];
      // Filter vehicles where partner_id matches the selected partner
      return vehicles.filter(vehicle => vehicle.partner_id === parseInt(formData.partner_id));
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
      ...(name === 'partner_id' && { vehicle_no: '' })
    }));
  };

  // Add after getFilteredVehicles function and before if (!show) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/packages', formData);
      if (response.data) {
        onAdd(response.data);
        onClose();
        setFormData({
          partner_id: '',
          vehicle_no: '',
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
      }
    } catch (error) {
      console.error('Error adding package:', error);
      alert('Failed to add package');
    }
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
            {/* Vehicle Section */}
            <div className="form-section">
              <div className="form-group">
                <label>Partner Name</label>
                <select name="partner_id" value={formData.partner_id} onChange={handleChange} required>
                  <option value="">Select Partner</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>{partner.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Vehicle No</label>
                <select name="vehicle_no" value={formData.vehicle_no} onChange={handleChange} required disabled={!formData.partner_id}>
                  <option value="">Select Vehicle</option>
                  {getFilteredVehicles().map(vehicle => (
                    <option key={vehicle.id} value={vehicle.licensePlate}>
                      {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Driver</label>
                <select name="driver_id" value={formData.driver_id} onChange={handleChange} required>
                  <option value="">Select Driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Diesel Status</label>
                <select name="diesel_status" value={formData.diesel_status} onChange={handleChange} required>
                  <option value="Self">Self</option>
                  <option value="Client">Client</option>
                </select>
              </div>

              <div className="form-group">
                <label>Supervisor</label>
                <select name="supervisor_id" value={formData.supervisor_id} onChange={handleChange} required>
                  <option value="">Select Supervisor</option>
                  {supervisors.map(supervisor => (
                    <option key={supervisor.id} value={supervisor.id}>{supervisor.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Company Section */}
            <div className="form-section">
              <h3>Company</h3>
              <div className="form-group">
                <label>Company</label>
                <select name="company_id" value={formData.company_id} onChange={handleChange} required>
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Route ID</label>
                <input type="text" name="route_id" value={formData.route_id} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Route Name</label>
                <input type="text" name="route_name" value={formData.route_name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>No of Days</label>
                <input type="number" name="no_of_days" value={formData.no_of_days} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Monthly Kms</label>
                <input type="number" name="monthly_kms" value={formData.monthly_kms} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Actual Kms</label>
                <input type="number" name="actual_kms" value={formData.actual_kms} onChange={handleChange} />
              </div>
            </div>

            {/* Remove all duplicate fields and the standalone Diesel Status and Supervisor fields */}
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