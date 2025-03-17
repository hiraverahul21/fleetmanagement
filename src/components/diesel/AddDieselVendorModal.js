import React, { useState } from 'react';
import axios from 'axios';
import './AddDieselVendorModal.css';

const AddDieselVendorModal = ({ show, onClose, onAdd }) => {
  const [vendorData, setVendorData] = useState({
    name: '',
    address: '',
    contact_person: '',
    supply_type: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/diesel-vendors', vendorData);
      onAdd(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding diesel vendor:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Diesel Vendor</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vendor Name</label>
            <input
              type="text"
              value={vendorData.name}
              onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={vendorData.address}
              onChange={(e) => setVendorData({...vendorData, address: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              value={vendorData.contact_person}
              onChange={(e) => setVendorData({...vendorData, contact_person: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Supply Type</label>
            <select
              value={vendorData.supply_type}
              onChange={(e) => setVendorData({...vendorData, supply_type: e.target.value})}
              required
            >
              <option value="">Select Supply Type</option>
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="CNG">CNG</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Add Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDieselVendorModal;