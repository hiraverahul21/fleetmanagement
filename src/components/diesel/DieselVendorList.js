import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DieselVendorList.css';

const DieselVendorList = () => {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diesel-vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching diesel vendors:', error);
    }
  };

  return (
    <div className="diesel-vendor-list-container">
      <div className="vendor-header">
        <h2>Diesel Vendor Management</h2>
        <button className="add-vendor-btn">
          <i className="fas fa-plus"></i> Add Vendor
        </button>
      </div>
      <div className="vendor-content">
        <table>
          <thead>
            <tr>
              <th>Diesel Vendor ID</th>
              <th>Diesel Vendor Name</th>
              <th>Address</th>
              <th>Contact Person</th>
              <th>Supply Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>{vendor.id}</td>
                <td>{vendor.name}</td>
                <td>{vendor.address}</td>
                <td>{vendor.contact_person}</td>
                <td>{vendor.supply_type}</td>
                <td>
                  <button className="action-btn edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="action-btn delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DieselVendorList;