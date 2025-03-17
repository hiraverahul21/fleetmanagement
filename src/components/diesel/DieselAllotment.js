import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DieselAllotment.css';

const DieselAllotment = () => {
  const [allotments, setAllotments] = useState([]);

  useEffect(() => {
    fetchAllotments();
  }, []);

  const fetchAllotments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diesel-allotments');
      setAllotments(response.data);
    } catch (error) {
      console.error('Error fetching diesel allotments:', error);
    }
  };

  return (
    <div className="diesel-allotment-container">
      <div className="allotment-header">
        <h2>Diesel Allotment Management</h2>
        <button className="add-allotment-btn">
          <i className="fas fa-plus"></i> Add Allotment
        </button>
      </div>
      <div className="allotment-content">
        <table>
          <thead>
            <tr>
              <th>Vehicle No</th>
              <th>Driver Name</th>
              <th>Allotment Date</th>
              <th>Quantity (Liters)</th>
              <th>Vendor Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allotments.map((allotment) => (
              <tr key={allotment.id}>
                <td>{allotment.vehicle_no}</td>
                <td>{allotment.driver_name}</td>
                <td>{allotment.allotment_date}</td>
                <td>{allotment.quantity}</td>
                <td>{allotment.vendor_name}</td>
                <td>{allotment.status}</td>
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

export default DieselAllotment;