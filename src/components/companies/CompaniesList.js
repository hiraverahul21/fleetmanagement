import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompaniesList.css';
import AddCompaniesModal from './AddCompaniesModal';

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/companies');
      setCompanies(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setLoading(false);
    }
  };

  const handleAddCompany = (newCompany) => {
    setCompanies([...companies, newCompany]);
  };

  return (
    <div className="companies-container">
      <div className="companies-header">
        <h2>Companies Management</h2>
        <button className="add-company-btn" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i> Add Company
        </button>
      </div>
      <div className="companies-content">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr key={company.id}>
                <td>{index + 1}</td>
                <td>{company.id}</td>
                <td>{company.name}</td>
                <td>
                  <span className={`status-badge ${company.status}`}>
                    {company.status}
                  </span>
                </td>
                <td>{new Date(company.created_at).toLocaleString()}</td>
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
      <AddCompaniesModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCompany}
      />
    </div>
  );
};

export default CompaniesList;