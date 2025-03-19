import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DieselAllotment.css';

const DieselAllotment = () => {
  const [allotments, setAllotments] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [daysInMonth, setDaysInMonth] = useState(31);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [pumpDetails, setPumpDetails] = useState({});

  // Add the helper function here, before the other functions
  const getWeeklyDates = (year, month) => {
    const dates = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get first Sunday of the month
    let currentDate = new Date(firstDay);
    currentDate.setDate(currentDate.getDate() + (7 - currentDate.getDay()));
  
    while (currentDate <= lastDay) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }
    return dates;
  };

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

  const toggleRow = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // Add the calculateDieselPerReceipt function here with other helper functions
  const calculateDieselPerReceipt = (totalDiesel, numberOfReceipts) => {
    if (!totalDiesel || numberOfReceipts === 0) return 0;
    return Math.round(totalDiesel / numberOfReceipts);
  };

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
                    <button 
                      className="expand-btn"
                      onClick={() => toggleRow(allotment.id)}
                    >
                      {expandedRows.has(allotment.id) ? '−' : '+'}
                    </button>
                  </td>
                  <td>{allotment.vehicle_no}</td>
                  <td>{selectedYear}</td>
                  <td>{getMonthsForYear(selectedYear)[selectedMonth].label}</td>
                  <td>{daysInMonth}</td>
                  <td>{allotment.company_route_id}</td>
                  <td>{allotment.route_name}</td>
                  <td>{allotment.monthly_kms}</td>
                  <td>{allotment.actual_kms}</td>
                  <td>{allotment.vehicle_average || 'N/A'}</td>
                  <td>{allotment.vehicle_capacity || 'N/A'}</td>
                  <td>
                    {allotment.monthly_kms && allotment.vehicle_average 
                      ? Math.round(allotment.monthly_kms / allotment.vehicle_average)
                      : 'N/A'
                    }
                  </td>
                  <td>{allotment.supervisor_name || 'Not Assigned'}</td>
                  <td>
                    <button className="action-btn edit">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="action-btn delete">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
                {expandedRows.has(allotment.id) && (
                  <tr className="expanded-row">
                    <td colSpan="14">
                      <div className="sub-table-container">
                        <table className="sub-table">
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
                            {(() => {
                              const weeklyDates = getWeeklyDates(selectedYear, selectedMonth);
                              const totalDiesel = allotment.monthly_kms && allotment.vehicle_average 
                                ? Math.round(allotment.monthly_kms / allotment.vehicle_average)
                                : 0;
                              const dieselPerReceipt = calculateDieselPerReceipt(totalDiesel, weeklyDates.length);
                              
                              return weeklyDates.map((date, index) => (
                                <tr key={index}>
                                  <td>Sample Pump</td>
                                  <td>{`RB00${index + 1}`}</td>
                                  <td>{`12345${index + 1}`}</td>
                                  <td>{date.toLocaleDateString()}</td>
                                  <td>{dieselPerReceipt}</td>
                                  <td>Auto</td>
                                  <td>{getMonthsForYear(selectedYear)[selectedMonth].label}</td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
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
}; // Add this closing bracket

export default DieselAllotment;