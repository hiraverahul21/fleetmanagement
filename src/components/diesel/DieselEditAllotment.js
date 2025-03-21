import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DieselAllotment.css';

const DieselEditAllotment = () => {
  const [allotments, setAllotments] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [daysInMonth, setDaysInMonth] = useState(31);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [allotmentDetails, setAllotmentDetails] = useState({});

  useEffect(() => {
    const days = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    setDaysInMonth(days);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchAllotments();
  }, [selectedYear, selectedMonth]);

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

  const fetchAllotments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/diesel-allotments`, {
        params: {
          year: selectedYear,
          month: selectedMonth + 1
        }
      });
      console.log('Fetched allotments:', response.data);
      setAllotments(response.data);
    } catch (error) {
      console.error('Error fetching allotments:', error);
    }
  };

  const fetchAllotmentDetails = async (allotmentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/diesel-allotments/details/${allotmentId}`);
      console.log('Fetched details:', response.data);
      setAllotmentDetails(prev => ({
        ...prev,
        [allotmentId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching allotment details:', error);
    }
  };

  const toggleRow = async (allotmentId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(allotmentId)) {
      newExpandedRows.delete(allotmentId);
    } else {
      newExpandedRows.add(allotmentId);
      if (!allotmentDetails[allotmentId]) {
        await fetchAllotmentDetails(allotmentId);
      }
    }
    setExpandedRows(newExpandedRows);
  };

  const getMonthLabel = (year, monthIndex) => {
    if (monthIndex === undefined || monthIndex < 0 || monthIndex >= 12) return '';
    const date = new Date(year, monthIndex);
    return date.toLocaleString('default', { month: 'short' }) + '-' + year;
  };

  return (
    <div className="diesel-allotment-container">
      <div className="allotment-header">
        <div>
          <h2>Edit Diesel Allotment</h2>
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
            <button 
              className="update-allotment-btn"
              onClick={() => handleUpdateAllotment()}
              style={{
                backgroundColor: '#ff8c00',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '20px'
              }}
            >
              <i className="fas fa-sync"></i> Update Allotment
            </button>
          </div>
        </div>
      </div>
      <div className="allotment-table">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Vehicle No</th>
              <th>Year</th>
              <th>Allotment Month</th>
              <th>No Of Days</th>
              <th>Company Route ID</th>
              <th>Route Name</th>
              <th>Monthly Kms</th>
              <th>Actual Kms</th>
              <th>Vehicle Average</th>
              <th>Vehicle Capacity</th>
              <th>Diesel Require</th>
              <th>Supervisor Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allotments.map((allotment) => (
              <React.Fragment key={allotment.id}>
                <tr>
                  <td>
                    <button className="expand-btn" onClick={() => toggleRow(allotment.id)}>
                      {expandedRows.has(allotment.id) ? '-' : '+'}
                    </button>
                  </td>
                  <td>{allotment.vehicle_no}</td>
                  <td>{allotment.year}</td>
                  <td>{getMonthLabel(allotment.year, allotment.month - 1)}</td>
                  <td>{daysInMonth}</td>
                  <td>{allotment.company_route_id}</td>
                  <td>{allotment.route_name}</td>
                  <td>{allotment.monthly_kms}</td>
                  <td>{allotment.actual_kms}</td>
                  <td>{allotment.vehicle_average}</td>
                  <td>{allotment.vehicle_capacity}</td>
                  <td>{allotment.diesel_require}</td>
                  <td>{allotment.supervisor_name}</td>
                  <td>
                    <button className="edit-btn">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="delete-btn">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
                {expandedRows.has(allotment.id) && (
                  <tr className="details-row">
                    <td colSpan="14">
                      <table className="inner-table">
                        <thead>
                          <tr>
                            <th>Petrol Pump</th>
                            <th>Receipt Book ID</th>
                            <th>Receipt No</th>
                            <th>Receipt Date</th>
                            <th>Diesel Qty</th>
                            <th>Status</th>
                            <th>Month</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allotmentDetails[allotment.id]?.map((detail, index) => (
                            <tr key={index}>
                              <td>
                                <select defaultValue="">
                                  <option value="">Select Pump</option>
                                  {/* Add pump options here */}
                                </select>
                              </td>
                              <td>
                                <select defaultValue="">
                                  <option value="">Select Receipt Book</option>
                                  {/* Add receipt book options here */}
                                </select>
                              </td>
                              <td>
                                <select defaultValue="">
                                  <option value="">Select Receipt No</option>
                                  {/* Add receipt number options here */}
                                </select>
                              </td>
                              <td>{new Date(detail.date).toLocaleDateString()}</td>
                              <td>{detail.diesel_qty}</td>
                              <td>{detail.status || 'Auto'}</td>
                              <td>{getMonthLabel(allotment.year, allotment.month - 1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DieselEditAllotment;

const handleUpdateAllotment = async () => {
  try {
    // TODO: Implement update logic
    console.log('Update allotment clicked');
  } catch (error) {
    console.error('Error updating allotment:', error);
    alert('Failed to update allotment');
  }
};