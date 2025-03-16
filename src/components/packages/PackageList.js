import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PackageList.css';
import AddPackageModal from './AddPackageModal';
import EditPackageModal from './EditPackageModal';

const PackageList = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [routeStops, setRouteStops] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);

  useEffect(() => {
    document.body.style.paddingLeft = '250px';
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Remove recalculation and directly fetch the data
      const [packagesRes, companiesRes, supervisorsRes, driversRes, partnersRes, routeStopsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/packages'),
        axios.get('http://localhost:5000/api/companies'),
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/drivers'),
        axios.get('http://localhost:5000/api/partners'),
        axios.get('http://localhost:5000/api/route-stops')
      ]);

      setPackages(packagesRes.data);
      setCompanies(companiesRes.data);
      setSupervisors(supervisorsRes.data);
      setDrivers(driversRes.data);
      setPartners(partnersRes.data);
      setRouteStops(routeStopsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddPackage = () => {
    setShowModal(true);
  };

  // Remove the first handleModalClose and keep this updated version
  const handleModalClose = () => {
    setShowModal(false);
    setEditingPackage(null);  // Reset editingPackage when modal closes
  };

  const handlePackageAdded = async (newPackage) => {
    await fetchData();
    handleModalClose();
  };

  const handleEditSubmit = async (updatedPackage) => {
    await fetchData();
    handleModalClose();
  };

  const handleEditClick = (pkg) => {
    setEditingPackage(pkg);
    setShowModal(true);
  };

  // Remove the duplicate handleModalClose that was here
  
  // Update the edit button in the table
  // Add this function before the return statement
  const getVehicleCount = (vehicleNo) => {
    return packages.filter(pkg => pkg.vehicle_no === vehicleNo).length;
  };

  // Add this function to determine row background color
  const getRowBackgroundColor = (vehicleNo) => {
    const count = getVehicleCount(vehicleNo);
    if (count > 3) return '#ffcccc'; // dark red
    if (count > 2) return '#ffb3b3'; // light red
    if (count > 1) return '#ffffd1'; // light yellow
    return ''; // default background
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
                <th>Partner Name</th>
                <th>Vehicle No</th>
                <th>Route ID</th>
                <th>Company Route ID</th>
                <th>Route Name</th>
                <th>Route Total Kms</th>
                <th>Driver Name</th>
                <th>Shift</th>
                <th>No of Trips per Day</th>
                <th>No of Days</th>
                <th>Monthly Kms</th>
                <th>Actual Kms</th>
                <th>Kms(+/-)</th>
                <th>Diff %(+/-)</th>
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
                const partner = partners.find(p => p.id === pkg.partner_id);

                // Calculate differences
                const kmsDiff = pkg.actual_kms - pkg.monthly_kms;
                const diffPercentage = ((pkg.actual_kms * 100 / pkg.monthly_kms) - 100).toFixed(2);

                return (
                  <tr 
                    key={pkg.id}
                    style={{ backgroundColor: getRowBackgroundColor(pkg.vehicle_no) }}
                  >
                    <td>{partner?.name || ''}</td>
                    <td>{pkg.vehicle_no}</td>
                    <td>{pkg.route_id}</td>
                    <td>{pkg.company_route_id || ''}</td>
                    <td 
                      title={(() => {
                        const stops = routeStops.filter(stop => stop.route_id === parseInt(pkg.route_id))
                          .map(stop => `${stop.stop_srno}. ${stop.start_from} → ${stop.end_to} (${stop.stop_kms}km)`);
                        return stops.length ? stops.join('\n') : 'No stops available';
                      })()}
                      style={{ cursor: 'help' }}
                    >
                      {pkg.route_name}
                    </td>
                    <td>{pkg.route_total_kms}</td>
                    <td>{driver?.name || ''}</td>
                    <td>{pkg.shift}</td>
                    <td>{pkg.trips_per_day}</td>
                    <td>{pkg.no_of_days}</td>
                    <td>{pkg.monthly_kms}</td>
                    <td>{pkg.actual_kms}</td>
                    <td style={{ color: kmsDiff > 0 ? 'red' : 'black' }}>
                      {kmsDiff}
                    </td>
                    <td style={{ color: diffPercentage > 0 ? 'red' : 'black' }}>
                      {diffPercentage}%
                    </td>
                    <td>{company?.name || ''}</td>
                    <td>{pkg.diesel_status}</td>
                    <td>{supervisor?.name || ''}</td>
                    <td>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEditClick(pkg)}
                      >
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
      <EditPackageModal 
        show={showModal && editingPackage !== null}
        onClose={handleModalClose}
        onEdit={handleEditSubmit}
        editPackage={editingPackage}
        companies={companies}
        supervisors={supervisors}
        drivers={drivers}
        partners={partners}
      />
      <AddPackageModal 
        show={showModal && editingPackage === null}
        onClose={handleModalClose}
        onAdd={handlePackageAdded}
        companies={companies}
        supervisors={supervisors}
        drivers={drivers}
        partners={partners}
      />
    </div>
  );
};

export default PackageList;