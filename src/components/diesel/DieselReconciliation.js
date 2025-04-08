import React, { useState } from 'react';
import axios from 'axios';
import './DieselReconciliation.css';

const DieselReconciliation = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    const formData = new FormData();
    formData.append('pdfFile', selectedFile);

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/diesel/convert-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob' // Add this to handle binary data
      });

      const excelBlob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      setExcelData(excelBlob);
      alert('PDF converted successfully!');
    } catch (error) {
      console.error('Error converting PDF:', error);
      setError(error.response?.data?.message || 'Error converting PDF to Excel');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!excelData) {
      setError('No data available for download');
      return;
    }

    const url = window.URL.createObjectURL(excelData);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diesel_reconciliation.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="diesel-reconciliation-container">
      <h2>Diesel Reconciliation</h2>
      
      <div className="upload-section">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="file-input"
        />
        <button 
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="upload-btn"
        >
          {loading ? 'Converting...' : 'Convert PDF to Excel'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {excelData && (
        <div className="download-section">
          <button 
            onClick={handleDownload}
            className="download-btn"
          >
            Download Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default DieselReconciliation;