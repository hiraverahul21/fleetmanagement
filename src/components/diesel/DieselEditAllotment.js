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

  // Add new state for period check
  const [periodExists, setPeriodExists] = useState(false);
  
  // Add new function to check period
  const checkAllotmentPeriod = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diesel-allotments/check-period', {
        params: {
          year: selectedYear,
          month: selectedMonth + 1
        }
      });
      setPeriodExists(response.data.exists);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking allotment period:', error);
      return false;
    }
  };
  
  // Update fetchAllotments to check period first
  const fetchAllotments = async () => {
    try {
      const exists = await checkAllotmentPeriod();
      if (!exists) {
        setAllotments([]);
        return;
      }
  
      const response = await axios.get(`http://localhost:5000/api/diesel-allotments`, {
        params: {
          year: selectedYear,
          month: selectedMonth + 1
        }
      });
      const formattedAllotments = response.data.map(allotment => ({
        ...allotment,
        year: allotment.year || selectedYear,
        month: allotment.month || (selectedMonth + 1)
      }));
      setAllotments(formattedAllotments);
    } catch (error) {
      console.error('Error fetching allotments:', error);
    }
  };

  // Update the fetchAllotmentDetails to handle the response properly
  // Add state for vendors
  const [vendors, setVendors] = useState([]);
  
  // Add useEffect to fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/diesel-vendors/active-receipts');
        setVendors(response.data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    fetchVendors();
  }, []);
  
  // Update the fetchAllotmentDetails function
  const fetchAllotmentDetails = async (allotmentId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/diesel-allotments/details/${allotmentId}`);
      const formattedDetails = response.data.map(detail => ({
        ...detail,
        date: detail.date ? new Date(detail.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        vendor_id: detail.vendor_id || '',
        receipt_book_id: detail.receipt_book_id || '',
        receipt_number: detail.receipt_number || '',
        diesel_qty: detail.diesel_qty || 0,
        status: detail.status || 'Active'
      }));
      setAllotmentDetails(prev => ({
        ...prev,
        [allotmentId]: formattedDetails
      }));
    } catch (error) {
      console.error('Error fetching allotment details:', error);
    }
  };
  
  // Move the table body rendering inside the return statement
  // Add new state for receipt books and receipt numbers
  const [receiptBooks, setReceiptBooks] = useState({});
  const [receiptNumbers, setReceiptNumbers] = useState({});
  
  // Add function to fetch receipt books for a vendor
  const fetchReceiptBooks = async (vendorId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/diesel-receipts/${vendorId}`);
      setReceiptBooks(prev => ({
        ...prev,
        [vendorId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching receipt books:', error);
    }
  };
  
  // Add function to fetch receipt numbers for a receipt book
  const fetchReceiptNumbers = async (receiptBookId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/diesel-receipts/${receiptBookId}/numbers`);
      setReceiptNumbers(prev => ({
        ...prev,
        [receiptBookId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching receipt numbers:', error);
    }
  };
  
  // Update the renderDetailsTableBody function
  const renderDetailsTableBody = (allotment) => {
    return allotmentDetails[allotment.id]?.map((detail, index) => (
      <tr key={index}>
        <td>
          <select 
            defaultValue={detail.vendor_id || ""}
            onChange={(e) => {
              const vendorId = e.target.value;
              if (vendorId) fetchReceiptBooks(vendorId);
            }}
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
            defaultValue={detail.receipt_book_id || ""}
            onChange={(e) => {
              const bookId = e.target.value;
              if (bookId) fetchReceiptNumbers(bookId);
            }}
          >
            <option value="">Select Receipt Book</option>
            {receiptBooks[detail.vendor_id]?.map(book => (
              <option key={book.receipt_book_id} value={book.receipt_book_id}>
                {book.receipt_book_id}
              </option>
            ))}
          </select>
        </td>
        <td>
          <select defaultValue={detail.receipt_number || ""}>
            <option value="">Select Receipt No</option>
            {receiptNumbers[detail.receipt_book_id]?.map(number => (
              <option key={number.value} value={number.value}>
                {number.label}
              </option>
            ))}
          </select>
        </td>
        <td>{new Date(detail.date).toLocaleDateString()}</td>
        <td>{detail.diesel_qty}</td>
        <td>{detail.status}</td>
        <td>{getMonthLabel(allotment.year, allotment.month - 1)}</td>
      </tr>
    ));
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

  const handleUpdateAllotment = async () => {
    try {
      // TODO: Implement update logic
      console.log('Update allotment clicked');
    } catch (error) {
      console.error('Error updating allotment:', error);
      alert('Failed to update allotment');
    }
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
              <th>Allotment ID</th>
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
                  <td>{allotment.id || 'N/A'}</td>
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
                          {renderDetailsTableBody(allotment)}
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