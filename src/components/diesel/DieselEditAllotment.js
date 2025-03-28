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
  // Add these state declarations
  const [vendors, setVendors] = useState([]);
  const [receiptBooks, setReceiptBooks] = useState({});
  const [receiptNumbers, setReceiptNumbers] = useState({});
  // const [periodExists, setPeriodExists] = useState(false);

  // Add vendors fetch effect
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

  // Add these functions inside the component
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
  // Update the fetchAllotments function
  const fetchAllotments = async () => {
    try {
      const exists = await checkAllotmentPeriod();
      if (!exists) {
        setAllotments([]);
        return;
      }
  
      const response = await axios.get(`http://localhost:5000/api/diesel-allotments/details`, {
        params: {
          year: selectedYear,
          month: selectedMonth + 1
        }
      });
      setAllotments(response.data);
    } catch (error) {
      console.error('Error fetching allotments:', error);
    }
  };

  // Remove the separate fetchAllotmentDetails function as details are now included in the main response
  
  // Update the renderDetailsTableBody function
  // Update the sub-table header
  <thead>
    <tr>
      <th>Allotment ID</th>
      <th>Petrol Pump</th>
      <th>Receipt Book ID</th>
      <th>Receipt No</th>
      <th>Receipt Date</th>
      <th>Diesel Qty</th>
      <th>Status</th>
      <th>Month</th>
    </tr>
  </thead>
  
  // Update the renderDetailsTableBody function
  const renderDetailsTableBody = (allotment) => {
    return allotment.details?.map((detail, index) => (
      <tr key={index}>
        <td>{allotment.id}</td>
        <td>
          <select 
            value={detail.vendor_id || ""}
            onChange={async (e) => {
              const vendorId = e.target.value;
              // Update the detail object with new vendor_id
              detail.vendor_id = vendorId;
              
              if (vendorId) {
                try {
                  const receiptBooksResponse = await axios.get(`http://localhost:5000/api/diesel-receipts/${vendorId}`);
                  setReceiptBooks(prev => ({
                    ...prev,
                    [vendorId]: receiptBooksResponse.data
                  }));
  
                  if (receiptBooksResponse.data && receiptBooksResponse.data.length > 0) {
                    const firstBookId = receiptBooksResponse.data[0].receipt_book_id;
                    const receiptNumbersResponse = await axios.get(`http://localhost:5000/api/diesel-receipts/${firstBookId}/numbers`);
                    setReceiptNumbers(prev => ({
                      ...prev,
                      [firstBookId]: receiptNumbersResponse.data
                    }));
                  }
                } catch (error) {
                  console.error('Error fetching receipt details:', error);
                }
              }
              // Force a re-render by updating allotments state
              setAllotments(prev => [...prev]);
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
            value={detail.receipt_book_id || ""}
            onChange={async (e) => {
              const bookId = e.target.value;
              // Update the detail object with new receipt_book_id
              detail.receipt_book_id = bookId;
              
              if (bookId) {
                try {
                  const response = await axios.get(`http://localhost:5000/api/diesel-receipts/${bookId}/numbers`);
                  setReceiptNumbers(prev => ({
                    ...prev,
                    [bookId]: response.data
                  }));
                } catch (error) {
                  console.error('Error fetching receipt numbers:', error);
                }
              }
              // Force a re-render by updating allotments state
              setAllotments(prev => [...prev]);
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
          <select 
            value={detail.receipt_number || ""}
            onChange={(e) => {
              const receiptNumber = e.target.value;
              // Update the detail object with new receipt_number
              detail.receipt_number = receiptNumber;
              // Force a re-render by updating allotments state
              setAllotments(prev => [...prev]);
            }}
          >
            <option value="">Select Receipt No</option>
            {receiptNumbers[detail.receipt_book_id]?.map(number => (
              <option key={number.value} value={number.value}>
                {number.value}
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
  
  // Update the toggleRow function
  // Update the toggleRow function to fetch receipt data when expanding
  const toggleRow = async (allotmentId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(allotmentId)) {
      newExpandedRows.delete(allotmentId);
    } else {
      newExpandedRows.add(allotmentId);
      // Fetch receipt data when expanding
      const allotment = allotments.find(a => a.id === allotmentId);
      if (allotment && allotment.details) {
        for (const detail of allotment.details) {
          if (detail.vendor_id) {
            await fetchReceiptBooks(detail.vendor_id);
            if (detail.receipt_book_id) {
              await fetchReceiptNumbers(detail.receipt_book_id);
            }
          }
        }
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
              <th>Package ID</th>
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
                  <td>{allotment.package_id || 'N/A'}</td>
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
                            <th>Allotment ID</th>
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