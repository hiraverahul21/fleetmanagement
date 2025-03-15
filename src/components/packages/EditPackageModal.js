import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddPackageModal.css';

const EditPackageModal = ({ show, onClose, onEdit, editPackage, companies, supervisors, drivers, partners }) => {
  const [formData, setFormData] = useState({
    partner_id: '',
    vehicle_no: '',
    route_id: '',
    route_name: '',
    route_total_kms: '',
    shift: '',
    driver_id: '',
    no_of_days: '',
    monthly_kms: '',
    actual_kms: '',
    company_id: '',
    diesel_status: 'Self',
    supervisor_id: ''
  });

  const [vehicles, setVehicles] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState([]);

  // Populate form data when editing
  useEffect(() => {
    if (editPackage) {
      setFormData({
        partner_id: editPackage.partner_id || '',
        vehicle_no: editPackage.vehicle_no || '',
        route_id: editPackage.route_id || '',
        route_name: editPackage.route_name || '',
        route_total_kms: editPackage.route_total_kms || '',
        driver_id: editPackage.driver_id || '',
        shift: editPackage.shift || '',
        no_of_days: editPackage.no_of_days || '',
        monthly_kms: editPackage.monthly_kms || '',
        actual_kms: editPackage.actual_kms || '',
        company_id: editPackage.company_id || '',
        diesel_status: editPackage.diesel_status || 'Self',
        supervisor_id: editPackage.supervisor_id || ''
      });

      // Fetch routes for the selected company
      if (editPackage.company_id) {
        fetchRoutes(editPackage.company_id);
      }
    }
  }, [editPackage]);

  // Fetch vehicles when partner changes
  useEffect(() => {
    if (formData.partner_id) {
      axios.get(`http://localhost:5000/api/vehicles?partner_id=${formData.partner_id}`)
        .then(response => {
          setVehicles(response.data);
        })
        .catch(error => {
          console.error('Error fetching vehicles:', error);
        });
    } else {
      setVehicles([]);
    }
  }, [formData.partner_id]);

  const fetchRoutes = async (companyId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/main-routes/company`, {
        params: { company_id: companyId }
      });
      setAvailableRoutes(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  // Update useEffect to properly handle route data when company changes
  useEffect(() => {
    if (formData.company_id) {
      const fetchRoutes = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/main-routes/company`, {
            params: { company_id: formData.company_id }
          });
          setAvailableRoutes(response.data);
        } catch (error) {
          console.error('Error fetching routes:', error);
        }
      };
      fetchRoutes();
    }
  }, [formData.company_id]);

  // Update handleChange to handle all form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add handleRouteChange for route selection
  const handleRouteChange = (e) => {
    const selectedRoute = availableRoutes.find(route => route.route_id === parseInt(e.target.value));
    if (selectedRoute) {
      setFormData(prev => ({
        ...prev,
        route_id: e.target.value,
        route_name: selectedRoute.route_name,
        route_total_kms: selectedRoute.route_total_kms,
        monthly_kms: selectedRoute.route_total_kms * parseInt(prev.no_of_days || 30)
      }));
    }
  };

  // Update form JSX to match AddPackageModal structure
  return (
    show && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Edit Package</h2>
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
                    {vehicles.map(vehicle => (
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
                  <select 
                    name="route_id" 
                    value={formData.route_id} 
                    onChange={handleRouteChange}
                    required
                    disabled={!formData.company_id}
                  >
                    <option value="">Select Route</option>
                    {availableRoutes.map(route => (
                      <option key={route.route_id} value={route.route_id}>
                        {route.company_route_id} - {route.route_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Route Total Kms</label>
                  <input 
                    type="text" 
                    name="route_total_kms" 
                    value={formData.route_total_kms} 
                    readOnly 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Route Name</label>
                  <input 
                    type="text" 
                    name="route_name" 
                    value={formData.route_name} 
                    readOnly 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Shift</label>
                  <select name="shift" value={formData.shift} onChange={handleChange} required>
                    <option value="">Select Shift</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
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
                  <input 
                    type="number" 
                    name="actual_kms" 
                    value={formData.actual_kms} 
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required 
                    placeholder="Enter actual kilometers"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="submit-btn">Update Package</button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default EditPackageModal;


const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.put(`http://localhost:5000/api/packages/${editPackage.id}`, formData);
    onEdit(formData);
    onClose();
  } catch (error) {
    console.error('Error updating package:', error);
    alert('Failed to update package');
  }
};