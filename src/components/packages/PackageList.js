import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PackageList.css';
import AddPackageModal from './AddPackageModal';

const PackageList = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.body.style.paddingLeft = '250px';
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all required data
      const [packagesRes, companiesRes, supervisorsRes, driversRes] = await Promise.all([
        axios.get('http://localhost:5000/api/packages'),
        axios.get('http://localhost:5000/api/companies'),
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/drivers')
      ]);

      setPackages(packagesRes.data);
      setCompanies(companiesRes.data);
      setSupervisors(supervisorsRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddPackage = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handlePackageAdded = async (newPackage) => {
    await fetchData(); // Fetch fresh data after adding package
    handleModalClose();
  };

  return (
    <div className="package-list-container">
      <div className="package-header">
        <h2>Package Management</h2>
        <button className="add-package-btn" onClick={handleAddPackage}>
          <i className="fas fa-plus"></i> Add Package
        </button>
      </div>
      <div className="package-content">
        <div className="package-grid">
          <table>
            <thead>
              <tr>
                <th>Vehicle No</th>
                <th>Route ID</th>
                <th>Route Name</th>
                <th>Driver Name</th>
                <th>No of Days</th>
                <th>Monthly Kms</th>
                <th>Actual Kms</th>
                <th>Company Allocated</th>
                <th>Diesel Status</th>
                <th>Supervisor Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => {
                const company = companies.find(c => c.id === pkg.company_id);
                const supervisor = supervisors.find(s => s.id === pkg.supervisor_id);
                const driver = drivers.find(d => d.id === pkg.driver_id);

                return (
                  <tr key={pkg.id}>
                    <td>{pkg.vehicle_no}</td>
                    <td>{pkg.route_id}</td>
                    <td>{pkg.route_name}</td>
                    <td>{driver?.name || ''}</td>
                    <td>{pkg.no_of_days}</td>
                    <td>{pkg.monthly_kms}</td>
                    <td>{pkg.actual_kms}</td>
                    <td>{company?.name || ''}</td>
                    <td>{pkg.diesel_status}</td>
                    <td>{supervisor?.name || ''}</td>
                    <td>
                      <button className="action-btn edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="action-btn delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <AddPackageModal 
        show={showModal}
        onClose={handleModalClose}
        onAdd={handlePackageAdded}
      />
    </div>
  );
};

export default PackageList;