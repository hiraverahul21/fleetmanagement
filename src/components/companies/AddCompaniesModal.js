import React, { useState } from 'react';
import axios from 'axios';
import './AddCompaniesModal.css';

const AddCompaniesModal = ({ show, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting company data:', formData); // Debug log

      const response = await axios.post('http://localhost:5000/api/companies', {
        name: formData.name.trim(),
        status: formData.status
      });

      console.log('Server response:', response.data); // Debug log

      if (response.data) {
        onAdd(response.data);
        setFormData({
          name: '',
          status: 'active'
        });
        onClose();
      }
    } catch (error) {
      console.error('Detailed error:', error.response || error); // Enhanced error logging
      alert(error.response?.data?.message || 'Failed to add company. Please try again.');
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Company</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Add Company</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompaniesModal;