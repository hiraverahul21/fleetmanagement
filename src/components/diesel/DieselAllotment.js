import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DieselAllotment.css';

const DieselAllotment = () => {
  const [allotments, setAllotments] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [daysInMonth, setDaysInMonth] = useState(31);

  const getMonthsForYear = (year) => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(year, i);
      months.push({
        value: i,
        label: date.toLocaleString('default', { month: 'short' }) + '-' + year
      });
    }
    return months;
  };

  useEffect(() => {
    fetchAllotments();
    const days = new Date(selectedYear, parseInt(selectedMonth) + 1, 0).getDate();
    setDaysInMonth(days);
  }, []);

  const fetchAllotments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diesel-allotments');
      setAllotments(response.data);
    } catch (error) {
      console.error('Error fetching diesel allotments:', error);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, parseInt(month) + 1, 0).getDate();
  };

  useEffect(() => {
    const days = new Date(selectedYear, parseInt(selectedMonth) + 1, 0).getDate();
    setDaysInMonth(days);
  }, [selectedYear, selectedMonth]);

  return (
    <div className="diesel-allotment-container">
      <div className="allotment-header">
        <div>
          <h2>Diesel Allotment Management</h2>
          <div className="year-selector">
            <label htmlFor="yearSelect">Select Year:</label>
            <select 
              id="yearSelect"
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="year-dropdown"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
            <label htmlFor="monthSelect">Select Month:</label>
            <select
              id="monthSelect"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="month-dropdown"
            >
              {getMonthsForYear(selectedYear).map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <label htmlFor="daysInMonth">Days in Month:</label>
            <input
              id="daysInMonth"
              type="text"
              value={daysInMonth}
              readOnly
              className="days-input"
            />
          </div>
        </div>
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