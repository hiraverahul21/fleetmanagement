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
  const [vendors, setVendors] = useState([]);
  const [receiptBooks, setReceiptBooks] = useState([]);
// ... existing state declarations ...

const handleMonthChange = async (e) => {
  const newMonth = parseInt(e.target.value);
  
  try {
    // Check if allotment already exists for this period
    const response = await axios.get(`http://localhost:5000/api/diesel-allotments/check-period`, {
      params: {
        year: selectedYear,
        month: newMonth + 1 // Adding 1 because months are 0-based in JavaScript
      }
    });

    if (response.data.exists) {
      alert(`Diesel allotment already exists for ${selectedYear}-${getMonthsForYear(selectedYear)[newMonth].label}`);
      return;
    }

    setSelectedMonth(newMonth);
    const days = new Date(selectedYear, newMonth + 1, 0).getDate();
    setDaysInMonth(days);
    await fetchAllotments();
    
  } catch (error) {
    console.error('Error checking allotment period:', error);
    alert('Error occurred while checking allotment period');
  }
};
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

  // Add these state declarations at the top with other states
  const [selectedVendors, setSelectedVendors] = useState({});
  const [vendorReceiptBooks, setVendorReceiptBooks] = useState({});
  const [receiptNumbers, setReceiptNumbers] = useState({});
  const [selectedReceiptBooks, setSelectedReceiptBooks] = useState({});
  
  // Add these functions before the return statement
  // Modify the fetchReceiptNumbers function
  const fetchReceiptNumbers = async (receiptBookId, allotmentId, index) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/diesel-receipts/${receiptBookId}/numbers`);
      // Ensure response.data is an array before setting it in state
      const numbers = Array.isArray(response.data) ? response.data : [];
      setReceiptNumbers(prev => ({
        ...prev,
        [`${allotmentId}_${index}`]: numbers
      }));
    } catch (error) {
      console.error('Error fetching receipt numbers:', error);
      setReceiptNumbers(prev => ({
        ...prev,
        [`${allotmentId}_${index}`]: []
      }));
    }
  };
  
  // Update the handleReceiptBookChange function
  // Move these function definitions outside of JSX, place them with other functions before the return statement
  const handleReceiptBookChange = async (receiptBookId, allotmentId, index) => {
    // Clear receipt numbers when receipt book changes
    setReceiptNumbers(prev => ({
      ...prev,
      [`${allotmentId}_${index}`]: []
    }));
    
    // Update selected receipt book
    setSelectedReceiptBooks(prev => ({
      ...prev,
      [`${allotmentId}_${index}`]: receiptBookId
    }));
  
    if (receiptBookId) {
      await fetchReceiptNumbers(receiptBookId, allotmentId, index);
    }
  };

  // Add the fetchVendors function
  const fetchVendors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diesel-vendors/active-receipts');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  
  // Add new function to fetch receipt books for selected vendor
  // Update the fetchVendorReceiptBooks function
  const fetchVendorReceiptBooks = async (vendorId, allotmentId, index) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/diesel-receipts/${vendorId}`);
      setVendorReceiptBooks(prev => ({
        ...prev,
        [`${allotmentId}_${index}`]: response.data
      }));
    } catch (error) {
      console.error('Error fetching vendor receipt books:', error);
    }
  };
  
  // Add vendor selection handler
  // Update the handleVendorChange function to include index
  const handleVendorChange = async (vendorId, allotmentId, index) => {
    setSelectedVendors(prev => ({
      ...prev,
      [`${allotmentId}_${index}`]: vendorId
    }));
    if (vendorId) {
      await fetchVendorReceiptBooks(vendorId, allotmentId, index);
    }
  };
  
  const fetchReceiptBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diesel-receipts');
      setReceiptBooks(response.data);
    } catch (error) {
      console.error('Error fetching receipt books:', error);
    }
  };

  // Update the initial useEffect
  useEffect(() => {
    fetchAllotments();
    fetchVendors();
    fetchReceiptBooks();
    const days = new Date(selectedYear, parseInt(selectedMonth) + 1, 0).getDate();
    setDaysInMonth(days);
  }, []);
  
  // Update the expanded row content
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

  // Add fetchAllotments function if it's missing
  const fetchAllotments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diesel-allotments');
      setAllotments(response.data);
    } catch (error) {
      console.error('Error fetching allotments:', error);
    }
  };

  // Add with other state declarations at the top
  const [selectedReceiptNumbers, setSelectedReceiptNumbers] = useState({});
  
  // Add this state with other state declarations at the top
  const [pendingAllotments, setPendingAllotments] = useState({});
  
  // Add this function before the return statement
  const handleReceiptNumberChange = (receiptNumber, allotmentId, index) => {
    // Check if this receipt number is already selected in another row
    const isAlreadySelected = Object.entries(selectedReceiptNumbers).some(
      ([key, value]) => {
        const [currentAllotmentId, currentIndex] = key.split('_');
        return value === receiptNumber && 
               (currentAllotmentId !== allotmentId.toString() || currentIndex !== index.toString());
      }
    );
  
    if (isAlreadySelected) {
      alert('This receipt number is already selected. Please choose a different one.');
      return;
    }
  
    setSelectedReceiptNumbers(prev => ({
      ...prev,
      [`${allotmentId}_${index}`]: receiptNumber
    }));
  };

  const handleSaveAllotment = async () => {
    try {
      const checkResponse = await axios.get(`http://localhost:5000/api/diesel-allotments/check-period`, {
        params: {
          year: selectedYear,
          month: selectedMonth + 1
        }
      });
  
      if (checkResponse.data.exists) {
        alert(`Diesel allotment already exists for ${selectedYear}-${getMonthsForYear(selectedYear)[selectedMonth].label}`);
        return;
      }
  
      const allotmentsToSave = allotments.map(allotment => {
        const weeklyDates = getWeeklyDates(selectedYear, selectedMonth);
        const subRows = weeklyDates.map((date, index) => ({
          date: new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0], // This will preserve the correct date
          vendor_id: selectedVendors[`${allotment.id}_${index}`],
          receipt_book_id: selectedReceiptBooks[`${allotment.id}_${index}`],
          receipt_number: selectedReceiptNumbers[`${allotment.id}_${index}`],
          diesel_qty: calculateDieselPerReceipt(
            Math.round(allotment.monthly_kms / allotment.vehicle_average),
            weeklyDates.length
          ),
          status: 'active'
        }));
  
        // Calculate diesel_require value
        const dieselRequire = allotment.monthly_kms && allotment.vehicle_average 
          ? Math.round(allotment.monthly_kms / allotment.vehicle_average)
          : 0;
  
        // Create main allotment object with all required fields
        const mainAllotment = {
          vehicle_no: allotment.vehicle_no,
          year: selectedYear,
          month: selectedMonth + 1,
          company_route_id: allotment.company_route_id,
          monthly_kms: allotment.monthly_kms,
          vehicle_average: allotment.vehicle_average,
          status: 'active',
          // Add the missing fields
          no_of_days: daysInMonth,
          route_name: allotment.route_name || '',
          actual_kms: allotment.actual_kms || 0,
          vehicle_capacity: allotment.vehicle_capacity || 0,
          diesel_require: dieselRequire,
          supervisor_name: allotment.supervisor_name || 'Not Assigned',
          diesel_details: subRows
        };
  
        return mainAllotment;
      });
  
      const response = await axios.post('http://localhost:5000/api/diesel-allotments/save', allotmentsToSave);
      alert('Allotments saved successfully!');
      fetchAllotments();
    } catch (error) {
      console.error('Error saving allotments:', error);
      alert('Failed to save allotments');
    }
  };
  
  // Update the Add Allotment button in the return statement
  // Update the return statement structure
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
              onChange={handleMonthChange}
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
        <button className="add-allotment-btn" onClick={handleSaveAllotment}>
          <i className="fas fa-plus"></i> Add Allotment
        </button>
      </div>
      <div className="allotment-content">
        <table>          
          <thead>
            <tr>
              <th></th>
              <th>Package Id</th>
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
                  <td>{allotment.id || 'N/A'}</td>
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
                                  
                                  <td>
                                    <select 
                                      className="pump-dropdown"
                                      value={selectedVendors[`${allotment.id}_${index}`] || ''}
                                      onChange={(e) => handleVendorChange(e.target.value, allotment.id, index)}
                                    >
                                      <option value="">Select Pump</option>
                                      {vendors.map(vendor => (
                                        <option key={vendor.id} value={vendor.id}>
                                          {vendor.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  
                                  <td>
                                    <select 
                                      className="receipt-book-dropdown"
                                      disabled={!selectedVendors[`${allotment.id}_${index}`]}
                                      value={selectedReceiptBooks[`${allotment.id}_${index}`] || ''}
                                      onChange={(e) => handleReceiptBookChange(e.target.value, allotment.id, index)}
                                    >
                                      <option value="">Select Receipt Book</option>
                                      {vendorReceiptBooks[`${allotment.id}_${index}`]?.map(book => (
                                        <option key={book.id} value={book.receipt_book_id}>
                                          {book.receipt_book_id}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td>
                                    <select 
                                      className="receipt-no-dropdown"
                                      disabled={!selectedReceiptBooks[`${allotment.id}_${index}`]}
                                      value={selectedReceiptNumbers[`${allotment.id}_${index}`] || ''}
                                      onChange={(e) => handleReceiptNumberChange(e.target.value, allotment.id, index)}
                                    >
                                      <option value="">Select Receipt No</option>
                                      {receiptNumbers[`${allotment.id}_${index}`]?.map(number => (
                                        <option 
                                          key={number.value} 
                                          value={number.value}
                                          disabled={number.isUsed}
                                        >
                                          {number.label} {number.isUsed ? '(Used)' : ''}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
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
};

export default DieselAllotment;