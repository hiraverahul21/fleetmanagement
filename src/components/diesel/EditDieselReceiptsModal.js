import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddDieselReceiptsModal.css';

const EditDieselReceiptsModal = ({ show, onClose, onUpdate, receipt }) => {
  const [vendors, setVendors] = useState([]);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (show && receipt) {
      fetchVendors();
      // Format the date without timezone adjustment
      const formattedReceipt = {
        ...receipt,
        issued_date: receipt.issued_date.substring(0, 10)
      };
      setReceiptData(formattedReceipt);
    }
  }, [show, receipt]);

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
      const response = await axios.put(`http://localhost:5000/api/diesel-receipts/${receipt.id}`, receiptData);
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating diesel receipt:', error);
    }
  };

  if (!show || !receiptData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Diesel Receipt</h2>
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
            <button type="submit" className="submit-btn">Update Receipt</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDieselReceiptsModal;