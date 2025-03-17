import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddDieselReceiptsModal.css';

const AddDieselReceiptsModal = ({ show, onClose, onAdd }) => {
  const [vendors, setVendors] = useState([]);
  const [staff, setStaff] = useState([]);
  
  useEffect(() => {
    if (show) {
      fetchVendors();
      fetchStaff();
    }
  }, [show]);

  const fetchStaff = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/staff/supervisors');
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Add staff_id to initial state
  const initialFormState = {
    vendor_id: '',
    receipt_book_id: '',
    issued_date: new Date().toISOString().split('T')[0], // Set current date
    receipt_from: '',
    receipt_to: '',
    receipts_count: '0',
    receipts_balance: '0',
    status: 'active'
  };
  
  const [receiptData, setReceiptData] = useState(initialFormState);

  useEffect(() => {
    if (show) {
      fetchVendors();
      setReceiptData(initialFormState); // Reset form when modal opens
    }
  }, [show]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diesel-vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const calculateReceiptsCount = (from, to) => {
    const fromNum = parseInt(from);
    const toNum = parseInt(to);
    if (!isNaN(fromNum) && !isNaN(toNum) && toNum >= fromNum) {
      return toNum - fromNum + 1;
    }
    return 0;
  };

  const handleReceiptChange = (field, value) => {
    const updatedData = { ...receiptData, [field]: value };
    
    if (field === 'receipt_from' || field === 'receipt_to') {
      const count = calculateReceiptsCount(
        field === 'receipt_from' ? value : receiptData.receipt_from,
        field === 'receipt_to' ? value : receiptData.receipt_to
      );
      updatedData.receipts_count = count;
      updatedData.receipts_balance = count;
    }
    
    setReceiptData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/diesel-receipts', receiptData);
      onAdd(response.data);
      onClose();
    } catch (error) {
      console.error('Error adding diesel receipt:', error);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Diesel Receipt</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vendor Name</label>
            <select
              value={receiptData.vendor_id}
              onChange={(e) => setReceiptData({...receiptData, vendor_id: e.target.value})}
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Receipt Book ID</label>
            <input
              type="text"
              value={receiptData.receipt_book_id}
              onChange={(e) => setReceiptData({...receiptData, receipt_book_id: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Issued Date</label>
            <input
              type="date"
              value={receiptData.issued_date}
              onChange={(e) => setReceiptData({...receiptData, issued_date: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Issued To</label>
            <select
              value={receiptData.staff_id || ''}
              onChange={(e) => setReceiptData({...receiptData, staff_id: e.target.value})}
              required
            >
              <option value="">Select Staff</option>
              {staff.map(person => (
                <option key={person.id} value={person.id}>{person.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Receipt From</label>
            <input
              type="number"
              min="0"
              value={receiptData.receipt_from}
              onChange={(e) => handleReceiptChange('receipt_from', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Receipt To</label>
            <input
              type="number"
              min="0"
              value={receiptData.receipt_to}
              onChange={(e) => handleReceiptChange('receipt_to', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Receipts Count</label>
            <input
              type="number"
              value={receiptData.receipts_count}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Receipts Balance</label>
            <input
              type="number"
              value={receiptData.receipts_balance}
              readOnly
              disabled
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={receiptData.status}
              onChange={(e) => setReceiptData({...receiptData, status: e.target.value})}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn">Add Receipt</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDieselReceiptsModal;