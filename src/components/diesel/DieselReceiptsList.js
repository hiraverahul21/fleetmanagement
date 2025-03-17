import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DieselReceiptsList.css';
import AddDieselReceiptsModal from './AddDieselReceiptsModal';
import EditDieselReceiptsModal from './EditDieselReceiptsModal';

const DieselReceiptsList = () => {
  const [receipts, setReceipts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/diesel-receipts');
      setReceipts(response.data);
    } catch (error) {
      console.error('Error fetching diesel receipts:', error);
    }
  };

  const handleReceiptAdded = (newReceipt) => {
    setReceipts([...receipts, newReceipt]);
  };

  const handleEdit = (receipt) => {
    setSelectedReceipt(receipt);
    setShowEditModal(true);
  };

  const handleReceiptUpdated = (updatedReceipt) => {
    setReceipts(receipts.map(receipt => 
      receipt.id === updatedReceipt.id ? updatedReceipt : receipt
    ));
  };

  return (
    <div className="diesel-receipts-list-container">
      <div className="receipts-header">
        <h2>Diesel Receipts Management</h2>
        <button className="add-receipt-btn" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Add Receipt
        </button>
      </div>
      <div className="receipts-content">
        <table>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Receipt Book ID</th>
              <th>Issued Date</th>
              <th>Receipt From</th>
              <th>Receipt To</th>
              <th>Receipts Count</th>
              <th>Receipts Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id} className={`status-${receipt.status.toLowerCase()}`}>
                <td>{receipt.vendor_name}</td>
                <td>{receipt.receipt_book_id}</td>
                <td>{new Date(receipt.issued_date).toLocaleDateString()}</td>
                <td>{receipt.receipt_from}</td>
                <td>{receipt.receipt_to}</td>
                <td>{receipt.receipts_count}</td>
                <td>{receipt.receipts_balance}</td>
                <td>{receipt.status}</td>
                <td>
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEdit(receipt)}
                  >
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
      <AddDieselReceiptsModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleReceiptAdded}
      />
      <EditDieselReceiptsModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedReceipt(null);
        }}
        onUpdate={handleReceiptUpdated}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default DieselReceiptsList;